import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import PoweredImg from "../../img/powered.svg";
import LogoHorizontal from "../../img/logo-horizontal.svg";
import ScreenWarning from '../../components/MaxPhone';
import passwordArrowLeft from '../../img/password_arrow-left.svg';
import verifyEmailConfirmImg from '../../img/verify_email_confirmed-img.svg';

const RecuperarSenha = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [showCheckEmail, setShowCheckEmail] = useState(false); // Novo estado

    const handlePasswordReset = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulação de envio de e-mail (apenas visual)
        setTimeout(() => {
            setMessage('Um link de recuperação foi enviado para o seu e-mail.');
            setIsSubmitting(false);
            setShowCheckEmail(true); // Mostra a tela de checar email
        }, 2000);
    };

    // Função para esconder a mensagem após 3 segundos
    const hideMessage = () => {
        setTimeout(() => {
            setMessage('');
        }, 3000); // Mensagem desaparece após 3 segundos
    };

    // Executa a função hideMessage quando a mensagem for definida
    React.useEffect(() => {
        if (message) {
            hideMessage();
        }
    }, [message]);

    return (
        <div>
            <main className="auth-container d-flex align-items-center justify-content-center">
                <div className="auth-box shadow-lg p-4">
                    <div className="text-center mb-4">
                        <div className='img-box-logo'>
                            <span className='d-flex justify-content-center'>
                                <img src={LogoHorizontal} alt="Logo Horizontal" />
                            </span>
                        </div>
                        <div className="button_log">
                            <span className="button_log active">RECUPERAR SENHA</span>
                        </div>
                    </div>

                    {/* Mostrar o formulário de recuperação de senha ou a tela de verificação de email */}
                    {!showCheckEmail ? (
                        <form onSubmit={handlePasswordReset} className="space-y-4">
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

                            {isSubmitting && (
                                <div className="loading-overlay">
                                    <Icon icon="svg-spinners:ring-resize" className="loading-icon" />
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`btn btn-primary w-100 ${isSubmitting ? 'disabled' : ''}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar'}
                            </button>

                            <div className="text-center mt-3">
                                <div className='text-center mt-3 content' style={{ display: 'flex', justifyContent: 'center', gap: '3px', alignItems: 'center' }}>
                                    <img src={passwordArrowLeft} style={{ height: '10px' }} alt="Voltar" />
                                    <a href="/login" className="text-dark">Voltar para Login</a>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="check-email-container text-center">
                            <img
                                src={verifyEmailConfirmImg}
                                style={{ display: 'block', margin: '0 auto', height: '50px'}}
                                alt="Verificar Email"
                            />
                            <h2 style={{fontWeight: '600', fontSize: '20px', marginTop: '20px'}}>Verifique seu E-Mail</h2>
                            <p style={{fontSize: '15px'}}>
                                Um email foi enviado para <span style={{ fontWeight: '500', color: '#FF1A1A' }}>{email}</span>.
                                <br />
                                Por favor, verifique sua caixa de entrada.
                            </p>
                            <a href="/login" className="text-dark">
                                <button
                                    onClick={() => setShowCheckEmail(false)}
                                    className="btn btn-secondary mt-3"
                                >
                                    Voltar para Login
                                </button>
                            </a>
                        </div>
                    )}

                    <div
                        className="powered-footer-login"
                        style={{
                            marginTop: showCheckEmail ? '40px' : '72px',
                        }}
                    >
                        <span className="d-flex justify-content-center">
                            <img src={PoweredImg} alt="Powered by" />
                        </span>
                    </div>
                </div>
                <ScreenWarning />
            </main>
        </div>
    );
};

export default RecuperarSenha;