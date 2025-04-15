import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import InviteSection from './InviteSection';
import { database, ref, push, set, get } from '../../firebase/firebase';

const SelectedDaysBox = ({ selectedDays, onClose, closing, year, prodLogMonth }) => {
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('00:00');
    const [eventName, setEventName] = useState('');
    const [eventLink, setEventLink] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [toastType, setToastType] = useState('success');
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionClick = (option) => {
        setSelectedOption(prev => (prev === option ? null : option));
    };

    const fetchUsers = async () => {
        const usersRef = ref(database, 'users/');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const usersData = snapshot.val();
            setUsers(Object.values(usersData));
        } else {
            console.log('Nenhum usuário encontrado.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getDayOfWeek = (day, month, year) => {
        const daysOfWeek = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];
        const date = new Date(year, month, day);
        return daysOfWeek[date.getDay()];
    };

    const firstDayObj = selectedDays[0];
    const lastDayObj = selectedDays[selectedDays.length - 1];

    let eventDuration = '';
    if (firstDayObj) {
        const firstDayString = `${getDayOfWeek(firstDayObj.day, firstDayObj.month, firstDayObj.year)}, Dia ${firstDayObj.day} de ${months[firstDayObj.month]}`;
        const lastDayString = `${getDayOfWeek(lastDayObj.day, lastDayObj.month, lastDayObj.year)}, Dia ${lastDayObj.day} de ${months[lastDayObj.month]}`;

        eventDuration = firstDayObj.day === lastDayObj.day
            ? firstDayString
            : `${firstDayString} até ${lastDayString}`;
    }

        const handleScheduleEvent = () => {
        if (!eventName || !startTime || !endTime || !eventDescription) {
            setToastType('error');
            setShowToast(true);
            setShowProgress(false);
            setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return;
        }

        const eventType = selectedOption || 'relative';

        const eventRef = push(ref(database, 'events'));

        const eventData = {
            name: eventName,
            duration: eventDuration,
            startTime,
            endTime,
            link: eventLink || null,
            description: eventDescription,
            users: selectedUsers.length > 0 ? selectedUsers.map(user => ({ ...user, status: 'pending' })) : users.map(user => ({ ...user, status: 'pending' })), // Adicionando todos os usuários se "Todos" estiver selecionado
            selectedDays,
            eventType,
            status: 'pending'
        };

        set(eventRef, eventData)
            .then(() => {
                console.log("Evento agendado com sucesso!");
                setToastType('success');
                setShowToast(true);
                setShowProgress(true);
                setTimeout(() => {
                    setShowToast(false);
                    setShowProgress(false);

                    document.querySelector('.selected-days-box').classList.add('slideout');
                    document.querySelector('.overlay').classList.add('fadeout');

                    setTimeout(() => {
                        onClose();
                    }, 1000);
                }, 2000);
            })
            .catch((error) => {
                console.error("Erro ao agendar evento: ", error);
            });
    };

    const closeWithAnimation = () => {
        document.querySelector('.selected-days-box').classList.add('slideout');
        document.querySelector('.overlay').classList.add('fadeout');

        setTimeout(() => {
            onClose();
        }, 1000);
    };
    
    return (
        <div className={`overlay ${closing ? 'fadeout' : 'fadein'}`}>
            <div className={`selected-days-box ${closing ? 'slideout' : 'slidein'}`}>
                <div className="selected-days-box-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <h3 style={{ textAlign: 'center', flexGrow: 1 }}>Adicionar Eventos</h3>
                    <Icon
                        className='icon'
                        icon="mingcute:close-fill"
                        onClick={closeWithAnimation}
                        style={{ position: 'absolute', right: '10px', cursor: 'pointer', fontSize: '24px' }}
                    />
                </div>
                <div className='content-days'>
                    <InviteSection
                        users={users}
                        selectedUsers={selectedUsers}
                        setSelectedUsers={setSelectedUsers}
                    />

                    <div className="coolinput">
                        <label className="text" htmlFor="input">Nome do Evento:</label>
                        <input
                            className="input"
                            name="input"
                            placeholder="Escreva aqui o nome do evento..."
                            type="text"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                        />
                    </div>

                    <div className="coolinput">
                        <label className="text" htmlFor="duration">Duração do Evento</label>
                        <input className="input input-event-duration" name="duration" type="text" value={eventDuration} readOnly style={{ cursor: 'default' }} />
                    </div>

                    <div className="coolinput">
                        <label className="text" htmlFor="link">Adicionar Link</label>
                        <input
                            className="input"
                            name="link"
                            type="text"
                            placeholder="Adicionar link ao evento..."
                            value={eventLink}
                            onChange={(e) => setEventLink(e.target.value)}
                        />
                    </div>

                    <div className='flex-inputs'>
                        <div className="coolinput">
                            <label className="text" htmlFor="start-time">Início do Evento</label>
                            <input
                                className="input"
                                name="start-time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>

                        <div className="coolinput">
                            <label className="text" htmlFor="end-time">Fim do Evento</label>
                            <input
                                className="input"
                                name="end-time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="coolinput">
                        <label className="text" htmlFor="description">Adicionar Descrição</label>
                        <textarea
                            className="input"
                            name="description"
                            placeholder="Adicionar descrição ao evento..."
                            value={eventDescription}
                            onChange={(e) => setEventDescription(e.target.value)}
                        />
                    </div>

                    <h1 className="event-type-title">Tipo de Evento</h1>
                    <div className="option-boxes">
                        <div
                            className={`option-box option-important ${selectedOption === 'important' ? 'selected' : ''}`}
                            onClick={() => handleOptionClick('important')}
                        >
                            <Icon icon="fluent:important-12-regular" className="option-icon icon" />
                            <span className="option-text">Importante</span>
                        </div>
                        <div
                            className={`option-box option-relative ${selectedOption === 'relative' ? 'selected' : ''}`}
                            onClick={() => handleOptionClick('relative')}
                        >
                            <Icon icon="majesticons:pin-line" className="option-icon icon" />
                            <span className="option-text">Relativo</span>
                        </div>
                    </div>
                </div>

                <div className="footer">
                    <button className="cancel-btn" onClick={closeWithAnimation}>Cancelar</button>
                    <button className="schedule-btn" onClick={handleScheduleEvent}>Agendar</button>
                </div>
            </div>

            {/* Toast de sucesso */}
            <div className={`toast ${showToast ? 'show' : 'hide'} ${toastType}`}>
                <div className="toast-content">
                    <Icon
                        icon={toastType === 'success' ? "ic:round-check" : "ic:round-close"}
                        className={`icon ${toastType}`}
                        style={{ color: toastType === 'success' ? '#4caf50' : '#ee0e0e' }}
                    />
                    <div className="message">
                        <span className="text text-1">{toastType === 'success' ? 'Sucesso' : 'Erro'}</span>
                        <span className="text text-2">{toastType === 'success' ? 'Evento foi criado com sucesso!' : 'Preencha os campos'}</span>
                    </div>
                    <Icon
                        icon="ic:round-close"
                        className="fa-solid fa-xmark close"
                        onClick={() => setShowToast(false)}
                    />
                    <div className={`progress ${showProgress ? 'show' : ''}${toastType}`}></div>
                </div>
            </div>
        </div>
    );
};

export default SelectedDaysBox;
