import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update, get } from 'firebase/database';
import { Icon } from '@iconify/react';
import plusIcon from '@iconify/icons-mdi/plus'; // Ícone de "mais"
import "../../master/master.css";

const VisualizarEmpresaComponent = ({ onClose, selectedCard }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [integrantes, setIntegrantes] = useState([{ nome: '' }]); // Estado para os campos de integrantes
  const [errorMessage, setErrorMessage] = useState(''); // Estado para a mensagem de erro
  const [groupData, setGroupData] = useState(null);
  const [members, setMembers] = useState([]);
  const [cadastrados, setCadastrados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null); // Estado para o grupo selecionado
  // Abrir modal
  const handleAddModalOpen = () => {
    // Define os integrantes com os emails já cadastrados
    setIntegrantes(members.map(email => ({ nome: email })));
    setIsAddModalOpen(true);
  };

  // Fechar modal e limpar campos de integrantes
  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setIntegrantes([{ nome: '' }]); // Redefine os campos de integrantes para o estado inicial
    setErrorMessage(''); // Limpa a mensagem de erro ao fechar o modal
  };

  // Adicionar novo campo de integrante
  const handleAddIntegrante = () => {
    {
      setIntegrantes([...integrantes, { nome: '' }]); // Adiciona um novo campo
      setErrorMessage(''); // Limpa a mensagem de erro se for válido adicionar
    }
  };

  const isEmailCadastrado = (email) => {
    return Array.isArray(cadastrados) && cadastrados.includes(email);
  };

  const handleSaveIntegrantes = () => {
    const novosEmails = integrantes
      .map((integrante) => integrante.nome)
      .filter((email) => email); // Filtra emails não vazios

    // Verifica se os emails já estão cadastrados
    const emailsNaoCadastrados = novosEmails.filter(email => !usuarios.includes(email));

    if (emailsNaoCadastrados.length === 0) {
      const db = getDatabase();
      const groupRef = ref(db, `groups/${selectedCard.id}/members`);

      // Atualiza a lista de membros
      get(groupRef).then(snapshot => {
        const currentMembers = snapshot.val() || {};

        // Cria um objeto para armazenar os emails
        const updatedMembers = {};

        // Filtra os novos emails que não estão nos membros existentes
        const novosEmailsFiltrados = novosEmails.filter(email => !currentMembers.includes(email));

        // Adiciona novos emails ao objeto com o índice como chave
        novosEmailsFiltrados.forEach((email, index) => {
          const safeKey = index + Object.keys(currentMembers).length; // Define uma chave sequencial
          updatedMembers[safeKey] = email; // Armazena o email como valor
        });

        // Adiciona os membros existentes ao objeto
        Object.entries(currentMembers).forEach(([key, member]) => {
          updatedMembers[key] = member; // Mantém os membros existentes
        });

        // Atualiza o Firebase com o novo objeto de membros
        update(groupRef, updatedMembers)
          .then(() => {
            handleAddModalClose(); // Fecha o modal após salvar
          })
          .catch((error) => {
            console.error("Erro ao salvar integrantes:", error);
          });
      });
    } else {
      setErrorMessage("Os seguintes emails não estão cadastrados: " + emailsNaoCadastrados.join(', '));
    }
  };

  // Função para buscar os emails cadastrados
  const fetchCadastrados = () => {
    const db = getDatabase();
    const usersRef = ref(db, 'users'); // Supondo que a coleção de usuários esteja em 'users'
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const emails = data ? Object.values(data).map(user => user.email) : []; // Ajuste se a estrutura for diferente
      setCadastrados(emails); // Armazena os emails cadastrados
    });
  };

  useEffect(() => {
    if (selectedCard.id) {
      const db = getDatabase();
      const groupRef = ref(db, `groups/${selectedCard.id}`);

      const unsubscribe = onValue(groupRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGroupData(data);
          const membersArray = Array.isArray(data.members) ? data.members : [];
          setMembers(membersArray);
          setCadastrados(membersArray); // Define cadastrados como um array
        }
      });

      return () => unsubscribe();
    }
  }, [selectedCard]);

  // Atualizar o valor do campo de integrante
  const handleIntegranteChange = (index, event) => {
    const novosIntegrantes = [...integrantes];
    novosIntegrantes[index].nome = event.target.value;
    setIntegrantes(novosIntegrantes);
  };

  const handleInputChange = (index, value, isSocios = false, field = '') => {
    if (isSocios && field) {
      // Atualizando o campo específico do sócio (nome ou qualificação)
      setGroupData((prevData) => ({
        ...prevData,
        infosGroup: {
          ...prevData.infosGroup,
          socios: prevData.infosGroup.socios.map((socio, i) =>
            i === index ? { ...socio, [field]: value } : socio
          ),
        },
      }));
    } else {
      // Atualizando campos fora de socios
      setGroupData((prevData) => ({
        ...prevData,
        infosGroup: {
          ...prevData.infosGroup,
          [index]: value, // Atualizando campos não relacionados a sócios
        },
      }));
    }
  };

  const handleBlur = (field, isSocios = false, index = null) => {
    const db = getDatabase();
    const groupRef = ref(db, `groups/${selectedCard.id}/infosGroup`);

    if (isSocios) {
      // Atualiza o campo do sócio
      if (groupData && groupData.infosGroup && Array.isArray(groupData.infosGroup.socios)) {
        const updatedSocios = [...groupData.infosGroup.socios];
        const socio = updatedSocios[index];
        if (socio) {
          socio[field] = groupData.infosGroup.socios[index][field];  // Atualiza o campo 'nome' ou 'qualificacao'
          const socioRef = ref(db, `groups/${selectedCard.id}/infosGroup/socios/${index}`);
          update(socioRef, socio)  // Atualiza o sócio específico no Firebase
            .catch((error) => {
              console.error("Erro ao atualizar o sócio:", error);
            });
        } else {
          console.warn(`Erro: Sócio com índice ${index} não encontrado.`);
        }
      } else {
        console.warn("Erro: Dados de sócios estão indefinidos.");
      }
    } else {
      // Atualiza os campos fora de socios
      if (groupData && groupData.infosGroup && field in groupData.infosGroup) {
        update(groupRef, {
          [field]: groupData.infosGroup[field],
        }).catch((error) => {
          console.error("Erro ao atualizar o campo:", error);
        });
      } else {
        console.warn(`Erro: Campo ${field} não encontrado em infosGroup.`);
      }
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users'); // Ref para o nó de usuários

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const emails = Object.values(data).map(user => user.email); // Assume que cada usuário tem um campo 'email'
        setUsuarios(emails); // Define os usuários cadastrados
      }
    });

    // Limpa o listener quando o componente desmonta
    return () => unsubscribe();
  }, []);

  return (
    <div className="modal-overlay_vizuempresa">
      <div className="modal-container_vizuempresa">
        <h2>Informações da Empresa</h2>
        <div className="modal-content_vizuempresa">
          {groupData ? (
            <>
              <div className="identificacao_vizuempresa">
                <h3>Identificação da Empresa</h3>
                <div className='coolinputEmpresa'>
                  <label className='text'>Razão Social: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.razaoSocial || ''}
                    onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                    onBlur={() => handleBlur('razaoSocial')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Nome Fantasia: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData?.nomeFantasia || ''}
                    onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                    onBlur={() => handleBlur('nomeFantasia')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Natureza Jurídica: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.naturezaJuridica || ''}
                    onChange={(e) => handleInputChange('naturezaJuridica', e.target.value)}
                    onBlur={() => handleBlur('naturezaJuridica')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Classificação: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.classificacao || ''}
                    onChange={(e) => handleInputChange('classificacao', e.target.value)}
                    onBlur={() => handleBlur('classificacao')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>CNPJ: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.cnpj || ''}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    onBlur={() => handleBlur('cnpj')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Porte da Empresa: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.porteEmpresa || ''}
                    onChange={(e) => handleInputChange('porteEmpresa', e.target.value)}
                    onBlur={() => handleBlur('porteEmpresa')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>CNAE: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.cnae || ''}
                    onChange={(e) => handleInputChange('cnae', e.target.value)}
                    onBlur={() => handleBlur('cnae')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Identificação Estadual: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.identificacaoEstadual || ''}
                    onChange={(e) => handleInputChange('identificacaoEstadual', e.target.value)}
                    onBlur={() => handleBlur('identificacaoEstadual')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Identificação Nacional: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.identificacaoNacional || ''}
                    onChange={(e) => handleInputChange('identificacaoNacional', e.target.value)}
                    onBlur={() => handleBlur('identificacaoNacional')}
                  />
                </div>
              </div>

              <div className="localizacao-socios_vizuempresa">
                <h3>Localização e Contato</h3>
                <div className='coolinputEmpresa'>
                  <label className='text'>CEP: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.cep || ''}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    onBlur={() => handleBlur('cep')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Cidade: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.cidade || ''}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    onBlur={() => handleBlur('cidade')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Rua: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.rua || ''}
                    onChange={(e) => handleInputChange('rua', e.target.value)}
                    onBlur={() => handleBlur('rua')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Estado: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.estado || ''}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    onBlur={() => handleBlur('estado')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Bairro: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.bairro || ''}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    onBlur={() => handleBlur('bairro')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Número: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.numero || ''}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    onBlur={() => handleBlur('numero')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Telefone: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.telefone || ''}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    onBlur={() => handleBlur('telefone')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>E-Mail: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                  />
                </div>
                <div className='coolinputEmpresa'>
                  <label className='text'>Website: </label>
                  <input
                    type="text"
                    className='input'
                    value={groupData.infosGroup?.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    onBlur={() => handleBlur('website')}
                  />
                </div>

                <div className="socios-container">
                  <h3>Sócios e Qualificações</h3>
                  {groupData?.infosGroup?.socios && Array.isArray(groupData.infosGroup.socios) && groupData.infosGroup.socios.length > 0 ? (
                    groupData.infosGroup.socios.map((pessoa, index) => (
                      <div key={index} className="socio-item">
                        <div className='coolinputEmpresa'>
                          <label className='text'>Sócio {index + 1}: </label>
                          <input
                            type="text"
                            className="input"
                            value={pessoa.nome || ''}
                            onChange={(e) => handleInputChange(index, e.target.value, true, 'nome')}
                            onBlur={() => handleBlur('nome', true, index)}
                          />
                        </div>
                        <div className='coolinputEmpresa'>
                          <label className='text'>Qualificação:</label>
                          <input
                            className="input"
                            type="text"
                            value={pessoa.qualificacao || ''}
                            onChange={(e) => handleInputChange(index, e.target.value, true, 'qualificacao')}
                            onBlur={() => handleBlur('qualificacao', true, index)}
                          />
                        </div>
                      </div>
                    ))
                  ) : null}

                </div>
              </div>
            </>
          ) : (
            <p>Carregando...</p>
          )}
        </div>

        <div className="button-group_vizuempresa">
          <button className="add-button_vizuempresa" onClick={handleAddModalOpen}>Adicionar Integrantes</button>
          <button className="close-button_vizuempresa" onClick={onClose}>Fechar</button>
        </div>
      </div>

      {/* Modal para adicionar integrantes */}
      {isAddModalOpen && (
        <div className="modal-overlay_vizuempresa">
          <div className="modal-container-add_vizuempresa">
            <h2>Adicionar Novo Integrante</h2>
            <div className="modal_adduser-content_vizuempresa">
              <div className="integrantes-list_vizuempresa">
                {integrantes.map((integrante, index) => (
                  <div key={index} className="integrante-field_vizuempresa">
                    <input
                      type="text"
                      placeholder={`Email do Integrante ${index + 1}`}
                      value={integrante.nome}
                      onChange={(e) => handleIntegranteChange(index, e)}
                      className="input_vizuempresa"
                      style={{
                        backgroundColor: isEmailCadastrado(integrante.nome) ? '#e5e5e5' : '#ffffff',
                      }}
                    />
                  </div>
                ))}
              </div>
              {errorMessage && (
                <p className="error-message_vizuempresa">{errorMessage}</p>
              )}
              <button className="m_visa_addUser" onClick={handleAddIntegrante}>
                Adicionar Integrante
              </button>
            </div>
            <div className="modal-buttons_vizuempresa">
              <button className="save-button_vizuempresa" onClick={handleSaveIntegrantes}>Salvar</button>
              <button className="close-button_vizuempresa" onClick={handleAddModalClose}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizarEmpresaComponent;