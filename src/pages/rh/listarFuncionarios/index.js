import React, { useState, useEffect } from 'react';
import '../rh.css';
import { ref, onValue, push, serverTimestamp, set } from "firebase/database";
import logo2 from '../../../img/logo_gestockpt2.svg';
import { database } from '../../../firebase/firebase';
import searchIcon from '../../../img/search-icon.svg';
import addImg from '../../../img/add-img.svg';
import actionsImg from '../../../img/actions-img.svg';
import orderArrow from '../../../img/order-arrow.svg';
import SidebarGestock from '../../ADM/components/sidebar';

const ListarFuncionarios = () => {
    const [searchInput, setSearchInput] = useState('');
    const [clearVisible, setClearVisible] = useState(false);
    const [isPopoverOpen, setPopoverOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('Nenhuma');
    const [isRotated, setIsRotated] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false)
    const [isLoading, setIsLoading] = useState(true); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado da sidebar

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
        setClearVisible(e.target.value !== '');
    };

    const clearSearch = () => {
        setSearchInput('');
        setClearVisible(false);
    };

    const handleOrderSelection = (option) => {
        setSelectedOption(option); // Atualiza a opção selecionada
        setPopoverOpen(false); // Fecha o popover após a seleção
    };

    const togglePopover = () => {
        setPopoverOpen(!isPopoverOpen);
        setIsRotated(!isRotated);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const moduleStateRef = ref(database, 'moduleStates/modulo2');
        const unsubscribe = onValue(moduleStateRef, (snapshot) => {
          const state = snapshot.val();
          setIsBlocked(state === 'bloqueado'); // Atualiza o estado de bloqueio
          setIsLoading(false); // Define o carregamento como concluído
        });
    
        return () => unsubscribe();
      }, []);
    
      // Se estiver carregando ou o estado de bloqueio for null, não renderize nada
      if (isLoading || isBlocked === null) {
        return null; // Aguarda a resposta antes de renderizar
      };
    
    return (
        <div className={`d-flex ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <SidebarGestock isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            {isBlocked && (
                <div className="warning-message">
                    <img src={logo2} alt="Logo Gestock" />
                    <p>O Módulo de RH está bloqueado. Você não pode acessar esta tela.</p>
                </div>
            )}
            {isBlocked && <div className="overlay22" />}
            <section className="rh_cargos-section">
                <div className="rh_cargos-container">
                    <div className="rh_section-title">
                        <h1>Prontuário do Funcionário</h1>
                        <span>Resumo e detalhes dos dados dos funcionários</span>
                    </div>

                    <div className="rh_list_funcionarios-header">
                        <div className="rh_search-group">
                            <input
                                placeholder="Pesquisar funcionário"
                                className="rh_search-input"
                                value={searchInput}
                                onChange={handleSearchInputChange}
                            />
                            <img src={searchIcon} alt="Buscar" className="rh_search-icon" />
                            {clearVisible && (
                                <button className="rh_clear-btn" aria-label="Clear" onClick={clearSearch}></button>
                            )}
                        </div>
                        <div className="rh_filter-group">
                            <div className="rh_cargos-order">
                                    <h3>
                                        Ordenar por: <span id="selected-option">{selectedOption}</span>
                                    </h3>
                                    <a href="#" className="rh_order-arrow" id="order-arrow" onClick={togglePopover}>
                                        <img
                                            src={orderArrow}
                                            alt="Order"
                                            style={{
                                                transition: 'transform 0.3s',
                                                transform: isRotated ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }}
                                        />
                                    </a>
                                    {isPopoverOpen && (
                                        <div className="rh_popover">
                                            <div className="rh_popover-content">
                                                <ul>
                                                    {['Nenhuma', 'Ordem Alfabética (Crescente)', 'Ordem Alfabética (Decrescente)', 'Salário (Crescente)', 'Salário (Decrescente)'].map((option) => (
                                                        <h1
                                                            key={option}
                                                            onClick={() => handleOrderSelection(option)}
                                                            className={selectedOption === option ? 'rh_selected' : ''}
                                                        >
                                                            {option}
                                                        </h1>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            <a href="/dadosPessoais">
                                <div className="rh_cargos-cadastrar">
                                    <h3>Cadastrar</h3>
                                    <img src={addImg} alt="Adicionar" />
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className="rh_list_funcionarios-categories">
                        <h1 className="rh_list_categorie-4">Nome Completo</h1>
                        <h1 className="rh_list_categorie-5">Cargo</h1>
                        <h1 className="rh_list_categorie-6">Número de Registro</h1>
                        <h1 className="rh_list_categorie-7">Data de Admissão</h1>
                        <h1 className="rh_list_categorie-8">Status</h1>
                        <h1 className="rh_list_categorie-9">Ações</h1>
                    </div>

                    {[1, 2, 3].map((_, index) => (
                        <div className="rh_list_funcionarios-box_container" key={index}>
                            <div className="rh_list_funcionario-box_img"></div>
                            <h3 className="rh_list_user_full-name">Carlos de Souza Lopes</h3>
                            <div className="rh_list_funcionario-cargo_box">
                                <p>Funcionário</p>
                            </div>
                            <h3 className="rh_list_register-number">1423</h3>
                            <h3 className="rh_list_admission-date">28/08/2024</h3>
                            <div className="rh_checkbox-wrapper">
                                <input type="checkbox" />
                                <svg viewBox="0 0 35.6 35.6">
                                    <circle className="rh_background" cx="17.8" cy="17.8" r="17.8"></circle>
                                    <circle className="rh_stroke" cx="17.8" cy="17.8" r="14.37"></circle>
                                </svg>
                            </div>
                            <a href="/editarFuncionarios">
                                <img className="rh_list_actions-img" src={actionsImg} alt="Ações" />
                            </a>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ListarFuncionarios;
