import React, { useState, useEffect } from 'react';

const InviteSection = ({ users, selectedUsers, setSelectedUsers }) => {
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filteredUsers, setFilteredUsers] = useState([]); 
    const [showUsers, setShowUsers] = useState(false); 
    const [filterOption, setFilterOption] = useState('Todos');
    const [showNotification, setShowNotification] = useState(false); 
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        if (filterOption === 'Todos') {
            setSelectedUsers(users); // Seleciona todos os usuários quando 'Todos' for selecionado
            setSearchTerm(''); // Limpa o campo de busca
            setShowUsers(false); // Esconde a lista de usuários filtrados
        } else {
            setSelectedUsers([]); // Remove todos os usuários quando 'Privado' é selecionado
        }
    }, [filterOption, users, setSelectedUsers]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers([]);
            setShowUsers(false);
        } else {
            const filtered = users.filter(user =>
                (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredUsers(filtered);
            setShowUsers(true);
        }
    }, [searchTerm, users]);

    const handleFilterChange = (e) => {
        setFilterOption(e.target.value);
        setSearchTerm('');
    };

    const handleUserClick = (user) => {
        setSearchTerm(user.name || user.email);
        setShowUsers(false);
    };

    const handleAddClick = () => {
        const foundUser = users.find(user => user.name === searchTerm || user.email === searchTerm);
        if (foundUser && !selectedUsers.includes(foundUser)) {
            setSelectedUsers([...selectedUsers, foundUser]);
            setNotificationMessage(`${searchTerm} adicionado com sucesso!`);
            setShowNotification(true);
            setSearchTerm('');

            setTimeout(() => setShowNotification(false), 3000);
        } else if (selectedUsers.includes(foundUser)) {
            setNotificationMessage('Usuário já foi adicionado.');
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        } else {
            setNotificationMessage('Nenhum usuário selecionado.');
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        }
    };

    return (
        <div className="invite-section">
            <div className="inputs-invite-user">
                <input
                    type="text"
                    className="invite-input"
                    placeholder="Usuários Relacionados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={filterOption === 'Todos'} // Desabilita o input quando "Todos" está selecionado
                />
                <select
                    className="invite-filter"
                    value={filterOption}
                    onChange={handleFilterChange}
                >
                    <option value="Todos">Todos</option>
                    <option value="Privado">Privado</option>
                </select>
                <button
                    className="invite-btn"
                    onClick={handleAddClick}
                    disabled={filterOption === 'Todos'} // Desabilita o botão quando "Todos" está selecionado
                    style={{
                        backgroundColor: filterOption === 'Todos' ? '#ccc' : '#FF1A1A',
                        cursor: filterOption === 'Todos' ? 'not-allowed' : 'pointer'
                    }}
                >
                    Adicionar
                </button>
            </div>

            {showNotification && (
                <div className="notification">
                    {notificationMessage}
                </div>
            )}

            {selectedUsers.length > 0 && (
                <div className="selected-users">
                    <strong>Usuários adicionados:</strong>
                    <ul>
                        {selectedUsers.map((user, index) => (
                            <li key={index}>{user.fullName || user.email}</li>
                        ))}
                    </ul>
                </div>
            )}

            {showUsers && (
                <div className="users-list fade-in">
                    {filteredUsers.map((user, index) => (
                        <div
                            key={index}
                            className="user-item"
                            onClick={() => handleUserClick(user)}
                            style={{ cursor: 'pointer' }}
                        >
                            {user.fullName || user.email}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InviteSection;
