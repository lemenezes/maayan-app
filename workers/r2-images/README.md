# Maayan R2 Images Worker

Worker Cloudflare para upload e delete de imagens no bucket R2 `maayan-listings`.

## Rotas

- `POST /upload`
  - Header: `x-upload-secret`
  - Body `FormData`:
    - `file`
    - `listingId`
  - Resposta: `{ "url": "...", "key": "..." }`

- `DELETE /delete`
  - Header: `x-upload-secret`
  - Body JSON:
    - `{ "url": "..." }` ou `{ "key": "..." }`
  - Apenas paths iniciando com `listings/` podem ser deletados.

## Configuracao

1. Configure o segredo:

```bash
cd workers/r2-images
npx wrangler secret put UPLOAD_SECRET
```

2. Ajuste variaveis em `wrangler.toml` se necessario:

- `APP_ORIGIN`
- `CDN_PUBLIC_URL`

3. Deploy:

```bash
cd workers/r2-images
npx wrangler deploy
```
