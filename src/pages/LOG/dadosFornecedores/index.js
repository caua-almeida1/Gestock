import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { v4 as uuidv4 } from 'uuid'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, set, get, child } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Sidebar from '../../../components/SidebarGestock';
import { getAuth } from 'firebase/auth';

import uploadedArchiveImg from "../../../img/uploaded-archive_img.svg";
import deleteImg from "../../../img/archive-delete_img.svg";
import uploadedSuccessImg from '../../../img/uploaded-success_img.svg'; // Imagem de upload bem-sucedido
import alertDeleteImg from '../../../img/delete-success_img.svg'; // Imagem de exclusão
import certificadoCheckImg from '../../../img/certificado_check-img.svg'

const DadosFornecedores = () => {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const location = useLocation();
    const { sku } = location.state || {};

    useEffect(() => {
        if (sku) {
            console.log("SKU do produto selecionado:", sku);
        }
    }, [sku]);

    const [step, setStep] = useState(1);
    const totalSteps = 3;
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        step1: {
            razaoSocial: '',
            tipoFornecedor: '',
            cnpj: '',
        },
        step2: {
            ra: '',
            avaliacao: '',
            cnpjAtivo: '',
            tempoDeMercado: '',
            habilitacaoJuridica: '',
            habilitacoesTecnicas: '',
            situacaoEconomica: '',
            regularidadeFiscal: ''
        },
        step3: {

        }
    });

    const handleChange = (e, stepKey) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [stepKey]: { ...prev[stepKey], [name]: value },
        }));
    };

    const handleNext = () => {
        if (step === 1 && !formData.step1.razaoSocial.trim()) {
            showNotification('error', 'Por favor, preencha a Razão Social antes de avançar.');
            return;
        }
    
        setLoading(true);
        setTimeout(() => {
            setStep(step + 1);
            setLoading(false);
        }, 1700);
    };

    const handleBack = () => {
        if (step > 1) {
            setLoading(true);
            setTimeout(() => {
                setStep(step - 1);
                setLoading(false);
            }, 1700);
        }
    };

    const handleCircleClick = (clickedStep) => {
        if (clickedStep > step) {
            if (step === 1 && !formData.step1.razaoSocial.trim()) {
                showNotification('error', 'Por favor, preencha a Razão Social antes de avançar.');
                return;
            }
        }
    
        if (clickedStep !== step) {
            setLoading(true);
            setTimeout(() => {
                setStep(clickedStep);
                setLoading(false);
            }, 1700);
        }
    };
    

    const handleFinalize = async () => {
        setLoading(true); // Ativa o loading
    
        // Gera um ID único para o fornecedor
        const fornecedorId = uuidv4();
    
        const formDataWithSku = {
            fornecedorId, // Adiciona o ID único ao objeto de dados
            sku,
            step1: formData.step1,
            step2: formData.step2,
            step3: formData.step3,
        };
    
        try {
            const db = getDatabase();
            const productsRef = ref(db, 'products/' + sku);
    
            const snapshot = await get(productsRef);
            const productData = snapshot.val();
    
            if (productData) {
                // Calcula o índice do novo fornecedor
                let existingSuppliers = Object.keys(productData)
                    .filter(key => key.startsWith('fornecedor'))
                    .map(key => parseInt(key.replace('fornecedor', ''), 10));
    
                const newSupplierIndex = Math.max(...existingSuppliers, 0) + 1;
    
                // Adiciona o fornecedor com o ID único
                await set(ref(db, `products/${sku}/fornecedores/${fornecedorId}`), formDataWithSku);
    
                console.log(`Fornecedor ${fornecedorId} adicionado com sucesso ao produto ${sku}`);
            } else {
                console.error("Produto não encontrado no banco de dados.");
            }
    
            // Exibe a notificação de sucesso
            setNotification({
                type: 'success',
                message: 'Fornecedor cadastrado com sucesso!',
                visible: true,
            });
    
            // Redireciona para a tela de "products-estoque" após 3 segundos
            setTimeout(() => {
                navigate('/products-estoque');
            }, 3000);
        } catch (error) {
            console.error("Erro ao adicionar fornecedor:", error);
            setNotification({
                type: 'error',
                message: 'Erro ao cadastrar o fornecedor. Tente novamente.',
                visible: true,
            });
        } finally {
            setLoading(false); // Desativa o loading
        }
    };    

    // Fecha a notificação e redireciona
    const closeNotification = () => {
        setNotification({ type: '', message: '', visible: false });
    };


    const [notification, setNotification] = useState({ type: '', message: '', visible: false });

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files).map(file => ({
            name: file.name,
            id: `${file.name}-${Date.now()}`,
        }));
    
        if (files.length + newFiles.length > 3) {
            showNotification('error', 'O número máximo de 3 arquivos foi atingido.');
            e.target.value = '';
            return;
        }
    
        setFiles(prevFiles => {
            const updatedFiles = [...prevFiles, ...newFiles];
            setFormData(prevFormData => ({
                ...prevFormData,
                step3: {
                    certificados: updatedFiles.map(file => file.name) // Armazenando apenas os nomes dos arquivos
                }
            }));
            return updatedFiles;
        });
    
        e.target.value = ''; 
    };
    
    const removeFile = (fileId) => {
        setFiles((prevFiles) => prevFiles.filter(file => file.id !== fileId));
        showNotification('delete', `Arquivo excluído: ${fileId}`);
    };

    const showNotification = (type, message) => {
        setNotification({ type, message, visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    };

    const handleReturn = () => {
        navigate('/products-estoque');
    };

    const [cnpj, setCnpj] = useState('');

    const handleCnpjChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo o que não for número
        if (value.length <= 14) {
            value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        setCnpj(value);

        setFormData((prevState) => ({
            ...prevState,
            step1: {
                ...prevState.step1,
                cnpj: value,  // Atualizando o CNPJ dentro de step1
            },
        }));
    };

    return (

        <div>
            {loading && (
                <div className="loading-overlay">
                    <Icon icon="svg-spinners:ring-resize" className="loading-icon" />
                </div>
            )}

            {notification.visible && (
                <div className={`supplier-notification supplier-notification--${notification.type}`}>
                    <p>{notification.message}</p>
                    <button onClick={closeNotification} className="supplier-notification__button">Continuar</button>
                </div>
            )}


            <Sidebar className="sidebar-container" />

            <div className='body-group-edit'>
                <button className="return-button" onClick={handleReturn}>
                    <Icon icon="mdi:arrow-left" width={24} height={24} />
                    Retornar
                </button>

                <div className="left-section">

                    <div className='title_edit_empres'>
                        <span><h2>Cadastrar Fornecedor</h2></span>
                        <span><p>Cadastrando um novo fornecedor</p></span>
                    </div>

                    <div className="steps-indicator">
                        {Array.from({ length: totalSteps }, (_, index) => {
                            const titles = [
                                "Dados do Fornecedor",
                                "Homologação do Fornecedor",
                                "Certificados do Fornecedor",
                            ];

                            const subtitles = [
                                "Preencha os campos do fornecedor",
                                "Preencha os campos do fornecedor",
                                "Preencha os campos do fornecedor",
                            ];

                            const icons = [
                                <Icon icon="majesticons:user-line" width="24" height="24" />,
                                <Icon icon="mingcute:paper-line" width="24" height="24" />,
                                <Icon icon="bitcoin-icons:verify-filled" width="24" height="24" />,
                            ];

                            return (
                                <div key={index} className="step-wrapper" onClick={() => handleCircleClick(index + 1)}>
                                    <div className="step-content">
                                        <div className="step-title">
                                            <h3>{titles[index]}</h3>
                                            <p>{subtitles[index]}</p>
                                        </div>
                                        <div className="circle-wrapper">
                                            {index < totalSteps - 1 && (
                                                <>
                                                    <div className="line background-line"></div>
                                                    <div className={`line foreground-line ${step > index + 1 ? 'line-active' : ''}`}></div>
                                                </>
                                            )}
                                            <div className={`circle ${step > index ? 'active' : ''}`}>
                                                {icons[index]}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className='container-progress'>
                    <div className="content-step">
                        <div className={`right-section animate-appear step-${step}`}>
                            <p>Passo {step}/{totalSteps}</p>
                            <h1>Preencha os campos do fornecedor </h1>
                            <p>Fornecedor</p>
                            <div className="inputs-container">
                                {step === 1 ? (
                                    <div>
                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Razão social</label>
                                                <input
                                                    placeholder="Preencha o campo..."
                                                    className="input_field"
                                                    type="text"
                                                    name="razaoSocial"
                                                    value={formData.step1.razaoSocial || ""}
                                                    onChange={(e) => handleChange(e, "step1")}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">CNPJ</label>
                                                <input
                                                    placeholder="00.000.000/0000-00"
                                                    className="input_field"
                                                    type="text"
                                                    value={formData.step1.cnpj || ""}
                                                    onChange={handleCnpjChange}
                                                    maxLength="18"
                                                    name="cnpj"
                                                />
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Tipo de Fornecedor</label>
                                                <select
                                                    name="tipoFornecedor"
                                                    className="input_field"
                                                    value={formData.step1.tipoFornecedor || ""}
                                                    onChange={(e) => handleChange(e, "step1")}
                                                >
                                                    <option value="" disabled selected>Selecione uma opção</option>
                                                    <option value="monopolista">Monopolista</option>
                                                    <option value="concorrente">Concorrente</option>
                                                    <option value="individual">Individual</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="buttons-step-content">
                                            <button
                                                className="button-step back-button"
                                                disabled={step === 1 || loading}
                                                onClick={handleBack}
                                            >
                                                Voltar
                                            </button>
                                            <button className="button-step next-button" onClick={handleNext}>
                                                Próximo
                                            </button>
                                        </div>
                                    </div>
                                ) : step === 2 ? (
                                    <div>
                                        <div className="input-step">
                                            <label className="input_label">RA</label>
                                            <input
                                                placeholder="Preencha o campo..."
                                                className="input_field"
                                                type="text"
                                                name="ra" // O nome do campo
                                                value={formData.step2.ra || ""} // Acessando o valor de step2
                                                onChange={(e) => handleChange(e, "step2")} // Passando para a função de update
                                            />
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Avaliação</label>
                                                <select
                                                    name="avaliacao" // O nome do campo
                                                    className="input_field"
                                                    value={formData.step2.avaliacao || ""} // Acessando o valor de step2
                                                    onChange={(e) => handleChange(e, "step2")} // Passando para a função de update
                                                >
                                                    <option value="" disabled selected>Selecione uma opção</option>
                                                    <option value="excelente">Excelente</option>
                                                    <option value="bom">Bom</option>
                                                    <option value="satisfatório">Satisfatório</option>
                                                    <option value="insatisfatório">Insatisfatório</option>
                                                </select>
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">CNPJ Ativo</label>
                                                <select
                                                    name="cnpjAtivo" // O nome do campo
                                                    className="input_field"
                                                    value={formData.step2.cnpjAtivo || ""} // Acessando o valor de step2
                                                    onChange={(e) => handleChange(e, "step2")} // Passando para a função de update
                                                >
                                                    <option value="" disabled selected>Selecione uma opção</option>
                                                    <option value="Sim">Sim</option>
                                                    <option value="Não">Não</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Tempo de Mercado</label>
                                                <select
                                                    name="tempoDeMercado" // O nome do campo
                                                    className="input_field"
                                                    value={formData.step2.tempoDeMercado || ""} // Acessando o valor de step2
                                                    onChange={(e) => handleChange(e, "step2")} // Passando para a função de update
                                                >
                                                    <option value="" disabled selected>Selecione uma opção</option>
                                                    <option value="Menos de 1 ano">Menos de 1 ano</option>
                                                    <option value="1 a 2 anos">1 a 2 anos</option>
                                                    <option value="3 a 5 anos">3 a 5 anos</option>
                                                    <option value="6 a 10 anos">6 a 10 anos</option>
                                                    <option value="Mais de 10 anos">Mais de 10 anos</option>
                                                </select>
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Habilitação Jurídica</label>
                                                <select
                                                    name="habilitacaoJuridica" // O nome do campo
                                                    className="input_field"
                                                    value={formData.step2.habilitacaoJuridica || ""} // Acessando o valor de step2
                                                    onChange={(e) => handleChange(e, "step2")} // Passando para a função de update
                                                >
                                                    <option value="" disabled selected>Selecione uma opção</option>
                                                    <option value="Em conformidade">Em conformidade</option>
                                                    <option value="Com pendências">Com pendências</option>
                                                    <option value="Cancelada">Cancelada</option>
                                                    <option value="Expirada">Expirada</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Habilitações Técnicas</label>
                                                <select
                                                    name="habilitacoesTecnicas" // O nome do campo
                                                    className="input_field"
                                                    value={formData.step2.habilitacoesTecnicas || ""} // Acessando o valor de step2
                                                    onChange={(e) => handleChange(e, "step2")} // Passando para a função de update
                                                >
                                                    <option value="" disabled selected>Selecione uma opção</option>
                                                    <option value="Necessário">Necessário</option>
                                                    <option value="Não necessário">Não necessário</option>
                                                </select>
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Situação Econômica</label>
                                                <select
                                                    name="situacaoEconomica" // O nome do campo
                                                    className="input_field"
                                                    value={formData.step2.situacaoEconomica || ""} // Acessando o valor de step2
                                                    onChange={(e) => handleChange(e, "step2")} // Passando para a função de update
                                                >
                                                    <option value="" disabled selected>Selecione uma opção</option>
                                                    <option value="Sem pendências">Sem pendências</option>
                                                    <option value="Com pendências">Com pendências</option>
                                                    <option value="Cancelada">Cancelada</option>
                                                    <option value="Expirada">Expirada</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="input-step">
                                            <label className="input_label">Regularidade Fiscal</label>
                                            <select
                                                name="regularidadeFiscal" // O nome do campo
                                                className="input_field"
                                                value={formData.step2.regularidadeFiscal || ""} // Acessando o valor de step2
                                                onChange={(e) => handleChange(e, "step2")} // Passando para a função de update
                                            >
                                                <option value="" disabled selected>Selecione uma opção</option>
                                                <option value="Em conformidade">Em conformidade</option>
                                                <option value="Com documentação pendente">Com documentação pendente</option>
                                                <option value="Em processo de regularização">Em processo de regularização</option>
                                                <option value="Irregular">Irregular</option>
                                            </select>
                                        </div>

                                        <div className="buttons-step-content">
                                            <button
                                                className="button-step back-button"
                                                disabled={step === 2 || loading}
                                                onClick={handleBack}
                                            >
                                                Voltar
                                            </button>
                                            <button className="button-step next-button" onClick={handleNext}>
                                                Próximo
                                            </button>
                                        </div>
                                    </div>
                                ) : step === 3 ? (
                                    <div>
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
                                                {files.map((file, index) => (
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

                                            <div className="buttons-step-content">
                                                <button
                                                    className="button-step back-button"
                                                    disabled={step === 3 || loading}
                                                    onClick={handleBack}
                                                >
                                                    Voltar
                                                </button>
                                                <button className="button-step next-button" onClick={handleFinalize}>
                                                    Finalizar
                                                </button>
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

                                    </div>
                                ) : (
                                    <div>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DadosFornecedores;