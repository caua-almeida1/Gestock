import React, { useState, useEffect } from 'react';
import { ref, onValue, push, serverTimestamp, set } from "firebase/database";
import logo2 from '../../../img/logo_gestockpt2.svg';
import { database } from '../../../firebase/firebase';
import '../rh.css';
import searchIcon from "../../../img/search-icon.svg";
import orderArrow from "../../../img/order-arrow.svg";
import addCargoImg from "../../../img/add-img.svg";
import SidebarGestock from '../../ADM/components/sidebar';

const ListarCargos = () => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('Nenhuma');
    const [isRotated, setIsRotated] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false)
    const [isLoading, setIsLoading] = useState(true); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado da sidebar

    const handleOrderSelection = (option) => {
        setSelectedOption(option);
        setIsPopoverOpen(false);
        setIsRotated(false); // Reseta a rotação ao selecionar uma opção
    };

    const togglePopover = () => {
        setIsPopoverOpen(prev => !prev);
        setIsRotated(prev => !prev); // Alterna o estado de rotação com o popover
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
                        <h1>Cargos e Salários</h1>
                        <span>Visualizar Cargos</span>
                    </div>

                    <div className="rh_cargos-header">
                        <div className="rh_search-group">
                            <input placeholder="Pesquisar cargo" className="rh_search-input" />
                            <img src={searchIcon} alt="Search" className="rh_search-icon" />
                            <button className="rh_clear-btn" aria-label="Clear"></button>
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
                            <a href="/addCargo">
                                <div className="rh_cargos-cadastrar">
                                    <h3>Cadastrar</h3>
                                    <img src={addCargoImg} alt="Add" />
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className="rh_list_cargos-container">
                        <div className="rh_categories">
                            <h1 className="rh_categorie-1">Título do Cargo</h1>
                            <h1 className="rh_categorie-2">Descrição</h1>
                            <h1 className="rh_categorie-3">Salário</h1>
                        </div>

                        {Array(3).fill().map((_, index) => (
                            <a href="/detalhesCargo" style={{ textDecoration: 'none' }} key={index}>
                            <div className="rh_list_cargos-content" id={`cargos-content-${index + 1}`}>
                                <div className="rh_list_cargos-content_text">
                                <p className="rh_list_cargos-text-1">Gerente de TI</p>
                                <p className="rh_list_cargos-text-2">
                                    Responsável pela gestão da equipe de TI e projetos tecnológicos.
                                </p>
                                <span className="rh_list_cargos-wage-box">R$1.500</span>
                                </div>
                            </div>
                            </a>
                        ))}
                        </div>
                </div>
            </section>
            <footer></footer>
        </div>
    );
};

export default ListarCargos;