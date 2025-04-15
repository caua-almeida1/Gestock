import React, { useState, useEffect, useRef } from 'react';
import '../rh.css';
import uploadedArchiveImg from "../../../img/uploaded-archive_img.svg";
import deleteImg from "../../../img/archive-delete_img.svg";
import uploadedSuccessImg from '../../../img/uploaded-success_img.svg'; // Imagem de upload bem-sucedido
import alertDeleteImg from '../../../img/delete-success_img.svg'; // Imagem de exclusão
import SidebarGestock from '../../ADM/components/sidebar';

const AddCargo = () => { // Alterado para 'AddCargo'
    const [files, setFiles] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado da sidebar
    const [formData, setFormData] = useState({
        nomeCompleto: '',
        cbo: '',
        descricao: '',
        salarioBase: '',
        mediaSalario: '',
        comentarios: '',
    });

    const fileInputRef = useRef(null);
    const [notification, setNotification] = useState({ type: '', message: '', visible: false });

    const formatCurrency = (value) => {
        const numberValue = value.replace(/[^0-9]/g, '');
        return numberValue ? `R$ ${(parseInt(numberValue) / 100).toFixed(2).replace('.', ',')}` : '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files).map(file => ({
            name: file.name,
            id: `${file.name}-${Date.now()}`, // Gera um ID único
        }));
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
        e.target.value = ''; // Resetar o input para permitir upload do mesmo arquivo
        showNotification('upload', `Arquivo carregado: ${newFiles.map(f => f.name).join(', ')}`);
    };
    
    const removeFile = (fileId) => {
        setFiles((prevFiles) => prevFiles.filter(file => file.id !== fileId));
        showNotification('delete', `Arquivo excluído: ${fileId}`);
    };

    const showNotification = (type, message) => {
        setNotification({ type, message, visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    };

    useEffect(() => {
        // Verifica a visibilidade do botão de cadastro
        const allFieldsFilled = Object.values(formData).every(value => value.trim() !== '');
        const hasFiles = files.length > 0;

        if (allFieldsFilled && hasFiles) {
            // Lógica para mostrar botão de cadastrar se todos os campos estão preenchidos
        }
    }, [formData, files]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de cadastro
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`d-flex ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <SidebarGestock isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <section className="rh_cargos-section">
                <div className="rh_cargos-container">
                    <div className="rh_section-title">
                        <h1>Cadastrando um novo cargo</h1>
                        <span>Cadastre um cargo, descrição e sua pesquisa salarial</span>
                    </div>

                    <form className="rh_add-cargo_container" onSubmit={handleSubmit}>
                        <div className="rh_add-cargo_content1">
                            <div className="rh_form-container">
                                <h3>Nome completo</h3>
                                <input
                                    className="rh_form-input_1"
                                    name="nomeCompleto"
                                    placeholder="Insira um nome completo"
                                    type="text"
                                    value={formData.nomeCompleto}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="rh_form-container">
                                <h3>CBO (Classificação Brasileira de Ocupações)</h3>
                                <input
                                    className="rh_form-input_1"
                                    name="cbo"
                                    placeholder="Insira um nome completo"
                                    type="text"
                                    value={formData.cbo}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="rh_form-container">
                                <h3>Descrição</h3>
                                <textarea
                                    className="rh_add_description-input"
                                    name="descricao"
                                    id='rh_add_form-input_2'
                                    placeholder="Insira uma descrição"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="rh_add-cargo_content2">
                            <div className="rh_cargo-box_title">
                                <h1 style={{ display: 'inline' }}>Pesquisa salarial</h1>
                            </div>

                            <div className="rh_form-container">
                                <h3>Salário Base (R$)</h3>
                                <input
                                    className="rh_form-input"
                                    id='salario-base_input'
                                    name="salarioBase"
                                    placeholder="Insira um salário base"
                                    type="text"
                                    value={formData.salarioBase}
                                    onChange={e => handleInputChange({ target: { name: 'salarioBase', value: formatCurrency(e.target.value) } })}
                                />
                            </div>

                            <div className="rh_form-container">
                                <h3>Média Salarial no Mercado (R$)</h3>
                                <input
                                    className="rh_form-input"
                                    id='media-salario_input'
                                    name="mediaSalario"
                                    placeholder="Insira uma média salarial"
                                    type="text"
                                    value={formData.mediaSalario}
                                    onChange={e => handleInputChange({ target: { name: 'mediaSalario', value: formatCurrency(e.target.value) } })}
                                />
                            </div>

                            <div className="rh_form-container">
                                <h3>Comentários sobre a pesquisa</h3>
                                <textarea
                                    className="rh_add_comentarios-pesquisa_input"
                                    name="comentarios"
                                    id='rh_add_form-input_3'
                                    placeholder="Insira um comentário"
                                    value={formData.comentarios}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="rh_add-cargo_content3">
                            <div className="rh_add_upload-box_title">
                                <h1>Faça upload da pesquisa aqui</h1>
                            </div>

                            <div className="rh_add_upload-box">
                                <label htmlFor="file" className="rh_add_labelFile">
                                    <p><span>Faça upload</span> ou arraste um arquivo</p>
                                </label>
                                <input
                                    className="rh_add_upload-input"
                                    name="file"
                                    id="file"
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="rh_add_uploaded-itens">
                                <div className="rh_add_uploaded-itens_title">
                                    <h3 id="item-count">
                                        {files.length} {files.length !== 1 ? 'itens' : 'item'} carregado{files.length !== 1 ? 's' : ''}
                                    </h3>
                                </div>
                                <div className="rh_add_uploaded-itens_box" id="uploaded-items-box">
                                    {files.map(file => (
                                        <div key={file.id} className="rh_add_uploaded-item">
                                            <img src={uploadedArchiveImg} alt="PDF Icon" />
                                            <img
                                                src={deleteImg}
                                                alt="Close Icon"
                                                style={{ width: '20px', height: '20px' }}
                                                className="rh_add_close-icon"
                                                onClick={() => removeFile(file.id)} // Usando o ID único para remover o arquivo
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <a href='/listarCargos'>
                                <div
                                    id="rh_add_cadastrar-button"
                                    className={`rh_add_cadastrar-button ${Object.values(formData).every(value => value.trim() !== '') ? 'visible' : ''}`}
                                >
                                    <p>Cadastrar</p>
                                </div>
                            </a>
                        </div>

                        {notification.visible && (
                            <>
                                {notification.type === 'upload' && (
                                    <div id="notification" className="rh_add_notification" style={{ display: 'flex' }}>
                                        <img src={uploadedSuccessImg} alt="Upload Success Notification" />
                                        <p>{notification.message}</p>
                                    </div>
                                )}
                                {notification.type === 'delete' && (
                                    <div id="delete-notification" className="rh_add_notification" style={{ display: 'flex' }}>
                                        <img src={alertDeleteImg} alt="Delete Notification" />
                                        <p>{notification.message}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </form>
                </div>
            </section>
        </div>
    );
};

export default AddCargo;