import React, { useState, useEffect } from "react";
import "../rh.css";
import { useNavigate } from 'react-router-dom';
import SidebarGestock from '../../ADM/components/sidebar';

const Beneficios = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [benefitType, setBenefitType] = useState('');
    const [checkboxes, setCheckboxes] = useState([]); // Estado para armazenar os checkboxes
    const navigate = useNavigate(); // Hook para navegação
    const [activeStep, setActiveStep] = useState(3); // Definindo o terceiro círculo como ativo
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

    const areInputsFilled = () => {
        return checkboxes.every((checkbox) => checkbox.discount.trim() !== '');
    };

    // useEffect para atualizar isChecked com base nos inputs
    useEffect(() => {
        setIsChecked(areInputsFilled());
    }, [checkboxes]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveBenefits = () => {
        if (benefitsTypeInput && inputValue) {
            // Adiciona um novo checkbox à lista
            const newCheckbox = {
                id: `cbx-${checkboxes.length + 1}`,
                label: inputValue, // Usa o valor do input como rótulo
                discount: '', // Inicializa o valor do desconto
            };
            setCheckboxes((prev) => [...prev, newCheckbox]); // Adiciona o novo checkbox ao estado
            setBenefitsTypeInput(''); // Reseta o input de tipo de benefício
            setInputValue(''); // Reseta o input de valor
            handleCloseModal(); // Fecha o modal
        }
    };

    const handleDeleteLastBenefits = () => {
        // Remove os últimos 3 checkboxes, se existirem
        setCheckboxes((prev) => prev.slice(0, prev.length - 3));
    };    

    const handleCheckboxChange = () => setIsChecked(!isChecked);

    const handleInputChange = (id, value) => {
        // Remove todos os caracteres não numéricos (exceto o símbolo de porcentagem)
        const numericValue = value.replace(/[^\d.]/g, '');

        // Adiciona o símbolo de porcentagem se não estiver presente
        const formattedValue = numericValue ? `${numericValue}%` : '';

        setCheckboxes((prev) =>
        prev.map((checkbox) =>
            checkbox.id === id ? { ...checkbox, discount: formattedValue } : checkbox
        )
    );
};

    const handleBenefitTypeChange = (e) => setBenefitType(e.target.value);

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
                                    <h3>Passo 4/5</h3>
                                    <div className="rh_add_dados-form_title">
                                        <h1>Benefícios</h1>
                                        <p>Cadastrar beneficios dos funcionarios e as porcentagens descontada ou adicionada na folha de pagamento</p>
                                    </div>
                                </div>

                                <div className="rh_add_form-input_container">
                                    <div className="rh_add_form-input_benefits">
                                        <div className="rh_add_benefits-input-container">
                                            <div className="rh_add_benefits_content">
                                                <h2>Informações para o cálculo de folha de pagamento</h2>
                                                <div className="rh_add_benefits_input_content">
                                                    {checkboxes.map((checkbox) => (
                                                        <div className="rh_add_checkbox-wrapper-46" key={checkbox.id}>
                                                            <input
                                                                type="checkbox"
                                                                id={checkbox.id}
                                                                className="rh_add_inp-cbx"
                                                            />
                                                            <label htmlFor={checkbox.id} className="rh_add_cbx">
                                                                <span>
                                                                    <svg viewBox="0 0 12 10" height="10px" width="12px">
                                                                        <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                                                                    </svg>
                                                                </span>
                                                                <span>{checkbox.label}</span>
                                                            </label>
                                                            <div className="rh_add_benefits_value-content">
                                                                <h4>Valor descontado</h4>
                                                                <input
                                                                    className="rh_add_input_desconto required-input"
                                                                    type="text"
                                                                    placeholder="0%"
                                                                    value={checkbox.discount} // Usa o valor do desconto armazenado
                                                                    onChange={(e) => handleInputChange(checkbox.id, e.target.value)} // Atualiza o desconto
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="rh_add_buttons_container">
                                                <button type="button" className="rh_add_benefits-add_button" onClick={handleOpenModal}>
                                                    <span className="rh_add_button-text">Adicionar tipo de benefício</span>
                                                </button>

                                                {isModalOpen && (
                                                    <div className="rh_add_benefits_modal" onClick={handleCloseModal}>
                                                        <div className="rh_add_benefits_modal_content" onClick={(e) => e.stopPropagation()}>
                                                            <span className="rh_add_benefits_close" onClick={handleCloseModal}>&times;</span>
                                                            <h2>Adicionar benefício</h2>
                                                            <select
                                                                id="benefits_type_select"
                                                                value={benefitsTypeInput}
                                                                onChange={(e) => setBenefitsTypeInput(e.target.value)}
                                                            >
                                                                <option value="" disabled>Selecione uma opção</option>
                                                                <option value="calc_proventos">Cálculo de proventos</option>
                                                                <option value="calc_descontos">Cálculo de descontos</option>
                                                            </select>
                                                            {benefitsTypeInput === 'calc_proventos' && 
                                                                <input
                                                                    type="text"
                                                                    placeholder="Insira um provento"
                                                                    className="rh_add_required-input"
                                                                    value={inputValue}
                                                                    onChange={(e) => setInputValue(e.target.value)}
                                                                />
                                                            }
                                                            {benefitsTypeInput === 'calc_descontos' && 
                                                                <input
                                                                    type="text"
                                                                    placeholder="Insira um desconto"
                                                                    className="rh_add_required-input"
                                                                    value={inputValue}
                                                                    onChange={(e) => setInputValue(e.target.value)}
                                                                />
                                                            }
                                                            <button 
                                                                id="save_process_button" 
                                                                onClick={handleSaveBenefits}
                                                                style={{ 
                                                                    backgroundColor: benefitsTypeInput.trim() === '' || inputValue.trim() === '' ? 'rgb(170, 168, 168)' : '#FF0000',
                                                                    cursor: benefitsTypeInput.trim() === '' || inputValue.trim() === '' ? 'not-allowed' : 'pointer',
                                                                    transition: 'all ease 0.2s',
                                                                }}
                                                                disabled={benefitsTypeInput.trim() === '' || inputValue.trim() === ''} // Desabilita o botão se os inputs estiverem vazios
                                                            >
                                                                Salvar
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <button className="rh_add_delete_benefits-input" type="button" onClick={handleDeleteLastBenefits}>
                                                    <span className="rh_add_button-text">Excluir benefício</span>
                                                </button>
                                            </div>

                                            <a href="/ferias" style={{ textDecoration: 'none' }}>
                                                <button 
                                                    className="rh_add_next-button" 
                                                    style={{ display: isChecked ? 'flex' : 'none', alignItems: 'center' }} 
                                                    disabled={!isChecked} // Desabilita o botão se isChecked for false
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
                </div>
            </section>
        </div>
    );
};

export default Beneficios;