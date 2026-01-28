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

