import React, { useState, useEffect, useRef } from 'react';
import '../log.css';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import SidebarGestock from '../../ADM/components/sidebar';
import uploadedArchiveImg from "../../../img/uploaded-archive_img.svg";
import deleteImg from "../../../img/archive-delete_img.svg";
import uploadedSuccessImg from '../../../img/uploaded-success_img.svg'; // Imagem de upload bem-sucedido
import alertDeleteImg from '../../../img/delete-success_img.svg'; // Imagem de exclusão
import certificadoCheckImg from '../../../img/certificado_check-img.svg'

const DadosFornecedores = () => {
    const [files, setFiles] = useState([]);
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(2);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado da sidebar
    const [isFormComplete, setIsFormComplete] = useState(false); // Verifica se o formulário está completo

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

    const fileInputRef = useRef(null);
    const [notification, setNotification] = useState({ type: '', message: '', visible: false });

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files).map(file => ({
            name: file.name,
            id: `${file.name}-${Date.now()}`, // Gera um ID único
        }));
    
        // Verifica se o total de arquivos após o upload ultrapassará o limite
        if (files.length + newFiles.length > 3) {
            showNotification('error', 'O número máximo de 3 arquivos foi atingido.');
            e.target.value = ''; // Resetar o input para evitar novos uploads
            return;
        }
    
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
        e.target.value = ''; // Resetar o input para permitir upload do mesmo arquivo
        showNotification('upload', `Arquivo carregado: ${newFiles.map(f => f.name).join(', ')}`);
    };    
    
    const removeFile = (fileId) => {
        setFiles((prevFiles) => prevFiles.filter(file => file.id !== fileId));
        showNotification('delete', `Arquivo excluído: ${fileId}`);
    };

    const showNotification = (type, message) => {
        setNotification({ type, message, visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    };

    const handleNextStep = () => {
        if (isFormComplete && activeStep < steps.length - 3) {
            setActiveStep(activeStep + 1);
            // Navegar para a próxima página
            navigate('/homologacao');
        } else {
            alert("Por favor, preencha todos os campos antes de prosseguir.");
        }
    };

    const progressWidth = `${(activeStep / (steps.length - 5)) * 100}%`;

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
                if (index === 1) {
                    navigate("/homologacao");
                }
            }, 400); // Tempo deve corresponder à duração da transição
        }
    };

    useEffect(() => {
        // Verifica se pelo menos 3 arquivos foram carregados
        setIsFormComplete(files.length >= 3);
    }, [files]); // Executa toda vez que o estado `files` muda

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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
                                    <h3>Passo 3/3</h3>
                                    <div className="log_add_dados-form_title">
                                        <h1>Certificação</h1>
                                        <p>Fornecedor 1</p>
                                    </div>
                                </div>

                                <div className="log_add_upload-box">
                                    <label htmlFor="file" className="log_add_labelFile">
                                        <p><span>Faça upload</span> de uma imagem ou de um documento</p>
                                    </label>
                                    <input
                                        className="log_add_upload-input"
                                        name="file"
                                        id="file"
                                        type="file"
                                        multiple
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="certificados_check-container">
                                    {[...Array(3)].map((_, index) => (
                                        <div className="certificados_check-content" key={index}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="1em"
                                                height="1em"
                                                viewBox="0 0 24 24"
                                                className={files.length > index ? 'active' : ''}
                                            >
                                                <g fill={files.length > index ? "#FF0000" : "#A8A6A6"}>
                                                    <path d="M10.243 16.314L6 12.07l1.414-1.414l2.829 2.828l5.656-5.657l1.415 1.415z" />
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12m11 9a9 9 0 1 1 0-18a9 9 0 0 1 0 18"
                                                        clipRule="evenodd"
                                                    />
                                                </g>
                                            </svg>
                                            <h4>Certificado {index + 1}</h4>
                                        </div>
                                    ))}
                                </div>

                                <div className="log_add_uploaded-itens">
                                    <div className="log_add_uploaded-itens_title">
                                        <h3 id="item-count">
                                            {files.length} {files.length !== 1 ? 'itens' : 'item'} carregado{files.length !== 1 ? 's' : ''}
                                        </h3>
                                    </div>
                                    <div className="log_add_uploaded-itens_box" id="uploaded-items-box">
                                        {files.map(file => (
                                            <div key={file.id} className="log_add_uploaded-item">
                                                <img src={uploadedArchiveImg} alt="PDF Icon" />
                                                <img
                                                    src={deleteImg}
                                                    alt="Close Icon"
                                                    style={{ width: '20px', height: '20px' }}
                                                    className="log_add_close-icon"
                                                    onClick={() => removeFile(file.id)} // Usando o ID único para remover o arquivo
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {notification.visible && (
                                    <>
                                        {notification.type === 'upload' && (
                                            <div id="notification" className="log_add_notification" style={{ display: 'flex' }}>
                                                <img src={uploadedSuccessImg} alt="Upload Success Notification" />
                                                <p>{notification.message}</p>
                                            </div>
                                        )}
                                        {notification.type === 'delete' && (
                                            <div id="delete-notification" className="log_add_notification" style={{ display: 'flex' }}>
                                                <img src={alertDeleteImg} alt="Delete Notification" />
                                                <p>{notification.message}</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {isFormComplete && (
                                    <a href="/dadosFornecedores">
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
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );    
}

export default DadosFornecedores;