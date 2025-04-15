import React, { useState } from 'react';
import ModalGroupUsers from './ModalGroupUsers';
import { getDatabase, ref, push } from 'firebase/database';

const ModalGroup = ({ isOpen, onClose }) => {
    const [isGroupUsersOpen, setIsGroupUsersOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');

    if (!isOpen) return null;

    const handleOpenGroupUsers = () => {
        setIsGroupUsersOpen(true);
    };

    const handleCloseGroupUsers = () => {
        setIsGroupUsersOpen(false);
    };

    const handleAddUsers = (users) => {
        setSelectedUsers(users);
        handleCloseGroupUsers();
    };

    const handleCreateGroup = async () => {
        const db = getDatabase();
        const groupRef = ref(db, 'chat/conversations/groups'); // Caminho do grupo no banco de dados

        const newGroup = {
            name: groupName,
            description: groupDescription,
            contacts: selectedUsers.map((user) => user.id),
        };

        try {
            await push(groupRef, newGroup); // Adiciona o grupo ao Firebase
            alert('Grupo criado com sucesso!');
            onClose(); // Fecha o modal após a criação do grupo
        } catch (error) {
            console.error('Erro ao criar grupo:', error);
            alert('Erro ao criar grupo.');
        }
    };

    return (
        <div className="modal-group-overlay">
            <div className="modal-group">
                <div className="modal-group-header">
                    <h2>Criar Novo Grupo</h2>
                    <button onClick={onClose} className="close-group-btn">X</button>
                </div>
                <div className="modal-group-body">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="text"
                            placeholder="Nome do grupo"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="modal-group-input"
                        />
                        <textarea
                            placeholder="Descrição do grupo"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            className="modal-group-textarea"
                        ></textarea>
                        <input
                            type="text"
                            placeholder="Integrantes"
                            value={selectedUsers.map((user) => user.fullName).join(', ')}
                            className="modal-group-input"
                            readOnly
                        />
                        <button type="button" onClick={handleOpenGroupUsers} className="modal-group-btn-add-users">
                            Adicionar Integrantes
                        </button>
                    </form>
                    <button type="button" onClick={handleCreateGroup} className="modal-group-submit">
                        Criar Grupo
                    </button>
                </div>
            </div>
            {isGroupUsersOpen && (
                <ModalGroupUsers onClose={handleCloseGroupUsers} onAddUsers={handleAddUsers} />
            )}
        </div>
    );
};

export default ModalGroup;
