FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json tsconfig.node.json ./
COPY src/ ./src/

RUN npx tsc --noEmit -p tsconfig.node.json

EXPOSE 8787

CMD ["npx", "tsx", "src/server.ts"]
