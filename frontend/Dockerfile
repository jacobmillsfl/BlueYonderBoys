# syntax=docker/dockerfile:1
FROM node:20-alpine AS build

WORKDIR /app

# Do not use npm ci --omit=dev here — vite must be present to run the build.
# NODE_ENV=development ensures devDependencies install (avoid deprecated npm "production" config).
ENV NODE_ENV=development
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.26-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R a+rX /usr/share/nginx/html
