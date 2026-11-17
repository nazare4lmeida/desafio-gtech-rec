// Função serverless da Vercel: entrega todas as rotas /api/* ao app Express.
// O app fica em ./_server (cópia de server/src, ajustada para rodar na Vercel).
import app from "./_server/index.js";

export default app;
