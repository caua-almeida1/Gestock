import React, { useState, useEffect } from "react";
import "../rh.css";
import { useNavigate } from 'react-router-dom';
import SidebarGestock from '../../ADM/components/sidebar';

const Ferias = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [benefitType, setBenefitType] = useState('');
    const [checkboxes, setCheckboxes] = useState([]); // Estado para armazenar os checkboxes
    const navigate = useNavigate(); // Hook para navegação
    const [activeStep, setActiveStep] = useState(4); // Definindo o terceiro círculo como ativo
    const [isChecked, setIsChecked] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [benefitsTypeInput, setBenefitsTypeInput] = useState('');
    const [benefitsInputs, setBenefitsInputs] = useState([]);
    const [discountValue, setDiscountValue] = useState(''); // Valor do desconto
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

    const handleNextStep = () => {
        if (activeStep < steps.length - 3) {
            setActiveStep(prev => prev + 1);
        } else {
            navigate('/recrutamento');
        }
    };

    const progressWidth = `${(activeStep / (steps.length - 3)) * 100}%`;

    const handleCircleClick = (index) => {
        if (index < activeStep) {
            setActiveStep(index);
            const indicator = document.querySelector(".rh_add_indicator");
            const newWidth = `${(index / (steps.length - 3)) * 100}%`;
            indicator.style.width = newWidth;

            setTimeout(() => {
                if (index === 0) {
                    navigate("/dadosPessoais");
                } else if (index === 1) {
                    navigate("/recrutamento");
                } else if (index === 2) {
                    navigate("/exames");
                }
                else if (index === 2) {
                    navigate("/beneficios");
                }
            }, 400);
        } else if (index > activeStep) {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleReverseClick = (e) => {
        e.preventDefault(); // Impede a navegação imediata
        const indicator = document.querySelector(".rh_add_indicator");
    
        // Altera a largura para zero para criar o efeito reverso
        indicator.style.width = "0";
    
        // Define um tempo para redirecionar após a animação
        setTimeout(() => {
            window.location.href = "/dadosPessoais"; // Substitua pela URL desejada
        }, 400); // 400 ms para a transição (deve ser igual ao tempo da transição CSS)
    };

    const [isNextButtonVisible, setIsNextButtonVisible] = useState(false);

    const checkInputs = () => {
        const inputs = document.querySelectorAll('.required-input');
        const allFilled = Array.from(inputs).every(input => input.value);
        setIsNextButtonVisible(allFilled);
    };

    useEffect(() => {
        const inputs = document.querySelectorAll('.required-input');
        inputs.forEach(input => {
            input.addEventListener('input', checkInputs);
        });
        return () => {
            inputs.forEach(input => {
                input.removeEventListener('input', checkInputs);
            });
        };
    }, []);

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
                                        <p>{stepDescriptions[index]}</p> {/* Descrição específica */}
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
                                    <h3>Passo 5/5</h3>
                                    <div className="rh_add_dados-form_title">
                                        <h1>Férias</h1>
                                        <p>Cadastrar datas das férias</p>
                                    </div>
                                </div>

                                <div className="rh_add_form-input_container">
                                    {['Aquisitivo', 'Concessivo', 'Gozo'].map((tipo, index) => (
                                        <div className="rh_add_form-input_exams" key={index}>
                                            <h2>{tipo}</h2>
                                            <div className="rh_add_ferias-input-container">
                                                <div className="rh_add_ferias_content">
                                                    <h4>Início</h4>
                                                    <input className="rh_add_date-input_ferias required-input" type="date" id={`data-admissao-${index + 1}`} />
                                                </div>
                                                <div className="rh_add_ferias_content">
                                                    <h4>Término</h4>
                                                    <input className="rh_add_date-input_ferias required-input" type="date" id={`data-retorno-${index + 1}`} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isNextButtonVisible && (
                                        <a href="/listarFuncionarios" style={{ textDecoration: 'none' }}>
                                            <button className="rh_add_next-button" id="next-button" style={{ alignItems: 'center' }} disabled={!isNextButtonVisible}>
                                                <span className="rh_add_label-text_button">Finalizar</span>
                                                <span className="rh_add_icon-button">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                                        <path fill="currentColor" d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"></path>
                                                    </svg>
                                                </span>
                                            </button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Ferias;