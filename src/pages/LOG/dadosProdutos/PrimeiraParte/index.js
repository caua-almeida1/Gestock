import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, set, get, child } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Sidebar from '../../../../components/SidebarGestock';
import { getAuth } from 'firebase/auth'; // Importando o Firebase Authentication

const DadosProdutos1 = () => {
    const [step, setStep] = useState(1);
    const totalSteps = 3;
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        step1: { quantity: 0 },
        step2: {},
        step3: {},
    });


    const [sku, setSku] = useState("");
    const [stockWarning, setStockWarning] = useState(false);
    const [skuExists, setSkuExists] = useState(false);

    const handleSkuChange = (e) => {
        let value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
        value = value.slice(0, 10);
        const formattedSku = value
            .replace(/(.{3})(.{2})(.{3})(.{2})/, "$1-$2-$3-$4")
            .replace(/-$/, "");
        setSku(formattedSku);
        setFormData((prev) => ({
            ...prev,
            step1: { ...prev.step1, sku: formattedSku },
        }));
    };

    const handleChange = (e, stepKey) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [stepKey]: { ...prev[stepKey], [name]: value },
        }));
    };

    const [isNameEmpty, setIsNameEmpty] = useState(false);

    const [isSkuEmpty, setIsSkuEmpty] = useState(false);
    const [isSkuShort, setIsSkuShort] = useState(false);

    const handleNext = () => {
        if (step === 1) {
            const name = formData.step1.name;
    
            // Validação do nome
            if (!name || name.trim() === "") {
                setIsNameEmpty(true); // Exibir aviso
                return; // Impedir avanço
            }
    
            // Validação do SKU vazio
            if (!sku) {
                setIsSkuEmpty(true);
                return;
            }
    
            // Validação do SKU curto
            if (sku.replace(/-/g, "").length < 10) {
                setIsSkuShort(true);
                return;
            }
    
            // Verificação do SKU duplicado no Firebase
            const db = getDatabase();
            const productRef = ref(db, 'products/' + sku);
    
            get(productRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        setSkuExists(true); // SKU já cadastrado
                    } else {
                        // Limpar os avisos
                        setIsNameEmpty(false);
                        setIsSkuEmpty(false);
                        setIsSkuShort(false);
                        setSkuExists(false);
    
                        // Avançar para o próximo passo
                        setLoading(true);
                        setTimeout(() => {
                            setLoading(false);
                            setStep(step + 1);
                        }, 1700);
                    }
                })
                .catch((error) => {
                    console.error("Erro ao verificar SKU no Firebase:", error);
                });
        } else if (step === 2) {
            const { maxStock, minStock, securityStock } = formData.step2;
    
            if (!maxStock || !minStock || !securityStock) {
                setStockWarning(true); // Mostrar aviso de estoque incompleto
                return; // Bloquear o avanço
            }
    
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setStep(step + 1);
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
        if (clickedStep === step) return; // Se o passo atual for o mesmo, não faz nada
    
        // Validações para o passo atual
        if (step === 1) {
            const name = formData.step1.name;
    
            // Validação do nome
            if (!name || name.trim() === "") {
                setIsNameEmpty(true); // Exibir aviso
                return;
            } else {
                setIsNameEmpty(false); // Remover aviso
            }
    
            // Validação do SKU
            if (!sku) {
                setIsSkuEmpty(true); // Exibir aviso
                return;
            } else if (sku.replace(/-/g, "").length < 10) {
                setIsSkuShort(true); // Exibir aviso
                return;
            } else {
                setIsSkuEmpty(false); // Remover avisos
                setIsSkuShort(false);
            }
    
            // Verificação de SKU duplicado
            const db = getDatabase();
            const productRef = ref(db, 'products/' + sku);
    
            get(productRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        setSkuExists(true); // SKU já existe
                    } else {
                        setSkuExists(false); // SKU válido
                        proceedToStep(clickedStep); // Avança para o próximo passo
                    }
                })
                .catch((error) => {
                    console.error("Erro ao verificar SKU no Firebase:", error);
                });
    
            return;
        }
    
        // Validações para outros passos
        if (step === 2) {
            const { maxStock, minStock, securityStock } = formData.step2;
    
            if (!maxStock || !minStock || !securityStock) {
                setStockWarning(true); // Mostrar aviso de estoque incompleto
                return;
            }
        }
    
        proceedToStep(clickedStep); // Muda o passo
    };
    
    const proceedToStep = (clickedStep) => {
        setLoading(true);
    
        setTimeout(() => {
            setStep(clickedStep);
            setLoading(false);
        }, 1700);
    };
    

    const handleFinalize = () => {
        setLoading(true); 
        const auth = getAuth();
        const user = auth.currentUser;
        const userEmail = user ? user.email : null;

        const db = getDatabase();
        const productRef = ref(db, 'products/' + sku);

        get(productRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    updateProductData(productRef, userEmail);
                } else {
                    createNewProduct(productRef, userEmail);
                }
            })
            .catch((error) => {
                console.error("Erro ao verificar SKU no Firebase:", error);
            })
            .finally(() => {
                setLoading(false);
                setSuccessMessage(true);
                setTimeout(() => {
                    setSuccessMessage(false);
                    navigate('/products-estoque');
                }, 3000);
            });
    };

    const updateProductData = (productRef, userEmail) => {
        const productData = {
            infoProduct: formData,
            sender: userEmail,
            sku: sku,
        };

        set(productRef, productData)
            .catch((error) => {
                console.error("Erro ao atualizar produto no Firebase:", error);
            });
    };

    const createNewProduct = (productRef, userEmail) => {
        const productData = {
            infoProduct: formData,
            sender: userEmail,
            sku: sku,
        };

        set(productRef, productData)
            .catch((error) => {
                console.error("Erro ao criar novo produto no Firebase:", error);
            });
    };

    const closeSkuWarning = () => {
        setSkuExists(false);
    };

    const closeSkuShortWarning = () => {
        setIsSkuShort(false);
    };

    const closeStockWarning = () => {
        setStockWarning(false);
    };

    const handleReturn = () => {
        navigate('/products-estoque');
    };

    return (

        <div>
            {loading && (
                <div className="loading-overlay">
                    <Icon icon="svg-spinners:ring-resize" className="loading-icon" />
                </div>
            )}

            {successMessage && (
                <div className="log_stock-success-message">
                    Produto - Matéria Prima Criado Com Sucesso!
                </div>
            )}

            {skuExists && (
                <div className="sku-warning">
                    <p>
                        Este SKU já está cadastrado. Por favor, insira outro SKU.
                    </p>

                    <button
                        className="close-sku-warning"
                        onClick={closeSkuWarning}
                    >
                        Fechar
                    </button>


                </div>
            )}

            {isNameEmpty && (
                <div className="sku-warning">
                    <p>O campo Nome está vazio. Por favor, preencha antes de continuar.</p>
                    <button
                        className="close-sku-warning"
                        onClick={() => setIsNameEmpty(false)}
                    >
                        Fechar
                    </button>
                </div>
            )}

            {isSkuEmpty && (
                <div className="sku-warning">
                    <p>O campo SKU está vazio. Por favor, preencha antes de continuar.</p>
                    <button
                        className="close-sku-warning"
                        onClick={() => setIsSkuEmpty(false)}
                    >
                        Fechar
                    </button>
                </div>
            )}

            {isSkuShort && (
                <div className="sku-warning">
                    <p>O SKU deve ter 10 caracteres. Por favor, complete o campo.</p>
                    <button
                        className="close-sku-warning"
                        onClick={closeSkuShortWarning}
                    >
                        Fechar
                    </button>
                </div>
            )}

            {stockWarning && (
                <div className="sku-warning">
                    <p>
                        Todos os campos de estoque (máximo, mínimo e segurança) devem ser preenchidos.
                    </p>
                    <button
                        className="close-sku-warning"
                        onClick={closeStockWarning}
                    >
                        Fechar
                    </button>
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
                        <span><h2>Novo Matéria Prima</h2></span>
                        <span><p>Cadastrando novo matéria prima e seus fornecedores</p></span>
                    </div>

                    <div className="steps-indicator">
                        {Array.from({ length: totalSteps }, (_, index) => {
                            const titles = [
                                "Dados do produto",
                                "Dados do produto",
                                "Estocagem",
                            ];

                            const subtitles = [
                                "Preencha os campos do produto",
                                "Preencha os campos do produto",
                                "Preencha os campos de estocagem",
                            ];

                            const icons = [
                                <Icon icon="proicons:box" width="24" height="24" />,
                                <Icon icon="proicons:box" width="24" height="24" />,
                                <Icon icon="ant-design:shop-outlined" width="24" height="24" />,
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
                            <h1>Preencha os campos de dados do produto</h1>
                            <p>Por favor, preencha todos os campos fornecidos</p>
                            <div className="inputs-container">
                                {step === 1 ? (
                                    <div>
                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Nome</label>
                                                <input name="name" placeholder="Preencha o campo..." className="input_field" type="text" onChange={(e) => handleChange(e, "step1")}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">SKU</label>
                                                <input placeholder="ABC-DE-FGH-IJ" className="input_field" type="text" value={sku} onChange={handleSkuChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Descrição</label>
                                                <input name="description" className="input_field" type="text" placeholder="Preencha o campo..." onChange={(e) => handleChange(e, "step1")}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Categoria</label>
                                                <input name="category" className="input_field" type="text" placeholder="Preencha o campo..." onChange={(e) => handleChange(e, "step1")}
                                                />
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Unidade de Medida</label>
                                                <select name="unit" className="input_field" value={formData.step1.unit || ""} onChange={(e) => handleChange(e, "step1")}
                                                >
                                                    <option value="" disabled selected>Selecione uma opção</option>
                                                    <option value="peça">Peça</option>
                                                    <option value="caixa">Caixa</option>
                                                    <option value="saco">Saco</option>
                                                    <option value="garrafa">Garrafa</option>
                                                    <option value="gramas">Gramas</option>
                                                    <option value="litros">Litros</option>
                                                    <option value="metros">Metros</option>
                                                </select>
                                            </div>


                                            <div className="input-step">
                                                <label className="input_label">Quantidade</label>
                                                <input
                                                    name="quantity"
                                                    placeholder="Preencha o campo..."
                                                    className="input_field"
                                                    type="number"
                                                    onChange={(e) => handleChange(e, "step1")}
                                                />
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
                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Tipo de estoque</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="stockType"  // Nome único para o campo
                                                    value={formData.step2.stockType || ""}  // Controle de valor via estado
                                                    onChange={(e) => handleChange(e, "step2")}  // Atualiza o estado
                                                    placeholder="Preencha o campo..."
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Endereçamento</label>
                                                <div className="input-icon-wrapper">
                                                    <input
                                                        className="input_field"
                                                        type="text"
                                                        name="addressing"  // Nome único para o campo
                                                        value={formData.step2.addressing || ""}  // Controle de valor via estado
                                                        onChange={(e) => handleChange(e, "step2")}  // Atualiza o estado
                                                        placeholder="Preencha o campo..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Movimentação</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="movement"  // Nome único para o campo
                                                    value={formData.step2.movement || ""}  // Controle de valor via estado
                                                    onChange={(e) => handleChange(e, "step2")}  // Atualiza o estado
                                                    placeholder="Preencha o campo..."
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Demanda</label>
                                                <div className="input-icon-wrapper">
                                                    <input
                                                        className="input_field"
                                                        type="text"
                                                        name="demand"  // Nome único para o campo
                                                        value={formData.step2.demand || ""}  // Controle de valor via estado
                                                        onChange={(e) => handleChange(e, "step2")}  // Atualiza o estado
                                                        placeholder="Preencha o campo..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Estoque Máximo</label>
                                                <input
                                                    className="input_field"
                                                    type="number"
                                                    name="maxStock"
                                                    value={formData.step2.maxStock || ""}
                                                    onChange={(e) => handleChange(e, "step2")}
                                                    placeholder="Preencha o campo..."
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Estoque Mínimo</label>
                                                <input
                                                    className="input_field"
                                                    type="number"
                                                    name="minStock"
                                                    value={formData.step2.minStock || ""}
                                                    onChange={(e) => handleChange(e, "step2")}
                                                    placeholder="Preencha o campo..."
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Estoque de Segurança</label>
                                                <input
                                                    className="input_field"
                                                    type="number"
                                                    name="securityStock"
                                                    value={formData.step2.securityStock || ""}
                                                    onChange={(e) => handleChange(e, "step2")}
                                                    placeholder="Preencha o campo..."
                                                />
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

                                ) : step === 3 ? (
                                    <div>
                                        <div className="input-step">
                                            <label className="input_label">Parametrização do Formato de Endereçamento</label>
                                            <input
                                                className="input_field"
                                                type="text"
                                                name="addressingFormat"  // Nome único para o campo
                                                value={formData.step3.addressingFormat || ""}  // Controle de valor via estado
                                                onChange={(e) => handleChange(e, "step3")}  // Atualiza o estado
                                                placeholder="O Aluno deverá digitar a parametrização"
                                            />
                                        </div>
                                        <div className="input-step">
                                            <label className="input_label">Método de Movimentação</label>
                                            <select
                                                className="input_field"
                                                name="movementMethod"  // Nome único para o campo
                                                value={formData.step3.movementMethod || ""}  // Controle de valor via estado
                                                onChange={(e) => handleChange(e, "step3")}  // Atualiza o estado
                                            >
                                                <option value="" disabled>
                                                    Selecione uma opção
                                                </option>
                                                <option value="PEPS">PEPS</option>
                                                <option value="UEPS">UEPS</option>
                                                <option value="JIT">Just-in-Time (JIT)</option>
                                                <option value="CustoMédioPonderado">Custo Médio Ponderado</option>
                                                <option value="PVPS">PVPS</option>
                                                <option value="LIFO">LIFO</option>
                                            </select>
                                        </div>

                                        <div className="input-step-radios">
                                            <label className="input_label">Possui Kanban?</label>
                                            <div className="product-radio-buttons-container">
                                                <div className="product-radio-button">
                                                    <input
                                                        name="kanban"
                                                        id="unit"
                                                        className="product-radio-button__input"
                                                        type="radio"
                                                        value="sim"
                                                        checked={formData.step3.kanban === "sim"}  // Verifica se o valor está correto
                                                        onChange={(e) => handleChange(e, "step3")}  // Atualiza o estado
                                                    />
                                                    <label htmlFor="unit" className="product-radio-button__label">
                                                        <span className="product-radio-button__custom"></span>
                                                        Sim
                                                    </label>
                                                </div>
                                                <div className="product-radio-button">
                                                    <input
                                                        name="kanban"
                                                        id="bag"
                                                        className="product-radio-button__input"
                                                        type="radio"
                                                        value="não"
                                                        checked={formData.step3.kanban === "não"}  // Verifica se o valor está correto
                                                        onChange={(e) => handleChange(e, "step3")}  // Atualiza o estado
                                                    />
                                                    <label htmlFor="bag" className="product-radio-button__label">
                                                        <span className="product-radio-button__custom"></span>
                                                        Não
                                                    </label>
                                                </div>
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
                                            <button className="button-step next-button" onClick={handleFinalize}>
                                                Finalizar
                                            </button>
                                        </div>
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

export default DadosProdutos1;