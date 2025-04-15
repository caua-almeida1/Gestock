import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { database } from '../../firebase/firebase'; // Importar o banco de dados do Firebase
import { ref, onValue } from 'firebase/database';  // Importar onValue para ouvir as mudanças em tempo real

const EventsFutures = ({ isCompact, toggleCompact }) => {
    const [futureEvents, setFutureEvents] = useState([]); // Estado para armazenar eventos futuros

    useEffect(() => {
        const fetchEventDurations = () => {
            const eventsRef = ref(database, 'events/');

            // Ouve em tempo real as mudanças no banco de dados
            onValue(eventsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const events = snapshot.val();
                    const today = new Date(); // Data de hoje

                    // Zerando horas, minutos e segundos para comparação apenas por data (dia, mês, ano)
                    today.setHours(0, 0, 0, 0);

                    const futureEventsList = []; // Lista para armazenar eventos futuros

                    Object.values(events).forEach(event => {
                        const eventDate = parseEventDate(event.duration);

                        if (eventDate) {
                            // Zera horas, minutos e segundos da data do evento
                            eventDate.setHours(0, 0, 0, 0);

                            // Verifica se a data do evento é estritamente após a data de hoje
                            if (eventDate > today) {
                                futureEventsList.push(event); // Adiciona o evento à lista de eventos futuros
                            }
                        }
                    });

                    // Atualiza o estado com a lista de eventos futuros
                    setFutureEvents(futureEventsList);
                } else {
                    console.log('Nenhum evento encontrado.');
                }
            });
        };

        fetchEventDurations();
    }, []); // O array vazio [] garante que o listener seja configurado apenas uma vez

    // Função para extrair e converter a data de 'duration' no formato "Domingo, Dia 13 de Outubro"
    const parseEventDate = (durationString) => {
        if (!durationString) {
            return null; // Se a string for undefined ou vazia, retorna null
        }

        const regex = /Dia (\d{1,2}) de ([A-Za-z]+)/;
        const match = durationString.match(regex);

        if (match) {
            const day = parseInt(match[1]); // Extrai o dia
            const monthName = match[2];     // Extrai o nome do mês

            const months = {
                "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3,
                "Maio": 4, "Junho": 5, "Julho": 6, "Agosto": 7,
                "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11
            };

            const month = months[monthName];
            if (month !== undefined) {
                const year = new Date().getFullYear(); // Assume o ano atual
                return new Date(year, month, day);
            }
        }

        return null; // Se não encontrar correspondência, retorna null
    };

    // Função para buscar e exibir apenas o status, id e duration dos eventos cujo 'duration' é posterior ao dia atual
    const fetchFutureEventDetails = () => {
        const eventsRef = ref(database, 'events/');
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Define o horário para comparação apenas por data

        onValue(eventsRef, (snapshot) => {
            if (snapshot.exists()) {
                const events = snapshot.val();
                const futureEventDetails = Object.entries(events)
                    .filter(([id, event]) => {
                        const eventDate = parseEventDate(event.duration);
                        return eventDate && eventDate > today; // Filtra os eventos com data posterior a hoje
                    })
                    .map(([id, event]) => ({
                        id: id,
                        status: event.status,
                        duration: event.duration
                    }));

                console.log('Detalhes dos Eventos Futuros:', futureEventDetails);
            } else {
                console.log('Nenhum evento encontrado.');
            }
        });
    };

    // Função para determinar a cor do círculo com base no tipo do evento
    const getCircleColor = (eventType) => {
        console.log(`Tipo de evento: ${eventType}`); // Adicione este log para verificar o tipo
        switch (eventType) {
            case 'important':
                return 'red'; // Cor para eventos importantes
            case 'relative':
                return '#FF6693'; // Cor para eventos relativos
            default:
                return 'gray'; // Cor padrão
        }
    };

    return (
        <div className={`events-wrapper ${isCompact ? 'compact' : ''}`}>
            <header className="events-header centered-header">
                <span className="icon-left">
                    <Icon icon="lucide:calendar" width="24" height="24" />
                </span>
                <p className="events-title">Eventos Futuros</p>
                <span className="icon-right"></span>
            </header>

            {!isCompact && (
                <div className="events">
                    <ul>
                        {/* Mapeia os eventos futuros e os exibe na lista */}
                        {futureEvents.map((event, index) => (
                            <li key={index} className="event-item">
                                <div className="event-indicator">
                                    <div className="line"></div>
                                    <span className="event-time event-next" style={{ color: 'red' }}>
                                        {event.endTime || 'Horário Indefinido'}
                                    </span>
                                    {/* Adiciona a classe 'circle-future-events' se o status do evento for 'completed' */}
                                    <div
                                        className={`circle-events ${event.status === 'completed' ? 'circle-future-events' : ''}`}
                                        style={{ backgroundColor: getCircleColor(event.eventType) }}
                                    ></div>
                                </div>
                                <div className="event-details">
                                    <span className="event-name">{event.name}</span>
                                    <span className="event-duration">{event.duration}</span>
                                </div>
                            </li>
                        ))}

                    </ul>
                </div>
            )}

            <div className="drag-bar" onClick={() => { toggleCompact(); fetchFutureEventDetails(); }}>
                <div className="drag-icon"></div>
            </div>
        </div>
    );
};

export default EventsFutures;
