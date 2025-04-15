import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import defaultPhoto from '../img/unnamed.svg';
import eyeOpen from '../../src/img/eyeOpen.jpeg';
import eyeClosed from '../../src/img/eyeClosed.jpeg';
import { Icon } from "@iconify/react";
import { getDatabase, ref, get, set } from "firebase/database";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { useAuth } from '../contexts/authContext';

function EditProfileModal({ updateProfile, onClose }) {
  const { currentUser } = useAuth(); // Pega o usuário logado do contexto
  const [formData, setFormData] = useState({
    fullName: '',
    job: '',
    email: '',
    currentPassword: '',
    newPassword: '', // Novo campo para nova senha
    photo: defaultPhoto,
  });
  const [profilePhoto, setProfilePhoto] = useState(defaultPhoto);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false); // Para a visibilidade da nova senha
  const [loading, setLoading] = useState(true); // Novo estado para controlar o carregamento
  const modalRef = useRef();

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Busca as informações do usuário logado no Realtime Database quando o modal abre
    if (currentUser) {
      const fetchUserData = async () => {
        setLoading(true); // Inicia o carregamento
        try {
          const db = getDatabase();
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setFormData({
              fullName: userData.fullName || '',
              job: userData.job || '',
              email: userData.email || '',
              currentPassword: '',
              newPassword: '',
              photo: userData.photo || defaultPhoto,
            });
            setProfilePhoto(userData.photo || defaultPhoto);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setErrorMessage("Erro ao carregar os dados do perfil.");
        } finally {
          setLoading(false); // Finaliza o carregamento
        }
      };
      fetchUserData();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.job || !formData.email) {
      setErrorMessage("Por favor, preencha todos os campos.");
      setSuccessMessage("");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      // Atualiza a senha apenas se a nova senha for fornecida
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setErrorMessage("Por favor, informe sua senha atual para alterar a senha.");
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
        await reauthenticateWithCredential(user, credential);
        console.log("Reautenticação bem-sucedida");

        await updatePassword(user, formData.newPassword);
        console.log("Senha atualizada com sucesso no Authentication.");
      }

      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);

      const snapshot = await get(userRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};

      const updatedData = { ...currentData };

      if (formData.fullName !== currentData.fullName) updatedData.fullName = formData.fullName;
      if (formData.job !== currentData.job) updatedData.job = formData.job;
      if (formData.email !== currentData.email) updatedData.email = formData.email;
      if (formData.photo !== currentData.photo) updatedData.photo = formData.photo;

      if (Object.keys(updatedData).length > 0) {
        await set(userRef, updatedData);
        console.log("Dados de perfil atualizados com sucesso.");
      }

      setSuccessMessage("Perfil atualizado com sucesso!");
      setErrorMessage("");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Erro na atualização de perfil:", error);
      if (error.code === 'auth/requires-recent-login') {
        setErrorMessage("Você precisa se reautenticar para alterar a senha.");
      } else if (error.code === 'auth/invalid-credential') {
        setErrorMessage("Credenciais inválidas. Verifique a senha atual.");
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage("A nova senha precisa ter no mínimo 6 caracteres.");
      } else {
        setErrorMessage("Ocorreu um erro ao atualizar os dados.");
      }
    }
  };
  
  return (
    <div className="editprofile-modal-overlay">
      
      <div className="profile-edit" ref={modalRef}>
      {loading && (
        <div className="loading-overlay">
          <Icon icon="svg-spinners:ring-resize" className="loading-icon" />
        </div>
      )}
        <h2>
          <span style={{ color: '#000000', fontSize: '25px' }}>Editar</span>{' '}
          <span style={{ color: '#ff0000', fontSize: '25px' }}>Perfil</span>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="profile-picture">
            <label htmlFor="photoUpload" className="photo-upload-label">
              <img className="profile-img-editProf" src={profilePhoto} alt="foto de perfil" />
              <span className="camera-icon">
                <Icon icon="f7:camera" style={{ color: "white", fontSize: "30px" }} />
              </span>
            </label>
            <input
              type="file"
              id="photoUpload"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
          <label className="label">Nome Completo</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="input"
          />
          <label className="label">Cargo</label>
          <input
            type="text"
            name="job"
            value={formData.job}
            onChange={handleChange}
            className="input disabled-input"
            readOnly // Isso torna o campo somente leitura
            style={{
              backgroundColor: '#f0f0f0', // Cor de fundo cinza para indicar que está desabilitado
            }}
          />
          <label className="label">E-Mail Educacional</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
          />
          <label className="label">Senha Atual</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="input"
            />
            <img
              src={showPassword ? eyeOpen : eyeClosed}
              alt="toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            />
          </div>

          <label className="label">Nova Senha (opcional)</label>
          <div className="password-container">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="input"
            />
            <img
              src={showNewPassword ? eyeOpen : eyeClosed}
              alt="toggle new password visibility"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="password-toggle"
            />
          </div>

          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
          <div className="buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              Finalizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
