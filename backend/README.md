# Audiofy — Backend

Backend do projeto **Audiofy**, responsável por indexação de dados, regras de negócio e exposição de APIs para o frontend.

Este backend segue práticas modernas (2026), com foco em:
- previsibilidade de contratos
- clareza de responsabilidades
- evolução segura da API
- mentalidade BFF (Backend for Frontend)

---

## 🧠 Decisões Arquiteturais

### Tipo de API

- **API Privada**
- Com **mentalidade de BFF (Backend for Frontend)**

A API:
- não é pública
- não precisa manter compatibilidade com terceiros
- pode evoluir junto com o frontend
- é otimizada para o consumo específico do FE

### Versionamento da API

- Versionamento via URL:
```txt
/v1
```

Exemplo: `GET /v1/health`, `POST /v1/tracks`

### Convenção de Respostas (2026)

#### ✅ Sucesso

O status HTTP indica o resultado

O corpo retorna apenas os dados

Não confiar em mensagens de texto para lógica no frontend

```json
{
  "data": {}
}
```

Exemplos:
- `200 OK`
- `201 Created`
- `204 No Content`

#### ❌ Erro

Formato padronizado para todos os erros:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}
```

- `code` → usado pelo frontend (ex: `UNAUTHORIZED`, `VALIDATION_ERROR`)
- `message` → debug / logs / UX
- `details` → opcional (ex: erros de validação por campo)

Status HTTP corretos continuam sendo obrigatórios:
- `400` validação
- `401` não autenticado
- `403` sem permissão
- `404` não encontrado
- `409` conflito
- `500` erro inesperado



## 📋 Roadmap de Implementação

### 1. Setup Inicial

- ✅ Ajustar estrutura definitiva do repositório
- ✅ Configurar @nestjs/config
- ✅ Definir e validar variáveis de ambiente
- ✅ Definir NODE_ENV
- ✅ Scripts: dev, build, start, lint

### 2. Healthcheck

- ✅ Criar HealthModule
- ✅ Endpoint GET /v1/health
- ✅ Retornar status da aplicação

### 3. Tratamento Global de Erros

- ✅ Criar HttpExceptionFilter
- ✅ Padronizar todos os erros no formato definido
- ✅ Tratar exceções inesperadas (500)
- ✅ Log estruturado de erros

### 4. Validação de Requests

- ✅ Configurar ValidationPipe global
- ✅ DTOs com class-validator
- ✅ Retornar erros de validação no formato padrão

### 5. Banco de Dados

- ✅ Adicionar PRISMA
- ✅ Adicionar postgres

### 6. Autenticação JWT

- ✅ Implementar AuthModule com JWT
- ✅ Criar endpoints de login e registro
- ✅ Implementar JwtAuthGuard
- ✅ Decorator @Public() para rotas públicas
- ✅ Configurar guard global
- ✅ Criar UsersModule com Prisma
- ✅ Separar rotas públicas das privadas

## 🔐 Autenticação

### Rotas Públicas

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/health`

### Rotas Privadas

Todas as outras rotas requerem token JWT no header:

```
Authorization: Bearer <token>
```

### Uso no Frontend

```typescript
// Login
const { data } = await api.post('/v1/auth/login', { email, password });
const { access_token, user } = data;

// Requisições autenticadas
api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
```

---

## 🚀 Próximos Passos

### Setup Inicial

1. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite .env com suas credenciais
   ```

2. **Instale as dependências:**
   ```bash
   yarn install
   ```

3. **Criar migration do banco de dados:**
   ```bash
   yarn prisma:migrate
   ```

4. **Gerar Prisma Client:**
   ```bash
   npx prisma generate
   ```

5. **Inicie a aplicação:**
   ```bash
   yarn start:dev
   ```

### Testar Endpoints

```bash
# Health (pública)
curl http://localhost:3000/v1/health

# Registro
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Estado do indexador (requer auth)
curl http://localhost:3000/v1/indexer/state \
  -H "Authorization: Bearer <seu-token>"
```

---

## 🔄 Indexador Blockchain

O backend possui um **indexador automático** que sincroniza eventos da blockchain:

### Como funciona

1. **Cron job** roda a cada 30 segundos
2. Lê `lastBlockProcessed` do banco
3. Busca eventos novos via Alchemy (ethers v6)
4. Processa eventos de forma **idempotente**
5. Atualiza `lastBlockProcessed`

### Princípios

✅ **Determinístico** - mesmos blocos = mesmos eventos  
✅ **Reexecutável** - pode crashar e continuar  
✅ **Sem estado escondido** - tudo no banco  
✅ **Idempotente** - não duplica tracks  
✅ **Tolerante a falhas** - reprocessa blocos em caso de erro

### Configuração

No `.env`:
```env
ALCHEMY_API_KEY=your-alchemy-api-key
CONTRACT_ADDRESS=0x...
CHAIN_ID=11155111  # sepolia
```

### Endpoints

- `GET /v1/indexer/state` - Ver último bloco processado
- `POST /v1/indexer/sync` - Forçar sincronização manual

### Fluxo

```
Blockchain → Indexador → Banco de Dados → API → Frontend
```

O **frontend nunca chama RPC** - tudo vem da API.

---

## ⚠️ Importante

- Configure `JWT_SECRET` no arquivo `.env` com um valor seguro
- Configure `ALCHEMY_API_KEY` com sua chave da Alchemy
- Configure `CONTRACT_ADDRESS` com o endereço do contrato deployado
- Nunca commite o arquivo `.env` (já deve estar no .gitignore)
- Em produção, use variáveis de ambiente do ambiente de deploy
