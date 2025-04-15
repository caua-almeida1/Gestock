import React, { useState, useEffect } from 'react';
import '../log.css';
import { useNavigate } from 'react-router-dom';
import SidebarGestock from '../../ADM/components/sidebar';

const DadosFornecedores = () => {
    const [avaliacao, setAvaliacao] = useState(""); // Para armazenar a avaliação selecionada
    const [ra, setRa] = useState("");  // Armazena o RA
    const [cnpj, setCnpj] = useState(""); // Armazena o CNPJ Ativo
    const [tempoMercado, setTempoMercado] = useState(""); // Armazena o Tempo de Mercado
    const [habilitacaoJuridica, setHabilitacaoJuridica] = useState(""); // Armazena Habilitação Jurídica
    const [habilitacoesTecnicas, setHabilitacoesTecnicas] = useState(""); // Armazena Habilitações Técnicas
    const [situacaoEconomica, setSituacaoEconomica] = useState(""); // Situação Econômica
    const [regularidadeFiscal, setRegularidadeFiscal] = useState(""); // Regularidade Fiscal
    const [openDropdown, setOpenDropdown] = useState(null);  // Estado para controlar a abertura de dropdowns
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado da sidebar
    const [isFormComplete, setIsFormComplete] = useState(false); // Verifica se o formulário está completo

    const DadosFornecedores = JSON.parse(localStorage.getItem('passo1'));
    console.log(DadosFornecedores.cnpj); // CNPJ armazenado
    console.log(DadosFornecedores.tipoFornecedor); // Tipo de fornecedor armazenado
    console.log(DadosFornecedores.sku);
    
    const steps = [
        'Dados do Fornecedor',
        'Homologação do Fornecedor',
        'Certificados do Fornecedor',
        '#',
        '#',
        '#',
        '#'
    ];
    const stepDescriptions = [
        'Cadastrar dados pessoais do funcionario',
        'Cadastrar as fases do processos de seleção',
        'Cadastrar os exames',
        'Descrição para o passo 4.',
        'Descrição para o passo 5.',
        'Descrição para o passo 6.',
        'Descrição para o passo 7.'
    ];

    const handleFirstCircleClick = () => {
        navigate("/dadosFornecedores");
    };

    const handleNextStep = () => {
        navigate('/certificados'); // Navegar para a próxima página
    };

    const handleCircleClick = (index) => {
        if (index < activeStep) { // Se o círculo clicado for anterior
            setActiveStep(index); // Atualiza o passo ativo
            const indicator = document.querySelector(".log_add_indicator");
            indicator.style.width = `${(index / (steps.length - 5)) * 100}%`; // Calcula a nova largura

            // Navega para a página correspondente após a animação
            setTimeout(() => {
                if (index === 0) {
                    navigate("/dadosFornecedores");
                }
            }, 400); // Tempo deve corresponder à duração da transição
        }
    };

    const progressWidth = `${(activeStep / (steps.length - 5)) * 100}%`;

    const toggleDropdown = (dropdownName) => {
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName); // Abre o dropdown se não estiver aberto, senão fecha
    };

    const handleOptionClick = (option, dropdownName) => {
        if (dropdownName === 'avaliacao') {
            setAvaliacao(option);
        } else if (dropdownName === 'cnpj') {
            setCnpj(option);
        } else if (dropdownName === 'tempoMercado') {
            setTempoMercado(option);
        } else if (dropdownName === 'habilitacao-juridica') {
            setHabilitacaoJuridica(option);
        } else if (dropdownName === 'habilitacoes-tecnicas') {
            setHabilitacoesTecnicas(option);
        } else if (dropdownName === 'situacao-economica') {
            setSituacaoEconomica(option);
        } else if (dropdownName === 'regularidade-fiscal') {
            setRegularidadeFiscal(option);
        }
        setOpenDropdown(null);  // Fecha o dropdown após a seleção
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Função para verificar se todos os campos obrigatórios estão preenchidos
    const checkFormCompletion = () => {
        if (avaliacao && ra && cnpj && tempoMercado && habilitacaoJuridica && habilitacoesTecnicas && situacaoEconomica && regularidadeFiscal) {
            setIsFormComplete(true); // Todos os campos estão preenchidos
        } else {
            setIsFormComplete(false); // Algum campo está vazio
        }
    };

    // UseEffect para chamar a verificação sempre que algum campo mudar
    useEffect(() => {
        checkFormCompletion();
    }, [avaliacao, ra, cnpj, tempoMercado, habilitacaoJuridica, habilitacoesTecnicas, situacaoEconomica, regularidadeFiscal]);  // Dependências: se qualquer campo mudar, a verificação é chamada

    return (
        <div className={`d-flex ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <SidebarGestock isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <section className="log_add-fornecedores_section">
                <div className="log_add-fornecedores_container">
                    <div className="log_section-title">
                        <h1>Fornecedores</h1>
                        <span>Cadastrando seus fornecedores</span>
                    </div>

                    <div className="log_add-fornecedores_form">
                        <div className='log_fornecedores_steps-container'>
                            <div className="log_add_progress-container">
                                <div className="log_add_steps-description">
                                    {steps.slice(0, -4).map((title, index) => (
                                        <div className={`log_add_description ${index === activeStep ? 'log_active' : ''}`} key={index}>
                                            <h3>{title}</h3>
                                            <p>{stepDescriptions[index]}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="log_add_steps">
                                    {steps.slice(0, -4).map((_, index) => (
                                        <span
                                            key={index}
                                            className={`log_add_circle ${index <= activeStep ? 'log_active' : ''}`}
                                            id={`circle-${index + 1}`}
                                            onClick={() => handleCircleClick(index)} // Chama a função ao clicar
                                        ></span>
                                    ))}
                                    <div className="log_add_progress-bar">
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
                                        <h1>Preencha os campos de homologação</h1>
                                        <p>Fornecedor 1</p>
                                    </div>
                                </div>
                                <form className="log_add_form">
                                    <div className="log_add_form-input_container">
                                        <div className="log_add_form-input_content">
                                            <div className="log_add_form-input_ra">
                                                <h4>RA</h4>
                                                <input
                                                    type="text"
                                                    placeholder="Insira o RA"
                                                    className="log_add_required-input"
                                                    id="ra-input"
                                                    value={ra}
                                                    onChange={(e) => setRa(e.target.value)}  // Atualiza o estado de RA
                                                />
                                            </div>
                                            <div className="log_add_form-input_avaliacao">
                                                <h4>Avaliação</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Selecione uma opção"
                                                        className="log_add_required-input"
                                                        id="avaliacao"
                                                        style={{cursor: 'default'}}
                                                        readOnly
                                                        value={avaliacao}
                                                    />
                                                    <span
                                                        className="dropdown-arrow"
                                                        onClick={() => toggleDropdown('avaliacao')}  // Alterna o dropdown ao clicar na seta
                                                    />
                                                    {openDropdown === 'avaliacao' && (
                                                        <div className="dropdown-options">
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Excelente", 'avaliacao')}>
                                                                Excelente
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Bom", 'avaliacao')}>
                                                                Bom
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Satisfatório", 'avaliacao')}>
                                                                Satisfatório
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Insatisfatório", 'avaliacao')}>
                                                                Insatisfatório
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="log_add_form-input_container">
                                        <div className="log_add_form-input_content">
                                            <div className="log_add_form-input_cnpj-ativo">
                                                <h4>CNPJ Ativo</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Selecione uma opção"
                                                        className="log_add_required-input"
                                                        id="cnpj"
                                                        style={{cursor: 'default'}}
                                                        readOnly
                                                        value={cnpj}
                                                    />
                                                    <span
                                                        className="dropdown-arrow"
                                                        onClick={() => toggleDropdown('cnpj')}  // Alterna o dropdown ao clicar na seta
                                                    />
                                                    {openDropdown === 'cnpj' && (
                                                        <div className="dropdown-options">
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Sim", 'cnpj')}>
                                                                Sim
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Não", 'cnpj')}>
                                                                Não
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="log_add_form-input_mercado">
                                                <h4>Tempo de Mercado</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Selecione uma opção"
                                                        className="log_add_required-input"
                                                        id="tempo-mercado"
                                                        style={{cursor: 'default'}}
                                                        readOnly
                                                        value={tempoMercado}
                                                    />
                                                    <span
                                                        className="dropdown-arrow"
                                                        onClick={() => toggleDropdown('tempoMercado')}  // Alterna o dropdown ao clicar na seta
                                                    />
                                                    {openDropdown === 'tempoMercado' && (
                                                        <div className="dropdown-options">
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Menos de 1 ano", 'tempoMercado')}>
                                                                Menos de 1 ano
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("1 a 2 anos", 'tempoMercado')}>
                                                                1 a 2 anos
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("3 a 5 anos", 'tempoMercado')}>
                                                                3 a 5 anos
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("6 a 10 anos", 'tempoMercado')}>
                                                                6 a 10 anos
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Mais de 10 anos", 'tempoMercado')}>
                                                                Mais de 10 anos
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="log_add_form-input_container">
                                        <div className="log_add_form-input_content">
                                            <div className="log_add_form-input_habilitacao-juridica">
                                                <h4>Habilitação Jurídica</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Selecione uma opção"
                                                        className="log_add_required-input"
                                                        id="habilitacao-juridica"
                                                        style={{ cursor: 'default' }}
                                                        readOnly
                                                        value={habilitacaoJuridica}
                                                    />
                                                    <span
                                                        className="dropdown-arrow"
                                                        onClick={() => toggleDropdown('habilitacao-juridica')} // Alterna o dropdown ao clicar na seta
                                                    />
                                                    {openDropdown === 'habilitacao-juridica' && (
                                                        <div className="dropdown-options">
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Em conformidade", 'habilitacao-juridica')}>
                                                                Em conformidade
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Com pendências", 'habilitacao-juridica')}>
                                                                Com pendências
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Suspensa", 'habilitacao-juridica')}>
                                                                Suspensa
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Cancelada", 'habilitacao-juridica')}>
                                                                Cancelada
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Expirada", 'habilitacao-juridica')}>
                                                                Expirada
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="log_add_form-input_habilitacoes-tecnicas">
                                                <h4>Habilitações Técnicas</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Selecione uma opção"
                                                        className="log_add_required-input"
                                                        id="habilitacoes-tecnicas"
                                                        style={{ cursor: 'default' }}
                                                        readOnly
                                                        value={habilitacoesTecnicas}
                                                    />
                                                    <span
                                                        className="dropdown-arrow"
                                                        onClick={() => toggleDropdown('habilitacoes-tecnicas')} // Alterna o dropdown ao clicar na seta
                                                    />
                                                    {openDropdown === 'habilitacoes-tecnicas' && (
                                                        <div className="dropdown-options">
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Necessário", 'habilitacoes-tecnicas')}>
                                                                Necessário
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Não necessário", 'habilitacoes-tecnicas')}>
                                                                Não necessário
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="log_add_form-input_container">
                                        <div className="log_add_form-input_content">
                                            <div className="log_add_form-input_situacao-economica">
                                                <h4>Situação Econômica</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Selecione uma opção"
                                                        className="log_add_required-input"
                                                        id="situacao-economica"
                                                        style={{cursor: 'default'}}
                                                        readOnly
                                                        value={situacaoEconomica}
                                                    />
                                                    <span
                                                        className="dropdown-arrow"
                                                        onClick={() => toggleDropdown('situacao-economica')}  // Alterna o dropdown ao clicar na seta
                                                    />
                                                    {openDropdown === 'situacao-economica' && (
                                                        <div className="dropdown-options">
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Sem pendências", 'situacao-economica')}>
                                                                Sem pendências
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Com pendências", 'situacao-economica')}>
                                                                Com pendências
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Em crescimento", 'situacao-economica')}>
                                                                Em crescimento
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Em regularização", 'situacao-economica')}>
                                                                Em regularização
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="log_add_form-input_regularidade-fiscal">
                                                <h4>Regularidade Fiscal</h4>
                                                <div className="input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Selecione uma opção"
                                                        className="log_add_required-input"
                                                        id="regularidade-fiscal"
                                                        style={{cursor: 'default'}}
                                                        readOnly
                                                        value={regularidadeFiscal}
                                                    />
                                                    <span
                                                        className="dropdown-arrow"
                                                        onClick={() => toggleDropdown('regularidade-fiscal')}  // Alterna o dropdown ao clicar na seta
                                                    />
                                                    {openDropdown === 'regularidade-fiscal' && (
                                                        <div className="dropdown-options">
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Em conformidade", 'regularidade-fiscal')}>
                                                                Em conformidade
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Com documentação pendente", 'regularidade-fiscal')}>
                                                                Com documentação pendente
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Em processo de regularização", 'regularidade-fiscal')}>
                                                                Em processo de regularização
                                                            </div>
                                                            <div className="dropdown-option" onClick={() => handleOptionClick("Irregular", 'regularidade-fiscal')}>
                                                                Irregular
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isFormComplete && (
                                        <a href="/certificados">
                                            <button
                                                className="log_add_next-button"
                                                onClick={handleNextStep}
                                            >
                                                <span className="log_add_label-text_button">Próximo</span>
                                                <span className="log_add_icon-button">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                                        <path fill="currentColor" d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"></path>
                                                    </svg>
                                                </span>
                                            </button>
                                        </a>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );    
}

export default DadosFornecedores;