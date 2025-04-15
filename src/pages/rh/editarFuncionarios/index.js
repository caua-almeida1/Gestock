import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import '../rh.css'; // Importando o CSS
import SidebarGestock from '../../ADM/components/sidebar';

const EditarFuncionarios = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado da sidebar

    useEffect(() => {
        loadData();
    }, []);

    const downloadPDF = (event) => {
        event.preventDefault();
        
        const doc = new jsPDF();
        
        // Configurações gerais do PDF
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text("Relatório de Funcionário", 10, 15);
        
        // Linha abaixo do título
        doc.setLineWidth(0.5);
        doc.line(10, 20, 200, 20);
        
        // Ajustes para os campos
        const fields = [
            { label: "Nome", defaultValue: document.getElementById('rh_nome-input').defaultValue },
            { label: "Cargo", defaultValue: document.getElementById('rh_cargo-input').defaultValue },
            { label: "Número de Registro", defaultValue: document.getElementById('rh_registro-input').defaultValue },
            { label: "Data de Admissão", defaultValue: document.getElementById('rh_admissao-input').defaultValue },
            { label: "1º Fase", defaultValue: document.getElementById('rh_fase1-input').defaultValue },
            { label: "2º Fase", defaultValue: document.getElementById('rh_fase2-input').defaultValue },
            { label: "Exame 1", defaultValue: document.getElementById('rh_exame1-input').defaultValue },
            { label: "Data Exame 1", defaultValue: document.getElementById('rh_dataexame1-input').defaultValue },
            { label: "Resultado 1", defaultValue: document.getElementById('rh_resultado1-input').defaultValue },
            { label: "Exame 2", defaultValue: document.getElementById('rh_exame2-input').defaultValue },
            { label: "Data Exame 2", defaultValue: document.getElementById('rh_dataexame2-input').defaultValue },
            { label: "Resultado 2", defaultValue: document.getElementById('rh_resultado2-input').defaultValue },
            { label: "Salário", defaultValue: document.getElementById('rh_salario-input').defaultValue },
            { label: "Desconto IRRF", defaultValue: document.getElementById('rh_irrf-input').defaultValue },
            { label: "Desconto INSS", defaultValue: document.getElementById('rh_inss-input').defaultValue },
            { label: "Desconto VA/VR", defaultValue: document.getElementById('rh_vr-input').defaultValue },
            { label: "Periculosidade", defaultValue: document.getElementById('rh_periculosidade-input').defaultValue },
            { label: "Percentual Periculosidade", defaultValue: document.getElementById('rh_percentual-periculosidade').defaultValue },
            { label: "Insalubridade", defaultValue: document.getElementById('rh_insalubridade-input').defaultValue },
            { label: "Percentual Insalubridade", defaultValue: document.getElementById('rh_percentual-insalubridade').defaultValue }
        ];
    
        // Configuração inicial para tabela
        let yPosition = 30;
        doc.setFontSize(12);
        
        // Loop para renderizar cada campo com uma borda e espaçamento adequado
        fields.forEach(field => {
            // Adiciona fundo em tons de cinza para cada linha
            doc.setFillColor(255, 255, 255);
            doc.rect(10, yPosition - 5, 190, 10, 'F');
    
            // Renderiza o campo com espaçamento e layout estilo tabela
            doc.setTextColor(60, 60, 60);
            doc.text(`${field.label}:`, 12, yPosition);
            doc.setTextColor(0, 0, 0);
            doc.text(field.defaultValue, 70, yPosition);
            
            yPosition += 10;
        });
        
        // Salva o PDF com o nome especificado
        doc.save('dados_funcionario.pdf');
    };

    const loadData = () => {
        // Lógica para carregar os dados, se necessário.
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
                        <h1>Administração de pessoal</h1>
                        <span>Administração de Pessoal gerencia documentos, exames, benefícios e condições de trabalho dos funcionários</span>
                    </div>

                    <div className="rh_edit_funcionarios-info_box">
                        <div className="rh_edit_funcionarios-info_header">
                            <h3>Informações do Funcionário</h3>
                            <a href="#" style={{ textDecoration: 'none' }}>
                                <span id="save-message" className="rh_save-message" style={{ display: 'none', marginLeft: '800px' }}>Salvar alterações</span>
                            </a>
                        </div>
                        <div className="rh_edit_funcionarios_info-content">
                            <div className="rh_edit_funcionarios_info-content_1">
                                <div className="rh_edit_funcionarios_info-geral_content">
                                    <h4>Informações Gerais</h4>
                                    <p>Nome: <input type="text" id="rh_nome-input" defaultValue="João Silva"/></p>
                                    <p>Cargo: <input type="text" id="rh_cargo-input" defaultValue="Técnico de Segurança do Trabalho"/></p>
                                    <p>Número de Registro: <input type="text" id="rh_registro-input" defaultValue="12345"/></p>
                                    <p>Data de Admissão: <input type="text" id="rh_admissao-input" defaultValue="15/03/2023"/></p>
                                </div>
                                <div className="rh_edit_funcionarios_processo-seletivo_content">
                                    <h4>Fase do processo seletivo</h4>
                                    <p>1º Fase: <input type="text" id="rh_fase1-input" defaultValue="Triagem"/></p>
                                    <p>2º Fase: <input type="text" id="rh_fase2-input" defaultValue="Entrevista"/></p>
                                </div>
                                <div className="rh_edit_funcionarios_exames-content">
                                    <h4>Exames</h4>
                                    <div className="rh_edit_funcionarios_exames-content_1">
                                        <p>Tipo de Exame: <input type="text" id="rh_exame1-input" defaultValue="Admissional"/></p>
                                        <p>Data do Exame: <input type="text" id="rh_dataexame1-input" defaultValue="10/03/2023"/></p>
                                        <p>Resultado: <input type="text" id="rh_resultado1-input" defaultValue="Aprovado"/></p>
                                    </div>
                                    <div className="rh_edit_funcionarios_exames-content_2">
                                        <p>Tipo de Exame: <input type="text" id="rh_exame2-input" defaultValue="Admissional"/></p>
                                        <p>Data do Exame: <input type="text" id="rh_dataexame2-input" defaultValue="10/03/2023"/></p>
                                        <p>Resultado: <input type="text" id="rh_resultado2-input" defaultValue="Aprovado"/></p>
                                    </div>
                                </div>
                            </div>
                            <div className="rh_edit_funcionarios_info-content_2">
                                <div className="rh_edit_funcionarios_beneficios-content">
                                    <div className="rh_edit_funcionarios_beneficions-content_1">
                                        <h4>Benefícios espontâneos</h4>
                                        <p>Tipo de Benefício: <input type="text" id="rh_beneficio-input" defaultValue="Plano de Saúde"/></p>
                                        <p>Tipo de Benefício: <input type="text" id="rh_beneficio-input" defaultValue="Plano de Saúde"/></p>
                                        <p>Tipo de Benefício: <input type="text" id="rh_beneficio-input" defaultValue="Plano de Saúde"/></p>
                                        <p>Tipo de Benefício: <input type="text" id="rh_beneficio-input" defaultValue="Plano de Saúde"/></p>
                                    </div>
                                    <div className="rh_edit_funcionarios_beneficions-content_2">
                                        <h4>Benefícios compulsórios</h4>
                                        <ul>Vale Transporte</ul>
                                        <li>Desconto na folha de pagamento: <input type="text" className="rh_edit_funcionarios_beneficios-input" id="rh_vt-input" defaultValue="6%"/></li>
                                        <ul>FGTS</ul>
                                        <li>Desconto na folha de pagamento: <input type="text" className="rh_edit_funcionarios_beneficios-input" id="rh_fgts-input" defaultValue="8%"/></li>
                                    </div>
                                </div>
                                <div className="rh_edit_funcionarios_salario-content">
                                    <div className='rh_edit_funcionarios_dependentes-content_box'>
                                        <h4>Dependentes</h4>
                                        <p>Quantidade: <input type="text" id="rh_dependentes-input" defaultValue="2"/></p>
                                    </div>
                                    <div className='rh_edit_funcionarios_salario-content_box'>
                                        <h4>Salário Família</h4>
                                        <p>Valor: <input type="text" id="rh_salario-input" defaultValue="1500"/></p>
                                    </div>
                                </div>
                                <div class="rh_edit_funcionarios_ferias-content">
                                    <h4>Férias</h4>
                                    <p>Aquisitivo: <input type="text" id="rh_ferias-aquisitivo" defaultValue="11/02/2025 - 11/03/2025" /></p>
                                    <p>Concessivo: <input type="text" id="rh_ferias-concessivo" defaultValue="11/02/2025 - 11/03/2025" /></p>
                                    <p>Gozo: <input type="text" id="rh_ferias-gozo" defaultValue="11/02/2025 - 11/03/2025" /></p>
                                </div>
                            </div>
                            <div class="rh_edit_funcionarios_info-content_3">
                                <div class="rh_edit_funcionarios_descontos-content">
                                    <h4>Descontos na folha de pagamento</h4>
                                    <ul>IRRF</ul>
                                    <li>Desconto na folha de pagamento: <input type="text" class="rh_edit_funcionarios_descontos-input" style={{width: '50px'}} id="rh_irrf-input" defaultValue="6%" /></li>
                                    <ul>INSS</ul>
                                    <li>Desconto na folha de pagamento: <input type="text" class="rh_edit_funcionarios_descontos-input" style={{width: '50px'}} id="rh_inss-input" defaultValue="8%" /></li>
                                    <ul>VA/VR</ul>
                                    <li>Desconto na folha de pagamento: <input type="text" class="rh_edit_funcionarios_descontos-input" style={{width: '50px'}} id="rh_vr-input" defaultValue="8%" /></li>
                                </div>
                                <div class="rh_edit_funcionarios_periculosidade-insalubridade_content">
                                    <div class="rh_edit_funcionarios_periculosidade-content">
                                        <h4>Periculosidade e Insalubridade</h4>
                                        <ul>Periculosidade:</ul>
                                        <li>Tipo de Adicional: <input type="text" class="rh_edit_funcionarios_adicional-input" id="rh_periculosidade-input" defaultValue="Periculosidade" /></li>
                                        <li>Percentual: <input type="text" class="rh_edit_funcionarios_percentual-input" id="rh_percentual-periculosidade" defaultValue="30%" /></li>
                                    </div>
                                    <div class="rh_edit_funcionarios_insalubridade-content">
                                        <ul>Insalubridade:</ul>
                                        <li>Tipo de Adicional: <input type="text" class="rh_edit_funcionarios_adicional-input" id="rh_insalubridade-input" defaultValue="Insalubridade" /></li>
                                        <li>Percentual: <input type="text" class="rh_edit_funcionarios_percentual-input" id="rh_percentual-insalubridade" defaultValue="20%" /></li>
                                    </div>
                                </div>
                                <div class="rh_edit_funcionarios_dados-button_content" onClick={downloadPDF}>
                                    <h3>Carregar esses dados</h3>
                                    <a href="#" id="download-pdf"><div class="rh_edit_funcionarios_dados-button"></div></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EditarFuncionarios;