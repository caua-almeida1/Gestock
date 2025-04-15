import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getAuth, signOut } from 'firebase/auth'; // Importa as funções do Firebase
import { useNavigate } from 'react-router-dom'; // Para redirecionamento
import { auth } from '../../../../firebase/firebase';
import EditProfileModal from '../../../../components/editprofile';
import defaultPhoto from '../../../../img/fotodeperfiel_header.png';

const SidebarGestock = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const editProfileModalRef = useRef(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        closeAllSubMenus();
    };

    const toggleSubMenu = (index) => {
        setActiveSubMenu(activeSubMenu === index ? null : index);
        if (!isSidebarOpen) setIsSidebarOpen(true);
    };

    const closeAllSubMenus = () => {
        setActiveSubMenu(null);
    };

    // Função para abrir o modal
    const openModal = () => {
        setIsModalOpen(true);
    };

    // Função para fechar o modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Função para atualizar o perfil
    const updateProfile = (updatedProfile) => {
        closeModal(); // Fecha o modal após a atualização
    };

    const handleLogout = async () => {
        try {
            await signOut(auth); // Encerra a sessão no Firebase
            sessionStorage.clear(); // Remove os dados armazenados
            navigate('/login'); // Redireciona para a tela de login
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return (
        <>
            <nav id="sidebar" className={isSidebarOpen ? '' : 'close'}>
                <ul>
                    <li>
                        <span className="logo">Gestock</span>
                        <button onClick={toggleSidebar} id="toggle-btn" className={isSidebarOpen ? '' : 'rotate'}>
                            <Icon icon="iconamoon:arrow-left-2-bold" />
                        </button>
                    </li>
                    <li>
                        <a href="/dashboardADM">
                            <Icon icon="mage:dashboard-fill" className='icon' />
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="/calendar">
                            <Icon icon="tabler:calendar-filled" className='icon' />
                            <span>Calendário</span>
                        </a>
                    </li>

                    {/* Administração Menu */}
                    <li>
                        <button onClick={() => toggleSubMenu(1)} className={activeSubMenu === 1 ? 'dropdown-btn rotate' : 'dropdown-btn'}>
                            <Icon icon="eos-icons:admin" />
                            <span>ADM</span>
                            {activeSubMenu === 1 ? (
                                <Icon icon="mdi:chevron-up" />
                            ) : (
                                <Icon icon="mdi:chevron-down" />
                            )}
                        </button>
                        <ul className={activeSubMenu === 1 ? 'sub-menu show' : 'sub-menu'}>
                            <div className='list-sub-menu'>
                                <li><a href="/editcompany">Editar Empresa</a></li>
                                <li><a href="#">Opção 2</a></li>
                            </div>
                        </ul>
                    </li>

                    {/* Recursos Humanos Menu */}
                    <li>
                        <button onClick={() => toggleSubMenu(2)} className={activeSubMenu === 2 ? 'dropdown-btn rotate' : 'dropdown-btn'}>
                            <Icon icon="fluent:people-team-20-filled" />
                            <span>RH</span>
                            {activeSubMenu === 2 ? (
                                <Icon icon="mdi:chevron-up" />
                            ) : (
                                <Icon icon="mdi:chevron-down" />
                            )}
                        </button>
                        <ul className={activeSubMenu === 2 ? 'sub-menu show' : 'sub-menu'}>
                            <div className='list-sub-menu'>
                                <li><a href="/listarCargos">Cargos</a></li>
                                <li><a href="/listarFuncionarios">Funcionários</a></li>
                            </div>
                        </ul>
                    </li>

                    {/* Logística Menu */}
                    <li>
                        <button onClick={() => toggleSubMenu(3)} className={activeSubMenu === 3 ? 'dropdown-btn rotate' : 'dropdown-btn'}>
                            <Icon icon="mdi:hand-truck" />
                            <span>LOG</span>
                            {activeSubMenu === 3 ? (
                                <Icon icon="mdi:chevron-up" />
                            ) : (
                                <Icon icon="mdi:chevron-down" />
                            )}
                        </button>
                        <ul className={activeSubMenu === 3 ? 'sub-menu show' : 'sub-menu'}>
                            <div className='list-sub-menu'>
                                <li><a href="/products-estoque">Opção 1</a></li>
                                <li><a href="#">Opção 2</a></li>
                            </div>
                        </ul>
                    </li>

                    <li className='bottom-item'>
                        <a href="/login">
                            <Icon icon="majesticons:logout" className='icon' />
                            <span>Sair</span>
                        </a>
                    </li>

                    {/* Perfil Menu */}
                    <li>
                        <button onClick={() => toggleSubMenu(4)} className={activeSubMenu === 4 ? 'dropdown-btn rotate' : 'dropdown-btn'}>
                            <Icon icon="iconamoon:profile-circle-fill" className='icon' />
                            <span>Perfil</span>
                            {activeSubMenu === 4 ? (
                                <Icon icon="mdi:chevron-up" />  // Ícone de seta para cima
                            ) : (
                                <Icon icon="mdi:chevron-down" />  // Ícone de seta para baixo
                            )}
                        </button>
                        <ul className={activeSubMenu === 4 ? 'sub-menu show' : 'sub-menu'}>
                            <div className='list-sub-menu'>
                                <li><a onClick={openModal}>Editar Perfil</a></li> {/* Abre o modal */}
                                <li><a href="#">Notificações</a></li>
                            </div>
                        </ul>
                    </li>

                </ul>
            </nav>
            {isModalOpen && (
                <EditProfileModal
                    updateProfile={updateProfile}
                    onClose={closeModal}
                />
            )}
        </>
    );
};

export default SidebarGestock;