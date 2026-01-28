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


Exemplo: GET /v1/health, POST /v1/tracks

Convenção de Respostas (2026)
✅ Sucesso

O status HTTP indica o resultado

O corpo retorna apenas os dados

Não confiar em mensagens de texto para lógica no frontend

{
  "data": {}
}


Exemplos:

200 OK

201 Created

204 No Content

❌ Erro

Formato padronizado para todos os erros:

{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}


code → usado pelo frontend (ex: UNAUTHORIZED, VALIDATION_ERROR)

message → debug / logs / UX

details → opcional (ex: erros de validação por campo)

Status HTTP corretos continuam sendo obrigatórios:

400 validação

401 não autenticado

403 sem permissão

404 não encontrado

409 conflito

500 erro inesperado



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


5. Banco de Dados

Adicionar PRISMA

## 🗄️ Database (Prisma)

### Setup Inicial

```bash
# 1. Copiar .env.example para .env
cp .env.example .env

# 2. Subir banco de dados PostgreSQL com Docker
docker-compose up -d

# 3. Gerar Prisma Client
yarn prisma:generate

# 4. Criar e aplicar migrations
yarn prisma:migrate

# 5. (Opcional) Abrir Prisma Studio
yarn prisma:studio
```

### Configuração Manual (sem Docker)

Se preferir instalar PostgreSQL manualmente:

1. Instale PostgreSQL na sua máquina
2. Crie um banco de dados chamado `audiofy`
3. Atualize `DATABASE_URL` no `.env` com suas credenciais
4. Execute `yarn prisma:generate` e `yarn prisma:migrate`

### Scripts do Prisma

- `yarn prisma:generate` - Gera o Prisma Client
- `yarn prisma:migrate` - Cria e aplica migrations
- `yarn prisma:studio` - Abre interface visual do banco
- `yarn prisma:seed` - Executa seed do banco

### Uso no Código

```typescript
import { PrismaService } from './database/prisma.service';

@Injectable()
export class MyService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }
}
```

O `PrismaService` está disponível globalmente (módulo marcado como `@Global()`), então você pode injetá-lo em qualquer service sem precisar importar o `PrismaModule`.

