FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm install
COPY server ./server
RUN npm run build -w server

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm install --omit=dev -w server
COPY --from=build /app/server/dist ./server/dist
EXPOSE 3000
CMD ["node", "server/dist/index.js"]
