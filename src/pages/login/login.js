import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';
import { getDatabase, ref, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Icon } from '@iconify/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import PoweredImg from "../../img/powered.svg";
import LogoHorizontal from "../../img/logo-horizontal.svg";
import ScreenWarning from '../../components/MaxPhone';

const Auth = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [redirectToSendDatabaseGroup, setRedirectToSendDatabaseGroup] = useState(false);
    const [groups, setGroups] = useState(null); // Novo estado para armazenar grupos
    const [redirected, setRedirected] = useState(false);
    
    const authenticateUser = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setCurrentUser(user);

            // Armazenar no sessionStorage o ID do usuário e seu papel
            sessionStorage.setItem('userId', user.uid);
            await fetchUserJob(user); // Verifica o papel do usuário após login

            return user;
        } catch (error) {
            console.error("Código de erro:", error.code);
            setErrorMessage('');
            switch (error.code) {
                case 'auth/wrong-password':
                    setErrorMessage('A senha está incorreta. Por favor, tente novamente.');
                    break;
                case 'auth/user-not-found':
                    setErrorMessage('Este e-mail não está registrado.');
                    break;
                case 'auth/invalid-email':
                    setErrorMessage('O formato do e-mail está incorreto.');
                    break;
                case 'auth/too-many-requests':
                    setErrorMessage('Muitas tentativas falhas. Tente novamente mais tarde.');
                    break;
                case 'auth/invalid-credential':
                    setErrorMessage('Credenciais inválidas. Verifique seu e-mail e senha.');
                    break;
                default:
                    setErrorMessage('Ocorreu um erro. Tente novamente mais tarde.');
            }
        }
    };

    const fetchUserJob = async (user) => {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}/job`); // Acessa o campo job do usuário logado
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const job = snapshot.val();
            console.log("Job:", job);

            // Armazenar o papel no sessionStorage
            sessionStorage.setItem('userRole', job);

            // Redirecionar conforme o papel
            if (job === "Master") {
                navigate("/dashboard"); // Redireciona para dashboard se o job for "Master"
            } else if (job === "Demais funções" || job === "Administrador") {
                navigate("/dashboardADM"); // Redireciona para dashboardADM
            } else {
                navigate("/send-database-group"); // Caso contrário, redireciona para send-database-group
            }
        }
    };

    const fetchGroups = async (userEmail) => {
        const db = getDatabase();
        const groupsRef = ref(db, 'groups'); // Referência ao nó 'groups' no Firebase
        try {
            const snapshot = await get(groupsRef);
            if (snapshot.exists()) {
                const groups = snapshot.val();
                console.log("Email do usuário:", userEmail); // Loga o e-mail do usuário no console

                // Filtrar os grupos cujo admin.email corresponde ao userEmail
                const filteredGroups = Object.keys(groups)
                    .filter(groupId => groups[groupId].admin?.email === userEmail)
                    .map(groupId => ({ id: groupId, ...groups[groupId] }));

                setGroups(filteredGroups); // Armazena os grupos filtrados no estado
                console.log("Grupos filtrados:", filteredGroups); // Loga os grupos filtrados no console

                // Verifica se algum grupo possui o campo 'edited' igual a 0
                const hasEditedZero = filteredGroups.some(group => group.edited === 0);
            } else {
                console.log("Nenhum grupo encontrado.");
            }
        } catch (error) {
            console.error("Erro ao buscar grupos:", error);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSigningIn(true);

        try {
            const user = await authenticateUser(email, password);
            if (user) {
                // Apenas chama fetchGroups se o usuário não foi redirecionado
                if (!redirected) {
                    await fetchGroups(email);
                }
            }
        } catch {
            // Erros são tratados na função authenticateUser
        } finally {
            setIsSigningIn(false);
        }
    };

    // Sincronização de autenticação entre abas
    useEffect(() => {
        const auth = getAuth();

        // Observe as mudanças de estado do Firebase
        onAuthStateChanged(auth, (user) => {
            if (user) {
                sessionStorage.setItem('userId', user.uid);
                fetchUserJob(user); // Busca o job do usuário
            } else {
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('userRole');
            }
        });
    }, []);

    return (
        <div>
            {redirectToSendDatabaseGroup && <Navigate to='/send-database-group' replace={true} />}

            <main className="auth-container d-flex align-items-center justify-content-center">
                <div className={`auth-box shadow-lg p-4 ${isLogin ? '' : 'expanded'}`}>
                    <div className="text-center mb-4">
                        <div className='img-box-logo'>
                            <span className='d-flex justify-content-center'>
                                <img src={LogoHorizontal} alt="Logo Horizontal" />
                            </span>
                        </div>
                        <div className="button_log">
                            <span className={`button_log ${isLogin ? 'active' : ''}`}>ENTRAR</span>
                        </div>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="form-group">
                            <label>E-Mail Educacional</label>
                            <input
                                type="email"
                                className="form-control input-smaller"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Insira seu email educacional"
                            />
                        </div>
                        <div className="form-group">
                            <label>Senha</label>
                            <input
                                type="password"
                                className="form-control input-smaller"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Insira sua senha"
                            />
                        </div>

                        {isSigningIn && (
                            <div className="loading-overlay">
                                <Icon icon="svg-spinners:ring-resize" className="loading-icon" />
                            </div>
                        )}
                        {errorMessage && (
                            <div className="alert alert-danger">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`btn btn-primary w-100 ${isSigningIn ? 'disabled' : ''}`}
                            disabled={isSigningIn}
                        >
                            {isSigningIn ? (isLogin ? 'Entrando...' : 'Cadastrando...') : (isLogin ? 'Entrar' : 'Cadastre-se')}
                        </button>

                        {isLogin && (
                            <div className="text-center mt-3">
                                <a href="/recuperar-senha" className="text-dark">Esqueceu sua senha? <span className="text-primary">Recupere aqui!</span></a>
                            </div>
                        )}
                    </form>

                    <div className="powered-footer-login">
                        <span className='d-flex justify-content-center'>
                            <img src={PoweredImg} alt="Powered by" />
                        </span>
                    </div>
                </div>
                <ScreenWarning />
                {groups && (
                    <div className="groups-list">
                        <h3>Grupos Administrados por {email}:</h3>
                        <ul>
                            {groups.map(group => (
                                <li key={group.id}>
                                    {group.admin} {/* Supondo que o grupo tenha um campo 'name' */}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Auth;
