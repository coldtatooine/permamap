# Dockerfile para Permamap Frontend
# Multi-stage build para otimização de tamanho e segurança

# ========================================
# STAGE 1: Build Stage
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Variáveis de ambiente da aplicação
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG NODE_ENV

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV NODE_ENV=${NODE_ENV}
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV CI=true

# Dependências do sistema
RUN apk add --no-cache libc6-compat git

# pnpm via Corepack (versão pinada em package.json#packageManager)
RUN corepack enable

# Manifests primeiro — cache de dependências
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/ui/package.json ./packages/ui/
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

# Código fonte
COPY packages/ ./packages/
COPY frontend/ ./frontend/

# Build de produção
ENV NODE_ENV=production

RUN echo "Iniciando build de produção..." && \
    pnpm --filter frontend build && \
    echo "Build concluído com sucesso"

# ========================================
# STAGE 2: Production Stage
# ========================================
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Criar usuário não-root para nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user

# Configurar permissões
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

USER nginx-user

CMD ["nginx", "-g", "daemon off;"]
