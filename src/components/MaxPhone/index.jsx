import React, { useState, useEffect } from "react";
import logo from '../../img/logo_gestockpt2.svg';

const ScreenWarning = () => {
  const [isScreenSmall, setIsScreenSmall] = useState(false);

  useEffect(() => {
    // Função para verificar o tamanho da tela
    const checkScreenSize = () => {
      setIsScreenSmall(window.innerWidth < 1024);
    };

    // Verifica o tamanho da tela ao carregar a página
    checkScreenSize();

    // Adiciona listener para verificar mudanças no tamanho da tela
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (isScreenSmall) {
      // Desabilita o scroll quando a tela for menor que 1024px
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden"; // Garante que o scroll seja desativado no body e no html
    } else {
      // Reabilita o scroll quando a tela for maior que 1024px
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto"; // Reativa o scroll no body e no html
    }
  }, [isScreenSmall]);

  if (!isScreenSmall) {
    return null;
  }

  // Estilo para o aviso de tela pequena
  const warningStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw", // Garante que o aviso cubra toda a largura da viewport
    height: "100vh", // Garante que o aviso cubra toda a altura da viewport
    backgroundColor: "#f92b2b",
    color: "white",
    display: "flex",
    flexDirection: "column", // Para alinhar logo e texto verticalmente
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999999, // Garante que o aviso fique acima de todo o conteúdo
    fontSize: "24px",
    textAlign: "center",
    padding: "20px",
  };

  // Estilo para a logo
  const logoStyle = {
    width: "150px", 
    height: "150px",
    marginBottom: "20px", // Espaço entre o logo e o texto
    position: "absolute",
    top: "20px", // Coloca o logo mais próximo do topo
    left: "50%",
    transform: "translateX(-50%)", // Centraliza horizontalmente
  };
  

  return (
    <div style={warningStyle}>
      <div style={logoStyle}>
        <img src={logo} alt="Logo Gestock" />
      </div>
      <p>O GesTock não está disponível neste dispositivo.</p>
    </div>
  );
};

export default ScreenWarning;
