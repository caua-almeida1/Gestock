import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import useSound from 'use-sound';
import ScreenWarning from "../../../components/MaxPhone";
import Sidebar from "../../../components/SidebarGestock";
import ChatImg from "../../../img/chat-main-img.svg";

import sendSound from '../../../audio/send.mp3'
import receiveSound from '../../../audio/receive.mp3'

import "./chat.css";
import { useAuth } from '.././../../contexts/authContext';
import { getDatabase, set, off, ref, child, get, update, push, onValue, remove } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import NewContactModal from "../../../components/chat/chat/NewContactModal";
import ForwardModal from "../../../components/chat/chat/ForwardModal";
import EditMessageModal from "../../../components/chat/chat/EditMessageModal";
import ModalGroup from "../../../components/chat/chat/ModalGroup"

// ====== IMPORTAÇÃO EMOJIS ========
import Emoji1 from "../../../img/emojis/emoji (2).png"
import Emoji2 from "../../../img/emojis/emoji (3).png"
import Emoji3 from "../../../img/emojis/emoji (4).png"
import Emoji4 from "../../../img/emojis/emoji (5).png"
import Emoji5 from "../../../img/emojis/emoji (7).png"
import Emoji6 from "../../../img/emojis/emoji (6).png"
import Emoji7 from "../../../img/emojis/emoji (8).png"
import Emoji8 from "../../../img/emojis/emoji (1).png"

