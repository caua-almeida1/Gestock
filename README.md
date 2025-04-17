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
- Filtragem por dia, semana ou mês

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
- Gráficos dinâmicos de movimentação de estoque, tarefas e participação
- Filtros por períodos: hoje, semana, mês ou ano
- Análises por hora, dia da semana ou semana do ano

### 👥 Gerenciamento de Usuários
- Cadastro de administradores e estudantes
- Atribuição de permissões
- Histórico de ações

### 🔐 Segurança e Autenticação
- Autenticação por e-mail, telefone, Google, Facebook ou Apple
- Verificação de código por e-mail (EmailJS)
- Proteção de dados com Firebase Auth

---

## 💻 Tecnologias Utilizadas

- **Frontend:** React.js + Tailwind CSS
- **Backend:** Firebase (Firestore, Storage, Authentication)
- **Envio de e-mails:** EmailJS
- **Design UI/UX:** Figma
- **Gráficos:** Recharts
- **Ícones:** Iconify

---

## 📂 Estrutura do Projeto

```bash
/src
 ├── assets/          # Logos, imagens e ícones
 ├── components/      # Componentes reutilizáveis (botões, cards, inputs)
 ├── pages/           # Páginas do sistema (login, dashboard, agenda, chat, etc)
 ├── services/        # Integrações com Firebase e EmailJS
 ├── context/         # Autenticação e estados globais
 └── utils/           # Funções auxiliares e formatações
