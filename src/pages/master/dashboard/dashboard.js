import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import "../../master/master.css";
import { ref, onValue, update, push, remove } from "firebase/database";
import { database } from "../../../firebase/firebase";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import Sidebar from "../../../components/SidebarGestock";
import Calendar from "../../../components/calendar-production/Calendar";
import ScreenWarning from '../../../components/MaxPhone';

const Dashboard = () => {
  const [modules, setModules] = useState({});
  const [moduleDates, setModuleDates] = useState({});
  const [timeRemaining, setTimeRemaining] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const calculateTimeRemaining = (moduleKey) => {
    const releaseDate = moduleDates[moduleKey];
    if (!releaseDate) return null; // Se não houver data, retorna nulo

    const now = new Date();
    const releaseTime = new Date(releaseDate);
    const timeDiff = releaseTime - now;

    if (timeDiff <= 0) {
      return "Bloqueado";
    } else {
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      return `Faltam ${days}d ${hours}h ${minutes}m para liberar`;
    }
  };

  useEffect(() => {
    const modulesRef = ref(database, 'moduleStates/');
    const datesRef = ref(database, 'moduleDates/');

    onValue(modulesRef, (snapshot) => {
      if (snapshot.exists()) {
        setModules(snapshot.val());
      } else {
        console.log("Nenhum dado disponível para os módulos.");
      }
    });


    onValue(datesRef, (snapshot) => {
      if (snapshot.exists()) {
        setModuleDates(snapshot.val());
      } else {
        console.log("Nenhum dado disponível para as datas dos módulos.");
      }
    });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login'); // Redireciona para o login
    }
  }, [currentUser, navigate]);

  // Atualiza o tempo restante para cada módulo
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimes = {};

      Object.keys(moduleDates).forEach(moduleKey => {
        updatedTimes[moduleKey] = calculateTimeRemaining(moduleKey);
      });

      setTimeRemaining(updatedTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [moduleDates]);

  const formatModuleName = (moduleName) => {
    return moduleName.replace(/modulo(\d+)/i, 'Modulo $1');
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  //==================== MOVO CAUA =============================
  const [visibleUsersCount, setVisibleUsersCount] = useState(4);
  const [users, setUsers] = useState([]);
  const [updates, setUpdates] = useState([]);

  const [showMore, setShowMore] = useState(false);

  const handleToggleShow = () => {
    setShowMore((prevShowMore) => !prevShowMore);
  };

  useEffect(() => {
    const usersRef = ref(database, 'users/');
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = [];
        snapshot.forEach((childSnapshot) => {
          usersData.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        setUsers(usersData);
      } else {
        console.log("Nenhum usuário encontrado.");
      }
    });
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isEditing, setIsEditing] = useState(false); // Estado para controlar a edição
  const [userData, setUserData] = useState({}); // Dados do usuário que podem ser editados

  const handleEdit = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    const storedUpdates = JSON.parse(localStorage.getItem("updates")) || [];
    const currentTime = Date.now();

    // Filtrar apenas as atualizações ainda válidas
    const validUpdates = storedUpdates.filter(
      (update) => currentTime - update.timestamp < 5 * 60 * 1000
    );

    setUpdates(validUpdates);

    // Atualizar o Local Storage com as atualizações válidas
    localStorage.setItem("updates", JSON.stringify(validUpdates));
  }, []);

  const addUpdate = (fullName) => {
    const newUpdate = {
      fullName, // Apenas o nome do usuário
      time: "Agora",
      timestamp: Date.now(),
    };

    const updatedUpdates = [...updates, newUpdate];

    setUpdates(updatedUpdates);

    localStorage.setItem("updates", JSON.stringify(updatedUpdates));

    setTimeout(() => {
      const filteredUpdates = updatedUpdates.filter(
        (update) => Date.now() - update.timestamp < 5 * 60 * 1000
      );
      setUpdates(filteredUpdates);
      localStorage.setItem("updates", JSON.stringify(filteredUpdates));
    }, 5 * 60 * 1000);
  };

  const handleSave = () => {
    const userRef = ref(database, `users/${selectedUser.id}`);
    update(userRef, userData)
      .then(() => {
        setAlertMessage({
          type: "success",
          text: "Usuário atualizado com sucesso!",
        });

        // Adicionar nova atualização
        addUpdate(`${userData.fullName} foi editado.`);

        setTimeout(() => setAlertMessage(null), 3000);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Erro ao atualizar o usuário: ", error);
        setAlertMessage({
          type: "error",
          text: "Erro ao atualizar o usuário. Tente novamente.",
        });
        setTimeout(() => setAlertMessage(null), 3000);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const [isClosing, setIsClosing] = useState(false);

  const handleOpenModal = (user) => {
    console.log("ID do usuário:", user.id);
    setSelectedUser(user);
    setUserData(user);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setIsEditing(false);
  };


  const visibleUsers = showMore ? users : users.slice(0, 4);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  const [alertMessage, setAlertMessage] = useState(null);

  const handleDelete = () => {
    const userRef = ref(database, `users/${selectedUser.id}`);
    remove(userRef)
      .then(() => {
        setAlertMessage({
          type: "success",
          text: "Usuário excluído com sucesso!",
        });

        // Adicionar nova atualização
        addUpdate(`${userData.fullName} foi excluído.`);

        setTimeout(() => setAlertMessage(null), 3000);
        setModalVisible(false); // Fechar o modal após a exclusão
      })
      .catch((error) => {
        console.error("Erro ao excluir o usuário: ", error);
        setAlertMessage({
          type: "error",
          text: "Erro ao excluir o usuário. Tente novamente.",
        });
        setTimeout(() => setAlertMessage(null), 3000);
      });
  };

  return (
    <div className="dashboard">
      <Sidebar className="sidebar-container" />
      <div className="container-dashboard">
        <main>
          <h1>Dashboard</h1>

          {/* ======== ESQUERDA DO DASHBOARD ========*/}
          <div className="insights">
            {/* Renderizar dinamicamente os módulos */}
            {Object.keys(modules).map((moduleKey, index) => (
              <div key={index} className={`module-card-${index + 1}`}>
                <Icon
                  icon={modules[moduleKey] === "bloqueado" ? "ic:round-lock" : "tabler:circle-check-filled"}
                  className="icon"
                />
                <div className="middle">
                  <div className="left">
                    <h3>{formatModuleName(moduleKey)}</h3>
                    <h1>{formatStatus(modules[moduleKey])}</h1>
                  </div>
                </div>
                <small className="text-muted">
                  {modules[moduleKey] === "bloqueado"
                    ? timeRemaining[moduleKey] || "Bloqueado"
                    : "Módulo liberado"}
                </small>
              </div>
            ))}
          </div>

          {/* ============== MUDANCA CAUA INICIO ================== */}

          <div className="dashboard-users-card">
            <h2>Usuários</h2>
            <table>
              <thead>
                <tr>
                  <th>Nome </th>
                  <th>Email</th>
                  <th>Cargo</th>
                  <th>Status</th>
                  <th>Gerenciar</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user, index) => (
                  <tr key={index}>
                    <td>{user.fullName || "N/A"}</td>
                    <td>{user.email || "N/A"}</td>
                    <td>{user.job || "N/A"}</td>
                    <td className="warning-status-users">Indefinido</td>
                    <td>
                      <Icon
                        icon="mingcute:settings-1-fill"
                        className="master_dashboard-icon"
                        onClick={() => handleOpenModal(user)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a href="#" onClick={handleToggleShow}>
              {showMore ? "Mostrar Menos" : "Mostrar Mais"}
            </a>
          </div>
        </main>

        {modalVisible && (
          <div className={`master_dashboard-modal-overlay ${modalVisible ? 'show' : 'hide'}`}>
            <div className={`master_dashboard-modal-container ${modalVisible ? 'show' : 'hide'}`}>
              <div className="master_dashboard-modal-header">
                <h2>Gerenciar Usuário</h2>
                <button className="master_dashboard-modal-close" onClick={handleCloseModal}>×</button>
              </div>

              {selectedUser ? (
                <div>
                  <form className="newproduct_form">
                    <label className="newproduct_label">
                      Nome do Usuário
                      <input
                        type="text"
                        className="newproduct_input"
                        name="fullName"
                        value={userData.fullName || ""}
                        onChange={handleChange}
                        disabled={!isEditing} // Desabilita o campo se não estiver em modo de edição
                      />
                    </label>

                    {/* Campo de Email */}
                    <label className="newproduct_label">
                      Email
                      <input
                        type="email"
                        className="newproduct_input"
                        name="email"
                        value={userData.email || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </label>

                    {/* Campo de Cargo */}
                    <label className="newproduct_label">
                      Cargo
                      <select
                        className="newproduct_input"
                        name="job"
                        value={userData.job || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                      >
                        <option value="Master">Master</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Demais Funções">Demais Funções</option>
                      </select>
                    </label>

                    {/* Campo de Senha */}
                    <label className="newproduct_label">
                      Senha
                      <div className="password-container">
                        <input
                          type={isPasswordVisible ? "text" : "password"}
                          className="newproduct_input"
                          name="Senha"
                          value={userData.Senha || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                        <button
                          type="button"
                          className="dashboard_label-password-toggle-btn"
                          onClick={togglePasswordVisibility}
                          disabled={!isEditing}
                        >
                          {isPasswordVisible ? <Icon icon="fluent:eye-off-24-filled" className="icon" /> : <Icon icon="fluent:eye-12-filled" className="icon" />}
                        </button>
                      </div>
                    </label>
                  </form>

                  <div className="dashboard_master-buttons-actions">
                    {!isEditing ? (
                      <button onClick={handleEdit} className="dashboard_master-edit-btn">Editar</button>
                    ) : (
                      <button onClick={handleSave} className="dashboard_master-save-btn">Salvar alterações</button>
                    )}
                    <button onClick={handleDelete} className="dashboard_master-delete-btn">
                      <Icon icon="fluent:delete-24-filled" className="icon" />
                      Excluir Usuário
                    </button>
                  </div>

                </div>
              ) : (
                <p>Carregando...</p>
              )}
            </div>
          </div>
        )}


        {alertMessage && <div className="dashboard_master-alert-overlay"></div>}

        {alertMessage && (
          <div
            className={`dashboard_master-alert dashboard_master-alert-${alertMessage.type} ${alertMessage ? "dashboard_master-alert-slide-in" : "dashboard_master-alert-slide-out"
              }`}
          >
            <p>{alertMessage.text}</p>
          </div>
        )}


        {/* ======== DIREITA DO DASHBOARD ========*/}
        <div className="right">
          <div className="recent-updates">
            <h2>Atualizações</h2>
            <div className="updates">
              {updates.length > 0 ? (
                updates.map((update, index) => (
                  <div className="update" key={index}>
                    <div className="profile-photo">
                      <Icon icon="mingcute:user-4-fill" className="icon" />
                    </div>
                    <div className="message">
                      <div className="dashboard-message-info">
                        <p>O Usuário</p>
                        <b>{update.fullName}</b>
                      </div>
                      <small className="text-muted">{update.time}</small>
                    </div>
                  </div>
                ))
              ) : (
                <p>Sem atualizações no momento</p>
              )}
            </div>
          </div>

          {/* ============== MUDANCA CAUA FINAL ================== */}


          <div className="calendar-dashboard">
            <h2> Calendário de Eventos </h2>

            <div>
              <Calendar className="calendar-dashboard" />
            </div>
          </div>
        </div>
      </div>
      {/* ======= LIMITE DE LARGURA ======= */}
      <ScreenWarning />
    </div>
  );
};

export default Dashboard;
