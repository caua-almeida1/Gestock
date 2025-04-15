import React, { useState, useEffect } from 'react';
import '../log.css';
import { useNavigate } from 'react-router-dom';
import SidebarGestock from '../../ADM/components/sidebar';

const Estocagem = () => {
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [formValues, setFormValues] = useState({
        formatoEnderecamento: '',
        metodoMovimentacao: '',
    });
    const [kanbanSelected, setKanbanSelected] = useState(''); // Estado para os radios
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

    // Atualiza seleção de Kanban
    const handleRadioChange = (e) => {
        setKanbanSelected(e.target.value);
    };

    // Valida o formulário sempre que os valores mudarem
    useEffect(() => {
        const allFieldsFilled =
            Object.values(formValues).every((value) => value.trim() !== '') &&
            kanbanSelected !== ''; // Inclui validação do radio
        setIsFormComplete(allFieldsFilled);
    }, [formValues, kanbanSelected]);

    const handleOptionClick = (value) => {
        setFormValues((prevValues) => ({
            ...prevValues,
            formatoEnderecamento: value,
        }));
        setIsOpen(false);
    };

    const handleNextStep = () => {
        navigate('/dashboardADM');
    };

    const progressWidth = `${(activeStep / (steps.length - 100)) * 100}%`;

    const handleCircleClick = (index) => {
        if (index === 0) { // Apenas o primeiro círculo pode ser clicado
            setActiveStep(index); // Atualiza o passo ativo
            const indicator = document.querySelector(".log_add_indicator");
            indicator.style.width = `${(index / (steps.length - 5)) * 100}%`; // Calcula a nova largura
    
            // Navega para a página correspondente após a animação
            setTimeout(() => {
                if (index === 0) {
                    navigate("/dadosProdutos2");
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
                        <div className="log_produtos_steps-container">
                            <div className="log_add_progress-container">
                                <div className="log_add_steps-description">
                                    {steps.slice(0, -5).map((title, index) => (
                                        <div
                                            className={`log_add_description ${
                                                index === activeStep ? 'log_active' : ''
                                            }`}
                                            key={index}
                                        >
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
                                    <h3>Passo 2/3</h3>
                                    <div className="log_add_dados-form_title">
                                        <h1>Preencha os campos de estocagem</h1>
                                        <p className="log_add_dados_produtos_form-subtitle">
                                            Por favor, preencha todos os campos fornecidos
                                        </p>
                                    </div>
                                </div>
                                <form className="log_add_form">
                                    <div className="log_add_form-input_container">
                                        <div className="log_add_form-input_content">
                                            <div className="log_add_form-input_formato-enderecamento">
                                                <h4>Parametrização do formato de endereçamento</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Selecione uma opção"
                                                        className="log_add_required-input"
                                                        id="formatoEnderecamento"
                                                        readOnly
                                                        value={formValues.formatoEnderecamento}
                                                        onClick={toggleDropdown.formatoEnderecamento}
                                                    />
                                                    <span className="dropdown-arrow" onClick={toggleDropdown} />
                                                    {isOpen && (
                                                        <div className="dropdown-options">
                                                            {['PEPS', 'UEPS', 'FIFO', 'LIFO', 'FEFO', 'Custo Médio Ponderado', 'JIT'].map((option) => (
                                                                <div
                                                                    className="dropdown-option"
                                                                    key={option}
                                                                    onClick={() => handleOptionClick(option)}
                                                                >
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="log_add_form-input_container">
                                        <div className="log_add_form-input_content">
                                            <div className="log_add_form-input_metodo-movimentacao">
                                                <h4>Método de movimentação</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Insira o método de movimentação"
                                                        className="log_add_required-input"
                                                        id="metodoMovimentacao"
                                                        value={formValues.metodoMovimentacao}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="log_add_radio-buttons-container">
                                        <h4>Possui Kanban?</h4>
                                        <div className="log_add_radio-button">
                                            <input
                                                name="radio-group"
                                                id="radio1"
                                                className="log_add_radio-button__input"
                                                type="radio"
                                                value="Sim"
                                                onChange={handleRadioChange}
                                            />
                                            <label htmlFor="radio1" className="log_add_radio-button__label">
                                                <span className="log_add_radio-button__custom"></span>
                                                Sim
                                            </label>
                                        </div>
                                        <div className="log_add_radio-button">
                                            <input
                                                name="radio-group"
                                                id="radio2"
                                                className="log_add_radio-button__input"
                                                type="radio"
                                                value="Não"
                                                onChange={handleRadioChange}
                                            />
                                            <label htmlFor="radio2" className="log_add_radio-button__label">
                                                <span className="log_add_radio-button__custom"></span>
                                                Não
                                            </label>
                                        </div>
                                    </div>

                                    {isFormComplete && (
                                            <button
                                                className="log_add_next-button"
                                                onClick={handleNextStep}
                                            >
                                                <span className="log_add_label-text_button">Finalizar</span>
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

export default Estocagem;