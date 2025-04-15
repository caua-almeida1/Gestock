import React, { useState, useEffect } from 'react';
import '../rh.css';
import { useNavigate } from 'react-router-dom';
import SidebarGestock from '../../ADM/components/sidebar';

const DadosPessoais = () => {
    const [showModal, setShowModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [numeroRegistro, setNumeroRegistro] = useState("");
    const [rg, setRg] = useState('');
    const [cpf, setCpf] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [documents, setDocuments] = useState(['Carteira de Trabalho (CTPS)', 'Comprovante de Residência']);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const navigate = useNavigate();
    const [checkedDocuments, setCheckedDocuments] = useState(Array(documents.length).fill(false));
    const [activeStep, setActiveStep] = useState(0);
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
        'Descrição para o passo 6.',
        'Descrição para o passo 7.'
    ];

    const handleNextStep = () => {
        if (activeStep < steps.length - 3) {
            // setActiveStep(prev => prev + 1);
            setIsFormComplete(false);
        } else {
            navigate('/recrutamento'); // Navegar para a próxima página
        }
    };   

    const progressWidth = `${(activeStep / (steps.length - 2)) * 100}%`;

    const handleModalToggle = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleInputChange = (e) => {
        setDocumentType(e.target.value);
    };

    const handleSaveDocument = () => {
        if (documentType) {
            setDocuments([...documents, documentType]);
            setCheckedDocuments([...checkedDocuments, false]);
            setDocumentType('');
            handleModalToggle();
        }
    };

    useEffect(() => {
        const gerarNumeroAleatorio = () => Math.floor(10000 + Math.random() * 90000);
        setNumeroRegistro(gerarNumeroAleatorio());
    }, []);

    const formatRG = (input) => {
        const value = input.value.replace(/\D/g, '');
        const formattedValue = value
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1-$2');

        input.value = formattedValue;
        setRg(formattedValue);
    };

    const formatCPF = (input) => {
        const value = input.value.replace(/\D/g, '');
        const formattedValue = value
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        input.value = formattedValue;
        setCpf(formattedValue);
    };

    useEffect(() => {
        const isComplete = document.getElementById('nome-completo')?.value &&
                          document.getElementById('numero-registro')?.value &&
                          document.getElementById('cargo')?.value &&
                          document.getElementById('data-admissao')?.value &&
                          rg &&
                          cpf &&
                          checkedDocuments.every(checked => checked);

        setIsFormComplete(isComplete);
    }, [rg, cpf, checkedDocuments]);

    const handleCheckboxChange = (index) => {
        const newCheckedDocuments = [...checkedDocuments];
        newCheckedDocuments[index] = !newCheckedDocuments[index];
        setCheckedDocuments(newCheckedDocuments);
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
                        <div className='rh_steps-container'>
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
                                        <span key={index} className={`rh_add_circle ${index <= activeStep ? 'rh_active' : ''}`} id={`circle-${index + 1}`}></span>
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
                                    <h3>Passo 1/5</h3>
                                    <div className="rh_add_dados-form_title">
                                        <h1>Dados Pessoais</h1>
                                        <p>Cadastrar dados pessoais dos funcionários</p>
                                    </div>
                                </div>
                                <form className="rh_add_form">
                                    <div className="rh_add_form-input_container">
                                        <div className="rh_add_form-input_content">
                                            <div className="rh_add_form-input_name">
                                                <h4>Nome completo</h4>
                                                <input type="text" placeholder="Insira o nome completo" className="rh_add_required-input" id="nome-completo" />
                                            </div>
                                            <div className="rh_add_form-input_register">
                                                <h4>Número de registro</h4>
                                                <input
                                                    type="text"
                                                    value={numeroRegistro}
                                                    placeholder="Insira o número de registro"
                                                    className="rh_add_required-input"
                                                    id="numero-registro"
                                                    onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
                                                    pattern="\d*"
                                                    title="Apenas números são permitidos"
                                                />
                                            </div>
                                        </div>
                                    </div>
    
                                    <div className="rh_add_form-input_container">
                                        <div className="rh_add_form-input_content">
                                            <div className="rh_add_form-input_cargo">
                                                <h4>Cargo</h4>
                                                <input type="text" placeholder="Insira o cargo" className="rh_add_required-input" id="cargo" />
                                            </div>
                                            <div className="rh_add_form-input_admission">
                                                <h4>Data de admissão</h4>
                                                <input className="rh_add_date-input_admission" type="date" id="data-admissao" />
                                            </div>
                                        </div>
                                    </div>
    
                                    <div className="rh_add_form-input_container">
                                        <div className="rh_add_form-input_content">
                                            <div className="rh_add_form-input_rg">
                                                <h4>RG</h4>
                                                <input
                                                    type="text"
                                                    placeholder="Insira o RG"
                                                    className="rh_add_required-input"
                                                    id="rg"
                                                    value={rg}
                                                    onInput={(e) => formatRG(e.target)}
                                                    maxLength="12"
                                                />
                                            </div>
                                            <div className="rh_add_form-input_cpf">
                                                <h4>CPF</h4>
                                                <input
                                                    type="text"
                                                    placeholder="Insira o CPF"
                                                    className="rh_add_required-input"
                                                    id="cpf"
                                                    maxLength="14"
                                                    value={cpf}
                                                    onInput={(e) => formatCPF(e.target)}
                                                />
                                            </div>
                                        </div>
                                    </div>
    
                                    <div className="rh_add_documents-area_container">
                                        <div className="rh_add_documents-area_header">
                                            <h3>Documentos</h3>
                                            <p>Documentos que foram recebidos na contratação</p>
                                            <div className="rh_add_documents-area_checkbox">
                                                {documents.map((doc, index) => (
                                                    <div className="rh_add_checkbox-container" key={index}>
                                                        <input
                                                            type="checkbox"
                                                            className="rh_add_ui-checkbox"
                                                            id={doc}
                                                            checked={checkedDocuments[index]}
                                                            onChange={() => handleCheckboxChange(index)}
                                                        />
                                                        <span>{doc}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button type="button" className="rh_add_documentos-add_button" onClick={handleModalToggle}>
                                                <span>Novo tipo de documento</span>
                                            </button>
                                        </div>
                                    </div>

                                    {isModalOpen && (
                                        <div className="rh_add_document-modal">
                                            <div className="rh_add_document-modal-content">
                                                <span className="rh_add_document-close" onClick={handleModalToggle}>&times;</span>
                                                <h2>Adicionar novo tipo de documento</h2>
                                                <input
                                                    type="text"
                                                    id="document-type-input"
                                                    placeholder="Insira o tipo de documento"
                                                    value={documentType}
                                                    onChange={handleInputChange}
                                                />
                                                <button
                                                    id="save-document-button"
                                                    onClick={handleSaveDocument}
                                                    style={{
                                                        backgroundColor: documentType.trim() === '' ? 'rgb(170, 168, 168)' : '#FF0000', // Fundo cinza se vazio, vermelho se preenchido
                                                        cursor: documentType.trim() === '' ? 'not-allowed' : 'pointer', // Cursor alterado
                                                        transition: 'background-color ease 0.2s' // Transição suave
                                                    }}
                                                    disabled={documentType.trim() === ''}
                                                >
                                                    Salvar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <a href="/recrutamento" style={{ display: isFormComplete ? 'block' : 'none' }}>
                                        <button className="rh_add_next-button" onClick={handleNextStep} disabled={!isFormComplete}>
                                            <span className="rh_add_label-text_button">Próximo</span>
                                            <span className="rh_add_icon-button">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                                    <path fill="currentColor" d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"></path>
                                                </svg>
                                            </span>
                                        </button>
                                    </a>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default DadosPessoais;