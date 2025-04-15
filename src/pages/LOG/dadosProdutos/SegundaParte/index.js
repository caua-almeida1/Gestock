import React, { useState, useEffect } from 'react';
import '../../log.css';
import { useNavigate } from 'react-router-dom';
import SidebarGestock from '../../../ADM/components/sidebar';

const DadosProdutos2 = () => {
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [formValues, setFormValues] = useState({
        tipoEstoque: '',
        enderecamento: '',
        movimentacao: '',
        demanda: '',
        minEstoque: '',
        maxEstoque: '',
        segurancaEstoque: '',
    });
    
    const [isOpen, setIsOpen] = useState(false); // Dropdown aberto/fechado
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado da sidebar

    const steps = [
        'Dados do Produto',
        'Estocagem',
        '#',
        '#',
        '#',
        '#',
        '#'
    ];
    const stepDescriptions = [
        'Preencha os campos do produto',
        'Preencha os campos do estocagem',
        'Descrição para o passo 3',
        'Descrição para o passo 4.',
        'Descrição para o passo 5.',
        'Descrição para o passo 6.',
        'Descrição para o passo 7.'
    ];

    // Atualiza valores do formulário
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [id]: value,
        }));
    };

    // Valida o formulário sempre que os valores mudarem
    useEffect(() => {
        const allFieldsFilled = Object.values(formValues).every((value) => value.trim() !== '');
        setIsFormComplete(allFieldsFilled);
    }, [formValues]);    

    const handleOptionClick = (value) => {
        setFormValues((prevValues) => ({
            ...prevValues,
            unidadeMedida: value,
        }));
        setIsOpen(false);
    };

    const handleNextStep = () => {
        navigate('/estocagem'); // Navegar para a próxima página
    };

    const progressWidth = `${(activeStep / (steps.length - 5)) * 100}%`;

    const handleCircleClick = (index) => {
        if (index === 0) { // Apenas o primeiro círculo pode ser clicado
            setActiveStep(index); // Atualiza o passo ativo
            const indicator = document.querySelector(".log_add_indicator");
            indicator.style.width = `${(index / (steps.length - 5)) * 100}%`; // Calcula a nova largura
    
            // Navega para a página correspondente após a animação
            setTimeout(() => {
                if (index === 0) {
                    navigate("/dadosProdutos1");
                }
            }, 400); // Tempo deve corresponder à duração da transição
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`d-flex ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <SidebarGestock isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <section className="log_add-produtos_section">
                <div className="log_add-produtos_container">
                    <div className="log_section-title">
                        <h1>Novo produto</h1>
                        <span>Cadastrando novo produto e seus fornecedores</span>
                    </div>

                    <div className="log_add-produtos_form">
                        <div className='log_produtos_steps-container'>
                            <div className="log_add_progress-container">
                                <div className="log_add_steps-description">
                                    {steps.slice(0, -5).map((title, index) => (
                                        <div className={`log_add_description ${index === activeStep ? 'log_active' : ''}`} key={index}>
                                            <h3>{title}</h3>
                                            <p>{stepDescriptions[index]}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="log_add_steps">
                                    {steps.slice(0, -5).map((_, index) => (
                                        <span
                                            key={index}
                                            className={`log_add_circle ${index <= activeStep ? 'log_active' : ''} ${index !== 0 ? 'log_non-clickable' : ''}`}
                                            id={`circle-${index + 1}`}
                                            onClick={() => handleCircleClick(index)} // Apenas o primeiro círculo chama a função
                                        ></span>
                                    ))}
                                    <div className="log_add_produtos_progress-bar">
                                        <span className="log_add_indicator" style={{ width: progressWidth }}></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="log_add_dados-form_container">
                            <div className="log_add_dados-form_content">
                                <div className="log_add_dados-form_header">
                                    <h3>Passo 1/3</h3>
                                    <div className="log_add_dados-form_title">
                                        <h1>Preencha os campos de dados do produto</h1>
                                        <p className='log_add_dados_produtos_form-subtitle'>Por favor, preencha todos os campos fornecidos</p>
                                    </div>
                                </div>
                                <form className="log_add_form">
                                    <div className="log_add_form-input_container">
                                        <div className="log_add_form-input_content">
                                            <div className="log_add_form-input_tipo-estoque">
                                                <h4>Tipo de Estoque</h4>
                                                <input
                                                    type="text"
                                                    placeholder="Insira o tipo de estoque"
                                                    className="log_add_required-input"
                                                    id="tipoEstoque"
                                                    value={formValues.tipoEstoque}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="log_add_form-input_enderecamento">
                                                <h4>Endereçamento</h4>
                                                <input
                                                    type="text"
                                                    placeholder="Insira o enderaçamento"
                                                    className="log_add_required-input"
                                                    id="enderecamento"
                                                    value={formValues.enderecamento}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="log_add_form-input_container">
                                        <div className="log_add_form-input_content">
                                            <div className="log_add_form-input_movimentacao">
                                                <h4>Movimentação</h4>
                                                <input
                                                    type="text"
                                                    placeholder="Insira a movimentação"
                                                    className="log_add_required-input"
                                                    id="movimentacao"
                                                    value={formValues.movimentacao}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="log_add_form-input_demanda">
                                                <h4>Demanda</h4>
                                                <input
                                                    type="text"
                                                    placeholder="Insira a demanda"
                                                    className="log_add_required-input"
                                                    id="demanda"
                                                    value={formValues.demanda}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="log_add_form-input_container">
                                        <div className="log_add_form-input_content">
                                            <div className="log_add_form-input_estoque">
                                                <h4>Estoque mínimo</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="number"
                                                        placeholder="Insira o mínimo de estoque"
                                                        className="log_add_required-input"
                                                        id="minEstoque"
                                                        value={formValues.minEstoque}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="log_add_form-input_estoque">
                                                <h4>Estoque máximo</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="number"
                                                        placeholder="Insira o máximo de estoque"
                                                        className="log_add_required-input"
                                                        id="maxEstoque"
                                                        value={formValues.maxEstoque}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="log_add_form-input_estoque">
                                                <h4>Estoque de segurança</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Insira o estoque de segurança"
                                                        className="log_add_required-input"
                                                        id="segurancaEstoque"
                                                        value={formValues.segurancaEstoque}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isFormComplete && (
                                        <button
                                            className="log_add_next-button"
                                            onClick={handleNextStep}
                                        >
                                            <span className="log_add_label-text_button">Próximo</span>
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DadosProdutos2;