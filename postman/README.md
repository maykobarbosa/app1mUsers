# Postman – API Login app1mUsers

## Importar no Postman

1. Abra o Postman.
2. **Import** → **Upload Files** (ou arraste o arquivo).
3. Selecione: `API Login - app1mUsers.postman_collection.json`.

## Variáveis da collection

| Variável       | Valor padrão           | Uso |
|----------------|------------------------|-----|
| `baseUrl`      | `http://localhost:3000` | URL base da API. Altere se rodar em outra porta/host. |
| `access_token` | (vazio)                | Preenchido automaticamente após **Login**. |

## Ordem sugerida para testar

1. **Register** – Cria um usuário (ajuste email/senha no body se quiser).
2. **Login** – Faz login com o mesmo email/senha. O token é salvo automaticamente.
3. **Get Profile** – Usa o token salvo e retorna o perfil do usuário.

Se a API estiver em outra URL, edite a variável `baseUrl` na collection (clique na collection → **Variables**).
