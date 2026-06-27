# Usar imagem oficial Node.js leve (Alpine)
FROM node:20-alpine

# Criar diretório de trabalho
WORKDIR /app

# Copiar ficheiros de dependências primeiro (cache eficiente)
COPY package*.json ./

# Instalar dependências
RUN npm install --omit=dev

# Copiar o resto do projeto
COPY . .

# Expor a porta (Render usa variável PORT automaticamente)
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
