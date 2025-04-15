import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaEnvelope, FaLock, FaChevronDown } from 'react-icons/fa';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, set, auth, get, push } from '../../../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import "../../master/master.css";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ScreenWarning from '../../../components/MaxPhone';
import Sidebar from '../../../components/SidebarGestock'

const Admregister = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [formValues, setFormValues] = useState({ email: '', password: '', confirmPassword: '', fullName: '', job: 'Administrador' });
    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [completedSteps, setCompletedSteps] = useState([false, false, false]);
    const [errorMessage, setErrorMessage] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    const [isAaVisible, setIsAaVisible] = useState(false);
    const navigate = useNavigate();
    const sidebarRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const toggleAa = () => {
        setIsAaVisible(!isAaVisible);
    };

    const generateRandomPassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        const length = 6;
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    };

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            setIsOpen(false); // Fechar o sidebar se o clique for fora dele
        }
    };

    useEffect(() => {
        if (step === 2) {
            const randomPassword = generateRandomPassword();
            setFormValues((prevValues) => ({
                ...prevValues,
                password: randomPassword,
                confirmPassword: randomPassword,
            }));
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // Limpar o listener quando o componente for desmontado
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [step, isOpen]);


    const toggleSidebar = () => setIsOpen(!isOpen);
    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value
        }));

        console.log('Valores do formulário atualizados:', { ...formValues, [name]: value }); // Verifique os valores aqui
        updateCompletedSteps(name, value);
    };

    const updateCompletedSteps = (name, value) => {
        const newCompletedSteps = [...completedSteps];
        if (step === 1) {
            newCompletedSteps[step] = formValues.email.length > 0;
        } else if (step === 2) {
            newCompletedSteps[step] = formValues.password.length > 0 && formValues.confirmPassword.length > 0;
        } else {
            newCompletedSteps[step] = value.length > 0;
        }
        setCompletedSteps(newCompletedSteps);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (step === 2 && formValues.password !== formValues.confirmPassword) {
            showNotification('As senhas não coincidem. Por favor, tente novamente.', 'error');
            return;
        }
        if (step >= 2) {
            await registerUser();
            return;
        }
        setCompletedSteps((prev) => {
            const newCompletedSteps = [...prev];
            newCompletedSteps[step] = true;
            return newCompletedSteps;
        });
        setStep(step + 1);
    };

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false })); // Oculta a notificação após 6 segundos
        }, 10000); // O tempo total de exibição da notificação
    };

    const registerUser = async () => {
        setLoading(true);
        if (!formValues.job) {
            alert('Por favor, selecione um cargo.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formValues.email, formValues.password);
            const user = userCredential.user;
            const db = getDatabase();
            const usersRef = ref(db, `users/${user.uid}`);

            // Salvar os dados do usuário
            await set(usersRef, {
                email: formValues.email,
                fullName: formValues.fullName,
                job: formValues.job,
                Senha: formValues.password,
                nomeFantasia: formValues.job === 'Administrador' ? `Grupo ${user.uid}` : '' // Atribuir nomeFantasia baseado no cargo
            });

            if (formValues.job === 'Administrador') {
                // Referência aos grupos
                const groupsRef = ref(db, 'groups');
                const snapshot = await get(groupsRef);
                const existingGroups = snapshot.exists() ? snapshot.val() : {};
            
                // Calcular o próximo número de empresa
                const groupNumbers = Object.values(existingGroups).map(group => {
                    const match = group.nomeFantasia.match(/Empresa (\d+)/);
                    return match ? parseInt(match[1], 10) : 0;
                });
                const nextGroupNumber = Math.max(...groupNumbers, 0) + 1;
            
                const groupName = `Empresa ${nextGroupNumber}`;
            
                const newGroupRef = ref(db, `groups/${groupName}`);
                await set(newGroupRef, {
                    admin: {
                        email: formValues.email,
                        name: formValues.fullName,
                    },
                    members: [formValues.email],
                    nomeFantasia: groupName,
                    edited: 0,
                });
            }            

            await sendEmailWithPassword(formValues.email, formValues.password);
            showNotification('Usuário cadastrado com sucesso!!', 'success'); // Notificação de sucesso
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            // Tratar erros específicos do Firebase
            let errorMessage = '';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este e-mail já está cadastrado.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'E-mail inválido. Verifique o formato.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'A operação não é permitida. Entre em contato com o administrador.';
                    break;
                default:
                    errorMessage = 'Ocorreu um erro durante o cadastro. Tente novamente.';
                    break;
            }

            showNotification(errorMessage, 'error'); // Notificação de erro específica
        } finally {
            setLoading(false); // Desativa o loader após a conclusão
        }
    };
    const sendEmailWithPassword = async (email, password) => {
        try {
            await axios.post('http://localhost:3001/send-email', {
                to: email,
                subject: 'Sua Senha de Cadastro',
                text: `Olá, sua senha gerada automaticamente é: ${password}. Por favor, altere-a após o primeiro login.`
            });
            console.log('E-mail de senha enviado com sucesso');
        } catch (error) {
            console.error('Erro ao enviar o e-mail:', error);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <div>
            <div className="dashboard">
                <Sidebar className="sidebar-container" />
                {loading && (
                    <div className="loading-overlay">
                        <Icon icon="svg-spinners:ring-resize" className="loading-icon" />
                    </div>
                )}
                <div></div>
                {notification.message && (
                    <div className={`notification ${notification.type} ${notification.visible ? 'visible' : ''}`}>
                        <button onClick={() => setNotification({ ...notification, visible: false })} className="close-button">X</button>
                        <span> <br></br> <p>{notification.message}</p></span>
                    </div>
                )}

                <div className="admregister-container">
                    <div className="text-container">
                        <div className="text70">
                            <h3>Seu Nome</h3>
                            <p>Nome completo</p>
                        </div>
                        <div className="text71">
                            <h3>Seu Email</h3>
                            <p>Email educacional</p>
                        </div>
                        <div className="text72">
                            <h3>Sua Senha</h3>
                            <p>Senha e confirmação</p>
                        </div>
                    </div>

                    <div className={`step-form-container ${isProfileVisible ? 'is-profile-visible' : ''}`}>
                        <div className="steps-indicator">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className={`step-item ${completedSteps[index] ? 'active' : ''}`}>
                                    <div className={`circle ${completedSteps[index] ? 'active' : ''}`}>
                                        {index === 0 && <FaUser />}
                                        {index === 1 && <FaEnvelope />}
                                        {index === 2 && <FaLock />}
                                    </div>
                                    {index < 2 && (
                                        <div className={`line ${completedSteps[index + 1] ? 'active' : ''}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="form-content">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <div className="info-labe">
                                        <label>Passo {step + 1}/3</label>
                                    </div>

                                    <div className="info-h2"></div>
                                    <div className="cadastro-h2">
                                        <h2>Cadastro de Usuários</h2>
                                    </div>
                                    <div className="passos-p">
                                        <p>Realize os 3 passos para criar um usuário administrador</p>
                                    </div>
                                    {step === 1 ? (
                                        <>
                                            <div className="info-label">
                                                <label>Email educacional</label>
                                            </div>
                                            <input
                                                type="email"
                                                className={`form-contro ${step === 1 ? 'step-2' : ''}`}
                                                name="email"
                                                value={formValues.email || ''}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </>
                                    ) : step === 2 ? (
                                        <>
                                            <div className="info-label">
                                                <label>Senha</label>
                                            </div>
                                            <div className="password-field">
                                                <input
                                                    type={isPasswordVisible ? 'text' : 'password'}
                                                    className="form-controo"
                                                    name="password"
                                                    value={formValues.password || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="toggle-password"
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            <div className="info-label">
                                                <label>Confirmação de Senha</label>
                                            </div>
                                            <div className="password-field">
                                                <input
                                                    type={isPasswordVisible ? 'text' : 'password'}
                                                    className="form-controo"
                                                    name="confirmPassword"
                                                    value={formValues.confirmPassword || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="toggle-password"
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </>
                                    ) : step === 0 ? (
                                        <>
                                            <div className="info-label">
                                                <label>Nome completo</label>
                                            </div>
                                            <input
                                                type="text"
                                                className="form-contro"
                                                name="fullName"
                                                value={formValues.fullName || ''}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </>
                                    ) : null}
                                    {step === 0 && (
                                        <div>
                                            <div className="info-label">
                                                <label>Cargo</label>
                                            </div>
                                            <select name="job" value={formValues.job} onChange={handleInputChange} className='m_reg_cargo'>
                                                <option value="Administrador">Administrador</option>
                                                <option value="Demais funções">Demais funções</option>
                                                <option value="Master">Master</option>
                                            </select>
                                        </div>

                                    )}

                                    <div className="form-buttons">
                                        {step > 0 && (
                                            <button type="button" onClick={handleBack} className='botao-voltar'>
                                                Voltar
                                            </button>
                                        )}
                                        <button type="submit" className={`botao-reg ${step === 2 ? 'step-2' : ''}`} >
                                            {step === 2 ? 'Cadastrar' : 'Próximo'}
                                        </button>
                                    </div>
                                    <div className="error-message-container">
                                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <ScreenWarning />
            </div>
        </div>
    );
};

export default Admregister;