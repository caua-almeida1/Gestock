import React, { useState, useEffect, useContext } from "react";
import { Icon } from "@iconify/react";
import { getDatabase, ref, onValue, set, push, get } from "firebase/database";
import { AuthContext } from "../../../contexts/authContext";

const NewContactModal = ({ onClose }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [userContacts, setUserContacts] = useState([]); // Para armazenar contatos do usuário logado
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext); // Usando contexto para pegar o usuário logado

  useEffect(() => {
    setTimeout(() => setShowModal(true), 10);

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 1250);

    const fetchUsers = async () => {
      const db = getDatabase();
      const usersRef = ref(db, "users");

      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const usersList = Object.keys(data).map((key) => ({
            id: key,
            fullName: capitalizeFirstLetter(data[key].fullName),
            job: data[key].job,
            email: data[key].email, // Adiciona o email do usuário
          }));
          setUsers(usersList);
        }
      });
    };

    const fetchUserContacts = async () => {
      const db = getDatabase();
      const chatRef = ref(db, "chat"); // Referência à tabela de chat

      onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Encontre o chat do usuário logado e pegue os contatos
          const userChat = Object.values(data).find(
            (chat) => chat.userEmail === currentUser.email
          );

          if (userChat && userChat.userContacts) {
            const contacts = userChat.userContacts.map((contact) => contact.id);
            setUserContacts(contacts);
          }
        }
      });
    };

    fetchUsers();
    fetchUserContacts();

    return () => clearTimeout(timeoutId);
  }, [currentUser]);

  const capitalizeFirstLetter = (string) => {
    return string.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(onClose, 200);
  };

  const handleCheckboxChange = (event, user) => {
    if (event.target.checked) {
      setSelectedUsers((prevSelected) => [...prevSelected, user]);
    } else {
      setSelectedUsers((prevSelected) =>
        prevSelected.filter((selectedUser) => selectedUser.id !== user.id)
      );
    }
  };

  const isUserSelected = (userId) => {
    return selectedUsers.some((selectedUser) => selectedUser.id === userId);
  };

  // Filtra usuários que não estão nos contatos do usuário logado
  const filteredUsers = users.filter((user) => {
    return (
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !userContacts.includes(user.id) // Exclui contatos existentes
    );
  });

  const handleAddContacts = async () => {
    if (selectedUsers.length === 0 || !currentUser) return;
  
    const db = getDatabase();
    const chatRef = ref(db, "chat");
  
    try {
      // Verifica se já existe uma tabela 'userContacts' para o usuário logado
      const chatSnapshot = await get(chatRef);
      let userChatKey = null;
      let existingContacts = [];
  
      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.val();
        // Procura pelo chat do usuário logado pelo email
        const userChatEntry = Object.entries(chatData).find(
          ([key, value]) => value.userEmail === currentUser.email
        );
  
        if (userChatEntry) {
          userChatKey = userChatEntry[0]; // Pega a chave do chat existente
          existingContacts = userChatEntry[1].userContacts || []; // Contatos existentes
        }
      }
  
      // Se já existir uma tabela para o usuário, atualiza os contatos
      if (userChatKey) {
        const updatedContacts = [
          ...existingContacts,
          ...selectedUsers.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
          })),
        ];
  
        // Atualiza a lista de contatos
        await set(ref(db, `chat/${userChatKey}/userContacts`), updatedContacts);
        console.log("Contatos atualizados com sucesso!");
  
      } else {
        // Se não existir uma tabela, cria uma nova
        const newChatRef = push(chatRef); // Cria um novo registro em 'chat'
        const newChatData = {
          userEmail: currentUser.email, // Email do usuário logado
          userContacts: selectedUsers.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
          })),
        };
  
        await set(newChatRef, newChatData);
        console.log("Contatos adicionados com sucesso!");
      }
  
      // Limpa a lista de contatos selecionados após adicionar
      setSelectedUsers([]);
    } catch (error) {
      console.error("Erro ao adicionar ou atualizar contatos:", error);
    }
  };  
  
  return (
    <>
      <div
        className={`new-contact-modal-overlay ${showModal ? "show" : ""}`}
        onClick={handleClose}
      ></div>
      <div className={`new-contact-modal ${showModal ? "show" : ""}`}>
        <div className="new-contact-modal-header">
          <h2>Adicionar Novo Contato</h2>
          <button onClick={handleClose} className="close-button">
            <Icon icon="mdi:close" className="icon" />
          </button>
        </div>
        <div className="new-contact-modal-body">
          <form action="" className="content-sidebar-form">
            <div className="new-contact-span-input">
              <input
                type="search"
                className="content-sidebar-input new-contact-modal-input"
                placeholder="Pesquise por usuário"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="new-contact-modal-users-content skeleton">
                <div className="skeleton-item skeleton-item-h2"></div>
                <div className="skeleton-item-list-ul">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="skeleton-item skeleton-item-list"
                    ></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="new-contact-modal-users-content slide-in">
                <h2>Todos os Usuários</h2>
                <div className="new-contact-modal-users-list">
                  <ul>
                    {filteredUsers.map((user) => (
                      <li className="hover-item" key={user.id}>
                        <div className="checkbox-wrapper-46">
                          <input
                            type="checkbox"
                            id={`cbx-${user.id}`}
                            className="inp-cbx"
                            checked={isUserSelected(user.id)}
                            onChange={(event) =>
                              handleCheckboxChange(event, user)
                            }
                          />
                          <label
                            htmlFor={`cbx-${user.id}`}
                            className="cbx label"
                          >
                            <span>
                              <svg
                                viewBox="0 0 12 10"
                                height="10px"
                                width="12px"
                              >
                                <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                              </svg>
                            </span>
                            <span>
                              <Icon
                                icon="mingcute:user-4-fill"
                                className="icon conversation-item-image"
                              />
                            </span>
                            <div className="new-contact-modal-users-info">
                              <h1>{user.fullName}</h1>
                              <p>{user.job}</p>
                            </div>
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </form>

          <div
            className="new-contact-modal-footer"
            style={{
              visibility: selectedUsers.length > 0 ? "visible" : "hidden",
              opacity: selectedUsers.length > 0 ? 1 : 0,
              transition: "opacity 0.3s ease, visibility 0.3s ease",
            }}
          >
            <span className="selected-users">
              {selectedUsers.map((user) => user.fullName).join(", ")}
            </span>
            <Icon
              icon="flowbite:user-add-solid"
              className="icon"
              onClick={handleAddContacts} // Adiciona os contatos ao clicar no ícone
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NewContactModal;
