# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies from the lockfile before copying the rest of the source.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Same-origin deployments use a relative path such as /api/v1.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
