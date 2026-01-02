FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar resto do projeto
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Comando padrão (dev server com hot reload)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


