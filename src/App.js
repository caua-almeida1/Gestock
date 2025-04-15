import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/authContext";

import Login from "./pages/login/login";
import RecuperarSenha from "./pages/login/recuperarSenha"
import Modulos from "../src/pages/master/modulos/modulos";
import Upload from "../src/pages/master/upload/upload";
import Register from "../src/pages/master/masterregister/masterresgister";
import Home from "./components/home";
import VizuEmpresa from "../src/pages/master/viewempresa/vizualizarempresa";
import Meucalendario from "../src/pages/master/meucalendario/meucalendario";
import VisaoGeral from "../src/pages/master/visaogeral/visaogeral";
import ChatJs from "../src/pages/master/chat/chat";
import VizuUsuario from "../src/pages/master/viewusuario/visualizarusuario";
import MasterRegister from "../src/pages/master/masterregister/masterresgister";
import Dashboard from "../src/pages/master/dashboard/dashboard";
import MessagesScreen from "../src/pages/master/message(teste)/message";
import CalendarProduction from "../src/pages/master/meucalendario/meucalendario";
import SendDatabaseGroup from "../src/pages/send-database-group/index";

import EditCompany from "../src/pages/ADM/EditCompany/index";
import AddCargo from "../src/pages/rh/adicionarCargo/index";
import ListarCargos from "../src/pages/rh/listarCargos";
import DetalhesCargo from "../src/pages/rh/detalhesCargo";
import CalendarProductionADM from "../src/pages/ADM/calendarioADM/calendar";
import ListarFuncionarios from "../src/pages/rh/listarFuncionarios";
import EditarFuncionarios from "../src/pages/rh/editarFuncionarios";
import DadosPessoais from "../src/pages/rh/dadosPessoais";
import Recrutamento from "../src/pages/rh/recrutamento";
import Exames from "../src/pages/rh/exames";
import Beneficios from "../src/pages/rh/beneficios";
import Ferias from "../src/pages/rh/ferias";
import DashboardADM from "./pages/ADM/dashboard";

import Homologacao from "./pages/LOG/homologacao";
import Certificados from "./pages/LOG/certificados";
import DadosProdutos1 from "./pages/LOG/dadosProdutos/PrimeiraParte";
import DadosProdutos2 from "./pages/LOG/dadosProdutos/SegundaParte";
import DadosFornecedores from "./pages/LOG/dadosFornecedores";
import Estocagem from "./pages/LOG/estocagem";

import Estoque from "./pages/LOG/logProducts/produto-estoque"
import ProdutoFinal from "./pages/LOG/logProducts/produto-final";
import ProductsLog from "../src/pages/master/viewusuario/visualizarusuario";
import CotacaoFornecedores from "./pages/LOG/cotacao";

function AppRoutes() {
  const { userLoggedIn } = useAuth();

  const routesArray = [
    {
      path: "*",
      element: userLoggedIn ? <Navigate to="/dashboard" /> : <Login />,
    },
    {
      path: "/recuperar-senha",
      element: <RecuperarSenha />,
    },
    {
      path: "/dashboard",
      element: userLoggedIn ? <Dashboard /> : <Navigate to="/login" />,
    },
    {
      path: "/dashboardADM",
      element: userLoggedIn ? <DashboardADM /> : <Navigate to="/login" />,
    },
    {
      path: "/chat",
      element: userLoggedIn ? <ChatJs /> : <Navigate to="/login" />,
    },
    {
      path: "/masterregister",
      element: userLoggedIn ? <MasterRegister /> : <Navigate to="/login" />,
    },
    {
      path: "/visuario",
      element: userLoggedIn ? <VizuUsuario /> : <Navigate to="/login" />,
    },
    {
      path: "/vizuempresa",
      element: userLoggedIn ? <VizuEmpresa /> : <Navigate to="/login" />,
    },
    {
      path: "/visaogeral",
      element: userLoggedIn ? <VisaoGeral /> : <Navigate to="/login" />,
    },
    {
      path: "/upload",
      element: userLoggedIn ? <Upload /> : <Navigate to="/login" />,
    },
    {
      path: "/modulos",
      element: userLoggedIn ? <Modulos /> : <Navigate to="/login" />,
    },
    {
      path: "/meucalendario",
      element: userLoggedIn ? <Meucalendario /> : <Navigate to="/login" />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: userLoggedIn ? <Home /> : <Navigate to="/login" />,
    },
    {
      path: "/message",
      element: userLoggedIn ? <MessagesScreen /> : <Navigate to="/login" />,
    },
    {
      path: "/calendar",
      element: userLoggedIn ? <CalendarProductionADM /> : <Navigate to="/login" />,
    },
    {
      path: "/send-database-group",
      element: userLoggedIn ? <SendDatabaseGroup /> : <Navigate to="/login" />,
    },
    {
      path: "/editcompany",
      element: userLoggedIn ? <EditCompany /> : <Navigate to="/login" />,
    },
    {
      path: "/addCargo",
      element: userLoggedIn ? <AddCargo /> : <Navigate to="/login" />,
    },
    {
      path: "/listarCargos",
      element: userLoggedIn ? <ListarCargos /> : <Navigate to="/login" />,
    },
    {
      path: "/detalhesCargo",
      element: userLoggedIn ? <DetalhesCargo /> : <Navigate to="/login" />,
    },
    {
      path: "/editarFuncionarios",
      element: userLoggedIn ? <EditarFuncionarios /> : <Navigate to="/login" />,
    },
    {
      path: "/listarFuncionarios",
      element: userLoggedIn ? <ListarFuncionarios /> : <Navigate to="/login" />,
    },
    {
      path: "/dadosPessoais",
      element: userLoggedIn ? <DadosPessoais /> : <Navigate to="/login" />,
    },
    {
      path: "/recrutamento",
      element: userLoggedIn ? <Recrutamento /> : <Navigate to="/login" />,
    },
    {
      path: "/exames",
      element: userLoggedIn ? <Exames /> : <Navigate to="/login" />,
    },
    {
      path: "/beneficios",
      element: userLoggedIn ? <Beneficios /> : <Navigate to="/login" />,
    },
    {
      path: "/ferias",
      element: userLoggedIn ? <Ferias /> : <Navigate to="/login" />,
    },
    {
      path: "/dadosFornecedores",
      element: <DadosFornecedores />,
    },
    {
      path: "/homologacao",
      element: <Homologacao />,
    },
    {
      path: "/certificados",
      element: <Certificados />,
    },
    {
      path: "/dadosProdutos1",
      element: <DadosProdutos1 />,
    },
    {
      path: "/dadosProdutos2",
      element: <DadosProdutos2 />,
    },
    {
      path: "/estocagem",
      element: <Estocagem />,
    },
    {
      path: "/products-estoque",
      element: <Estoque/>,
    },
    {
      path: "/products-final",
      element: <ProdutoFinal/>,
    },
    {
      path: "/dados-fornecedores",
      element: <DadosFornecedores/>,
    },

    {
      path: "/cotacao-fornecedores",
      element: <CotacaoFornecedores/>,
    },
  ];

  return useRoutes(routesArray);
}

function App() {
  return (
    <AuthProvider>
      <div className="w-full h-screen flex flex-col">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
