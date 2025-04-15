import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';

const UploadChatModal = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [fileType, setFileType] = useState(null);
  const fileInputRef = useRef(null);
  const [showModalUpload, setShowModalUpload] = useState(false);

  // Função para abrir o modal
  const handleLinkClick = () => {
    setShowModalUpload(true);
  };

  // Função para fechar o modal com animação
  const handleCloseModalUpload = () => {
    const modalContent = document.querySelector('.modal-content-upload-chat');
    const modalOverlay = document.querySelector('.modal-overlay-upload-chat');

    if (modalContent && modalOverlay) {
      modalContent.classList.add('fade-out-upload-chat'); // Animação para o conteúdo
      modalOverlay.classList.add('fade-out-overlay-upload-chat'); // Animação para o overlay

      setTimeout(() => setShowModalUpload(false), 300); // Tempo da animação de saída
    }
  };

  // Função para manipular o clique na opção
  const handleOptionClick = (type) => {
    setShowModalUpload(false);
    fileInputRef.current.accept = type === 'Fotos e Vídeos' ? 'image/*,video/*' : '*';
    fileInputRef.current.click();
  };

  // Função para manipular a mudança de arquivo
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      console.log(`Arquivo selecionado: ${selectedFile.name}`);
    }
  };

  return (
    <div className={`conversation-form-upload-chat ${!isConversationContentVisible ? "hidden" : ""}`}>
      <div type="button" className="conversation-form-button-upload-chat conversation-left-icons-upload-chat">
        <Icon icon="mingcute:emoji-line" className="icon-upload-chat" />
        <Icon
          type="file"
          name="file"
          icon="uil:link"
          className="icon-upload-chat"
          onClick={handleLinkClick} // evento de clique para abrir/fechar o menu
        />
      </div>
      <div className="conversation-form-group-upload-chat">
        <div className={`upload-options-upload-chat ${showOptions ? 'slide-in-documents-upload-chat' : 'slide-out-documents-upload-chat'}`}>
          {showModalUpload && (
            <div className="modal-overlay-upload-chat" onClick={handleCloseModalUpload}>
              <div className="modal-content-upload-chat fade-in-upload-chat" onClick={(e) => e.stopPropagation()}>
                <h3>Selecione o Tipo de Arquivo</h3>
                <button onClick={() => handleOptionClick('Fotos e Vídeos')}>
                  <Icon icon="ic:baseline-add-to-photos" className="icon-upload-chat" />
                  <p>Fotos e Vídeos</p>
                </button>
                <button onClick={() => handleOptionClick('Documentos')}>
                  <Icon icon="mingcute:document-2-fill" className="icon-upload-chat" />
                  <p>Documentos</p>
                </button>
              </div>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <textarea
          type="text"
          rows="1"
          className="conversation-form-input-upload-chat"
          placeholder="Digite uma mensagem..."
          ref={textareaRef}
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
      </div>
      <button
        type="button"
        className="conversation-form-button-upload-chat conversation-form-submit-upload-chat"
        onClick={handleSendMessage}
      >
        <Icon icon="fluent:send-28-filled" className="icon-upload-chat" />
      </button>
    </div>
  );
};

export default UploadChatModal;