const ChatJs = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});
  const arrowRefs = useRef({});
  const [textareaHeight, setTextareaHeight] = useState("auto");
  const textareaRef = useRef(null);
  const [MessageId, setMessageId] = useState(null);
  const [ContactName, setContactName] = useState(""); // Estado para armazenar o nome do contato
  const [selectedContact, setSelectedContact] = useState(null);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [forwardedMessage, setForwardedMessage] = useState('');
  const [userInfo, setUserInfo] = useState({ email: "", fullName: "" });
  const [showModalUpload, setShowModalUpload] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // ======== GRUPOS =========
  const [selectedTab, setSelectedTab] = useState("conversas");
  const [isModalGroupOpen, setIsModalGroupOpen] = useState(false);

  const handleModalGroupToggle = () => {
    setIsModalGroupOpen(!isModalGroupOpen);  // Alterna a visibilidade do modal
  };


  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const { currentUser } = useAuth();


  const [playSend] = useSound(sendSound);
  const [playReceive] = useSound(receiveSound);

  const handleConfigClick = async () => {
    if (currentUser) {
      console.log("Email do usuário logado:", currentUser.email);

      const db = getDatabase();
      const usersRef = ref(db, 'users');

      try {
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const users = snapshot.val();
          let found = false;

          // Itera sobre cada usuário e compara o email
          Object.keys(users).forEach((userId) => {
            if (users[userId].email === currentUser.email) {
              console.log("Nome completo do usuário logado:", users[userId].fullName);
              found = true;
            }
          });

          if (!found) {
            console.log("Usuário não encontrado.");
          }
        } else {
          console.log("Nenhum usuário encontrado no banco de dados.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    } else {
      console.log("Nenhum usuário está logado.");
    }
  };
  const [isConversationContentVisible, setIsConversationContentVisible] =
    useState(false);
  const [newContentVisible, setNewContentVisible] = useState(true);

  const handleArrowClick = (event, itemId) => {
    event.stopPropagation();
    setOpenDropdown((prev) => (prev === itemId ? null : itemId));
  };

  const handleInputChange = (event) => {
    setNewMessage(event.target.value); // Atualiza o valor do textarea
    const textareaLineHeight = 24;
    const maxLines = 5;
    const textarea = event.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(
      textarea.scrollHeight,
      textareaLineHeight * maxLines
    );
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflow =
      textarea.scrollHeight > textareaLineHeight * maxLines ? "auto" : "hidden";
  };

  const handleLogin = async (email, password) => {
    // Lógica de autenticação
    const userEmail = email; // Substitua isso pela lógica de captura de email

    // Após autenticar com sucesso
    fetchUserContacts(userEmail);
  };

  // ============= LÓGICA TROCA DE CONVERSAS USUARIOS ============

  //  ------------ ENVIO, RECIBO DE MENSAGENS E AÇÕES ------------
  const [newMessage, setNewMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const formatEmail = (email) => email.replace(/\./g, "_");
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false);
  const emojiMenuRef = useRef(null);
  const emojiOverlayRef = useRef(null);

  const handleEmojiMenuToggle = () => {
    setIsEmojiMenuOpen((prevState) => !prevState);
  };

  const handleEmojiClick = (emoji) => {
    // Atualiza o valor do textarea com o emoji
    setNewMessage(prevMessage => prevMessage + emoji);

    // Fecha o menu de emojis após selecionar um emoji
    handleEmojiMenuToggle();
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleModalToggle = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleBackClick = () => {
    setIsConversationContentVisible(false);
    setNewContentVisible(true);
    setMessageId(null);
  };

  const handleMessageClick = async (id, name, email) => {
    setMessageId(id);
    setContactName(name); const handleSendForwardedMessages = async (selectedContacts, messageText) => {
      const currentDate = new Date();
      const timeDay = currentDate.toLocaleDateString("pt-BR");
      const timeHours = currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      let lastContactId = null; // Variável para armazenar o último contato encaminhado

      for (const contactId of selectedContacts) {
        const contactEmail = contacts.find(contact => contact.id === contactId)?.email;

        if (!contactEmail) continue;

        const formattedUserFromEmail = formatEmail(currentUser.email);
        const formattedUserToEmail = formatEmail(contactEmail);
        const conversationPath = createConversationPath(formattedUserFromEmail, formattedUserToEmail);

        const newMessageObj = {
          id: new Date().getTime(),
          text: messageText,
          timeDay,
          timeHours,
          from: currentUser.email,
          toUsers: contactEmail,
          replyTo: replyMessage ? replyMessage.text : null,
          edited: false,
          forwarded: true // Adiciona o campo forwarded como true
        };

        try {
          const db = getDatabase();
          const messageRef = ref(db, `${conversationPath}/${newMessageObj.id}`);
          await set(messageRef, newMessageObj);

          // Adiciona um delay de 600ms após cada encaminhamento
          await new Promise((resolve) => setTimeout(resolve, 600));
          lastContactId = contactId; // Atualiza o último contato
        } catch (error) {
          console.error("Erro ao encaminhar a mensagem:", error);
        }
      }

      // Fecha o modal após o encaminhamento
      closeForwardModal();

      // Abre a conversa do último contato
      if (lastContactId) {
        const lastContact = contacts.find(contact => contact.id === lastContactId);
        if (lastContact) {
          handleMessageClick(lastContactId, lastContact.name, lastContact.email);
        }
      }
    };

    setIsConversationContentVisible(true);
    setNewContentVisible(false);

    const contactEmail = contacts.find(contact => contact.id === id)?.email;
    if (!contactEmail) return;

    const db = getDatabase();
    const formattedUserFromEmail = formatEmail(currentUser.email);
    const formattedUserToEmail = formatEmail(contactEmail);
    const conversationPath = createConversationPath(formattedUserFromEmail, formattedUserToEmail);

    const chatRef = ref(db, `${conversationPath}`);
    off(chatRef); // Remove o listener anterior

    onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const allMessages = snapshot.val();
        const messageList = Object.values(allMessages).map((msg) => ({
          ...msg,
          id: msg.id || new Date().getTime(),
          type: msg.from === currentUser.email ? "me" : "received"
        }));

        const uniqueMessages = Array.from(new Map(messageList.map(msg => [msg.id, msg])).values());

        // Toca som de recebimento apenas para mensagens de outros usuários
        if (
          JSON.stringify(messages) !== JSON.stringify(uniqueMessages) &&
          uniqueMessages[uniqueMessages.length - 1]?.from !== currentUser.email
        ) {
          playReceive();
        }

        setMessages(uniqueMessages);
      } else {
        setMessages([]);
      }
    });
  };

  const handleSendMessage = async () => {
    if ((newMessage.trim() === "" && uploadedFiles.length === 0) || !MessageId) return;

    const currentDate = new Date();
    const timeDay = currentDate.toLocaleDateString("pt-BR");
    const timeHours = currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const contactEmail = contacts.find(contact => contact.id === MessageId)?.email;
    const formattedUserFromEmail = formatEmail(currentUser.email);
    const formattedUserToEmail = formatEmail(contactEmail);
    const conversationPath = createConversationPath(formattedUserFromEmail, formattedUserToEmail);

    // Enviar texto ou arquivos
    if (newMessage.trim()) {
      const newMessageObj = {
        id: new Date().getTime(),
        text: newMessage,
        fileURL: null,
        timeDay,
        timeHours,
        from: currentUser.email,
        toUsers: contactEmail,
        replyTo: replyMessage ? replyMessage.text : null,
        edited: false
      };

      setMessages((prevMessages) => [...prevMessages, { ...newMessageObj, type: "me" }]);
    }

    // Enviar arquivos separados
    uploadedFiles.forEach(async (file) => {
      const newMessageObj = {
        id: new Date().getTime(),
        text: file.name, // Nome do arquivo
        fileURL: file.url,
        timeDay,
        timeHours,
        from: currentUser.email,
        toUsers: contactEmail,
        replyTo: replyMessage ? replyMessage.text : null,
        edited: false
      };

      setMessages((prevMessages) => [...prevMessages, { ...newMessageObj, type: "me" }]);

      // Enviar o arquivo para o banco de dados, se necessário
      try {
        const db = getDatabase();
        const messageRef = ref(db, `${conversationPath}/${newMessageObj.id}`);
        await set(messageRef, newMessageObj);
      } catch (error) {
        console.error("Erro ao enviar a mensagem:", error);
      }
    });

    setNewMessage("");
    setUploadedFiles([]); // Limpa os arquivos após o envio
    setReplyMessage(null);
    textareaRef.current.style.height = "auto";
    playSend();
  };


  const fetchUserContacts = async (userEmail) => {
    const db = getDatabase();
    const formattedUserEmail = formatEmail(userEmail);

    const userRef = ref(db, `chat/${formattedUserEmail}/userContacts`);

    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const contacts = snapshot.val();
        const contactArray = Object.values(contacts).map(contact => ({
          ...contact,
          lastMessage: "Sem mensagens",
          lastMessageTime: "",
          unreadCount: 0 // Inicializa o contador de mensagens não lidas
        }));

        contactArray.forEach(contact => {
          fetchConversations(formattedUserEmail, contact.email);
        });

        setContacts(contactArray);
      } else {
        setContacts([]);
      }
    });
  };

  const fetchConversations = async (userEmail, contactEmail) => {
    const db = getDatabase();
    const formattedUserFromEmail = formatEmail(userEmail);
    const formattedUserToEmail = formatEmail(contactEmail);

    const chatRef = ref(db, `chat/conversations/${formattedUserFromEmail}/${formattedUserToEmail}/messages`);

    onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const messages = snapshot.val();
        const messageList = Object.values(messages).map(msg => ({
          ...msg,
          id: msg.id || new Date().getTime(),
          type: msg.from === userEmail ? "me" : "received"
        }));

        // Garantir que não está adicionando mensagens duplicadas
        const updatedMessages = messageList.filter((message, index, self) =>
          index === self.findIndex((m) => m.id === message.id)
        );

        setMessages(updatedMessages);

        // Atualiza o último texto e horário para o contato
        setContacts(prevContacts => prevContacts.map(contact => {
          if (contact.email === contactEmail) {
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            const isContactActive = contact.id === MessageId; // Verifica se o contato está ativo
            return {
              ...contact,
              lastMessage: lastMessage ? lastMessage.text : "Sem mensagens",
              lastMessageTime: lastMessage ? lastMessage.timeHours : "",
              unreadCount: isContactActive ? 0 : contact.unreadCount + 1 // Incrementa se não estiver ativo
            };
          }
          return contact;
        }));
      } else {
        setMessages([]);
      }
    });
  };


  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Previne a quebra de linha com Enter
      handleSendMessage(); // Envia a mensagem
    }
  };

  const handleForwardMessage = (message) => {
    console.log("mensageType: encaminhada", message);
    setForwardedMessage(message.text); // Define a mensagem a ser encaminhada
    setIsForwardModalOpen(true); // Abre o modal ao encaminhar mensagem
  };


  const closeForwardModal = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsForwardModalOpen(false);
      setIsExiting(false);
    }, 600);
  };

  const handleDeleteMessage = async (messageId) => {
    const contactEmail = contacts.find(contact => contact.id === MessageId)?.email;
    const formattedUserFromEmail = formatEmail(currentUser.email);
    const formattedUserToEmail = formatEmail(contactEmail);
    const conversationPath = createConversationPath(formattedUserFromEmail, formattedUserToEmail);

    const db = getDatabase();
    const messageRef = ref(db, `${conversationPath}/${messageId}`);

    try {
      // Atualiza a mensagem para marcar como deletada
      await update(messageRef, { text: "Essa mensagem foi excluída", deleted: true });

      // Atualiza o estado local para refletir a exclusão
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, text: "Essa mensagem foi excluída", deleted: true } : msg
        )
      );
    } catch (error) {
      console.error("Erro ao excluir a mensagem:", error);
    }

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, deleted: true } : msg
      )
    );
  };


  const formatMessageDate = (messageDate) => {
    const today = new Date();
    const messageTime = new Date(messageDate);

    const diffTime = today - messageTime;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Ontem"; // Para mensagens de ontem
    } else if (diffDays > 1) {
      return messageTime.toLocaleDateString("pt-BR", {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }); // Para mensagens de 2 ou mais dias atrás
    } else {
      return messageTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Para mensagens do mesmo dia
    }
  };

  const handleReply = (message) => {
    setReplyMessage(message);
  };

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [messageToEdit, setMessageToEdit] = useState(null);

  const handleEditMessageSubmit = async (editedMessageText) => {
    if (!messageToEdit || !editedMessageText.trim()) return; // Verifica se há mensagem e se o texto não está vazio

    const db = getDatabase();
    const contactEmail = contacts.find(contact => contact.id === MessageId)?.email;
    const conversationPath = createConversationPath(formatEmail(currentUser.email), formatEmail(contactEmail));
    const messageRef = ref(db, `${conversationPath}/${messageToEdit.id}`);

    // Atualiza a mensagem no Firebase
    try {
      await update(messageRef, {
        ...messageToEdit,
        text: editedMessageText,
        edited: true,
      });

      // Atualiza o estado local para refletir a edição
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageToEdit.id ? { ...msg, text: editedMessageText, edited: true } : msg
        )
      );

      setEditModalVisible(false); // Fecha o modal após a edição
      setMessageToEdit(null); // Limpa a mensagem atual em edição
    } catch (error) {
      console.error("Erro ao atualizar mensagem:", error);
    }
  };

  const handleEditMessageClick = (message) => {
    setMessageToEdit(message);
    setEditModalVisible(true);
  };

  const createConversationPath = (email1, email2) => {
    const sortedEmails = [email1, email2].sort(); // Ordena os e-mails alfabeticamente
    return `chat/conversations/${sortedEmails[0]}_${sortedEmails[1]}/messages`;
  };

  // ======= CONTATOS ========
  const [contacts, setContacts] = useState([]);
  const [Contact, setContact] = useState(null); // Estado para o contato ativo

  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, "chat");

    const handleDataChange = (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        const userChat = Object.values(chatData).find(
          (chat) => chat.userEmail === currentUser.email
        );

        if (userChat && userChat.userContacts) {
          const contactsList = Object.values(userChat.userContacts).map((contact) => ({
            id: contact.id,
            fullName: contact.fullName,
            email: contact.email,
          }));
          setContacts(contactsList);
          setMessagesFetched(false); // Reset para buscar mensagens para novos contatos
        }
      } else {
        setContacts([]);
      }
    };

    const unsubscribe = onValue(dbRef, handleDataChange, { onlyOnce: false });

    return () => unsubscribe();
  }, [currentUser]);


  const fetchLastMessages = async () => {
    const db = getDatabase();

    contacts.forEach((contact, index) => {
      const formattedUserEmail = formatEmail(currentUser.email);
      const formattedContactEmail = formatEmail(contact.email);
      let conversationPath = `chat/conversations/${formattedUserEmail}_${formattedContactEmail}/messages`;
      const chatRef = ref(db, conversationPath);

      onValue(chatRef, (snapshot) => {
        if (snapshot.exists()) {
          const allMessages = snapshot.val();
          const messagesList = Object.values(allMessages);
          const lastMessage = messagesList[messagesList.length - 1];

          setContacts((prevContacts) => {
            const updatedContacts = [...prevContacts];
            updatedContacts[index] = {
              ...updatedContacts[index],
              lastMessage: lastMessage.text,
              lastMessageTime: lastMessage.timeHours,
            };
            return updatedContacts;
          });
        } else {
          conversationPath = `chat/conversations/${formattedContactEmail}_${formattedUserEmail}/messages`;
          const invertedChatRef = ref(db, conversationPath);

          onValue(invertedChatRef, (invertedSnapshot) => {
            if (invertedSnapshot.exists()) {
              const allMessages = invertedSnapshot.val();
              const messagesList = Object.values(allMessages);
              const lastMessage = messagesList[messagesList.length - 1];

              setContacts((prevContacts) => {
                const updatedContacts = [...prevContacts];
                updatedContacts[index] = {
                  ...updatedContacts[index],
                  lastMessage: lastMessage.text,
                  lastMessageTime: lastMessage.timeHours,
                };
                return updatedContacts;
              });
            }
          });
        }
      });
    });
  };

  const [messagesFetched, setMessagesFetched] = useState(false);

  useEffect(() => {
    if (contacts.length > 0 && !messagesFetched) {
      fetchLastMessages();
      setMessagesFetched(true);
    }
  }, [contacts, messagesFetched]);

  const normalizeText = (text) => {
    return text
      .normalize('NFD') // Normaliza para decompor os caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim(); // Remove espaços no início e no final
  };
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const filteredContacts = contacts.filter((contact) => {
    const normalizedSearchText = normalizeText(searchText.toLowerCase());
    const normalizedFullName = normalizeText(contact.fullName.toLowerCase());
    const normalizedEmail = normalizeText(contact.email.toLowerCase());

    return normalizedFullName.includes(normalizedSearchText) || normalizedEmail.includes(normalizedSearchText);
  });

  // ========== STATUS USUARIO ===========
  useEffect(() => {
    if (currentUser) {
      const db = getDatabase();
      const presenceRef = ref(db, `presence/${currentUser.email.replace(/\./g, "_")}`);

      // Atualiza a presença no banco de dados
      set(presenceRef, { online: true });
      onValue(presenceRef, (snapshot) => {
        setIsOnline(snapshot.val()?.online ?? false);
      });

      return () => set(presenceRef, { online: false });
    }
  }, [currentUser]);

  const handleSendForwardedMessages = async (selectedContacts, messageText) => {
    const currentDate = new Date();
    const timeDay = currentDate.toLocaleDateString("pt-BR");
    const timeHours = currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let lastContactId = null; // Variável para armazenar o último contato encaminhado

    for (const contactId of selectedContacts) {
      const contactEmail = contacts.find(contact => contact.id === contactId)?.email;

      if (!contactEmail) continue;

      const formattedUserFromEmail = formatEmail(currentUser.email);
      const formattedUserToEmail = formatEmail(contactEmail);
      const conversationPath = createConversationPath(formattedUserFromEmail, formattedUserToEmail);

      const newMessageObj = {
        id: new Date().getTime(),
        text: messageText,
        timeDay,
        timeHours,
        from: currentUser.email,
        toUsers: contactEmail,
        replyTo: replyMessage ? replyMessage.text : null,
        edited: false,
        forwarded: true // Adiciona o campo forwarded como true
      };

      try {
        const db = getDatabase();
        const messageRef = ref(db, `${conversationPath}/${newMessageObj.id}`);
        await set(messageRef, newMessageObj);
        lastContactId = contactId; // Atualiza o último contato
      } catch (error) {
        console.error("Erro ao encaminhar a mensagem:", error);
      }
    }

    closeForwardModal();
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (lastContactId) {
      const lastContact = contacts.find(contact => contact.id === lastContactId);
      if (lastContact) {
        handleMessageClick(lastContactId, lastContact.name, lastContact.email);
      }
    }
  };


  // ========= LOGICA ENVIO DOCUMENTOS ===========
  const handleLinkClick = () => {
    setShowModalUpload(true); // exibe o modal
  };

  const handleCloseModalUpload = () => {
    const modalContent = document.querySelector('.modal-content-upload');
    const modalOverlay = document.querySelector('.modal-overlay-upload');

    if (modalContent && modalOverlay) {
      modalContent.classList.add('fade-out-upload'); // Animação para o conteúdo
      modalOverlay.classList.add('fade-out-overlay'); // Animação para o overlay

      setTimeout(() => setShowModalUpload(false), 150); // Tempo da animação de saída
    }
  };

  const handleOptionClick = (type) => {
    setShowModalUpload(false);
    fileInputRef.current.accept = type === 'Fotos e Vídeos' ? 'image/*,video/*' : '*';
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      setLoading(true);
      setProgress(0); // Define o progresso inicial como 0%

      const fileArray = Array.from(files);
      fileArray.forEach(async (file) => {
        try {
          const fileName = file.name;
          const storage = getStorage();
          const fileRef = storageRef(storage, `uploads/${fileName}`);

          const uploadTask = uploadBytesResumable(fileRef, file);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setProgress(progress); // Atualiza o progresso
            },
            (error) => {
              console.error("Erro ao fazer upload do arquivo:", error);
              setLoading(false);
            },
            async () => {
              const fileURL = await getDownloadURL(fileRef);

              setUploadedFiles((prevFiles) => [
                ...prevFiles,
                { name: fileName, url: fileURL }
              ]);
              setLoading(false);
            }
          );
        } catch (error) {
          console.error("Erro ao fazer upload do arquivo:", error);
          setLoading(false);
        }
      });
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  return (
    <body className="body-chat">
      <Sidebar className="sidebar-container" />
      <section className="chat-section">
        <div className="chat-container">
          {/* ===== SIDEBAR AÇÕES CHAT ===== */}
          <aside className="chat-sidebar">
            <a href="#" className="chat-sidebar-home">
              <Icon icon="majesticons:home" />
            </a>

            <ul className="chat-sidebar-menu">
              <li>
                <a href="#" title="Conversas" className="menu-item-chat-1" onClick={() => handleTabChange("conversas")}>
                  <Icon icon="mingcute:chat-1-fill" />
                </a>
              </li>
              <li>
                <a href="#" title="Grupos" className="menu-item-chat-2" onClick={() => handleTabChange("grupos")}>
                  <Icon icon="flowbite:users-group-solid" />
                </a>
              </li>
              <li>
                <a href="#" title="Arquivos" className="menu-item-chat-3">
                  <Icon icon="lets-icons:folder-fill" />
                </a>
              </li>
              <li>
                <a href="#" title="Configurações" className="menu-item-chat-4">
                  <Icon icon="icon-park-solid:config" />
                </a>
              </li>
            </ul>
          </aside>

          <div className="chat-content">
            <div className="content-sidebar-chat">
              <div className="content-sidebar-title">
                {selectedTab === "conversas" ? "Conversas" : "Grupos"}  {/* Título dinâmico */}
                {selectedTab === "conversas" ? (
                  <Icon icon="mdi:user-multiple-add" className="icon" onClick={handleModalToggle} />
                ) : (
                  <Icon icon="mdi:account-group" className="icon" onClick={handleModalGroupToggle} />
                )}
              </div>
              <form action="" className="content-sidebar-form">
                <input
                  type="text"
                  className="content-sidebar-input"
                  placeholder={selectedTab === "conversas" ? "Pesquise por usuário" : "Pesquise por grupos"}
                  value={searchText}
                  onChange={handleSearchChange}
                />
                <button type="submit" className="content-sidebar-submit">
                  <Icon icon="tabler:search" className="icon" />
                </button>
              </form>
              <div className="content-messages">
                <ul className="content-messages-list">

                  {selectedTab === "conversas" ? (
                    <li className="content-message-title">
                      <span>Recentes</span>
                    </li>
                  ) : (
                    <li className="content-message-title">
                      <span>Grupos</span>
                    </li>
                  )
                  }

                  {selectedTab === "conversas" && filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <li
                        key={contact.id}
                        className={MessageId === contact.id ? "active" : ""}
                        onClick={() => handleMessageClick(contact.id, contact.fullName)}
                      >
                        <div className="content-message-item">
                          <div className="content-left-message-item">
                            <Icon icon="mingcute:user-4-fill" className="content-message-image icon" />
                            <span className="content-message-info">
                              <div className="content-message-name">
                                {contact.fullName} {contact.email === currentUser.email ? "(Você)" : ""}
                              </div>
                              <div className="content-message-text">{contact.lastMessage || ""}</div>
                            </span>
                          </div>
                          <span className="content-message-info-right">
                            <span className="content-message-unread">1</span>
                            <div className="content-message-time">{contact.lastMessageTime || ""}</div>
                          </span>
                        </div>
                      </li>
                    ))
                  ) : selectedTab === "conversas" ? (
                    <li className="not-contact-found">Nenhum contato encontrado.</li>
                  ) : selectedTab === "grupos" && filteredContacts.length === 0 ? (
                    <li className="not-contact-found">Nenhum grupo encontrado.</li>
                  ) : null}

                  {/* Aqui você pode adicionar a lógica de renderização de grupos, caso deseje */}
                </ul>

              </div>
            </div>
            {/* ======== CONTENT CONVERSATION ======== */}
            <div className="conversation">
              <div
                className={`conversation-top ${!isConversationContentVisible ? "hidden" : ""
                  }`}
              >
                <button
                  type="button"
                  className="conversation-back"
                  onClick={handleBackClick}
                >
                  <Icon icon="mingcute:arrow-left-fill" className="icon" />
                </button>
                <div className="conversation-user">
                  <Icon
                    icon="mingcute:user-4-fill"
                    className="icon conversation-user-image"
                  />
                  <div>
                    <div className="conversation-user-name">{ContactName}</div> {/* Exibe o nome do contato ativo */}
                    <div className="conversation-user-status online">
                      Online
                    </div>
                  </div>
                </div>
                <div className="conversation-buttons">
                  <button type="button">
                    <Icon icon="humbleicons:dots-vertical" className="icon" />
                  </button>
                </div>
              </div>

              <div
                className={`conversation-main ${!isConversationContentVisible ? "hidden" : ""
                  }`}
              >
                <ul className="conversation-wrapper">
                  <div className="conversation-divider">
                    <span>Hoje</span>
                  </div>
                  {messages.map((message, index) => {
                    const isFirstInSequence = index === 0 || messages[index - 1].type !== message.type;
                    const additionalClass = !isFirstInSequence ? "sub-sequence-item" : "";

                    return (
                      <li
                        key={message.id}
                        className={`conversation-item ${message.type} ${additionalClass}`}
                      >
                        {isFirstInSequence && (
                          <div className="conversation-item-side">
                            <Icon
                              icon="mingcute:user-4-fill"
                              className="icon conversation-item-image"
                            />
                          </div>
                        )}
                        <div className="conversation-item-content">
                          <div
                            className="conversation-item-wrapper"
                            onMouseEnter={() => setHoveredItem(message.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <div className="conversation-item-box">
                              <div className="conversation-item-text">
                                {message.replyTo && (
                                  <div className="replied-message">
                                    <div className="replied-message-content">
                                      <strong>
                                        {message.from === currentUser.email ? "Você" : message.replyTo.fullName}:
                                      </strong>
                                      <p>{message.replyTo}</p>
                                    </div>
                                  </div>
                                )}

                                {message.fileURL ? (
                                  <div className="file-message">
                                    <Icon icon="line-md:file-download-filled" width="24" height="24" className="icon" />
                                    <a href={message.fileURL} target="_blank" rel="noopener noreferrer" className="link-upload-archive">
                                      {message.text || "Arquivo enviado"}
                                    </a>
                                  </div>
                                ) : (
                                  <>
                                    {message.forwarded && (
                                      <div className="forwarded-label">
                                        <Icon icon="basil:forward-solid" className="icon" /> Encaminhada
                                      </div>
                                    )}
                                    <p className="edited-message-indicator">
                                      {message.deleted && message.from !== currentUser.email
                                        ? message.text
                                        : (message.deleted && message.from === currentUser.email
                                          ? "🛇 Essa mensagem foi excluída"
                                          : message.text)}
                                    </p>
                                  </>
                                )}
                                <div className="conversation-item-time">
                                  {message.edited && <span className="edited-tag"> (Editada) </span>}
                                  {message.timeHours}
                                </div>

                                <div className="conversation-item-dropdown">
                                  <button
                                    className="conversation-item-dropdown-toggle"
                                    onClick={(e) => handleArrowClick(e, message.id)}
                                    style={{
                                      opacity: hoveredItem === message.id || openDropdown === message.id ? 1 : 0,
                                      visibility: hoveredItem === message.id || openDropdown === message.id ? "visible" : "hidden",
                                      transition: "all 200ms ease",
                                    }}
                                  >
                                    <Icon icon="ep:arrow-down-bold" className="icon" />
                                  </button>
                                  <ul className={`conversation-item-dropdown-list ${openDropdown === message.id ? "open" : ""}`}>
                                    <li onClick={() => { handleReply(message); setOpenDropdown(null); }}>
                                      <a><Icon icon="iconamoon:do-redo-fill" /> Responder</a>
                                    </li>
                                    <li onClick={() => { handleForwardMessage(message); setOpenDropdown(null); }}>
                                      <a><Icon icon="fluent:share-16-filled" className="icon" /> Encaminhar</a>
                                    </li>
                                    {message.type !== "received" && (
                                      <li>
                                        <a onClick={() => handleEditMessageClick(message)}><Icon icon="clarity:edit-solid" className="icon" />Editar</a>
                                      </li>
                                    )}
                                    {message.type !== "received" && (
                                      <li>
                                        <a onClick={() => handleDeleteMessage(message.id)}><Icon icon="ic:round-delete" className="icon" />Deletar</a>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </ul>
              </div>
              <div
                className={`reply-box ${replyMessage ? "visible" : ""}`}
                style={{
                  width: "100%", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 200ms ease", maxHeight: replyMessage ? "150px" : "0px", // Animação de slide overflow: "hidden",
                }}
              >
                <div className={`emoji-overlay ${isEmojiMenuOpen ? "open" : ""}`} ref={emojiOverlayRef} onClick={handleEmojiMenuToggle}></div>


                <div className={`emoji-menu ${isEmojiMenuOpen ? "open" : ""}`} ref={emojiMenuRef}>
                  <ul>
                    <li onClick={() => handleEmojiClick('😊')}><img src={Emoji1} /></li>
                    <li onClick={() => handleEmojiClick('😂')}><img src={Emoji2} /></li>
                    <li onClick={() => handleEmojiClick('😍')}><img src={Emoji3} /></li>
                    <li onClick={() => handleEmojiClick('🤓')}><img src={Emoji4} /></li>
                    <li onClick={() => handleEmojiClick('👍')}><img src={Emoji5} /></li>
                    <li onClick={() => handleEmojiClick('🤔')}><img src={Emoji6} /></li>
                    <li onClick={() => handleEmojiClick('❤️')}><img src={Emoji7} /></li>
                    <li onClick={() => handleEmojiClick('💯')}><img src={Emoji8} /></li>
                  </ul>
                </div>
                {replyMessage && (
                  <div className="reply-box-content" style={{ flex: 1 }}>
                    <div className="reply-box-content-info">
                      <strong>
                        {replyMessage.from === currentUser.email ? "Você" : ContactName}
                      </strong>
                      <p>{replyMessage.text}</p>
                    </div>
                    <Icon icon="mdi:close" className="close-reply-box icon" style={{ fontSize: "24px" }} onClick={() => setReplyMessage(null)} type="button" />
                  </div>
                )}
                <div className="uploaded-files">
                  {uploadedFiles.map((file, index) => {
                    let fileIcon = null;

                    if (file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                      fileIcon = <Icon icon="bxs:file-image" width="24" height="24" style={{ color: 'white' }} />;
                    } else if (file.name.match(/\.(mp4|mkv|avi|mov)$/i)) {
                      fileIcon = <Icon icon="ic:round-video-file" width="24" height="24" />;
                    } else {
                      fileIcon = <Icon icon="line-md:file-document-filled" width="24" height="24" style={{ color: 'white' }} />;
                    }

                    return (
                      <div key={index} className="uploaded-file-item">
                        {fileIcon}
                        <span className="file-name-uploaded">{file.name}</span>
                        <button
                          style={{ marginLeft: '10px', backgroundColor: 'transparent', border: 'none' }}
                          onClick={() => handleRemoveFile(index)}
                        >
                          X
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>

              <div
                className={`conversation-form ${!isConversationContentVisible ? "hidden" : ""
                  }`}
              >
                <div type="button" className="conversation-form-button conversation-left-icons">
                  <Icon icon="mingcute:emoji-line" className="icon" onClick={handleEmojiMenuToggle} />
                  <Icon
                    type="file"
                    name="file"
                    icon="uil:link"
                    className="icon"
                    onClick={handleLinkClick} // evento de clique para abrir/fechar o menu
                  />
                </div>
                <div className="conversation-form-group">
                  <div className={`upload-options ${showOptions ? 'slide-in-documents' : 'slide-out-documents'}`}>
                    {showModalUpload && (
                      <div className="modal-overlay-upload" onClick={handleCloseModalUpload}>
                        <div className="modal-content-upload fade-in-upload" onClick={(e) => e.stopPropagation()}>
                          <h3>Selecione o Tipo de Arquivo</h3>
                          <button onClick={() => handleOptionClick('Fotos e Vídeos')}>
                            <Icon icon="ic:baseline-add-to-photos" className="icon" />
                            <p>Fotos e Vídeos</p>
                          </button>
                          <button onClick={() => handleOptionClick('Documentos')}>
                            <Icon icon="mingcute:document-2-fill" className="icon" />
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
                    className="conversation-form-input"
                    placeholder="Digite uma mensagem..."
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                  />


                </div>
                <button type="button" className="conversation-form-button conversation-form-submit" onClick={handleSendMessage}>
                  <Icon icon="fluent:send-28-filled" className="icon" />
                </button>
              </div>

              {loading && (
                <div className="loading-overlay-upload">
                  <div className="loading-container-upload">
                    <div className="progress-percentage">{progress}%</div>
                    <Icon icon="eos-icons:three-dots-loading" width="24" height="24" className="icon" />
                  </div>
                </div>
              )}
              {newContentVisible && (
                <div className="new-content-chat">
                  <img src={ChatImg} />
                  <h1>Utilize nosso Chat para se comunicar com seus </h1>
                  <h1>companheiros</h1>
                  <button onClick={handleModalToggle}>
                    Adicionar Novo Contato
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ForwardModal
        isOpen={isForwardModalOpen}
        onClose={closeForwardModal}
        contacts={contacts}
        isExiting={isExiting}
        forwardedMessage={forwardedMessage}
        onForward={handleSendForwardedMessages}
        setSelectedContact={setSelectedContact} // Passar como prop
        handleMessageClick={handleMessageClick} // Passe aqui
      />

      {isEditModalVisible && (
        <EditMessageModal isVisible={isEditModalVisible} onClose={() => setEditModalVisible(false)} message={messageToEdit} onSubmit={handleEditMessageSubmit} />
      )}

      {isModalVisible && (
        <NewContactModal onClose={handleModalToggle} isModalVisible={isModalVisible} />
      )}

      <ModalGroup isOpen={isModalGroupOpen} onClose={handleModalGroupToggle} />

      <ScreenWarning />
    </body>
  );
};

export default ChatJs;