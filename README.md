# Sistema de Agendamento Manicure

Sistema completo para gestão de manicure com App do Cliente (PWA-like) e Painel Administrativo.

## Instalação e Execução

### Pré-requisitos
- Node.js instalado.

### Passo a Passo

1.  Navegue até a pasta do projeto:
    ```bash
    cd project
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Inicie o servidor:
    ```bash
    npm start
    ```
    Ou para desenvolvimento (com restart automático se tiver nodemon):
    ```bash
    node server.js
    ```

4.  Acesse:
    -   **Cliente/App**: http://localhost:3000/client
    -   **Painel Admin**: http://localhost:3000/admin

## Tecnologias

-   **Backend**: Node.js, Express
-   **Database**: SQLite
-   **Frontend**: HTML5, CSS3, Vanilla JS
-   **Auth**: JWT, Bcrypt

## Estrutura

-   `/client`: Aplicação web para clientes agendarem serviços.
-   `/admin`: Painel para gestão de agendamentos e serviços.
-   `/server`: Código do backend e API.
-   `/server/db`: Banco de dados SQLite.

## Funcionalidades

-   Agendamento de serviços.
-   Quiz de recomendação.
-   Dashboard do usuário.
-   Gestão completa pelo Admin (Aceitar/Recusar agendamentos).
-   Notificações em tempo real (Simulado/Polling).
