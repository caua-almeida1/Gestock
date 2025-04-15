import React, { useState, useEffect } from 'react';

const UserPopup = ({ usersList, isOpen, onClose }) => {
    const [isPopupClosing, setIsPopupClosing] = useState(false);
    const [isPopupEntering, setIsPopupEntering] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsPopupEntering(true);  // Inicia animação de entrada
        }
    }, [isOpen]);

    const handleClosePopup = () => {
        setIsPopupClosing(true);    // Iniciar a animação de fechamento
        setTimeout(() => {
            onClose(); // Fechar o popup após a animação
            setIsPopupClosing(false);
            setIsPopupEntering(false); // Resetar o estado de entrada após o fechamento
        }, 300);  // Tempo de transição do CSS
    };

    if (!isOpen && !isPopupEntering) return null;

    return (
        <div className={`popup-container ${isPopupEntering ? 'entering' : ''} ${isPopupClosing ? 'closing' : ''}`}>
            <div className="popup-content">
                {/* Renderize os usuários ou outra lógica aqui */}
                <ul>
                    {usersList.map((user, index) => (
                        <li key={index}>{user.fullName} - {user.email}</li>
                    ))}
                </ul>
                <button onClick={handleClosePopup}>Fechar Popup</button>
            </div>
        </div>
    );
};

export default UserPopup;
