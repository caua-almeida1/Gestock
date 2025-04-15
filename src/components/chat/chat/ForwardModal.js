import React, { useState } from 'react';
import { Icon } from "@iconify/react";

const ForwardModal = ({ isOpen, onClose, contacts, isExiting, forwardedMessage, onForward }) => {
    const [selectedContacts, setSelectedContacts] = useState([]);

    if (!isOpen && !isExiting) return null;

    const toggleContactSelection = (contactId) => {
        setSelectedContacts(prev => 
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleClose = () => {
        onClose();
    };

    const handleForward = () => {
        onForward(selectedContacts, forwardedMessage);
        onClose(); // Fecha o modal após o envio
    };

    return (
        <div className={`modal-overlay-forward ${isExiting ? 'fade-out-forward' : ''}`} onClick={handleClose}>
            <div className={`modal-content-forward ${isExiting ? 'scale-out-forward' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className='modal-content-forward-header'>
                    <h2>Encaminhar Mensagem</h2>
                    <button onClick={handleClose} className="close-button">
                        <Icon icon="mdi:close" className="icon" />
                    </button>
                </div>

                {selectedContacts.length > 0 && (
                    <div className="selected-contacts">
                        <strong>Usuários selecionados:</strong>
                        <ul>
                            {contacts.filter(contact => selectedContacts.includes(contact.id)).map(contact => (
                                <li key={contact.id}>{contact.fullName}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <ul className="contacts-list forward-contacts-list">
                    {contacts.map(contact => (
                        <li className="hover-item" key={contact.id}>
                            <div className="checkbox-wrapper-46">
                                <input
                                    type="checkbox"
                                    id={`cbx-${contact.id}`}
                                    className="inp-cbx"
                                    checked={selectedContacts.includes(contact.id)}
                                    onChange={() => toggleContactSelection(contact.id)}
                                />
                                <label htmlFor={`cbx-${contact.id}`} className="cbx label">
                                    <span>
                                        <svg viewBox="0 0 12 10" height="10px" width="12px">
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
                                        <h1>{contact.fullName}</h1>
                                    </div>
                                </label>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="forwarded-message">
                    <strong>Mensagem a ser encaminhada:</strong>
                    <p>{forwardedMessage}</p>
                </div>

                <div className="modal-actions">
                    <button className='forward-button' onClick={handleForward}>Encaminhar</button>
                    <button onClick={handleClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default ForwardModal;
