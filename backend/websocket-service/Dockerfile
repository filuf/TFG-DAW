FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

COPY .env ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/.env ./

RUN npm install --omit=dev --frozen-lockfile

EXPOSE 3000

CMD [ "node", "dist/main" ]

