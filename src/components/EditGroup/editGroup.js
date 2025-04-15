import React from 'react';


const Modal = ({ isOpen, onClose, integrantes, handleChange, adicionarIntegrante, isIntegrantes }) => {
    if (!isOpen) return null; // Se o modal não estiver aberto, não renderize nada

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="m_vizuemp_main-card">
                    <div className='m_vizuemp_card-vermelho'>
                        <div className='m_vizuemp_card-vermelho-title'>Gestock</div>
                        <div className='m_vizuemp_card-vermelho-content'>
                            {/* Informações e Integrantes */}
                        </div>
                    </div>

                    <h2>
                        Editar <span className="m_vizuemp_main-card-title">{isIntegrantes ? "Integrantes" : "Identificação da Empresa"}</span>
                    </h2>
                    <div className="m_vizuemp_main-card-fields">
                        {isIntegrantes ? (
                            <div>
                                {integrantes.map((integrante, index) => (
                                    <div className="m_vizuemp_main-card-field-group" key={index}>
                                        <label htmlFor={`integrante-nome-${index}`}>Nome do Integrante</label>
                                        <input
                                            type="text"
                                            id={`integrante-nome-${index}`}
                                            placeholder="Digite o nome do integrante..."
                                            value={integrante}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button className='btn-submittt' onClick={adicionarIntegrante}>Adicionar Integrante</button>
                            </div>
                        ) : (
                            <div>
                                {/* Campos de identificação da empresa */}
                            </div>
                        )}
                    </div>
                    <button className="close-button" onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
