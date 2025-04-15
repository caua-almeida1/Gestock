import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

// Modal para editar a mensagem
const EditMessageModal = ({ isVisible, onClose, message, onSubmit }) => {
    const [editedMessage, setEditedMessage] = useState(message.text);
    const [isClosing, setIsClosing] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        // Focar automaticamente no textarea ao abrir o modal
        if (isVisible && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isVisible]);

    const handleInputChange = (e) => {
        setEditedMessage(e.target.value);
        const textareaLineHeight = 24;
        const maxLines = 5;
        const textarea = e.target;
        textarea.style.height = "auto";
        const newHeight = Math.min(
            textarea.scrollHeight,
            textareaLineHeight * maxLines
        );
        textarea.style.height = `${newHeight}px`;
        textarea.style.overflow =
            textarea.scrollHeight > textareaLineHeight * maxLines ? "auto" : "hidden";
    };

    const handleSubmit = () => {
        if (editedMessage.trim() !== "" && editedMessage !== message.text) {
            onSubmit(editedMessage);
            handleClose(); // Chama a função de fechamento com animação
        } else {
            handleClose(); // Apenas fecha o modal se não houver mudanças
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // Previne a quebra de linha com Enter
            handleSubmit(); // Usa a mesma lógica de submissão
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false); // Reseta para a próxima abertura
            onClose();
        }, 200); // Tempo de animação em ms
    };

    return (
        isVisible && (
            <div className={`edit-message-modal-overlay ${isClosing ? 'fade-out' : ''}`}>
                <div className={`edit-message-modal-content ${isClosing ? 'scale-out' : ''}`}>
                    <header className="edit-message-modal-header">
                        <h1>Editar Mensagem</h1>
                        <button className="close-btn" onClick={handleClose}>
                            <Icon icon="mdi:close" className="icon" />
                        </button>
                    </header>
                    <div className="edit-message-modal-body">
                        <div className="edit-message-body-past">
                            <div className="conversation-edit-message-item">
                                <p>{message.text}</p>
                                <p>{message.time}</p>
                            </div>                                  
                        </div>
                    </div>
                    <footer className="edit-message-modal-footer">
                        <div className="edit-message-group-form">
                            <textarea
                                type="text"
                                rows="1"
                                className="conversation-form-input"
                                placeholder="Digite uma mensagem..."
                                ref={textareaRef}
                                value={editedMessage}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress} // Detecta Enter
                            />
                            <Icon
                                className="submit-send-edit-conversation icon"
                                icon="ic:baseline-check"
                                onClick={handleSubmit}
                            />
                        </div>
                    </footer>
                </div>
            </div>
        )
    );
};

export default EditMessageModal;
