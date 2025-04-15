import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { ref, onValue, set, remove, get } from 'firebase/database';  // Adicione o método set para atualizar o banco
import { database } from '../../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import thumb1Alt from '../../../img/unnamed.svg';
import "../../master/master.css";
import StaggeredDropDown from '../../../components/products-log/StaggeredDropDown';
import ScreenWarning from '../../../components/MaxPhone';
import Sidebar from '../../../components/SidebarGestock';

const ProductsLog = ({ user }) => {
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const navigate = useNavigate();
    const sidebarRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('A - Z');

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
        setIsClosing(false);
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setSelectedUser(null);
        }, 500);
    };

    const handleDeleteUser = async (userId) => {
        try {
            // Buscar o usuário
            const userRef = ref(database, 'users/' + userId);
            const userSnapshot = await get(userRef);

            if (userSnapshot.exists()) {
                const userToDelete = userSnapshot.val();

                // Remover o usuário dos grupos
                const groupRef = ref(database, 'groups/' + userToDelete.company); // Ref para o grupo do usuário
                const groupSnapshot = await get(groupRef);

                if (groupSnapshot.exists()) {
                    const groupData = groupSnapshot.val();

                    // Verificar se o grupo contém o e-mail do usuário
                    if (groupData.members) {
                        const updatedMembers = groupData.members.filter(email => email !== userToDelete.email);

                        // Atualizar o grupo com a lista de membros atualizada
                        await set(groupRef, {
                            ...groupData,
                            members: updatedMembers
                        });
                    }
                }
                // Agora, excluir o usuário do banco de dados
                await remove(userRef);

                // Atualizar a lista de usuários no estado
                setUsers(users.filter(user => user.id !== userId));

                // Fechar o modal
                handleCloseModal();
            } else {
                console.error("Usuário não encontrado.");
            }
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
        }
    };

    const handleSaveChanges = async () => {
        try {
            // Atualizando o estado de carregamento
            setLoading(true);

            // Definir referências para o usuário e o grupo
            const userRef = ref(database, 'users/' + selectedUser.id);
            const groupRef = ref(database, 'groups/' + selectedUser.company); // Ref para o grupo selecionado

            // Garantir que 'company' não seja undefined
            const updatedUser = {
                ...selectedUser,
                company: selectedUser.company || '', // Definir valor padrão caso company esteja undefined
            };

            // Ler os dados do usuário
            const userSnapshot = await get(userRef);

            if (userSnapshot.exists()) {
                const currentUserData = userSnapshot.val();

                const updatedUserData = {
                    ...currentUserData,
                    fullName: selectedUser.fullName || currentUserData.fullName,
                    email: selectedUser.email || currentUserData.email,
                    job: selectedUser.job || currentUserData.job,
                    company: updatedUser.company, // Garantir que o campo company seja válido
                };

                // Atualiza os dados do usuário no banco de dados
                await set(userRef, updatedUserData);

                // Ler os dados do grupo
                const groupSnapshot = await get(groupRef);

                if (groupSnapshot.exists()) {
                    const currentGroupData = groupSnapshot.val();
                    const updatedGroup = {
                        ...currentGroupData,
                        members: [...currentGroupData.members, selectedUser.email], // Adiciona o e-mail do usuário ao grupo
                    };

                    // Atualiza o grupo com o novo membro
                    await set(groupRef, updatedGroup);
                }

                // Fechar o modal e finalizar o processo
                handleCloseModal();
            } else {
                console.error("Usuário não encontrado.");
            }
        } catch (error) {
            console.error("Erro ao atualizar o usuário e o grupo:", error);
        } finally {
            // Parar o carregamento e permitir novas ações
            setLoading(false);
        }
    };

    useEffect(() => {
        const gruposRef = ref(database, 'groups');
        onValue(gruposRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const groupsArray = Object.keys(data).map((key) => ({
                    id: key,
                    nomeFantasia: data[key].nomeFantasia || "Nome Padrão",
                    members: data[key].members || [],
                    admin: data[key].admin || {},
                    infosGroup: data[key].infosGroup || {},
                }));
                setGroups(groupsArray);
            }
        });
    }, []);

    useEffect(() => {
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersArray = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                setUsers(usersArray);
            }
        });
    }, []);

    // Função para pegar a empresa do user
    const getUserCompanyName = (user) => {
        const userGroup = groups.find(group => group.members.includes(user.email));
        if (userGroup) {
            return userGroup.infosGroup?.nomeFantasia || userGroup.nomeFantasia || 'Não inserido em nenhuma empresa';
        }
        return 'Não inserido em nenhuma empresa';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedUser((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Função para filtrar as informações
    const sortUsers = (users) => {
        if (sortOption === 'A - Z') {
            return [...users].sort((a, b) => a.fullName.localeCompare(b.fullName));
        } else if (sortOption === 'Mais Recentes') {
            return [...users].sort((a, b) => b.id.localeCompare(a.id)); // Ordena pelos mais recentes, com base na chave
        } else if (sortOption === 'Mais Antigos') {
            return [...users].sort((a, b) => a.id.localeCompare(b.id)); // Ordena pelos mais antigos, com base na chave
        }
        return users;
    };

    const filteredUsers = sortUsers(
        users.filter(user =>
            (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );

    const handleSortChange = (option) => {
        setSortOption(option);
    };
    return (
        <div>
            <div className="dashboard">
                <Sidebar className='sidebar-container' />
                <div className="products-log-container">
                    <div className="products-log-top">
                        <h2>Visualizar Usuário</h2>
                        <div className="products-actions-list">
                            <div className="products-actions-button" onClick={() => navigate("/masterregister")}>
                                <button className="add-product-button">+ Adicionar Novo Usuário</button>
                            </div>
                            <div className="products-actions-order">
                                <div className="group-product-search">
                                    <Icon icon="material-symbols:search" className="icon-product-search" />
                                    <input
                                        className="input-product-search"
                                        type="text"
                                        placeholder="Pesquisar Usuários"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <StaggeredDropDown onSelect={handleSortChange} />
                            </div>
                        </div>
                    </div>

                    <div className="products-log-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Foto</th>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                    <th>Cargo</th>
                                    <th>Empresa</th>
                                </tr>
                            </thead>
                            <tbody className='m_viewUser_users-info'>
                                {filteredUsers.map((user) => (
                                    <tr className="body-list-products" key={user.id}>
                                        <td className="list-image-product">
                                            <img
                                                src={user.photo || thumb1Alt} // Usa o campo 'photo' do Firebase ou uma imagem padrão
                                                alt={user.fullName || "Usuário"}
                                                className="user-thumbnail"
                                            />
                                        </td>
                                        <td className="category-product">{user.fullName}</td>
                                        <td className="quantity-product-info">{user.email}</td>
                                        <td className="sku-product-info">{user.job}</td>
                                        <td className="sku-product-info">{getUserCompanyName(user)}</td>
                                        <td className="sku-product-info">{user.cpf}</td>
                                        <td>
                                            <strong>
                                                <Icon
                                                    icon="mdi:eye"
                                                    className="icon"
                                                    onClick={() => handleOpenModal(user)}
                                                />
                                            </strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {showModal && selectedUser && (
                        <div className={`products-log-modal-overlay ${isClosing ? 'fade-out' : ''}`}>
                            <div className="products-log-modal-content">
                                <div className='products-log-modal-content-top-list'>
                                    <img
                                        src={selectedUser.photo || thumb1Alt}
                                        alt={selectedUser.fullName || "Usuário"}
                                        className="product-image-modal"
                                    />
                                    <div className='products-log-modal-content-infos'>
                                        <h2>Editar Informações do Integrante</h2>
                                        <div className='products-log-modal-content-sku-status'>

                                            <div className="coolinputUser">
                                                <label className="text">Nome:</label>
                                                <input
                                                    type="text"
                                                    placeholder="Nome do Integrante"
                                                    value={selectedUser.fullName || ""}
                                                    name="fullName"
                                                    className="input"
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="coolinputUser">
                                                <label className="text">Email:</label>
                                                <input
                                                    type="text"
                                                    placeholder="Email do Integrante"
                                                    value={selectedUser.email || ""}
                                                    name="email"
                                                    className="input"
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="coolinputUser">
                                                <label className="text">Cargo:</label>
                                                <select
                                                    name="job"
                                                    value={selectedUser.job || ""}
                                                    onChange={(e) => setSelectedUser({ ...selectedUser, job: e.target.value })}
                                                    className="input"
                                                >
                                                    <option value="">Selecione um Cargo</option>
                                                    <option value="Administrador">Administrador</option>
                                                    <option value="Demais funções">Demais funções</option>
                                                    <option value="Master">Master</option>
                                                </select>
                                            </div>

                                            <div className="coolinputUser">
                                                <label className="text">Empresa:</label>
                                                <select
                                                    value={selectedUser.company || ''}
                                                    name="company"
                                                    className="input"
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Selecione a Empresa</option>
                                                    {groups.map(group => (
                                                        <option key={group.id} value={group.id}>
                                                            {group.nomeFantasia || group.nomeFantasia}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='products-log-modal-footer'>
                                    <button className="save-modal-button" onClick={handleSaveChanges}>
                                        Salvar
                                    </button>
                                    <button className="delete-modal-button" onClick={() => handleDeleteUser(selectedUser.id)}>
                                        Deletar Usuário
                                    </button>
                                    <button className="close-modal-button" onClick={handleCloseModal}>
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <ScreenWarning />
                </div>
            </div>
        </div>
    );
};

export default ProductsLog;
