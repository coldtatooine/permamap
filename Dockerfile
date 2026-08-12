# Dockerfile para Permamap Frontend
# Multi-stage build para otimização de tamanho e segurança

# ========================================
# STAGE 1: Build Stage
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}/bin:${PATH}"
ENV CI=true
# tsc + vite precisam de devDependencies. Nao herdar NODE_ENV=production do EasyPanel.
ENV NODE_ENV=development

RUN apk add --no-cache libc6-compat git

# Corepack do Node 20 alpine e antigo (Cannot find matching keyid)
RUN npm install -g corepack@latest \
    && corepack enable \
    && corepack prepare pnpm@11.20.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/ui/package.json ./packages/ui/
COPY frontend/package.json ./frontend/

# --filter pula supabase CLI (root) — nao e necessario para o bundle do frontend
RUN pnpm install --frozen-lockfile --filter frontend --filter @permamap/ui

COPY packages/ ./packages/
COPY frontend/ ./frontend/

ENV NODE_ENV=production

RUN echo "Iniciando build de produção..." && \
    pnpm --filter frontend build && \
    echo "Build concluído com sucesso"

# ========================================
# STAGE 2: Production Stage
# ========================================
FROM nginx:alpine AS production

RUN apk add --no-cache curl

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user

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
