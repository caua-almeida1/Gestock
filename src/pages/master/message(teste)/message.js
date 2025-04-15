import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../../firebase/firebase';
import { ref, onValue, push, serverTimestamp, set } from "firebase/database";
import logo2 from '../../../img/logo_gestockpt2.svg';
import "../../master/master.css";

const MessageReceiver = () => {
  const [modalMessage, setModalMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [moduleStates, setModuleStates] = useState({ modulo1: 'bloqueado', modulo2: 'bloqueado', modulo3: 'bloqueado' });
  const [isBlocked, setIsBlocked] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    // Recuperar estados dos módulos do Firebase
    const moduleStatesRef = ref(database, 'moduleStates/');
    onValue(moduleStatesRef, (snapshot) => {
      const states = snapshot.val();
      if (states) {
        setModuleStates(states);
      }
    });
  }, []);

  useEffect(() => {
    const blocked = moduleStates.modulo1 === 'bloqueado';
    setIsBlocked(blocked);
  }, [moduleStates]);

  useEffect(() => {
    if (moduleStates.modulo1 !== 'bloqueado') {
      setIsBlocked(false);
    }
  }, [moduleStates.modulo1]);

  const updateModuleState = (module, state) => {
    const moduleRef = ref(database, 'moduleStates/' + module);
    set(moduleRef, state);
  };

  const blockModule1 = () => {
    updateModuleState('modulo1', 'bloqueado');
  };

  const unblockModule1 = () => {
    updateModuleState('modulo1', 'liberado');
  };

  const sendMessage = () => {
    const messageRef = ref(database, 'messages/receiver');
    push(messageRef, {
      content: newMessage,
      timestamp: serverTimestamp()
    });
    setNewMessage('');
  };

  useEffect(() => {
    const modalMessageRef = ref(database, 'messages/modal');
    onValue(modalMessageRef, (snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        const latestMessageKey = Object.keys(messages).pop();
        const latestMessage = messages[latestMessageKey].content;
        setModalMessage(latestMessage);
      }
    });
  }, []);

  return (
    <div className="message-receiver-container">
      {isBlocked && (
        <div className="warning-message">
          <img src={logo2} alt="Logo Gestock" />
          <p>O Módulo 1 está bloqueado. Você não pode acessar esta tela.</p>
        </div>
      )}
      {isBlocked && <div className="overlay22" />}
      <h2>Enviar mensagem</h2>
      <textarea
        className="message-input"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Digite sua mensagem"
      />
      <button className="send-button" onClick={sendMessage}>Enviar Mensagem</button>
      <h3>Última mensagem recebida:</h3>
      <div className="modal-message-display">{modalMessage}</div>
    </div>
  );
};

export default MessageReceiver;
