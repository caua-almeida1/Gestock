import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

const ModalGroupUsers = ({ onClose, onAddUsers }) => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        const db = getDatabase();
        const usersRef = ref(db, 'users'); // Supondo que os dados dos usuários estejam na coleção "users"

        const unsubscribe = onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val();
            if (usersData) {
                const usersArray = Object.keys(usersData).map((key) => ({
                    id: key,
                    ...usersData[key]
                }));
                setUsers(usersArray);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleCheckboxChange = (user) => {
        setSelectedUsers((prevSelected) =>
            prevSelected.some((u) => u.id === user.id)
                ? prevSelected.filter((u) => u.id !== user.id)
                : [...prevSelected, user]
        );
    };

    const handleAddUsersClick = () => {
        onAddUsers(selectedUsers);
    };

    return (
        <div className="modal-group-overlay">
            <div className="modal-group">
                <div className="modal-group-header">
                    <h2>Adicionar Integrantes</h2>
                    <button onClick={onClose} className="close-group-btn">X</button>
                </div>
                <div className="modal-group-body">
                    <ul>
                        {users.map((user) => (
                            <li key={user.id} className="user-item">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.some((u) => u.id === user.id)}
                                    onChange={() => handleCheckboxChange(user)}
                                />
                                {user.fullName}
                            </li>
                        ))}
                    </ul>
                    <h3>Usuários Selecionados:</h3>
                    <ul>
                        {selectedUsers.map((user) => (
                            <li key={user.id}>{user.fullName}</li>
                        ))}
                    </ul>
                    <button onClick={handleAddUsersClick} className="modal-group-submit">
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalGroupUsers;
