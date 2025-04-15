import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { database } from '../../firebase/firebase'; // Importar o banco de dados do Firebase
import { ref, onValue } from 'firebase/database';  // Importar onValue para ouvir as mudanças em tempo real

const EventsPasts = ({ isCompact, toggleCompact }) => {
    const [pastEvents, setPastEvents] = useState([]); // Estado para armazenar eventos passados

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
    
                    const pastEventsList = []; // Lista para armazenar eventos passados
    
                    Object.values(events).forEach(event => {
                        const eventDate = parseEventDate(event.duration);
    
                        if (eventDate) {
                            // Zera horas, minutos e segundos da data do evento
                            eventDate.setHours(0, 0, 0, 0);
    
                            // Verifica se a data do evento é estritamente anterior à data de hoje
                            if (eventDate < today) {
                                pastEventsList.push(event); // Adiciona o evento à lista de eventos passados
                            }
                        }
                    });

                    // Atualiza o estado com a lista de eventos passados
                    setPastEvents(pastEventsList);
                } else {
                    console.log('Nenhum evento encontrado.');
                }
            });
        };

        fetchEventDurations();
    }, []); // O array vazio [] garante que o listener seja configurado apenas uma vez

    // Função para extrair e converter a data de 'duration'
    const parseEventDate = (durationString) => {
        if (!durationString) {
            return null; // Se a string for undefined ou vazia, retorna null
        }
    
        const regex = /(\d{1,2}) de ([A-Za-z]+)/;
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
    

    return (
        <div className={`events-wrapper ${isCompact ? 'compact' : ''}`}>
            <header className="events-header centered-header">
                <span className="icon-left">
                    <Icon icon="lucide:calendar" width="24" height="24" />
                </span>
                <p className="events-title">Eventos Passados</p>
                <span className="icon-right"></span>
            </header>

            {!isCompact && (
                <div className="events">
                    <ul>
                        {/* Mapeia os eventos passados e os exibe na lista */}
                        {pastEvents.map((event, index) => (
                            <li key={index} className="event-item">
                                <div className="event-indicator">
                                    <div className="line"></div>
                                    <span className="event-time">{event.endTime || 'Horário Indefinido'}</span>
                                    <div className="circle-pending"></div>
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

            <div className="drag-bar" onClick={toggleCompact}>
                <div className="drag-icon"></div>
            </div>
        </div>
    );
};

export default EventsPasts;
