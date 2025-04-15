import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../rh.css';
import lapis from '../../../img/edit_details-img.svg';
import SidebarGestock from '../../ADM/components/sidebar';

const DetalhesCargo = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [cargoNome, setCargoNome] = useState('Gerente de TI');
    const [descricao, setDescricao] = useState('Um Gerente de TI supervisiona a infraestrutura tecnológica...');
    const [pesquisaSalarial, setPesquisaSalarial] = useState('A faixa salarial de um Gerente de TI pode variar...');
    const [salarioBase, setSalarioBase] = useState(4500.00);
    const [mediaSalarial, setMediaSalarial] = useState(5200.00);
    const [comentarios, setComentarios] = useState('O salário base está ligeiramente abaixo da média do mercado...');
    const [hasChanges, setHasChanges] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
        setHasChanges(true);
    };

    const handleCurrencyChange = (setter) => (event) => {
        let value = event.target.value.replace(/[^\d,]/g, '').replace(',', '.');
        if (!isNaN(value) && value !== '') {
            setter(parseFloat(value));
        } else {
            setter('');
        }
        setHasChanges(true);
    };

    const formatCurrency = (value) => {
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`d-flex ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <SidebarGestock isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <section className="rh_cargos-section flex-grow-1">
                <div className="rh_cargos-container">
                    <div className="rh_section-title">
                        <h1>Cargos e Salários</h1>
                        <span style={{ display: 'inline-block' }}>Descrições de cargos</span>
                    </div>

                    <div className="rh_details_cargo_box">
                        <div className="rh_cargo-box_title">
                            <h1 style={{ display: 'inline' }}>Detalhes do Cargo</h1>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {isEditing && hasChanges && (
                                    <span
                                        onClick={() => setHasChanges(false)}
                                        className="save-button"
                                        style={{ cursor: 'pointer', color: 'red', marginRight: '5px', marginTop: '8px' }}
                                    >
                                        Salvar Alterações
                                    </span>
                                )}
                                <button onClick={handleEditToggle}>
                                    <img src={lapis} alt="editarinfo" className="edit_details" />
                                </button>
                            </div>
                        </div>

                        <div className="rh_cargo_form">
                            <div className="rh_form-section_1">
                                <div className="rh_form-container">
                                    <h3>Nome</h3>
                                    <input
                                        className="rh_form-input"
                                        value={cargoNome}
                                        onChange={handleInputChange(setCargoNome)}
                                        placeholder="Insira um nome"
                                        type="text"
                                        readOnly={!isEditing}
                                    />
                                </div>
                                <div className="rh_form-container">
                                    <h3>Descrição</h3>
                                    <textarea
                                        id="rh_form-input_2"
                                        value={descricao}
                                        onChange={handleInputChange(setDescricao)}
                                        placeholder="Insira uma descrição"
                                        readOnly={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="rh_form-section_2">
                                <div className="rh_form-container">
                                    <h3>Pesquisa Salarial</h3>
                                    <textarea
                                        id="rh_form-input_3"
                                        value={pesquisaSalarial}
                                        onChange={handleInputChange(setPesquisaSalarial)}
                                        placeholder="Insira a pesquisa salarial"
                                        readOnly={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="rh_form-section_3">
                                <div className="rh_form-container">
                                    <h3>Salário Base</h3>
                                    <input
                                        className="rh_details_form-input_salario"
                                        value={isEditing ? `R$ ${salarioBase.toFixed(2).replace('.', ',')}` : formatCurrency(salarioBase)}
                                        onChange={handleCurrencyChange(setSalarioBase)}
                                        placeholder="Insira um valor"
                                        type="text"
                                        readOnly={!isEditing}
                                    />
                                </div>
                                <div className="rh_form-container">
                                    <h3>Média salarial no mercado</h3>
                                    <input
                                        className="rh_details_form-input_salario"
                                        value={isEditing ? `R$ ${mediaSalarial.toFixed(2).replace('.', ',')}` : formatCurrency(mediaSalarial)}
                                        onChange={handleCurrencyChange(setMediaSalarial)}
                                        placeholder="Insira um valor"
                                        type="text"
                                        readOnly={!isEditing}
                                    />
                                </div>
                                <div className="rh_form-container">
                                    <h3>Comentários sobre a pesquisa</h3>
                                    <textarea
                                        id="rh_form-input_6"
                                        value={comentarios}
                                        onChange={handleInputChange(setComentarios)}
                                        placeholder="Insira uma descrição"
                                        readOnly={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer></footer>
        </div>
    );
};

export default DetalhesCargo;