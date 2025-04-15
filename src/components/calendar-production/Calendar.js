import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { getDatabase, ref, onValue, update, get } from 'firebase/database';

export const Calendar = () => {
    const [currDate, setCurrDate] = useState(new Date());
    const [currMonth, setCurrMonth] = useState(currDate.getMonth());
    const [isCompact, setIsCompact] = useState(false);
    const [selectedFirstDays, setSelectedFirstDays] = useState([]);
    const [eventTypes, setEventTypes] = useState({});
    const [hoveredDay, setHoveredDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [modalEventData, setModalEventData] = useState(null);
    const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
    const [isPopupClosing, setIsPopupClosing] = useState(false);
    const [isPopupEntering, setIsPopupEntering] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [activeFilter, setActiveFilter] = useState(''); // Estado para controlar o filtro ativo

    // Notificar Usuario email 
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isEmailModalClosing, setIsEmailModalClosing] = useState(false);
    const [emailDetails, setEmailDetails] = useState({
        email: '',
        title: 'Notificação Evento Gestock', // Título pré-definido
        content: 'Este é um aviso de notificação ao evento.', // Conteúdo pré-definido
        file: null, // Arquivo anexado
    });

    const db = getDatabase();

    const [users, setUsers] = useState([]);
    const [statusFilter, setStatusFilter] = useState('pending'); // Inicializa o filtro como 'pending'
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentEventId, setCurrentEventId] = React.useState(null);

    const checkIfAllUsersCompleted = (users) => {
        return users.every(user => user.status === 'completed');
    };

    const [selectedEndTime, setSelectedEndTime] = useState(null);
    const [timeDifference, setTimeDifference] = useState(null);

    const handleDayClick = (day) => {
        if (selectedFirstDays.includes(day.date)) {
            const eventDetails = eventTypes[day.date];
            console.log(`Informações do evento para o dia ${day.date}:`);
            console.log(`ID do evento: ${eventDetails.eventId}`);
            console.log(`Nome do evento: ${eventDetails.eventName}`);
            console.log(`Tipo de evento: ${eventDetails.eventType}`);
            console.log(`End Time do evento: ${eventDetails.endTime}`);

            setCurrentEventId(eventDetails.eventId);
            fetchUsersFromEvent(eventDetails.eventId);


            if (eventDetails.users && eventDetails.users.length > 0) {
                console.log(`Usuários registrados para este evento:`);
                eventDetails.users.forEach((user, index) => {
                    console.log(`${index + 1}. Nome: ${user.fullName}, E-mail: ${user.email}, Cargo: ${user.job}`);
                });
                if (checkIfAllUsersCompleted(eventDetails.users)) {
                    const db = getDatabase();
                    const eventRef = ref(db, `events/${eventDetails.eventId}`);

                    update(eventRef, {
                        status: 'completed'
                    }).then(() => {
                        console.log('Status do evento atualizado para "completed".');
                    }).catch((error) => {
                        console.error('Erro ao atualizar o status do evento:', error);
                    });
                } else {
                    console.log('Nem todos os usuários completaram o evento.');
                }
            } else {
                console.log('Nenhum usuário registrado para este evento.');
            }
            setModalEventData({
                title: `Evento no dia ${day.date}`,
                name: eventDetails.eventName,
                date: day.date,
                eventType: eventDetails.eventType,
                duration: eventDetails.duration,
                link: eventDetails.link,
                users: eventDetails.users || [],
                endTime: eventDetails.endTime
            });
            setSelectedEndTime(eventDetails.endTime);
            setIsModalOpen(true);
        } else {
            console.log(`O dia ${day.date} não possui evento associado.`);
        }
    };

    const toggleCompact = () => setIsCompact(!isCompact);
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    useEffect(() => {
        const db = getDatabase();
        const eventsRef = ref(db, 'events');
        onValue(eventsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const eventKeys = Object.keys(data);
                let firstDays = [];
                let eventTypeMap = {};
                eventKeys.forEach((key) => {
                    const event = data[key];
                    if (event.selectedDays && event.selectedDays.length > 0) {
                        const firstDay = event.selectedDays[0];
                        firstDays.push(firstDay);
                        eventTypeMap[firstDay] = {
                            eventType: event.eventType,
                            eventName: event.name,
                            duration: event.duration,
                            link: event.link,
                            eventId: key,
                            users: event.users,
                            status: event.status,
                            endTime: event.endTime
                        };
                        if (event.duration) {
                            const durationParts = event.duration.split(' até ');
                            if (durationParts.length === 1) {
                                const singleDayMatch = durationParts[0].match(/Dia (\d+) de (\w+)/);
                                if (singleDayMatch) {
                                    const singleDay = parseInt(singleDayMatch[1], 10);
                                    const singleMonth = months.indexOf(singleDayMatch[2]);
                                    if (singleMonth === currMonth) {
                                        firstDays.push(singleDay);
                                        eventTypeMap[singleDay] = {
                                            eventType: event.eventType,
                                            eventName: event.name,
                                            duration: event.duration,
                                            link: event.link,
                                            eventId: key,
                                            users: event.users,
                                            status: event.status,
                                            endTime: event.endTime
                                        };
                                    }
                                }
                            } else if (durationParts.length === 2) {
                                const startDateString = durationParts[0].match(/Dia (\d+) de (\w+)/);
                                const endDateString = durationParts[1].match(/Dia (\d+) de (\w+)/);
                                if (startDateString && endDateString) {
                                    const startDay = parseInt(startDateString[1], 10);
                                    const startMonth = months.indexOf(startDateString[2]);
                                    const endDay = parseInt(endDateString[1], 10);
                                    const endMonth = months.indexOf(endDateString[2]);
                                    for (let month = startMonth; month <= endMonth; month++) {
                                        const daysInMonth = new Date(currDate.getFullYear(), month + 1, 0).getDate();
                                        const start = month === startMonth ? startDay : 1;
                                        const end = month === endMonth ? endDay : daysInMonth;
                                        if (month === currMonth) {
                                            firstDays.push(start);
                                            eventTypeMap[start] = {
                                                eventType: event.eventType,
                                                eventName: event.name,
                                                duration: event.duration,
                                                link: event.link,
                                                eventId: key,
                                                users: event.users,
                                                status: event.status,
                                                endTime: event.endTime
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                setSelectedFirstDays(firstDays);
                setEventTypes(eventTypeMap);
            }
        });
    }, [currMonth]);
    useEffect(() => {
        const filtered = usersList.filter(user => user.status === statusFilter);
        setFilteredUsers(filtered);
    }, [statusFilter, usersList]);
    useEffect(() => {
        const db = getDatabase();
        const usersRef = ref(db, 'users');
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersArray = Object.keys(data).map(key => data[key]);
                setUsersList(usersArray);
            }
        });
    }, []);
    useEffect(() => {
        if (selectedEndTime) {
            const endTimeParts = selectedEndTime.split(':');
            const endDate = new Date();
            endDate.setHours(parseInt(endTimeParts[0], 10), parseInt(endTimeParts[1], 10), 0);
            const now = new Date();
            const diffInMs = endDate - now;
            const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
            setTimeDifference(diffInMinutes);
        }
    }, [selectedEndTime]);

    useEffect(() => {
        if (currentEventId) {
            fetchUsersFromEvent(currentEventId);
        }
    }, [currentEventId]);

    const generateDays = () => {
        const firstDayOfMonth = new Date(currDate.getFullYear(), currMonth, 1).getDay();
        const lastDateOfMonth = new Date(currDate.getFullYear(), currMonth + 1, 0).getDate();
        const lastDayOfMonth = new Date(currDate.getFullYear(), currMonth, lastDateOfMonth).getDay();
        const lastDateOfLastMonth = new Date(currDate.getFullYear(), currMonth, 0).getDate();
        const days = [];

        // Função para gerar a classe dos eventos
        const getEventClass = (day) => {
            const event = eventTypes[day];
            if (!event) return ''; // Se não houver evento, não adiciona classe

            // Verifica se todos os usuários do evento concluíram
            const isCompleted = event.users && checkIfAllUsersCompleted(event.users);

            // Se não houver filtro ativo, mostrar todos os eventos
            if (!activeFilter) {
                return `selected-day-event ${event.eventType}-event ${isCompleted ? 'completed-event' : ''}`;
            }

            // Aplicar o filtro correspondente
            if (activeFilter === 'important' && event.eventType === 'important' && event.status !== 'completed') {
                return 'selected-day-event important-event';
            }
            if (activeFilter === 'relative' && event.eventType === 'relative' && event.status !== 'completed') {
                return 'selected-day-event relative-event';
            }
            if (activeFilter === 'completed' && (event.status === 'completed' || isCompleted)) {
                return 'selected-day-event completed-event';
            }

            return ''; // Se não passar no filtro, retorna string vazia
        };

        // Dias do mês anterior
        for (let i = firstDayOfMonth; i > 0; i--) {
            days.push({ date: lastDateOfLastMonth - i + 1, className: 'inactive' });
        }

        // Dias do mês atual
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const isToday = i === currDate.getDate() && currMonth === currDate.getMonth() ? 'active' : '';
            const eventClass = getEventClass(i);

            // Verifica se é dia importante, caso contrário aplica apenas a classe padrão
            const isSelectedDay = eventClass ? 'selected-day-event' : '';

            days.push({ date: i, className: `${isToday} ${isSelectedDay} ${eventClass}`.trim() });
        }
        // Dias do próximo mês
        for (let i = lastDayOfMonth; i < 6; i++) {
            days.push({ date: i - lastDayOfMonth + 1, className: 'inactive' });
        }
        return days;
    };
    const handlePrevNextClick = (direction) => {
        setCurrMonth(prev => {
            let newMonth = direction === 'prev' ? prev - 1 : prev + 1;
            if (newMonth < 0 || newMonth > 11) {
                newMonth = newMonth < 0 ? 11 : 0;
            }
            return newMonth;
        });
    };
    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setIsClosing(false);
        }, 500);
    };
    const handleClosePopup = () => {
        setIsPopupClosing(true);
        setTimeout(() => {
            setIsUserPopupOpen(false);
            setIsPopupClosing(false);
            setIsPopupEntering(false);
        }, 300);
    };
    const handleExtraUsersClick = (users) => {
        setUsersList(users);
        setIsUserPopupOpen(true);
        setIsUserPopupOpen(true);
        setTimeout(() => setIsPopupEntering(true), 10);
    };

    const days = generateDays();
    const renderUserProfile = (user) => {
        if (user.profileImg) {
            return <img src={user.profileImg} alt={user.fullName} className="user-extra-info-img" />;
        } else {
            const firstLetter = user.fullName.charAt(0).toUpperCase();
            return (
                <div className="user-extra-info-circle">
                    {firstLetter}
                </div>
            );
        }
    };
    const calculatePendingTime = (duration, endTime) => {
        const dateMatch = duration.match(/(\w+), Dia (\d+) de (\w+)/);
        if (!dateMatch) return 'Data inválida';
        const eventDay = parseInt(dateMatch[2], 10);
        const eventMonth = months.indexOf(dateMatch[3]); // Usando o seu array de meses
        const eventYear = new Date().getFullYear();
        const eventDate = new Date(eventYear, eventMonth, eventDay);
        const [eventHour, eventMinute] = endTime.split(':').map(Number);
        eventDate.setHours(eventHour, eventMinute, 0, 0);
        const now = new Date();
        if (now > eventDate) {
            const timeDifference = now - eventDate; // Mudou a ordem aqui
            const minutesPending = Math.ceil(timeDifference / (1000 * 60));
            const daysPending = Math.floor(minutesPending / 1440); // 1440 minutos em um dia
            const hoursPending = Math.floor((minutesPending % 1440) / 60);
            const remainingMinutes = minutesPending % 60;
            let pendingTime = '';
            if (daysPending > 0) {
                pendingTime += `${daysPending}d `;
            }
            if (hoursPending > 0) {
                pendingTime += `${hoursPending}h `;
            }
            if (remainingMinutes > 0) {
                pendingTime += `${remainingMinutes}m`;
            }
            return { title: 'Pendente há:', time: pendingTime.trim() || '0m' };
        } else {
            const timeDifference = eventDate - now;

            const minutesRemaining = Math.ceil(timeDifference / (1000 * 60));
            const daysRemaining = Math.floor(minutesRemaining / 1440);
            const hoursRemaining = Math.floor((minutesRemaining % 1440) / 60);
            const remainingMinutes = minutesRemaining % 60;
            let remainingTime = '';
            if (daysRemaining > 0) {
                remainingTime += `${daysRemaining}d `;
            }
            if (hoursRemaining > 0) {
                remainingTime += `${hoursRemaining}h `;
            }
            if (remainingMinutes > 0) {
                remainingTime += `${remainingMinutes}m`;
            }
            return { title: 'Tempo Restante:', time: remainingTime.trim() || '0m' };
        }
    };
    const handleUserStatus = (user, eventDetails) => {
        if (user.status === 'completed') {
            return (
                <div className="user-extra-center">
                    <h1 className='pending-title'>Concluído</h1>
                </div>
            );
        } else {
            const { title, time } = calculatePendingTime(eventDetails.duration, eventDetails.endTime);
            return (
                <div className="user-extra-center">
                    <h1 className='pending-title'>{title}</h1>
                    <p className='pending-time'>{time}</p>
                </div>
            );
        }
    };

    const handleDeliverClick = (fullName, status) => {
        console.log(`Nome do usuário: ${fullName}`);
        console.log(`Status do usuário: ${status}`);
    };

    const fetchUsersFromEvent = (eventId) => {
        const eventRef = ref(db, `events/${eventId}`);
        onValue(eventRef, (snapshot) => {
            const eventData = snapshot.val();
            if (eventData && eventData.users) {
                setUsers(Object.values(eventData.users));
            } else {
                setUsers([]);
                console.log(`Nenhum usuário encontrado para o evento ${eventId}.`);
            }
        });
    };

    const handleEntregarClick = (email) => {
        console.log(`E-mail do usuário entregue: ${email}`);
        console.log(`ID do evento: ${currentEventId}`); // Exibe o ID do evento atual

        // Referência ao evento no Firebase
        const eventRef = ref(db, `events/${currentEventId}/users`);
        onValue(eventRef, (snapshot) => {
            const usersData = snapshot.val();
            if (usersData) {
                // Procurar pelo usuário que tem o e-mail clicado
                const foundUserKey = Object.keys(usersData).find(key => usersData[key].email === email);
                if (foundUserKey) {
                    const foundUser = usersData[foundUserKey];
                    console.log(`Status atual do usuário: ${foundUser.status}`);

                    // Atualizar o status do usuário para 'completed'
                    const userRef = ref(db, `events/${currentEventId}/users/${foundUserKey}`);
                    update(userRef, { status: 'completed' })
                        .then(() => {
                            console.log(`Status do usuário ${email} atualizado para 'completed'.`);

                            // Atualizar a lista de usuários local
                            setUsers((prevUsers) => {
                                // Atualiza o status do usuário para 'completed'
                                const updatedUsers = prevUsers.map(user =>
                                    user.email === email ? { ...user, status: 'completed' } : user
                                );
                                // Atualiza o estado de filteredUsers
                                setFilteredUsers(updatedUsers.filter(user => user.status === statusFilter));
                                return updatedUsers;
                            });

                            // Mudar o filtro para 'completed'
                            handleStatusFilterChange('completed');

                            // Verifica se todos os usuários estão com status "completed"
                            const allUsers = Object.values(usersData);
                            if (checkIfAllUsersCompleted(allUsers)) {
                                // Marca o evento como "completed"
                                const eventStatusRef = ref(db, `events/${currentEventId}`);
                                update(eventStatusRef, { status: 'completed' })
                                    .then(() => {
                                        console.log('Evento marcado como "completed".');
                                    })
                                    .catch((error) => {
                                        console.error('Erro ao atualizar o status do evento:', error);
                                    });
                            }
                        })
                        .catch((error) => {
                            console.error('Erro ao atualizar o status do usuário:', error);
                        });
                } else {
                    console.log(`Usuário com o e-mail ${email} não encontrado no evento ${currentEventId}.`);
                }
            }
        }, { onlyOnce: true }); // Adicionado onlyOnce para evitar loops infinitos
    };


    const handleStatusFilterChange = (status) => {
        setStatusFilter(status); // Atualiza o filtro de status
        setFilteredUsers(users.filter(user => user.status === status)); // Aplica o filtro ao mudar
    };

    useEffect(() => {
        if (statusFilter === 'completed') {
            // Filtra usuários com status 'completed'
            setFilteredUsers(users.filter(user => user.status === 'completed'));
        } else if (statusFilter === 'pending') {
            // Filtra usuários com status diferente de 'completed'
            setFilteredUsers(users.filter(user => user.status !== 'completed'));
        }
    }, [statusFilter, users]);

    const handleNotificarClick = (email) => {
        setEmailDetails({ ...emailDetails, email });
        setIsEmailModalOpen(true);
        setIsEmailModalClosing(false);
    };

    const closeModalWithDelay = () => {
        setIsEmailModalClosing(true); // Inicia a animação de fechamento
        setTimeout(() => {
            setIsEmailModalOpen(false); // Fecha o modal após o tempo da animação
        }, 300); // Ajuste o tempo aqui para o mesmo da animação
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmailDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    }

    const handleFileChange = (e) => {
        setEmailDetails((prevDetails) => ({
            ...prevDetails,
            file: e.target.files[0], // Salva o arquivo selecionado
        }));
    };

    const handleSendEmail = () => {
        const formData = new FormData();
        formData.append('email', emailDetails.email);
        formData.append('title', emailDetails.title);
        formData.append('content', emailDetails.content);
        if (emailDetails.file) {
            formData.append('file', emailDetails.file);
        }

        fetch('http://localhost:3001/send-email-notification', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Erro ao enviar o email');
                }
            })
            .then((data) => {
                console.log(data.message);
                setIsModalOpen(false); // Fecha o modal
            })
            .catch((error) => {
                console.error('Erro:', error);
            });
    };

    // Função para alternar o filtro
    const handleFilterClick = (filter) => {
        setActiveFilter(prevFilter => prevFilter === filter ? '' : filter);
    };


    // =========== BACK ALTERADO PELO CAUA ==========
    const [userEmail, setUserEmail] = useState(null);
    const [userJob, setUserJob] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false); // Controle de autorização do botão

    useEffect(() => {
        const auth = getAuth();
        const db = getDatabase();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserEmail(user.email); // Armazena o e-mail do usuário
                console.log(`E-mail do usuário logado: ${user.email}`);

                // Buscar job do usuário na tabela 'users'
                const usersRef = ref(db, `users`);
                try {
                    const snapshot = await get(usersRef);
                    if (snapshot.exists()) {
                        const users = snapshot.val();
                        const userRecord = Object.values(users).find(u => u.email === user.email);
                        if (userRecord && userRecord.job) {
                            setUserJob(userRecord.job);
                            console.log(`Job do usuário logado: ${userRecord.job}`);
                            setIsAuthorized(userRecord.job === "Master"); // Verifica se o job é "Master"
                        } else {
                            console.log(`Job não encontrado para o e-mail: ${user.email}`);
                            setIsAuthorized(false);
                        }
                    } else {
                        console.log("Tabela 'users' está vazia ou não encontrada.");
                        setIsAuthorized(false);
                    }
                } catch (error) {
                    console.error('Erro ao buscar job do usuário:', error);
                    setIsAuthorized(false);
                }
            } else {
                console.log('Nenhum usuário está logado.');
                setIsAuthorized(false);
            }
        });

        // Limpar o listener ao desmontar o componente
        return () => unsubscribe();
    }, []);

    const handleConcludeEvent = async () => {
        if (currentEventId) {
            const db = getDatabase();
            const eventRef = ref(db, `events/${currentEventId}`);

            try {
                // Obtendo os dados atuais do evento
                const snapshot = await get(eventRef);
                if (snapshot.exists()) {
                    const eventData = snapshot.val();
                    console.log(`Status atual do evento com ID ${currentEventId}: ${eventData.status}`);
                    console.log(`Tipo atual do evento com ID ${currentEventId}: ${eventData.eventType}`);

                    if (eventData.status !== 'completed' || eventData.eventType !== 'completed') {
                        // Atualizando o status e o tipo do evento para "completed"
                        await update(eventRef, {
                            status: 'completed',
                            eventType: 'completed',
                            completedByEmail: userEmail, // E-mail do usuário que concluiu
                            completedByJob: userJob // Job do usuário que concluiu
                        });
                        console.log(`Evento concluído pelo usuário com e-mail: ${userEmail} e job: ${userJob}`);
                    } else {
                        console.log(`O evento com ID ${currentEventId} já está concluído.`);
                    }
                } else {
                    console.log(`Nenhuma informação encontrada para o evento com ID ${currentEventId}.`);
                }
            } catch (error) {
                console.error('Erro ao buscar ou atualizar os dados do evento:', error);
            }
        } else {
            console.log('Nenhum evento selecionado para conclusão.');
        }
    };

    return (
        <div className={`wrapper ${isCompact ? 'compact' : ''}`}>
            <header className="calendar-header">
                <span onClick={() => handlePrevNextClick('prev')} className="calendar-icon">
                    <Icon icon="mdi:chevron-left" width="24" height="24" />
                </span>
                <p className="current-date">{months[currMonth]}</p>
                <span onClick={() => handlePrevNextClick('next')} className="calendar-icon">
                    <Icon icon="mdi:chevron-right" width="24" height="24" />
                </span>
            </header>
            {!isCompact && (
                <div className="calendar">
                    <ul className="weeks">
                        {daysOfWeek.map((day, index) => (
                            <li key={day} className={index === new Date().getDay() ? 'active-day' : 'inactive-day'}>
                                {day}
                            </li>
                        ))}
                    </ul>
                    <ul className="days">
                        {days.map((day, index) => {
                            return (
                                <li
                                    key={index}
                                    className={day.className}
                                    onClick={() => handleDayClick(day)}  // Adiciona a função de clique
                                    onMouseEnter={() => setHoveredDay(day.date)}
                                    onMouseLeave={() => setHoveredDay(null)}
                                >
                                    {day.date}
                                    <span className="event-indicator"></span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

            )}
            {!isCompact && (
                <div className="status-bar">
                    <button
                        className={`status atrasado ${activeFilter === 'important' ? 'active-button status-actived' : ''}`}
                        onClick={() => handleFilterClick('important')}
                    >
                        Importante
                    </button>
                    <button
                        className={`status pendente ${activeFilter === 'relative' ? 'active-button status-actived' : ''}`}
                        onClick={() => handleFilterClick('relative')}
                    >
                        Relativo
                    </button>
                    <button
                        className={`status concluido ${activeFilter === 'completed' ? 'active-button status-actived' : ''}`}
                        onClick={() => handleFilterClick('completed')}
                    >
                        Concluído
                    </button>

                </div>
            )}
            <div className="drag-bar" onClick={toggleCompact}>
                <div className="drag-icon"></div>
            </div>
            <div>
            </div>

            {/* ========== IS MODAL ALTERADO PELO CAUA 15/12 ========== */}
            {isModalOpen && (
                <div className={`modal-overlay ${isClosing ? 'modal-closing' : ''}`} onClick={handleCloseModal}>
                    <div className="modal-calendar" onClick={(e) => e.stopPropagation()}>
                        {modalEventData ? (
                            <div>
                                <div className='modal-content-header'>
                                    <h2>{modalEventData.name}</h2>
                                </div>
                                <div className='line-modal-content'>
                                    <Icon icon="mingcute:calendar-line" className='icon' />
                                    <p>{modalEventData.duration}</p>
                                </div>
                                <div className='line-modal-content'>
                                    <Icon icon="tabler:link" className='icon' />
                                    <a href={modalEventData.link} target="_blank" rel="noopener noreferrer">
                                        {modalEventData.link}
                                    </a>
                                </div>
                                <div className='line-modal-content line-modal-content-users'>
                                    <Icon icon="ph:user-bold" className='icon' />
                                    <div className='users-list-modal'>
                                        {modalEventData.users && modalEventData.users.length > 0 ? (
                                            modalEventData.users.slice(0, 3).map((user, index) => (
                                                <div key={index} className='user-content-modal'>
                                                    <div className="profile-img-wrapper">
                                                        {user.profileImg ? (
                                                            <img src={user.profileImg} alt={`${user.fullName}'s profile`} className="profile-img" />
                                                        ) : (
                                                            <div className="profile-img-placeholder">
                                                                {user.fullName[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="status-icon-wrapper">
                                                            {user.status === 'pending' ? (
                                                                <div className="status-icon pending">
                                                                    <Icon icon="mdi:clock" />
                                                                </div>
                                                            ) : user.status === 'completed' ? (
                                                                <div className="status-icon completed">
                                                                    <Icon icon="mdi:check" />
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        <div className="user-info">
                                                            <p><strong>Nome:</strong> {user.fullName}</p>
                                                            <p><strong>Cargo:</strong> {user.job}</p>
                                                            <p><strong>Status: </strong>
                                                                {user.status === 'pending' ? 'Pendente' : user.status === 'completed' ? 'Realizado' : 'Desconhecido'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className='not-found-users-content'>Nenhum usuário registrado para este evento.</p>
                                        )}
                                        {modalEventData.users.length > 3 && (
                                            <div className='extra-users' onClick={() => handleExtraUsersClick(modalEventData.users)}>
                                                + {modalEventData.users.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p><strong>Tipo de evento:</strong> {modalEventData.eventType}</p>
                                <div className='modal-content-footer'>
                                    {isAuthorized && modalEventData.status !== 'completed' && (
                                        <button onClick={handleConcludeEvent} className='btn-checked-calendar'>Concluir Evento</button>
                                    )}
                                    <button className="btn-checked-calendar" onClick={handleCloseModal}>Fechar</button>
                                </div>
                            </div>
                        ) : (
                            <p>Carregando...</p>
                        )}
                    </div>
                </div>
            )}

            {isUserPopupOpen && (
                <div className={`popup-overlay ${isPopupClosing ? 'popup-closing' : ''} ${isPopupEntering ? 'popup-entering' : ''}`} onClick={handleClosePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Usuários Relacionados</h2>
                        <div className='buttons-popup-extra-users'>
                            <button onClick={() => handleStatusFilterChange('pending')} className={statusFilter === 'pending' ? 'active-filter' : ''}>Pendentes</button>
                            <button onClick={() => handleStatusFilterChange('completed')} className={statusFilter === 'completed' ? 'active-filter' : ''}>Concluídos</button>
                        </div>
                        <ul className='user-extra-list'>
                            {filteredUsers.map((user, index) => (
                                <li key={index}>
                                    <div className="user-extra-left">
                                        {renderUserProfile(user)}
                                        <div className="user-extra-details">
                                            <h1 className="user-full-name">{user.fullName}</h1>
                                            <p className="user-email">{user.email}</p>
                                        </div>
                                    </div>
                                    {handleUserStatus(user, modalEventData)}
                                    <div className="user-extra-right">
                                        <button className="btn btn-entregar" onClick={() => handleEntregarClick(user.email)}>
                                            Entregar
                                        </button>
                                        <button className="btn btn-notificar" onClick={() => handleNotificarClick(user.email)}>Notificar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className='extra-users-footer-content-popup'>
                            <button onClick={handleClosePopup}>Concluir</button>
                        </div>
                    </div>
                </div>
            )}

            {isEmailModalOpen && (
                <div className={`email-alert-modal ${isEmailModalClosing ? "closing" : ""}`}>
                    <div className={`email-alert-popup ${isEmailModalClosing ? "closing" : ""}`}>
                        <h3 className="email-alert-title">Email de Notificação</h3>
                        <div className="coolinput">
                            <label className="text" htmlFor="input">Título:</label>
                            <input
                                className="input"
                                type="text"
                                name="title"
                                value={emailDetails.title}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="coolinput">
                            <label className="text" htmlFor="input">Conteúdo:</label>
                            <textarea
                                className="input"
                                name="content"
                                value={emailDetails.content}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="coolinput">
                            <label className="text" htmlFor="input">Anexar Arquivo:</label>
                            <input
                                className="email-alert-input"
                                type="file"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="email-alert-buttons">
                            <button className="email-alert-button-cancel" onClick={closeModalWithDelay}>
                                Cancelar
                            </button>
                            <button className="email-alert-button-send" onClick={handleSendEmail}>
                                Notificar Usuário
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Calendar;