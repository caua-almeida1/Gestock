import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react"
import "../../master/master.css";
import UserImage from '../../../img/fotodeperfiel_header.png'
import { ref, onValue, set, remove, getDatabase } from 'firebase/database';  // Adicione o método set para atualizar o banco
import { database } from '../../../firebase/firebase';
import Img1 from '../../../img/img-dash1.jpg';
import Img2 from '../../../img/img-dash2.jpg';
import Img3 from '../../../img/img-dash3.jpg';
import Sidebaradm from '../components/sidebar';
import Calendar from "../../../components/calendar-production/Calendar";
import Header from '../components/header';
import ScreenWarning from '../../../components/MaxPhone';

const Dashboard = () => {
    const [currentImage, setCurrentImage] = useState(0);
    const [isSliding, setIsSliding] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activities, setActivities] = useState([]); // Adicionando estado para atividades
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [showAllActivities, setShowAllActivities] = useState(false);
    const images = [Img1, Img2, Img3];

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prevImage) => (prevImage + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length]);

    const handleImageChange = (index) => {
        setCurrentImage(index);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setIsClosing(false);
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
        }, 300);
    };

    const fetchUsers = async () => {
        const db = getDatabase();
        const usersRef = ref(db, 'users');

        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            const usersList = [];

            for (let id in data) {
                usersList.push(data[id]); // Adiciona o usuário ao array
            }

            setUsers(usersList); // Atualiza o estado dos usuários
        });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchActivities = async () => {
        const db = getDatabase();
        const activitiesRef = ref(db, 'activities');

        onValue(activitiesRef, (snapshot) => {
            const data = snapshot.val();
            const activitiesList = [];

            for (let id in data) {
                activitiesList.push(data[id]); // Adiciona a atividade ao array
            }

            setActivities(activitiesList); // Atualiza o estado das atividades
        });
    };

    useEffect(() => {
        fetchUsers();
        fetchActivities();
    }, []);

    const visibleUsers = showAllUsers ? users : users.slice(0, 3);
    const visibleActivities = showAllActivities ? activities : activities.slice(0, 2);

    return (

        <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Sidebaradm isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="dashboard-conteudo">
                <div className="main-section">
                    <div className="calendar-dashboard">
                        <div>
                            <Calendar className="calendar-dashboard" />
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-news">
                            <div className="carousel-container">
                                <div className={`carousel-container ${isModalOpen ? 'darkened' : ''}`}>
                                    <div className="card-image">
                                        <div
                                            className="image-slider"
                                            style={{ transform: `translateX(-${currentImage * 100}%)` }}
                                        >
                                            {images.map((image, index) => (
                                                <img key={index} src={image} alt={`Notícia SENAI-SP ${index}`} className="card-img" />
                                            ))}
                                        </div>
                                        <div className="image-dots">
                                            {images.map((_, index) => (
                                                <span
                                                    key={index}
                                                    className={`dot ${currentImage === index ? 'active' : ''}`}
                                                    onClick={() => handleImageChange(index)}
                                                ></span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-content-news">
                                <h3>Notícias SENAI-SP</h3>
                                <p>Suzana Dias, 25 de setembro de 2024 – O SENAI Suzana Dias anunciou hoje o lançamento de um novo programa de capacitação des...</p>
                                <button className="btn-saiba-mais">Saiba Mais</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bottom-section">
                    <div className="activities">
                        <h3>Atividades</h3>
                        <div className="activity-item">
                            <div className="activity-content">
                                <div className="user-avatar-container">
                                    <img src={UserImage} alt="User" className="user-avatar" />
                                </div>
                                <div className="activity-text">
                                    <div className="activity-icon">
                                        <Icon icon="ion:flag" className="flag-icon" />Nova Atividade
                                    </div>
                                    <div className="text-content">
                                        <span className="user-name">Patricia Prof.</span> adicionou uma nova <strong>Atividade</strong>
                                        <span className="activity-time">Just Now</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="recent-invoices">
                        <h3>Todos Usuários</h3>
                        <div className="user-table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome Do Usuário</th>
                                        <th>E-mail</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleUsers.map((user, index) => (
                                        <tr key={index}>
                                            <td>{user.fullName}</td>
                                            <td>{user.email}</td>
                                            <td className={user.status === 'Ativo' ? 'online-status' : 'warning'}>
                                                {typeof user.status === 'string' ? user.status : 'Status desconhecido'}
                                            </td>

                                            <td className="primary" onClick={handleOpenModal}>Detalhes</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {showAllUsers ? (
                            <a href="#!" onClick={() => setShowAllUsers(false)}>Ver Menos</a>
                        ) : (
                            <a href="#!" onClick={() => setShowAllUsers(true)}>Ver Mais</a>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className={`modal ${isClosing ? 'closing' : 'open'}`}>
                        <div className="modal-content">
                            <h2>Detalhes do Usuário</h2>
                            <p>Informações sobre o usuário selecionado.</p>
                            <button className='delete-modal-button' onClick={handleCloseModal}>Fechar</button>
                        </div>
                    </div>
                )}
            </div >
            <ScreenWarning />
        </div>
    );
};

export default Dashboard;
