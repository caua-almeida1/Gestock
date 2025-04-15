import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged, setPersistence, browserSessionPersistence } from "firebase/auth";

export const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configurar persistência da sessão para `sessionStorage`
  useEffect(() => {
    const configurePersistence = async () => {
      try {
        await setPersistence(auth, browserSessionPersistence); // Força o uso de sessionStorage
      } catch (error) {
        console.error("Erro ao configurar a persistência da sessão:", error);
      }
    };
    configurePersistence();
  }, []);

  // Observa mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        initializeUser(user);
      } else {
        // Limpa o estado quando o usuário sai
        setCurrentUser(null);
        setUserLoggedIn(false);
        setIsEmailUser(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Inicializa informações do usuário autenticado
  async function initializeUser(user) {
    setCurrentUser({ ...user });
    setUserLoggedIn(true);

    // Verifica se o provedor é "email e senha"
    const isEmail = user.providerData.some(
      (provider) => provider.providerId === "password"
    );
    setIsEmailUser(isEmail);
  }

  const value = {
    currentUser,
    userLoggedIn,
    isEmailUser,
    setCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
