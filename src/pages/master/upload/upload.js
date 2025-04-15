import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import calendarIcon from '@iconify/icons-mdi/calendar';
import userIcon from '@iconify/icons-mdi/account';
import notificationIcon from '@iconify/icons-mdi/bell';
import eyeIcon from '@iconify/icons-mdi/eye';
import lockIcon from '@iconify/icons-mdi/lock';
import moduleIcon from '@iconify/icons-mdi/archive';
import closeIcon from '@iconify/icons-mdi/close';
import "../../master/master.css";
import { useNavigate } from 'react-router-dom';
import veve from '../../../img/veve.svg'
import trasp from '../../../img/trasp.svg'
import ScreenWarning from '../../../components/MaxPhone';
import Sidebar from '../../../components/SidebarGestock'

const Upload = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [formValues, setFormValues] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
    const [selectedJob, setSelectedJob] = useState('');
    const [completedSteps, setCompletedSteps] = useState([false, false, false, false, false]);
    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const [isNotificationsVisible, setIsNotificationsVisible] = useState(false); // Estado para o card de notificações
    const [isAaVisible, setIsAaVisible] = useState(false);
    const sidebarRef = useRef(null);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const toggleNotifications = () => {
        setIsNotificationsVisible(!isNotificationsVisible);
    };

    const toggleAa = () => {
        setIsAaVisible(!isAaVisible);
    };

    const handleModulosClick = () => {
        navigate('/modulos');
    };

    const handleMeucalendarioClick = () => {
        navigate('/meucalendario');
    };

    const handleVisaogeralClick = () => {
        navigate('/visaogeral');
    };

    const handleUploadClick = () => {
        navigate('/upload');
    };

    const handleAdiconarUserClick = () => {
        navigate('/visuario');
    };

    const handleChatClick = () => {
        navigate('/chat');
    };

    const handleDashboardClick = () => {
        navigate('/dashboard');
    };

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            setIsOpen(false); // Fechar o sidebar se o clique for fora dele
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // Limpar o listener quando o componente for desmontado
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);
    return (
        <div className="dashboard">
                        <Sidebar className="sidebar-container"/>


            <div className="main-content">
                <div className='m_up_section'>
                <div className="upload-container">
                    <div className="upload-icone">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
                            <path fill="currentColor" d="M30.31 13v-.32a10.26 10.26 0 0 0-10.45-10a10.47 10.47 0 0 0-9.6 6.1A9.74 9.74 0 0 0 1.6 18.4a9.62 9.62 0 0 0 9.65 9.6H15v-2h-3.75A7.65 7.65 0 0 1 11 10.74h.67l.23-.63a8.43 8.43 0 0 1 8-5.4a8.26 8.26 0 0 1 8.45 8a8 8 0 0 1 0 .8l-.08.72l.65.3A6 6 0 0 1 26.38 26H21v2h5.38a8 8 0 0 0 3.93-15" className="clr-i-outline clr-i-outline-path-1" />
                            <path fill="currentColor" d="M22.28 21.85a1 1 0 0 0 .72-1.71l-5-5l-5 5a1 1 0 0 0 1.41 1.41L17 19v12.25a1 1 0 1 0 2 0V19l2.57 2.57a1 1 0 0 0 .71.28" className="clr-i-outline clr-i-outline-path-2" />
                            <path fill="none" d="M0 0h36v36H0z" />
                        </svg>
                    </div>
                    <div className="upload-text">
                        <span className="highlighted-text">Faça upload</span> ou arraste uma imagem
                    </div>
                    <input
                        type="file"
                        className="upload-input"
                    />
                </div>
                <h2 className="obv">Observação</h2>

                <textarea className='upload-ii' placeholder='Enviar Mensagem' type="text"></textarea>

                <button type="submit" className="uuii">Upload</button>  <button type="submit" className="uutt">Cancelar</button>

                <hr className="divider" />
                <h2 className="nnn">Arquivos Carregados</h2>
                <div className="veve">
                    <img src={veve} width={27} height={27} />
                </div>
                <div className="veve">
                    <img src={veve} width={27} height={27} />
                </div>
                <div className="veve">
                    <img src={trasp} width={27} height={27} />
                </div>

                <div className="uzz">
                    <span className="bbw">Guia para Microempreendedor Individual (MEI).pdf</span><div className='iu1'>218.6kb</div>
                </div>

                <div className="uzz">
                    <span className="bbw">Exemplo Organogramaimg</span> <div className='iu2'>25.1kb</div>
                </div>

                <div className="uzz">
                    <span className="bbw">Manual de Orientação para Empreendedores.pdf</span> <div className='iu'>182.4kb</div>
                </div>

            </div>
            </div>
            <ScreenWarning />
        </div >
    );
};

export default Upload;