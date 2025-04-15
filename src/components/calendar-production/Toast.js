// src/components/Toast.js

import React from 'react';
import { Icon } from '@iconify/react';

const Toast = ({ showToast, toastType, setShowToast, showProgress }) => {
    return (
        showToast && (
            <div className={`toast ${toastType}`}>
                <div className="toast-content">
                    <Icon
                        icon={toastType === 'success' ? "ic:round-check" : "ic:round-close"}
                        className={`icon ${toastType}`}
                        style={{ color: toastType === 'success' ? '#4caf50' : '#ee0e0e' }}
                    />
                    <div className="message">
                        <span className="text text-1">{toastType === 'success' ? 'Sucesso' : 'Erro'}</span>
                        <span className="text text-2">{toastType === 'success' ? 'Evento foi criado com sucesso!' : 'Preencha os campos'}</span>
                    </div>
                    <Icon icon="ic:round-close" className="fa-solid fa-xmark close" onClick={() => setShowToast(false)}/>
                    <div className={`progress ${showProgress ? 'show' : ''} ${toastType}`}></div>
                </div>
            </div>
        )
    );
};

export default Toast;
