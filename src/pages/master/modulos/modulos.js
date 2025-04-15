import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';
import { Icon } from '@iconify/react';
import lockIcon from '@iconify/icons-mdi/lock';
import checkCircleIcon from '@iconify/icons-mdi/check-circle';
import { isBefore, isToday } from 'date-fns';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import Sidebar from '../../../components/SidebarGestock';
import "../../master/master.css";
import { formatISO } from 'date-fns';

const ModulosView = () => {
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [moduleDates, setModuleDates] = useState({
        modulo1: null,
        modulo2: null,
        modulo3: null,
    });
    const [moduleStates, setModuleStates] = useState({
        modulo1: 'bloqueado',
        modulo2: 'bloqueado',
        modulo3: 'bloqueado',
    });

    const moduleTitles = {
        modulo1: 'ADM da Empresa',
        modulo2: 'RH da Empresa',
        modulo3: 'LOG da Empresa'
    };

    const moduleDescriptions = {
        modulo1: 'Módulo de ADM da Empresa: Controle geral, permitindo monitorar e gerenciar dados financeiros, operacionais e estratégicos para tomada de decisões.',
        modulo2: 'Módulo de RH da empresa: Inclui processos de contratação, folha de pagamento e avaliação de desempenho.',
        modulo3: 'Módulo de Logística da Empresa: Organiza o fluxo logístico, acompanhando o estoque, transporte e distribuição para otimizar a cadeia de suprimentos.'
    };

    const [notification, setNotification] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const db = getDatabase();
    const [currentButton, setCurrentButton] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);

    const toggleCalendar = (module) => {
        setCurrentButton(module);
        setShowCalendar(!showCalendar);
    };

    useEffect(() => {
        const moduleStatesRef = ref(db, 'moduleStates');
        const moduleDatesRef = ref(db, 'moduleDates');

        // Escuta as mudanças no estado dos módulos
        onValue(moduleStatesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setModuleStates(data);
            }
        });

        // Escuta as mudanças nas datas dos módulos
        onValue(moduleDatesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const dates = Object.keys(data).reduce((acc, key) => {
                    acc[key] = data[key] ? new Date(data[key]) : null; // Converte para objeto Date
                    return acc;
                }, {});
                setModuleDates(dates);
            }
        });
    }, [db]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleSaveDate = () => {
        const updatedDates = {
            ...moduleDates,
            [currentButton]: formatISO(selectedDate) // Usando date-fns para formatar corretamente
        };
        setModuleDates(updatedDates);

        // Atualiza a data de liberação apenas para o módulo específico no Firebase
        set(ref(db, `moduleDates/${currentButton}`), formatISO(selectedDate))
            .then(() => {
                console.log(`Data de liberação de ${currentButton} salva com sucesso.`);
            })
            .catch((error) => {
                console.error("Erro ao salvar a data de liberação:", error);
            });

        setShowCalendar(false);
    };

    // Função para liberar o módulo no exato horário já q essa desgraça nn tava liberando logo
    const liberarModuloNoExato = (moduleKey, releaseDate) => {
        const now = new Date();
        // Ajusta a data de liberação para que ela seja exata
        releaseDate.setSeconds(0); // Remove qualquer segundo extra, deixa no minuto exato.
        releaseDate.setMilliseconds(0); // Remove os milissegundos também

        const delay = releaseDate.getTime() - now.getTime(); // Diferença em milissegundos

        if (delay <= 0) {
            // Se a data já passou ou é o mesmo instante, libera o módulo imediatamente
            setModuleStates(prevStates => ({
                ...prevStates,
                [moduleKey]: 'liberado'
            }));
            // Atualiza no Firebase
            set(ref(db, `moduleStates/${moduleKey}`), 'liberado');
        } else {
            // Caso contrário, usa setTimeout para esperar até o horário exato
            setTimeout(() => {
                setModuleStates(prevStates => ({
                    ...prevStates,
                    [moduleKey]: 'liberado'
                }));
                // Atualiza no Firebase após o delay
                set(ref(db, `moduleStates/${moduleKey}`), 'liberado');
            }, delay);
        }
    };

    useEffect(() => {
        Object.keys(moduleDates).forEach(moduleKey => {
            if (moduleDates[moduleKey]) {
                const releaseDate = new Date(moduleDates[moduleKey]);
                liberarModuloNoExato(moduleKey, releaseDate); // Chama a função para liberar o módulo no exato horário
            }
        });
    }, [moduleDates]); // Executa sempre que moduleDates é alterado

    const handleBlockModule = (module) => {
        const updatedStates = {
            ...moduleStates,
            [module]: 'bloqueado'
        };
        setModuleStates(updatedStates);

        const updatedDates = {
            ...moduleDates,
            [module]: null // Remove a data de liberação
        };
        setModuleDates(updatedDates);

        // Atualiza o Firebase com os novos estados e a remoção da data para o módulo específico
        set(ref(db, `moduleStates/${module}`), 'bloqueado');
        set(ref(db, `moduleDates/${module}`), null);

        setNotification(`Módulo ${module.replace('modulo', '')} foi bloqueado!`);
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 10000);
    };

    return (
        <div className='dashboard'>
            <Sidebar className='sidebar-container' />
            <div className='main-content'>
                <div className="view-modulo">Visualizar Módulos</div>
                <section className="modulos">
                    {showCalendar && (
                        <div className="calendar-popup">
                            <h3>Alterar data de liberação</h3>
                            <DatePicker
                                selected={selectedDate}
                                onChange={handleDateChange}
                                timeInputLabel="Horário de liberação:"
                                showTimeInput
                                timeFormat="HH:mm"
                                timeIntervals={1}
                                dateFormat="Pp"
                                className="datepicker"
                                locale={ptBR}
                                inline
                                minDate={today}
                                filterTime={(time) => isToday(selectedDate) && isBefore(time, new Date())}
                            />
                            <div className='buttons-modulo'>
                                <button type="button-modulo" onClick={handleSaveDate}>Salvar</button>
                                <button type="button-modulo" onClick={() => setShowCalendar(false)}>Fechar</button>
                            </div>
                        </div>
                    )}

                    <div className={`notification ${showNotification ? 'show' : ''}`}>
                        {notification}
                    </div>
                    {Object.keys(moduleStates).map(modulo => (
                        <div className={`modulo-card ${moduleStates[modulo] === 'liberado' ? 'liberado' : ''}`} key={modulo}>
                            <div className="modulo-icon">
                                <span className="modulo-lock">
                                    <Icon icon={moduleStates[modulo] === 'liberado' ? checkCircleIcon : lockIcon} width="27" height="27" />
                                </span>
                            </div>
                            <div className="modulo-info">
                                <div className="modulo-text">
                                    <h1>{moduleTitles[modulo]}</h1>
                                    <p>{moduleDescriptions[modulo]}</p>
                                </div>
                                <div className='modulo-buttons'>
                                    <button className="modulo-timer" onClick={() => toggleCalendar(modulo)}>Alterar data</button>
                                    <button className="modulo-timer" onClick={() => handleBlockModule(modulo)}>Bloquear módulo</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default ModulosView;
