
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import EditProfileModal from './editprofile';
import { auth } from '../firebase/firebase';
import { getAuth, signOut } from 'firebase/auth'; // Importa as funções do Firebase
import { useNavigate } from 'react-router-dom'; // Para redirecionamento

const SidebarGestock = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Inicializado como false para nomes ocultos
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Função para alternar o estado do sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        closeAllSubMenus(); // Fecha submenus quando a sidebar é recolhida
    };

    // Função para alternar submenus
    const toggleSubMenu = (index) => {
        if (activeSubMenu === index) {
            setActiveSubMenu(null); // Fecha o submenu se ele já estiver ativo
        } else {
            setActiveSubMenu(index); // Abre o submenu específico
        }

        if (!isSidebarOpen) {
            setIsSidebarOpen(true); // Abre a sidebar se ela estiver fechada ao clicar no submenu
        }
    };

    // Função para fechar todos os submenus
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
                        <a href="/dashboard">
                            <Icon icon="mage:dashboard-fill" className='icon' />
                            {isSidebarOpen && <span>Dashboard</span>}
                        </a>
                    </li>
                    <li>
                        <a href="/modulos">
                            <Icon icon="streamline:module-three-solid" className='icon' />
                            {isSidebarOpen && <span>Módulos</span>}
                        </a>
                    </li>
                    <li>
                        <a href="/visuario">
                            <Icon icon="mdi:user" />
                            {isSidebarOpen && <span>Visualizar Usuario</span>}
                        </a>
                    </li>
                    <li>
                        <a href="/visaogeral">
                            <Icon icon="zondicons:view-show" className='icon' />
                            {isSidebarOpen && <span>Visão Geral</span>}
                        </a>
                    </li>
                    <li>
                        <a href="/chat">
                            <Icon icon="mingcute:chat-1-fill" className='icon' />
                            {isSidebarOpen && <span>Chat</span>}
                        </a>
                    </li>
                    <li>
                        <a href="/upload">
                            <Icon icon="line-md:upload" className='icon' />
                            {isSidebarOpen && <span>Upload</span>}
                        </a>
                    </li>
                    <li>
                        <a href="/meucalendario">
                            <Icon icon="tabler:calendar-filled" className='icon' />
                            {isSidebarOpen && <span>Calendário</span>}
                        </a>
                    </li>
                    <li>
                        <button onClick={() => toggleSubMenu(1)} className={activeSubMenu === 1 ? 'dropdown-btn rotate' : 'dropdown-btn'}>
                            <Icon icon="iconamoon:profile-circle-fill" className='icon' />
                            {isSidebarOpen && <span>Perfil</span>}
                            <Icon icon="mdi:chevron-down" />
                        </button>
                        <ul className={activeSubMenu === 1 ? 'sub-menu show' : 'sub-menu'}>
                            <div className='list-sub-menu'>
                                <li><a onClick={openModal}>Editar Perfil</a></li> {/* Abre o modal */}
                                <li><a href="#">Notificações</a></li>
                            </div>
                        </ul>
                    </li>
                    <button onClick={handleLogout} className="logout-btn">
                    <li className='bottom-item'>
                    
                        <a>
                            <Icon icon="majesticons:logout" className='icon' />
                            {isSidebarOpen && <span>Sair</span>}
                        </a>
                    
                    </li>
                    </button>
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
