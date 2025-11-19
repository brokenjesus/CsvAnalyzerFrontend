# Этап сборки
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build -- --configuration=production

# Этап запуска
FROM nginx:alpine

# Копирование собранного приложения
COPY --from=build /app/dist/csv-analyzer-frontend /usr/share/nginx/html

# Замена всей конфигурации nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
