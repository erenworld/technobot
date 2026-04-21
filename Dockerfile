FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY src/db ./src/db
RUN npm ci --omit=dev --legacy-peer-deps
RUN npm run prisma:generate
COPY --from=base /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
