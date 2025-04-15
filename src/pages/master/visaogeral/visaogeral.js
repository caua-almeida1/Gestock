import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import "../../master/master.css";
import { get, ref, set, database, getDatabase, onValue, push, serverTimestamp } from '../../../firebase/firebase';
import VisualizarEmpresaComponent from '../viewempresa/vizualizarempresa'
import Sidebar from '../../../components/SidebarGestock'
import ScreenWarning from '../../../components/MaxPhone';
import StaggeredDropDown from '../../../components/products-log/StaggeredDropDown';

const Modulos = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [lastNote, setLastNote] = useState('');
    const [groups, setGroups] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [members, setMembers] = useState(['']);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal para adicionar nota
    const [isVisualizarOpen, setIsVisualizarOpen] = useState(false); // Modal para visualizar empresa
    const [users, setUsers] = useState([]);
    const sidebarRef = useRef(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('A - Z');

    console.log(groups);
    console.log(selectedGroup); // Adicione esta linha para ver o que está sendo passado

    useEffect(() => {
        const database = getDatabase();
        const groupsRef = ref(database, 'groups');

        onValue(groupsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const groupsArray = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                    infosGroup: data[key].infosGroup || {},
                }));
                setGroups(groupsArray);
            }
        });
    }, []);

    const handleModalOpen = () => {
        setIsModalOpen(true);
        setIsVisualizarOpen(false); // Fechar o modal de visualização ao abrir o modal de adicionar nota
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleVizuempClick = (group) => {
        setSelectedGroup(group); // Aqui você deve definir o grupo selecionado
        setIsVisualizarOpen(true); // Abrindo o modal
    };

    const handleCloseVisualizar = () => {
        setIsVisualizarOpen(false);
    };

    const handleSortChange = (option) => {
        setSortOption(option);
    };

    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (index, value) => {
        const updatedMembers = [...members];
        updatedMembers[index] = value; // Atualiza o valor do integrante no índice correspondente
        setMembers(updatedMembers);
    };

    const handleCardClick = (group, index) => {
        const groupTitle = group.nomeFantasia || `${group.id}`; // Aqui pode estar o erro
        setSelectedCard({
            id: group.id,
            number: index + 1,
            admin: group.admin,
            nomeFantasia: group.nomeFantasia || "N/A",
            razaoSocial: group.razaoSocial || "N/A",
            naturezaJuridica: group.naturezaJuridica || "N/A",
            classificacao: group.classificacao || "N/A",
            cnpj: group.cnpj || "N/A",
            porteEmpresa: group.porteEmpresa || "N/A",
            cnae: group.cnae || "N/A",
            identificacaoEstadual: group.identificacaoEstadual || "N/A",
            identificacaoNacional: group.identificacaoNacional || "N/A",
            cep: group.cep || "N/A",
            cidade: group.cidade || "N/A",
            rua: group.rua || "N/A",
            estado: group.estado || "N/A",
            bairro: group.bairro || "N/A",
            numero: group.numero || "N/A",
            telefone: group.telefone || "N/A",
            email: group.email || "N/A",
            socios: group.socios || []
        });
    };

    const fetchUsers = async () => {
        const db = getDatabase();
        const usersRef = ref(db, 'users');

        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            const usersList = [];

            for (let id in data) {
                usersList.push(data[id]); // Adiciona o usuário ao array
            }

            setUsers(usersList); // Atualiza o estado dos usuários
        });
    };

    // UseEffect q serve para buscar os grupos do Firebase em tempo real
    useEffect(() => {
        const gruposRef = ref(database, 'groups'); // Procura no campo groups do nosso calabreso (realtime database)

        onValue(gruposRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const groupsArray = Object.keys(data).map((key) => ({
                    id: key,
                    nomeFantasia: data[key].nomeFantasia || "Nome Padrão", // Adiciona um valor/nome padrão
                    members: data[key].members || [],
                    admin: data[key].admin || {},
                    infosGroup: data[key].infosGroup || {}, // Verifique se o infosGroup existe
                }));

                setGroups(groupsArray); 
            }
        });
    }, []); // O `useEffect` roda apenas na primeira renderização

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            setIsOpen(false); // Fechar o sidebar se o clique for fora dele
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // Limpar o listener quando o componente for desmontado
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const sendModalMessage = () => {
        const messageRef = ref(database, 'messages/modal');  // Certifique-se de que está enviando para 'messages/modal'
        push(messageRef, {
            content: modalMessage,
            timestamp: serverTimestamp()
        });
        setModalMessage('');  // Limpa o campo após o envio
    };
    useEffect(() => {

        const receiverMessageRef = ref(database, 'messages/receiver');
        onValue(receiverMessageRef, (snapshot) => {
            const messages = snapshot.val();
            if (messages) {
                const latestMessageKey = Object.keys(messages).pop(); // Pega a última mensagem
                const latestMessage = messages[latestMessageKey].content;
                setMessageText(latestMessage);  // Atualiza o textarea com a mensagem
            }
        });
    }, []);

    console.log('selectedCard:', selectedCard);

    const sortGroups = (groups) => {
        if (sortOption === 'A - Z') {
            return [...groups].sort((a, b) => {
                const nameA = String(a.groupName || ''); // Converte para string
                const nameB = String(b.groupName || ''); // Converte para string
                return nameA.localeCompare(nameB); // Ordenação alfabética
            });
        } else if (sortOption === 'Mais Recentes') {
            return [...groups].sort((a, b) => b.id.localeCompare(a.id)); // Ordenação por ID (mais recentes primeiro)
        } else if (sortOption === 'Mais Antigos') {
            return [...groups].sort((a, b) => a.id.localeCompare(b.id)); // Ordenação por ID (mais antigos primeiro)
        }
        return groups;
    };

    const filteredGroups = sortGroups(
        groups.filter(group =>
          group.nomeFantasia.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (group.admin.name && group.admin.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    


    return (
        <div className="dashboard">
            <Sidebar className="sidebar-container" />
            <div className="main-content">
                <div className='mii'>Visão Geral</div>
                <div className='miiddm'>Veja as principais métricas das empresas relacionadas.</div>

                <div className="products-actions-order2">
                    <div className="group-product-search">
                        <Icon icon="material-symbols:search" className="icon-product-search" />
                        <input
                            className="input-product-search"
                            type="text"
                            placeholder="Pesquisar Grupos"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <StaggeredDropDown onSelect={handleSortChange} />
                </div>

                <div className="scrollable-cards-container">
                {filteredGroups.map((group, index) => (
                        <div
                            className='card-visa'
                            onClick={() => handleCardClick(group, index)}
                            key={group.id}
                        >
                            <span className="card-number-visa">{index + 1}</span>
                            <div className="card-content">
                                <div className='card-title'>
                                    <h3>{group?.nomeFantasia || `Empresa ${index + 1}`}</h3>
                                    <p>Quantidade de Integrantes: {Array.isArray(group.members) ? group.members.length : 0}</p>
                                </div>
                                <div className="card-adm">
                                    <h3>Administrador</h3>
                                    <p>{group.admin.name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedCard && (
                    <div className="detail-card">
                        <div className="detail-card-content">
                            <span className="card-number2">{selectedCard.number}</span>
                            <div className='tit'>
                                <h3>
                                    {selectedCard.nomeFantasia !== "N/A"
                                        ? selectedCard.nomeFantasia
                                        : `Empresa ${selectedCard.number}`}
                                </h3>
                            </div>
                            <div className='vizualizar-em'>
                                <h3>Visualizar Empresa</h3>
                                <p>Visualize e Altere as informações da empresa</p>
                                <svg
                                    onClick={handleVizuempClick}
                                    selectedGroup={selectedCard}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24"
                                >
                                    <g fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" d="M9 4.46A9.8 9.8 0 0 1 12 4c4.182 0 7.028 2.5 8.725 4.704C21.575 9.81 22 10.361 22 12c0 1.64-.425 2.191-1.275 3.296C19.028 17.5 16.182 20 12 20s-7.028-2.5-8.725-4.704C2.425 14.192 2 13.639 2 12c0-1.64.425-2.191 1.275-3.296A14.5 14.5 0 0 1 5 6.821" />
                                        <path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z" />
                                    </g>
                                </svg>

                                {isVisualizarOpen && (
                                    <VisualizarEmpresaComponent
                                        onClose={handleCloseVisualizar}
                                        selectedCard={selectedCard} // Passa o selectedCard para o componente
                                    />
                                )}
                            </div>

                            <div className='vizualizar-emc'>
                                <h3>Últimas Notas</h3>
                                <div className='redba'></div>
                            </div>
                            <div className='lll'>
                                <p>{selectedCard.admin ? selectedCard.admin.name.charAt(0) : ''}</p>
                            </div>
                            <div className='card-admi'>
                                <h3>{selectedCard.admin ? selectedCard.admin.name : ''}</h3>
                                <p>Administrador(a)</p>
                            </div>
                            <textarea
                                id='notes-input'
                                className='notes-input'
                                type="text"
                                value={messageText} // Última mensagem sincronizada
                                onChange={(e) => setLastNote(e.target.value)}
                                readOnly
                            ></textarea>
                            <div className='round-plus' onClick={handleModalOpen}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 1 1 2 0v5h5a1 1 0 0 1 0 2" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="m_visa_modal">
                            <h3>Adicionar Nota</h3>
                            <p>Escreva uma mensagem para o administrador da empresa!</p>
                            <textarea
                                value={modalMessage}
                                onChange={(e) => setModalMessage(e.target.value)}
                                placeholder="Escreva sua nota aqui..."
                            />
                            <div className='m_visa_btns-modal'>
                                <button className='m_visa_close-modal' onClick={sendModalMessage}>Enviar</button>
                                <button className='m_visa_close-modal' onClick={handleModalClose}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}

                <ScreenWarning />
            </div>
        </div >
    );
};

export default Modulos;