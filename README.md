# GesTock

**GesTock** é uma plataforma web desenvolvida para simular o ambiente de trabalho em áreas como **Logística** e **Administração**, auxiliando alunos e professores em atividades práticas, organização de tarefas e gestão de recursos. O projeto foi criado no SENAI com foco na **usabilidade**, **colaboração** e **aprendizado dinâmico**.

---

## 🚀 Funcionalidades

### 📦 Gestão de Estoque
- Cadastro e controle de produtos
- Atualização de quantidades
- Filtros por categoria e status
- Alertas visuais de estoque baixo

### 📅 Agenda Inteligente
- Criação de eventos e tarefas
- Arraste suave no calendário (drag-and-drop)
- Filtragem de eventos

### 🧑‍🏫 Matérias
- Vinculação de tarefas a matérias específicas
- Organização de conteúdos por disciplina
- Suporte para atividades de Logística, Administração e áreas afins

### 🗃️ Envio de Arquivos e Tarefas
- Alunos e professores podem enviar documentos
- Visualização e histórico de envios
- Uploads protegidos e armazenados via Firebase Storage

### 💬 Chat em Tempo Real
- Comunicação entre usuários do sistema
- Suporte a múltiplos tópicos por matéria
- Interface fluida com notificações de novas mensagens

### 📊 Dashboard Interativo
- Alertas dinâmicos de tarefas entregues, cadastros e modificações
- Filtros por períodos: hoje, semana, mês ou ano
- Análises por hora, dia da semana ou semana do ano

### 👥 Gerenciamento de Usuários
- Cadastro de administradores e estudantes
- Atribuição de permissões
- Histórico de ações

### 🔐 Segurança e Autenticação
- Autenticação por e-mail, telefone ou Google
- Verificação de código por e-mail (EmailJS)
- Proteção de dados com Firebase Auth

---

## 💻 Tecnologias Utilizadas

- **Frontend:** React.js + CSS3 + Tailwind CSS
- **Backend:** Firebase (Firestore, Storage, Authentication, Firebase Realtime)
- **Envio de e-mails:** EmailJS, Nodemailer
- **Design UI/UX:** Figma
- **Gráficos:** Recharts
- **Ícones:** Iconify

---

## 💬 Visual Chat

![Chat Screenshot](./chat.png)

## 📊 Visual Dashboard

![Dashboard Screenshot](./dashboard.png)

---

## 🔧 Como Rodar o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/caua-almeida1/Gestock.git
   
2. Acesse o diretório do projeto:
   ```bash
   cd front

3. Instale as dependências:
   ```bash
   npm install

4. Execute o projeto:
   ```bash
   npm start

---

## 💬 Testando a Tela de Chat

1. Após rodar o projeto, abra seu navegador e vá até a tela de chat. Para isso, acesse a URL:
   ```bash
   http://localhost:3000/chat
   
2. Ao acessar a tela de chat, você poderá enviar e receber mensagens em tempo real.
