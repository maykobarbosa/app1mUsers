# Histórico de Versionamento

Este arquivo segue o padrão **Semantic Versioning (SemVer)**: MAJOR.MINOR.PATCH.

---

## [1.4.0] - 2026-02-19
### Tipo
- Minor

### Alterações
- Pipeline de deploy: GitHub Actions (build, push para GHCR, deploy na VPS via SSH + Docker Compose); health check pós-deploy; secrets VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_APP_DIR, VPS_HEALTH_URL
- Health check: endpoint GET /health com @nestjs/terminus (Prisma + Redis); utilizado pelo pipeline e load balancer
- Métricas: endpoint GET /metrics (Prometheus); @willsoto/nestjs-prometheus; serviço Prometheus no Docker (docker/prometheus/prometheus.yml)
- Monitoring: Grafana no Docker (porta 3001); datasource Prometheus provisionado; dashboard "API Overview" (memória, CPU)
- Logging: logging estruturado com nestjs-pino (JSON em produção, pino-pretty em desenvolvimento); variável LOG_LEVEL
- docker-compose.prod.yml para deploy em produção (imagem GHCR; IMAGE_FULL); script opcional scripts/deploy-vps.sh
- Documentação: README com seção Deploy (secrets, pré-requisitos VPS) e variáveis de ambiente atualizadas

---

## [1.3.0] - 2025-02-19
### Tipo
- Minor

### Alterações
- Load balancer (Nginx) como ponto único de entrada da API
- API escalável com múltiplas réplicas: `docker compose up -d --scale api=N`
- Acesso à API via http://localhost:80 (porta do load balancer); porta 3000 da API não exposta no host
- Configuração Nginx em docker/nginx/nginx.conf (upstream api:3000, proxy_pass, headers X-Real-IP, X-Forwarded-*)

---

## [1.2.0] - 2025-02-19
### Tipo
- Minor

### Alterações
- Camada de cache entre API e banco de dados (padrão cache-aside)
- Redis como armazenamento de cache (Docker, healthcheck)
- Integração com @nestjs/cache-manager e cache-manager-redis-yet
- Perfil do usuário (GET /auth/profile) consultado no cache antes do banco; em caso de miss, busca no DB, grava no cache com TTL configurável (CACHE_TTL_SECONDS) e retorna
- Variáveis de ambiente: REDIS_HOST, REDIS_PORT, CACHE_TTL_SECONDS

---

## [1.1.0] - 2025-02-19
### Tipo
- Minor

### Alterações
- Escalonamento horizontal do banco: arquitetura Master-Slave (1 master para writes + 3 réplicas para reads)
- Replicação streaming PostgreSQL no Docker (postgres-master, postgres-replica-1/2/3)
- Integração com @prisma/extension-read-replicas para roteamento automático de leituras nas réplicas e escritas no master
- Leitura no primary no registro para checagem de email duplicado (consistência read-after-write)
