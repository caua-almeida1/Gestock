import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";

const database = getDatabase();

// Função para criar um novo usuário com e-mail e senha
export const doCreateUserWithEmailAndPassword = async (email, password, name, cpf) => {
  try {
    const userCredential = await firebaseCreateUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Dados armazenados no Realtime Database
    await set(ref(database, 'users/' + user.uid), {
      email,
      name,
      cpf
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Função para fazer login com e-mail e senha
export const doSignInWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    throw new Error(error.message); // Exibe a mensagem de erro se algo der errado
  }
};

export const checkUserCredentials = async (email, password) => {
  const userRef = ref(database, 'users'); // Substitua 'users' pelo caminho correto no seu banco de dados

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      // Verifica se o e-mail existe e se a senha corresponde
      for (const key in users) {
        if (users[key].email === email && users[key].password === password) {
          return true; // Credenciais válidas
        }
      }
    }
    return false; // Credenciais inválidas
  } catch (error) {
    console.error("Erro ao verificar credenciais:", error);
    throw new Error("Erro ao verificar credenciais");
  }
};

// Função para fazer login com o Google
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Adicionar usuário ao Firestore (opcional)
};

// Função para sair da sessão
export const doSignOut = () => {
  return auth.signOut();
};

// Função para mudar a senha do usuário atual
export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};
