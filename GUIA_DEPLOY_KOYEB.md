# Passo a Passo: Deploy no Koyeb com Banco TiDB

Este guia vai te ajudar a colocar seu site no ar usando o **Koyeb** (servidor grátis) conectado ao seu banco de dados **TiDB** (banco grátis).

## 1. Preparação (GitHub)
Certifique-se de que seu código atual está atualizado no GitHub.
1. Abra seu terminal (VS Code).
2. Digite:
   ```bash
   git add .
   git commit -m "Preparando para Koyeb"
   git push origin main
   ```
   *(Se der erro dizendo que não tem remoto configurado, me avise).*

## 2. Criar Serviço no Koyeb
1. Acesse **[app.koyeb.com](https://app.koyeb.com)** e faça login.
2. Clique no botão **"Create Web Service"** (ou "Create App").
3. Em **"Import via GitHub"**, selecione o repositório do seu projeto (`agendamentos` ou o nome que você deu).
   - Se pedir permissão para o GitHub, autorize.
4. **Branch:** Deixe como `main` (ou `master`).

## 3. Configurações do Servidor
O Koyeb é inteligente e deve detectar que é um app **Node.js**.
Se precisar preencher manualmente:
- **Builder:** `Standard` ou `Buildpack` (Buildpack é mais automático).
- **Run Command:** Deixe em branco (ele vai usar `npm start` automaticamente) ou digite `npm start`.
- **Instance Size:** Escolha **"Free"** (Nano).

## 4. Conectar o Banco de Dados (Variáveis de Ambiente)
Esta é a parte mais importante. Você precisa "ensinar" o Koyeb a senha do seu banco.

1. Procure a seção **"Environment Variables"** (Variáveis de Ambiente).
2. Clique em **"Add Variable"**.
3. Adicione as seguintes chaves e valores (copie do seu arquivo `.env` local ou pegue no painel do TiDB):

| Chave (Key) | Valor (Value - Exemplo/Onde pegar) |
| :--- | :--- |
| `TIDB_HOST` | `gateway01...tidbcloud.com` (O host longo do TiDB) |
| `TIDB_PORT` | `4000` |
| `TIDB_USER` | `seu_usuario.root` |
| `TIDB_PASSWORD` | `sua_senha_do_tidb` |
| `TIDB_DATABASE` | `agendamentos` (ou `test`) |
| `JWT_SECRET` | Crie uma senha secreta qualquer (ex: `segredo123`) |
| `PORT` | `3000` (Opcional, o Koyeb define sozinho, mas bom garantir) |

4. **Dica:** Não cole aspas (`""`) nos valores. Apenas o texto puro.

## 5. Finalizar Deploy
1. Dê um nome para o serviço (ex: `agendamentos-app`).
2. Clique no botão **"Deploy"**.

## 6. Acompanhar
- Você será levado para uma tela de logs.
- Espere aparecer algo como `Build successful` e depois `Server running on...`.
- Quando a bolinha de status ficar **Verde (Healthy)**, seu site está no ar!
- O link público estará no topo da página (ex: `https://agendamentos-app-seu-nome.koyeb.app`).

---

**Se der erro:**
- Verifique os logs (aba "Runtime Logs").
- Se disser "Connection refused" ou erro de banco, revina se a senha ou host do TiDB nas variáveis de ambiente estão corretos.
