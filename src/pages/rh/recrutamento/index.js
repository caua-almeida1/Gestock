import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import "../rh.css";
import SidebarGestock from '../../ADM/components/sidebar';

const Recrutamento = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [processTypeInput, setProcessTypeInput] = useState('');
    const [processInputs, setProcessInputs] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado da sidebar
    const steps = [
        'Dados Pessoais e documentos',
        'Recrutamento e seleção',
        'Exames',
        'Benefícios',
        'Férias',
        '#',
        '#'
    ];
    const stepDescriptions = [
        'Cadastrar dados pessoais do funcionario',
        'Cadastrar as fases do processos de seleção',
        'Cadastrar os exames',
        'Cadastrar os benefícios do funcionário',
        'Cadastrar datas dos períodos',
        '#',
        '#'
    ];

    const handleFirstCircleClick = () => {
        navigate("/dadosPessoais");
    };

    const handleNextStep = () => {
        if (activeStep < steps.length - 3) {
            // setActiveStep(prev => prev + 1);
        } else {
            navigate('/recrutamento');
        }
    };

    const handleCircleClick = (index) => {
        if (index < activeStep) { // Se o círculo clicado for anterior
            setActiveStep(index); // Atualiza o passo ativo
            const indicator = document.querySelector(".rh_add_indicator");
            // indicator.style.transition = "width 0.4s ease";
            indicator.style.width = `${(index / (steps.length - 3)) * 100}%`; // Calcula a nova largura

            // Navega para a página correspondente após a animação
            setTimeout(() => {
                if (index === 0) {
                    navigate("/dadosPessoais");
                }
                // Adicione mais navegações conforme necessário para outros passos
            }, 400); // Tempo deve corresponder à duração da transição
        }
    };

    const progressWidth = `${(activeStep / (steps.length - 3)) * 100}%`;

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveProcess = () => {
        if (processTypeInput.trim() !== '') {
            setProcessInputs((prevInputs) => [
                ...prevInputs,
                { id: Date.now(), value: processTypeInput },
            ]);
            setProcessTypeInput('');
            handleCloseModal();
        }
    };

    const handleDeleteLastInput = () => {
        setProcessInputs((prevInputs) => prevInputs.slice(0, -1));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`d-flex ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <SidebarGestock isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <section className="rh_add-funcionarios_section">
                <div className="rh_add-funcionarios_container">
                    <div className="rh_section-title">
                        <h1>Administração de pessoal</h1>
                        <span>Administração de pessoal gerencia documentos, exames, benefícios e condições de trabalho dos funcionários</span>
                    </div>

                    <div className="rh_add-funcionarios_form">
                        <div className="rh_steps-container">
                            <div className="rh_add_progress-container">
                                <div className="rh_add_steps-description">
                                    {steps.slice(0, -2).map((title, index) => (
                                        <div className={`rh_add_description ${index === activeStep ? 'rh_active' : ''}`} key={index}>
                                            <h3>{title}</h3>
                                            <p>{stepDescriptions[index]}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="rh_add_steps">
                                    {steps.slice(0, -2).map((_, index) => (
                                        <span
                                            key={index}
                                            className={`rh_add_circle ${index <= activeStep ? 'rh_active' : ''}`}
                                            id={`circle-${index + 1}`}
                                            onClick={() => handleCircleClick(index)} // Chama a função ao clicar
                                        ></span>
                                    ))}
                                    <div className="rh_add_progress-bar">
                                        <span className="rh_add_indicator" style={{ width: progressWidth }}></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rh_add_dados-form_container">
                            <div className="rh_add_dados-form_content">
                                <div className="rh_add_dados-form_header">
                                    <h3>Passo 2/5</h3>
                                    <div className="rh_add_dados-form_title">
                                        <h1>Recrutamento e Seleção</h1>
                                        <p>
                                            Cadastrar fases do processo seletivo que o funcionário passou
                                        </p>
                                    </div>
                                </div>

                                <div className="rh_add_form-input_container">
                                    <div className="rh_add_form-input_process" id="form-input-process">
                                        <h4>Tipo de Processo</h4>
                                        <input
                                            type="text"
                                            defaultValue="Triagem"
                                            className="rh_add_required-input"
                                            id="tipo-processo"
                                        />

                                        {processInputs.map((input) => (
                                            <input
                                                key={input.id} // A chave única para cada input
                                                type="text"
                                                value={input.value} // Usa o valor armazenado
                                                className="rh_add_required-input"
                                                id={`tipo-processo-${input.id}`} // ID único para cada input
                                            />
                                        ))}
                                    </div>

                                <div className="rh_add_buttons_container">
                                    <button type="button" className="rh_add_process-add_button" onClick={handleOpenModal}>
                                        <span>Adicionar processo seletivo</span>
                                    </button>

                                    {isModalOpen && (
                                        <div className="rh_add_process_modal" onClick={handleCloseModal}>
                                            <div className="rh_add_process_modal_content" onClick={(e) => e.stopPropagation()}>
                                                <span className="rh_add_process_close" onClick={handleCloseModal}>&times;</span>
                                                <h2>Adicionar novo processo seletivo</h2>
                                                <input
                                                    type="text"
                                                    id="process_type_input"
                                                    placeholder="Insira o tipo de processo seletivo"
                                                    value={processTypeInput} // Controla o valor do input
                                                    onChange={(e) => setProcessTypeInput(e.target.value)} // Atualiza o estado conforme o usuário digita
                                                />
                                                <button 
                                                    id="save_process_button" 
                                                    onClick={handleSaveProcess}
                                                    style={{ 
                                                        backgroundColor: processTypeInput.trim() === '' ? 'rgb(170, 168, 168)' : '#FF0000',
                                                        cursor: processTypeInput.trim() === '' ? 'not-allowed' : 'pointer',
                                                        transition: 'all ease 0.2s', // Adiciona a transição
                                                    }}
                                                    disabled={processTypeInput.trim() === ''} // Desabilita o botão se o input estiver vazio
                                                >
                                                    Salvar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                        <button className="rh_add_delete-input" type="button" onClick={handleDeleteLastInput}>
                                            <span className="rh_add_button-text">Excluir último processo</span>
                                        </button>

                                        <a href="/exames" style={{ textDecoration: "none" }}>
                                            <button
                                                className="rh_add_next-button"
                                                style={{ display: "block", alignItems: "center" }}
                                                onClick={handleNextStep} // Mova para o próximo passo ao clicar
                                            >
                                                <span className="rh_add_label-text_button">Próximo</span>
                                                <span className="rh_add_icon-button">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                                        <path fill="currentColor" d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"></path>
                                                    </svg>
                                                </span>
                                            </button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Recrutamento;