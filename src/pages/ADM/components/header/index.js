import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';  
import logo from '../../../../img/logogestock.png';
import defaultPhoto from '../../../../img/fotodeperfiel_header.png';
import EditProfileModal from '../../../../components/editprofile'; 

const Header = () => {
    const [profile, setProfile] = useState({
        fullName: "Bruno Gomes",
        role: "Administrador",
        email: "brunogomes@gmail.com",
        currentPassword: "22222",
        photo: defaultPhoto 
    });

    const [showModal, setShowModal] = useState(false); // Estado para controlar o modal do menu
    const [showEditProfile, setShowEditProfile] = useState(false); // Estado para o modal de edição de perfil
    const modalRef = useRef(null);
    const editProfileModalRef = useRef(null); // Ref para o modal de edição de perfil

    const toggleModal = () => {
        setShowModal(prev => !prev);
    };

    const openEditProfile = () => {
        setShowModal(false); // Fecha o primeiro modal
        setShowEditProfile(true); // Abre o modal de edição de perfil
    };

    const closeEditProfile = () => {
        setShowEditProfile(false); // Fecha o modal de edição de perfil
    };

    // Função para atualizar o perfil
    const updateProfile = (updatedProfile) => {
        setProfile(updatedProfile); // Atualiza o estado com os novos dados
    };

    // Fechar o primeiro modal ao clicar fora dele
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);

    // Fechar o modal de edição de perfil ao clicar fora dele
    useEffect(() => {
        const handleClickOutsideEditProfile = (event) => {
            if (editProfileModalRef.current && !editProfileModalRef.current.contains(event.target)) {
                closeEditProfile();
            }
        };
        document.addEventListener('mousedown', handleClickOutsideEditProfile);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideEditProfile);
        };
    }, [showEditProfile]);

    return (
        <div className="header-container">
            <div className="logo-gestock">
                <img src={logo} alt="Logo Gestock" />
            </div>

            <div className="headerright">
                <div className="user-info">
                    <div className="profile-pic">
                        <img src={profile.photo} alt="Foto de Perfil" />
                    </div>

                    <div className="user-name">
                        <h3>{profile.fullName}</h3>
                    </div>

                    <div className="user-arrow" onClick={toggleModal}>
                        <Icon icon="fe:arrow-down" style={{ color: '#000000', cursor: 'pointer' }} />
                    </div>

                    {showModal && (
                        <div className="header-modal" ref={modalRef}>
                            <button className="header-modal-option" onClick={openEditProfile}>Editar perfil</button>
                            <button className="header-modal-option">Editar empresa</button>
                        </div>
                    )}
                </div>
            </div>

            {showEditProfile && (
                <div ref={editProfileModalRef}>
                    <EditProfileModal 
                        profile={profile} 
                        updateProfile={updateProfile}  // Passa a função de atualização
                        onClose={closeEditProfile} 
                    />
                </div>
            )}
        </div>
    );
};

export default Header;
