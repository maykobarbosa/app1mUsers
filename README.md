# app1mUsers

API de autenticação e usuários construída com **escalabilidade em foco**, preparada para suportar **até 1 milhão de usuários**. Utiliza NestJS, Prisma, PostgreSQL, Redis, load balancing e observabilidade para alta disponibilidade e desempenho.

---

## Escalabilidade para 1 milhão de usuários

Esta aplicação foi projetada desde o início para escalar horizontal e verticalmente, com as seguintes decisões de arquitetura:

| Aspecto | Solução |
|--------|---------|
| **API** | Múltiplas réplicas atrás de load balancer (Nginx); escala com `--scale api=N` |
| **Banco de dados** | PostgreSQL com **1 master (writes)** e **3 réplicas (reads)**; leituras distribuídas via Prisma read replicas |
| **Cache** | Redis em cache-aside para perfil de usuário e dados quentes; reduz carga no DB |
| **Observabilidade** | Prometheus (métricas), Grafana (dashboards), logging estruturado (Pino) |
| **Deploy** | Pipeline CI/CD (GitHub Actions), health checks, deploy automatizado em VPS |

Com essa base, a stack suporta crescimento de tráfego e usuários (incluindo a meta de 1M de usuários) através de mais réplicas da API, réplicas adicionais do PostgreSQL e ajuste de recursos (CPU/memória) conforme a demanda.

---

## Stack

- **Runtime:** Node.js  
- **Framework:** NestJS  
- **ORM:** Prisma (PostgreSQL)  
- **Auth:** JWT + Passport (local + JWT strategy)  
- **Cache:** Redis (cache-manager)  
- **Proxy/LB:** Nginx  
- **Métricas:** Prometheus + Grafana  
- **Logs:** Pino (nestjs-pino)  

---

## Pré-requisitos

- Docker e Docker Compose  
- Node.js 18+ (para desenvolvimento local sem Docker)  

---

## Como rodar

### Com Docker (recomendado)

```bash
# Subir todos os serviços (PostgreSQL master + 3 réplicas, Redis, API, Nginx, Prometheus, Grafana)
docker compose up -d

# Escalar a API para 4 instâncias (exemplo para maior throughput)
docker compose up -d --scale api=4
```

- **API (via load balancer):** http://localhost  
- **Grafana:** http://localhost:3001  
- **Prometheus:** http://localhost:9090  

### Desenvolvimento local

```bash
npm install
npm run prisma:generate
# Configure .env (DATABASE_URL, REDIS_HOST, JWT_SECRET, etc.)
npm run prisma:migrate
npm run start:dev
```

---

## Variáveis de ambiente principais

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL do PostgreSQL (master) |
| `REDIS_HOST` / `REDIS_PORT` | Redis para cache |
| `JWT_SECRET` | Chave para assinatura dos tokens JWT |
| `CACHE_TTL_SECONDS` | TTL do cache (ex.: perfil de usuário) |
| `LOG_LEVEL` | Nível de log (ex.: `info`, `debug`) |

Para uso com read replicas, consulte a documentação do Prisma e a configuração de `datasource`/extensions no projeto.

---

## Deploy em produção

O repositório inclui pipeline de deploy (GitHub Actions) que faz build, push da imagem para GHCR e deploy na VPS via SSH + Docker Compose. Configure os secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_APP_DIR`, `VPS_HEALTH_URL`. O health check (`GET /health`) é usado pelo pipeline e pelo load balancer. Para produção, use `docker-compose.prod.yml` e a imagem publicada no registro.

---

## Documentação adicional

- **Versões e mudanças:** [VERSIONAMENTO.md](./VERSIONAMENTO.md) (SemVer).
