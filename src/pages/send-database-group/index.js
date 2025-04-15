import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { getDatabase, ref, update, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Sidebar from '../../components/SidebarGestock';

const SendDataBaseGroup = () => {
    const [step, setStep] = useState(1);
    const totalSteps = 6;
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Para redirecionamento
    const [formData, setFormData] = useState({
        razaoSocial: '',
        nomeFantasia: '',
        classificacao: '',
        naturezaJuridica: '',
        cnpj: '',
        porteEmpresa: '',
        dataFundacao: '',
        cnae: '',
        identificacaoEstadual: '',
        identificacaoNacional: '',
        capitalSocial: '',
        contasBancarias: '',
        cep: '',
        cidade: '',
        rua: '',
        estado: '',
        bairro: '',
        numero: '',
        telefone: '',
        email: '',
        website: '',
        missao: '',
        visao: '',
        valores: '',
        socios: '',
        qualificacao: '',
        identidadeVisualDocumento: ""
    });

    const [sócios, setSócios] = useState([{ id: Date.now(), nome: '', qualificacao: '' }]);
    const [groupKey, setGroupKey] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            identidadeVisualDocumento: file,
        });
    };

    useEffect(() => {
        if (formData.cep.length === 8) {
            fetchCepData(formData.cep);
        }
    }, [formData.cep]);

    const fetchCepData = async (cep) => {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData((prevData) => ({
                    ...prevData,
                    cidade: data.localidade,
                    rua: data.logradouro,
                    estado: data.uf,
                    bairro: data.bairro,
                }));
            } else {
                console.log("CEP não encontrado");
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    };

    const handleQualificacaoChange = (index, e) => {
        const { value } = e.target;
        setSócios((prevSócios) => {
            const novosSócios = [...prevSócios];
            novosSócios[index].qualificacao = value;
            return novosSócios;
        });
    };
    

    const handleSócioChange = (index, e) => {
        const newSócios = [...sócios];
        newSócios[index][e.target.name] = e.target.value;
        setSócios(newSócios);
    };
    const addSócio = () => {
        setSócios([...sócios, { id: Date.now(), nome: '', qualificacao: '' }]);
    };

    const removeSócio = (index) => {
        const newSócios = sócios.filter((_, i) => i !== index);
        setSócios(newSócios);
    };


    const handleNext = () => {
        if (step < totalSteps) {
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

    const fetchGroupByAdminEmail = async (email) => {
        const db = getDatabase();
        const groupsRef = ref(db, 'groups');
        try {
            const snapshot = await get(groupsRef);
            if (snapshot.exists()) {
                const groups = snapshot.val();
                const matchingGroup = Object.keys(groups).find(groupKey => {
                    const group = groups[groupKey];
                    return group.admin?.email === email;
                });

                if (matchingGroup) {
                    setGroupKey(matchingGroup);
                    console.log('Grupo correspondente:', matchingGroup);
                } else {
                    console.log('Nenhum grupo encontrado com este email de admin.');
                }
            } else {
                console.log('Nenhum grupo encontrado.');
            }
        } catch (error) {
            console.error('Erro ao buscar grupos:', error);
        }
    };

    const handleShowEmailAndGroup = () => {
        if (currentUser && currentUser.email) {
            console.log('E-mail logado:', currentUser.email);
            fetchGroupByAdminEmail(currentUser.email);
        } else {
            console.log('Nenhum usuário logado');
        }
    };

    const handleFinalSubmit = async () => {
        const db = getDatabase();
        const storage = getStorage();

        if (currentUser && currentUser.email) {
            const groupsRef = ref(db, 'groups');

            try {
                const snapshot = await get(groupsRef);
                if (snapshot.exists()) {
                    const groups = snapshot.val();
                    const matchingGroupKey = Object.keys(groups).find(groupKey => {
                        const group = groups[groupKey];
                        return group.admin?.email === currentUser.email;
                    });

                    if (matchingGroupKey) {
                        const groupRef = ref(db, `groups/${matchingGroupKey}`);

                        if (formData.identidadeVisualDocumento) {
                            const file = formData.identidadeVisualDocumento;
                            const fileRef = storageRef(storage, `docs/${file.name}`);
                            const uploadSnapshot = await uploadBytes(fileRef, file);
                            const downloadURL = await getDownloadURL(uploadSnapshot.ref);

                            const updates = {
                                nomeFantasia: formData.nomeFantasia,
                                edited: 1,
                                infosGroup: {
                                    razaoSocial: formData.razaoSocial,
                                    classificacao: formData.classificacao,
                                    naturezaJuridica: formData.naturezaJuridica,
                                    cnpj: formData.cnpj,
                                    porteEmpresa: formData.porteEmpresa,
                                    dataFundacao: formData.dataFundacao,
                                    cnae: formData.cnae,
                                    identificacaoEstadual: formData.identificacaoEstadual,
                                    identificacaoNacional: formData.identificacaoNacional,
                                    capitalSocial: formData.capitalSocial,
                                    contasBancarias: formData.contasBancarias,
                                    cep: formData.cep,
                                    cidade: formData.cidade,
                                    rua: formData.rua,
                                    estado: formData.estado,
                                    bairro: formData.bairro,
                                    numero: formData.numero,
                                    telefone: formData.telefone,
                                    email: formData.email,
                                    website: formData.website,
                                    missao: formData.missao,
                                    visao: formData.visao,
                                    valores: formData.valores,
                                    socios: sócios,
                                    qualificacao: formData.qualificacao,
                                    identidadeVisualDocumento: downloadURL
                                }
                            };

                            await update(groupRef, updates);
                            alert('Sua Empresa foi Editada com Sucesso!'); // Alerta de sucesso
                            setTimeout(() => {
                                navigate('/dashboard'); // Redireciona após 3 segundos
                            }, 3000);
                        } else {
                            console.log('Nenhum arquivo de identidade visual selecionado.');
                        }
                    } else {
                        console.log('Nenhum grupo encontrado com este email de admin.');
                    }
                } else {
                    console.log('Nenhum grupo encontrado.');
                }
            } catch (error) {
                console.error('Erro ao atualizar o grupo:', error);
            }
        } else {
            console.log('Nenhum usuário logado');
        }
    };

    return (

        <div>
            {loading && (
                <div className="loading-overlay">
                    <Icon icon="svg-spinners:ring-resize" className="loading-icon" />
                </div>
            )}
            <Sidebar className="sidebar-container" />

            <div className='body-group-edit'>

                <div className="left-section">

                    <div className='title_edit_empres'>
                        <span><h2>Editar Empresa</h2></span>
                        <span><p>Realize os 6 passos para editar uma empresa préviamente criada</p></span>
                    </div>

                    <div className="steps-indicator">
                        {Array.from({ length: totalSteps }, (_, index) => {
                            const titles = [
                                "Identificação",
                                "Finanças",
                                "Endereço e Contato",
                                "Sócios e Participações",
                                "Cultura Organizacional",
                                "Identidade Visual"
                            ];

                            const subtitles = [
                                "Identidade da empresa",
                                "Financeiro da empresa",
                                "Localização e dados telefônicos da empresa",
                                "Informações sobre os associados da empresa",
                                "Cadastro da Cultura Organizacional da Empresa",
                                "Documentos e Logo da empresa"
                            ];

                            const icons = [
                                <Icon icon="bx:user" />,
                                <Icon icon="mdi:dollar" />,
                                <Icon icon="ic:baseline-phone" />,
                                <Icon icon="mdi:partnership" />,
                                <Icon icon="streamline:script-2" />,
                                <Icon icon="majesticons:camera-line" />
                            ];

                            return (
                                <div key={index} className="step-wrapper" onClick={() => handleCircleClick(index + 1)}>
                                    <div className="step-content">
                                        <div className="step-title">
                                            <h3>{titles[index]}</h3>
                                            <p>{subtitles[index]}</p>
                                        </div>
                                        <div className="circle-wrapper">
                                            {/* Exibe linha cinza e vermelha apenas se não for o último círculo */}
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
                    <div className="header-section-group">
                        <h1>Edite a Identificação da Empresa</h1>
                        <p>Por favor, preencha os campos completos</p>
                    </div>

                    <div className="content-step">
                        <div className={`right-section animate-appear step-${step}`}>
                            <p>Passo {step}/{totalSteps}</p>
                            <h1>Preencha os campos de edição e criação de sua Empresa</h1>
                            <p>Por favor, preencha todos os campos fornecidos</p>
                            <div className="inputs-container">
                                {step === 1 ? (
                                    <div>
                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Razão Social</label>
                                                <input
                                                    placeholder='Preencha a razão social'
                                                    className="input_field"
                                                    type="text"
                                                    name="razaoSocial"
                                                    value={formData.razaoSocial}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Nome Fantasia</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="nomeFantasia"
                                                    value={formData.nomeFantasia}
                                                    onChange={handleChange}
                                                />
                                            </div >
                                        </div>
                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Classificação</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="classificacao"
                                                    value={formData.classificacao}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Natureza Jurídica</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="naturezaJuridica"
                                                    value={formData.naturezaJuridica}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">CNPJ</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="cnpj"
                                                    value={formData.cnpj}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Porte da Empresa</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="porteEmpresa"
                                                    value={formData.porteEmpresa}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Data de Fundação</label>
                                                <input
                                                    className="input_field"
                                                    type="date"
                                                    name="dataFundacao"
                                                    value={formData.dataFundacao}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Atividade Econômica (CNAE)</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="cnae"
                                                    value={formData.cnae}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Identificação Estadual</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="identificacaoEstadual"
                                                    value={formData.identificacaoEstadual}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Identificação Nacional</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="identificacaoNacional"
                                                    value={formData.identificacaoNacional}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="buttons-step-content">
                                            <button className="button-step back-button" disabled={step === 1 || loading} onClick={handleBack}>
                                                Voltar
                                            </button>
                                            <button className="button-step next-button" onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                ) : step === 2 ? (
                                    <div>
                                        <div className="input-step">
                                            <label className="input_label">Capital Social inicial</label>
                                            <input
                                                className="input_field"
                                                type="text"
                                                name="capitalSocial"
                                                value={formData.capitalSocial}
                                                onChange={(e) => {
                                                    const numericValue = e.target.value.replace(/\D/g, '');
                                                    const formattedValue = new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL',
                                                    }).format(numericValue / 100);
                                                    handleChange({
                                                        target: {
                                                            name: 'capitalSocial',
                                                            value: formattedValue,
                                                        },
                                                    });
                                                }}
                                            />
                                        </div>

                                        <div className="input-step">
                                            <label className="input_label">Contas Bancárias</label>
                                            <div className="input-icon-wrapper">
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="contasBancarias"
                                                    value={formData.contasBancarias}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="buttons-step-content">
                                            <button className="button-step back-button" disabled={step === 1 || loading} onClick={handleBack}>
                                                Voltar
                                            </button>
                                            <button className="button-step next-button" onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>

                                ) : step === 3 ? (
                                    <div>
                                        <div className="input-step">
                                            <label className="input_label">CEP</label>
                                            <input
                                                className="input_field"
                                                type="text"
                                                name="cep"
                                                value={formData.cep}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Cidade</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="cidade"
                                                    value={formData.cidade}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Rua</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="rua"
                                                    value={formData.rua}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Estado</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="estado"
                                                    value={formData.estado}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Bairro</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="bairro"
                                                    value={formData.bairro}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="inputs-flex">
                                            <div className="input-step">
                                                <label className="input_label">Número</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="numero"
                                                    value={formData.numero}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="input-step">
                                                <label className="input_label">Telefone</label>
                                                <input
                                                    className="input_field"
                                                    type="text"
                                                    name="telefone"
                                                    value={formData.telefone}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-step">
                                            <label className="input_label">E-mail</label>
                                            <input
                                                className="input_field"
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="input-step">
                                            <label className="input_label">Website</label>
                                            <input
                                                className="input_field"
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="buttons-step-content">
                                            <button className="button-step back-button" disabled={step === 1 || loading} onClick={handleBack}>
                                                Voltar
                                            </button>                                            <button className="button-step next-button" onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                ) : step === 4 ? (
                                    <div>
                                        {sócios.map((sócio, index) => (
                                            <div className="input-step" key={sócio.id}>
                                                <label className="input_label">{`Sócio ${index + 1}`}</label>

                                                <div className="input-step-sócios">
                                                    {/* Campo para o Nome do Sócio */}
                                                    <input
                                                        className="input_field"
                                                        type="text"
                                                        name="nome"
                                                        placeholder="Nome"
                                                        value={sócio.nome}
                                                        onChange={(e) => handleSócioChange(index, e)}
                                                        style={{ marginRight: '10px' }}
                                                    />
                                                </div>

                                                {/* Campo para a Qualificação do Sócio */}
                                                <div className="input-step-sócios">
                                                    <input
                                                        className="input_field"
                                                        type="text"
                                                        name="qualificacao"
                                                        placeholder="Qualificação"
                                                        value={sócio.qualificacao}
                                                        onChange={(e) => handleQualificacaoChange(index, e)}
                                                        style={{ marginTop: '5px' }}
                                                    />
                                                </div>

                                                {index === sócios.length - 1 ? (
                                                    <button onClick={addSócio}>
                                                        <Icon icon="mdi:plus" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => removeSócio(index)}>
                                                        <Icon icon="mdi:minus" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        <div className="buttons-step-content">
                                            <button className="button-step back-button" disabled={step === 1 || loading} onClick={handleBack}>
                                                Voltar
                                            </button>
                                            <button className="button-step next-button" onClick={handleNext}>Próximo</button>
                                        </div>                              </div>
                                ) : step === 5 ? (
                                    <div>
                                        <div className="input-step">
                                            <label className="input_label">Missão</label>
                                            <input
                                                className="input_field"
                                                type="text"
                                                name="missao"
                                                value={formData.missao}
                                                onChange={handleChange}
                                            />
                                        </div >
                                        <div className="input-step">
                                            <label className="input_label">Visão</label>
                                            <input
                                                className="input_field"
                                                type="text"
                                                name="visao"
                                                value={formData.visao}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="input-step">
                                            <label className="input_label">Valores</label>
                                            <input
                                                className="input_field"
                                                type="text"
                                                name="valores"
                                                value={formData.valores}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="buttons-step-content">
                                            <button className="button-step back-button" disabled={step === 1 || loading} onClick={handleBack}>
                                                Voltar
                                            </button>                                            <button className="button-step next-button" onClick={handleNext}>Próximo</button>
                                        </div>                                </div>
                                ) : (
                                    <div>
                                        <div className="input-step">
                                            <label className="input_label ">Upload de Identidade Visual e Documentos</label>
                                            <input
                                                className="input_field upload-step-visual"
                                                type="file"
                                                name="identidadeVisualDocumento"
                                                onChange={handleFileChange}
                                            />

                                        </div>
                                        <div className="buttons-step-content">
                                            <button className="button-step back-button" disabled={step === 1 || loading} onClick={handleBack}>
                                                Voltar
                                            </button>
                                            <button className="button-step next-button" onClick={handleFinalSubmit}>Finalizar</button>
                                        </div>
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

export default SendDataBaseGroup;
