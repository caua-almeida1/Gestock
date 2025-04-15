import React, { useState, useRef, useEffect } from "react";
import { ref, onValue, push, serverTimestamp, set } from "firebase/database";
import { database } from '../../../firebase/firebase';
import { jsPDF } from "jspdf"; // Importa a biblioteca jsPDF
import SidebarGestock from '../components/sidebar';
import { Icon } from '@iconify/react';
import logo2 from '../../../img/logo_gestockpt2.svg';
import editDocImg from '../../../img/edit_details-img.svg'
import ScreenWarning from '../../../components/MaxPhone';
import "../adm.css";

const CompanyInfo = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado da sidebar
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal
  const [isBlocked, setIsBlocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true); // Novo estado para controlar o carregamento
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Documento 1' },
    { id: 2, name: 'Documento 2' },
    { id: 3, name: 'Documento 3' },
  ]);

  const [companyData, setCompanyData] = useState({
    razaoSocial: "GonçalvesTec Serviços de Tecnologia Ltda.",
    nomeFantasia: "GonçalvesTec",
    naturezaJuridica: "Sociedade Limitada (Ltda.)",
    classificacao: "Limitada",
    cnpj: "12.345.678/0001-90",
    naturezaJuridicaExtra: "MEI",
    porte: "Pequeno Porte",
    cnae: "5211-1/100",
    identificacaoEstadual: "12.345.678/0001-95",
    identificacaoNacional: "123.456.789.123",
    capitalSocial: "R$ 150.000",
    contasBancarias: ["GonçalvesTec Bradesco", "GonçalvesTec Nubank"],
    cep: "06500-000",
    cidade: "Santana de Parnaíba",
    rua: "Rua das Palmeiras",
    estado: "São Paulo",
    bairro: "Jardim São Pedro",
    numero: "123",
    telefone: "(11) 98765-4321",
    email: "goncalvestec.central@gmail.com",
    socios: ["Bruno Gomes", "Daniel Petinice"]
  });

  // Função para atualizar os dados da empresa
  const handleInputChange = (e, field) => {
    setCompanyData({
      ...companyData,
      [field]: e.target.value
    });
  };

  const handleContaInputChange = (e, index) => {
    const updatedContas = [...companyData.contasBancarias];
    updatedContas[index] = e.target.value;
    setCompanyData({
      ...companyData,
      contasBancarias: updatedContas,
    });
  };

  const handleSocioInputChange = (e, index) => {
    const updatedSocios = [...companyData.socios];
    updatedSocios[index] = e.target.value;
    setCompanyData({
      ...companyData,
      socios: updatedSocios,
    });
  };

  // Função para gerar o PDF com os dados dos inputs
  const handleSave = () => {
    const doc = new jsPDF();

    // Configurações gerais do PDF
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Informações da Empresa", 10, 15);

    // Linha abaixo do título
    doc.setLineWidth(0.5);
    doc.line(10, 20, 200, 20);

    // Configuração inicial para tabela
    let yPosition = 30;
    doc.setFontSize(12);

    // Função para renderizar cada campo no PDF
    const fields = [
      { label: "Razão Social", value: companyData.razaoSocial },
      { label: "Nome Fantasia", value: companyData.nomeFantasia },
      { label: "Natureza Jurídica", value: companyData.naturezaJuridica },
      { label: "Classificação", value: companyData.classificacao },
      { label: "CNPJ", value: companyData.cnpj },
      { label: "Natureza Jurídica Extra", value: companyData.naturezaJuridicaExtra },
      { label: "Porte da Empresa", value: companyData.porte },
      { label: "CNAE", value: companyData.cnae },
      { label: "Identificação Estadual", value: companyData.identificacaoEstadual },
      { label: "Identificação Nacional", value: companyData.identificacaoNacional },
      { label: "Capital Social Inicial", value: companyData.capitalSocial },
      { label: "CEP", value: companyData.cep },
      { label: "Cidade", value: companyData.cidade },
      { label: "Rua", value: companyData.rua },
      { label: "Estado", value: companyData.estado },
      { label: "Bairro", value: companyData.bairro },
      { label: "Número", value: companyData.numero },
      { label: "Telefone", value: companyData.telefone },
      { label: "Email", value: companyData.email },
    ];

    // Renderiza os campos como uma tabela
    fields.forEach(field => {
      // Adiciona fundo em branco para cada linha
      doc.setFillColor(255, 255, 255); // fundo branco
      doc.rect(10, yPosition - 5, 190, 10, 'F'); // Adiciona o fundo

      // Renderiza o texto com espaçamento
      doc.setTextColor(60, 60, 60); // Cor do label
      doc.text(`${field.label}:`, 12, yPosition);
      doc.setTextColor(0, 0, 0); // Cor do valor
      doc.text(field.value, 70, yPosition);

      yPosition += 10; // Espaçamento entre os campos
    });

    // Adiciona a seção de contas bancárias
    doc.text("Contas Bancárias:", 10, yPosition);
    yPosition += 10;
    companyData.contasBancarias.forEach((conta, index) => {
      doc.setFillColor(255, 255, 255); // fundo branco
      doc.rect(10, yPosition - 5, 190, 10, 'F'); // Adiciona o fundo

      doc.setTextColor(60, 60, 60); // Cor do label
      doc.text(`Conta ${index + 1}:`, 12, yPosition);
      doc.setTextColor(0, 0, 0); // Cor do valor
      doc.text(conta, 70, yPosition);

      yPosition += 10; // Espaçamento entre as contas
    });

    // Adiciona a seção de sócios
    doc.text("Sócios e Participações:", 10, yPosition);
    yPosition += 10;
    companyData.socios.forEach((socio, index) => {
      doc.setFillColor(255, 255, 255); // fundo branco
      doc.rect(10, yPosition - 5, 190, 10, 'F'); // Adiciona o fundo

      doc.setTextColor(60, 60, 60); // Cor do label
      doc.text(`Sócio ${index + 1}:`, 12, yPosition);
      doc.setTextColor(0, 0, 0); // Cor do valor
      doc.text(socio, 70, yPosition);

      yPosition += 10; // Espaçamento entre os sócios
    });

    // Gerar o PDF e fazer o download
    doc.save("dados_empresa.pdf");
  };

  // Função para alternar o estado do modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  
  const handleDelete = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleUploadClick = () => {
    // Aciona o clique no input de arquivo
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Arquivo selecionado:', file);
      // Aqui você pode adicionar a lógica para salvar ou processar o arquivo
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const moduleStateRef = ref(database, 'moduleStates/modulo1');
    const unsubscribe = onValue(moduleStateRef, (snapshot) => {
      const state = snapshot.val();
      setIsBlocked(state === 'bloqueado'); // Atualiza o estado de bloqueio
      setIsLoading(false); // Define o carregamento como concluído
    });

    return () => unsubscribe();
  }, []);

  // Se estiver carregando ou o estado de bloqueio for null, não renderize nada
  if (isLoading || isBlocked === null) {
    return null; // Aguarda a resposta antes de renderizar
  };

  return (
    <div className={`d-flex ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <SidebarGestock isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {isBlocked && (
        <div className="warning-message">
          <img src={logo2} alt="Logo Gestock" />
          <p>O Módulo de ADM está bloqueado. Você não pode acessar esta tela.</p>
        </div>
      )}
      {isBlocked && <div className="overlay22" />}
      <div className="a_editcompany_container">
        <h2 className="a_editcompany_title">Visualizar Empresa</h2>
        <div className="a_editcompany_card">

          <div className="a_editcompany_left">
            <div className="a_editcompany_logo-container">
              <div className="a_editcompany_logo">
                <img className="a_editcompany_logo-edit" src={editDocImg} alt="AlterarImg" onClick={handleUploadClick}/>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
              </div>
              <p onClick={toggleModal} style={{ cursor: 'pointer', color: '#f52626', fontWeight: '600' }}>Editar documentos</p>

              {isModalOpen && (
                <div className="a_editcompany-modal">
                  <div className="a_editcompany_modal-content">
                    <span className="a_editcompany_modal-close" onClick={toggleModal}>×</span>
                    <h2>Editar Documentos</h2>
                    <div className="a_editcompany_uploaded_items-box">
                      <h3>Documentos adicionados</h3>
                      {documents.map((doc) => (
                        <div key={doc.id} className="a_editcompany_uploaded_items-content">
                          <p>{doc.name}</p>
                          <span onClick={handleUploadClick}>
                            <img src={editDocImg} alt="Documento" />
                          </span>
                          <span
                            className="a_editcompany_uploaded_items-delete"
                            onClick={() => handleDelete(doc.id)}
                          >
                            ×
                          </span>
                        </div>
                      ))}
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="a_editcompany_group">
              <h3>Integrantes</h3>
              <div className="a_editcompany_member_container-1">
                <div className="a_editcompany_member">
                  <div className="a_editcompany_member-img"></div>
                  <p className="a_editcompany_member-name">Carlos da Silva</p>
                </div>
                <div className="a_editcompany_member">
                  <div className="a_editcompany_member-img"></div>
                  <p className="a_editcompany_member-name">Carlos da Silva</p>
                </div>
              </div>
              <div className="a_editcompany_member_container-2">
                <div className="a_editcompany_member">
                  <div className="a_editcompany_member-img"></div>
                  <p className="a_editcompany_member-name">Carlos da Silva</p>
                </div>
                <div className="a_editcompany_member">
                  <div className="a_editcompany_member-img"></div>
                  <p className="a_editcompany_member-name">Carlos da Silva</p>
                </div>
              </div>
            </div>
          </div>

          <div className="a_editcompany_right">
            <div className="a_editcompany_columns">
              <div className="a_editcompany_column">
                <div className="a_editcompany_info">
                  <h3>Identificação da Empresa</h3>
                  <div className="field-container">
                    <span>Razão Social: </span>
                    <input
                      type="text"
                      value={companyData.razaoSocial}
                      id="razao_social-input"
                      onChange={(e) => handleInputChange(e, 'razaoSocial')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Nome Fantasia: </span>
                    <input
                      type="text"
                      value={companyData.nomeFantasia}
                      id="nome_fantasia-input"
                      onChange={(e) => handleInputChange(e, 'nomeFantasia')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Natureza Jurídica: </span>
                    <input
                      type="text"
                      value={companyData.naturezaJuridica}
                      id="natureza_juridica-input"
                      onChange={(e) => handleInputChange(e, 'naturezaJuridica')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Classificação: </span>
                    <input
                      type="text"
                      value={companyData.classificacao}
                      id="classificacao_input"
                      onChange={(e) => handleInputChange(e, 'classificacao')}
                    />
                  </div>
                  <div className="field-container">
                    <span>CNPJ: </span>
                    <input
                      type="text"
                      value={companyData.cnpj}
                      id="cnpj_input"
                      onChange={(e) => handleInputChange(e, 'cnpj')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Natureza Jurídica Extra: </span>
                    <input
                      type="text"
                      value={companyData.naturezaJuridicaExtra}
                      id="natureza_juridica_extra-input"
                      onChange={(e) => handleInputChange(e, 'naturezaJuridicaExtra')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Porte da Empresa: </span>
                    <input
                      type="text"
                      value={companyData.porte}
                      id="porte_empresa-input"
                      onChange={(e) => handleInputChange(e, 'porte')}
                    />
                  </div>
                  <div className="field-container">
                    <span>CNAE: </span>
                    <input
                      type="text"
                      value={companyData.cnae}
                      id="cnae_input"
                      onChange={(e) => handleInputChange(e, 'cnae')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Identificação Estadual: </span>
                    <input
                      type="text"
                      value={companyData.identificacaoEstadual}
                      id="identificacao_estadual-input"
                      onChange={(e) => handleInputChange(e, 'identificacaoEstadual')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Identificação Nacional: </span>
                    <input
                      type="text"
                      value={companyData.identificacaoNacional}
                      id="identificacao_nacional-input"
                      onChange={(e) => handleInputChange(e, 'identificacaoNacional')}
                    />
                  </div>
                </div>

                <div className="a_editcompany_finance">
                  <h3>Aspectos Financeiros</h3>
                  <div className="field-container">
                    <span>Capital Social Inicial: </span>
                    <input
                      type="text"
                      value={companyData.capitalSocial}
                      id="capital_social-input"
                      onChange={(e) => handleInputChange(e, 'capitalSocial')}
                    />
                  </div>

                  <div className="field-container" id="contas-bancarias">
                    <span>Contas Bancárias:</span>
                    {companyData.contasBancarias.map((conta, index) => (
                      <div key={index} className="conta-input-container">
                        <input
                          type="text"
                          value={conta}
                          id="contas_bancarias-input"
                          onChange={(e) => handleContaInputChange(e, index)}
                          placeholder={`Conta ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="a_editcompany_column">
                <div className="a_editcompany_location">
                  <h3>Localização e Contato</h3>
                  <div className="field-container">
                    <span>CEP: </span>
                    <input
                      type="text"
                      value={companyData.cep}
                      id="cep_input"
                      onChange={(e) => handleInputChange(e, 'cep')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Cidade: </span>
                    <input
                      type="text"
                      value={companyData.cidade}
                      id="cidade_input"
                      onChange={(e) => handleInputChange(e, 'cidade')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Rua: </span>
                    <input
                      type="text"
                      value={companyData.rua}
                      id="rua_input"
                      onChange={(e) => handleInputChange(e, 'rua')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Estado: </span>
                    <input
                      type="text"
                      value={companyData.estado}
                      id="estado_input"
                      onChange={(e) => handleInputChange(e, 'estado')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Bairro: </span>
                    <input
                      type="text"
                      value={companyData.bairro}
                      id="bairro_input"
                      onChange={(e) => handleInputChange(e, 'bairro')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Número: </span>
                    <input
                      type="text"
                      value={companyData.numero}
                      id="numero_input"
                      onChange={(e) => handleInputChange(e, 'numero')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Telefone: </span>
                    <input
                      type="text"
                      value={companyData.telefone}
                      id="telefone_input"
                      onChange={(e) => handleInputChange(e, 'telefone')}
                    />
                  </div>
                  <div className="field-container">
                    <span>Email: </span>
                    <input
                      type="email"
                      value={companyData.email}
                      id="email_input"
                      onChange={(e) => handleInputChange(e, 'email')}
                    />
                  </div>
                </div>

                <div className="a_editcompany_participants">
                  <h3>Sócios e Participações</h3>
                  <div className="field-container">
                    <span>Sócios:</span>
                    {companyData.socios.map((socio, index) => (
                      <div key={index} className="socio-input-container">
                        <input
                          type="text"
                          value={socio}
                          id="socio_input"
                          onChange={(e) => handleSocioInputChange(e, index)}
                          placeholder={`Sócio ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="a_editcompany_dados-button_container">
            <h3>Carregar esses dados</h3>
            <button className="a_editcompany_dados-button" onClick={handleSave}></button>
          </div>
        </div>
      </div>
      <ScreenWarning />
    </div>
  );
};

export default CompanyInfo;