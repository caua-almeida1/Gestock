import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, set, get, child } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Sidebar from '../../../components/SidebarGestock';
import { getAuth } from 'firebase/auth';

const CotacaoFornecedores = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.state) {
            const { id, razaoSocial, sku } = location.state;
            console.log("Dados recebidos na navegação:");
            console.log("ID do Fornecedor:", id);
            console.log("Razão Social do Fornecedor:", razaoSocial);
            console.log("SKU do Produto:", sku);
        } else {
            console.error("Nenhum dado recebido na navegação.");
        }
    }, [location.state]);

    const [step, setStep] = useState(1);
    const totalSteps = 1;
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        step1: {

        },
    });

    const handleChange = (e, stepKey) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [stepKey]: { ...prev[stepKey], [name]: value },
        }));
    };

    const handleNext = () => {
        if (step === 1) {
            setLoading(true);
            setTimeout(() => {
                setStep(step + 1);
                setLoading(false);
            }, 1700);
        } else {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setStep(step + 1);
            }, 1700);
        }
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
        if (clickedStep !== step) {
            setLoading(true);
            setTimeout(() => {
                setStep(clickedStep);
                setLoading(false);
            }, 1700);
        }
    };

    const handleFinalize = async () => {
        const db = getDatabase(); // Inicializa o banco de dados
        const fields = formData.step1; // Dados do formulário preenchidos
        const { sku, id: fornecedorId } = location.state || {};
    
        // Valida campos vazios
        const emptyFields = Object.keys(fields).filter((key) => !fields[key]);
        if (emptyFields.length > 0) {
            showNotification("error", "Por favor, preencha todos os campos antes de finalizar.");
            return;
        }
    
        try {
            setLoading(true);
    
            // Referência para a tabela do produto pelo SKU
            const productRef = ref(db, `products/${sku}`);
            const productSnapshot = await get(productRef);
    
            if (productSnapshot.exists()) {
                const productData = productSnapshot.val();
    
                // Verifica se existe o fornecedor no produto
                const fornecedores = productData.fornecedores || {};
                if (fornecedores[fornecedorId]) {
                    // Atualiza a coluna 'cotacao' do fornecedor
                    const cotacaoRef = ref(db, `products/${sku}/fornecedores/${fornecedorId}/cotacao`);
                    await set(cotacaoRef, {
                        ...fields,
                        timestamp: new Date().toISOString(), // Adiciona timestamp para controle
                    });
    
                    showNotification("success", "Cotação salva com sucesso!");
                    // Redireciona após 3 segundos
                    setTimeout(() => {
                        navigate('/products-estoque');
                    }, 3000);
                } else {
                    showNotification("error", "Fornecedor não encontrado para este produto.");
                }
            } else {
                showNotification("error", "Produto não encontrado no banco de dados.");
            }
        } catch (error) {
            console.error("Erro ao salvar cotação:", error);
            showNotification("error", "Ocorreu um erro ao salvar a cotação.");
        } finally {
            setLoading(false);
        }
    };    

    const closeNotification = () => {
        setNotification({ type: '', message: '', visible: false });
        navigate('/products-estoque'); // Redireciona após fechar a notificação
    };


    const [notification, setNotification] = useState({ type: '', message: '', visible: false });

    const showNotification = (type, message) => {
        setNotification({ type, message, visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    };

    const handleReturn = () => {
        navigate('/products-estoque');
    };

    const handleCustoChange = (e, step) => {
        const { name, value } = e.target;

        // Remove caracteres não numéricos
        const numericValue = value.replace(/\D/g, "");

        // Formata o número como moeda (R$)
        const formattedValue = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(numericValue / 100);

        setFormData((prevData) => ({
            ...prevData,
            [step]: {
                ...prevData[step],
                [name]: formattedValue,
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

                    <div className="title_edit_empres">
                        <span>
                            <h2>Cotação de Matéria Prima e Fornecedor</h2>
                        </span>
                        <span>
                            <p>
                                {location.state?.razaoSocial
                                    ? `Realizando a Cotação do Fornecedor "${location.state.razaoSocial}"`
                                    : "Realizando a cotação de fornecedores"}
                            </p>
                        </span>
                    </div>

                    <div className="steps-indicator">
                        {Array.from({ length: totalSteps }, (_, index) => {
                            const titles = [
                                "Dados da Compra do Fornecedor",
                            ];

                            const subtitles = [
                                "Quantidade, custo, frete, tempo de entrega",
                            ];

                            const icons = [
                                <Icon icon="icon-park-solid:shopping-bag" width="24" height="24" />
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
                            <h1>Preencha os campos com Dados da Compra</h1>
                            <p>Por favor, todos os campos fornecidos</p>
                            <div className="inputs-container">
                                {step === 1 ? (
                                    <div>
                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Quantidade do Produto</label>
                                                <input
                                                    placeholder="Preencha o campo..."
                                                    className="input_field"
                                                    type="number"
                                                    name="quantidade"
                                                    value={formData.step1.quantidade || ""}
                                                    onChange={(e) => handleChange(e, "step1")}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Custo</label>
                                                <input
                                                    placeholder="00,00"
                                                    className="input_field"
                                                    type="text"
                                                    name="custo"
                                                    value={formData.step1.custo || "00,00"}
                                                    onChange={(e) => handleCustoChange(e, "step1")}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Frete</label>
                                                <input
                                                    placeholder="00,00"
                                                    className="input_field"
                                                    type="text"
                                                    name="frete"
                                                    value={formData.step1.frete || "00,00"}
                                                    onChange={(e) => handleCustoChange(e, "step1")}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-step">
                                            <label className="input_label">Tempo de Entrega</label>
                                            <input
                                                placeholder="Preencha o campo...  ex: 10 dias"
                                                className="input_field"
                                                type="text"
                                                maxLength="18"
                                                name="tempoEntrega"
                                                value={formData.step1.tempoEntrega || ""}
                                                onChange={(e) => handleChange(e, "step1")}
                                            />
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Tipo de Conferência</label>
                                                <select
                                                    name="tipoConferencia"
                                                    className="input_field"
                                                    value={formData.step1.tipoConferencia || ""}
                                                    onChange={(e) => handleChange(e, "step1")}
                                                >
                                                    <option value="" disabled>
                                                        Selecione uma opção
                                                    </option>
                                                    <option value="Quantitativa (Às Cegas ou Normal)">Quantitativa (Às Cegas ou Normal)</option>
                                                    <option value="Qualitativa">Qualitativa</option>
                                                    <option value="Conferência de Preços">Conferência de Preços</option>
                                                    <option value="Conferência de Prazos">Conferência de Prazos</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="buttons-step-content">
                                            <button
                                                className="button-step next-button"
                                                onClick={handleFinalize}
                                            >
                                                Finalizar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CotacaoFornecedores;