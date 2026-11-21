# Añadir desplegar.yml directamente en GitHub

No hay cambios en el proyecto de Lovable. El fichero lo añades tú en GitHub.

## Pasos en GitHub
1. Abre el repositorio sincronizado y pulsa Add file → Create new file.
2. Nombre: `.github/workflows/desplegar.yml`; pega el contenido exacto del documento.
3. Haz commit en la rama sincronizada (main). El fichero aparecerá también en Lovable.
4. En Settings → Secrets and variables → Actions añade `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.

## Avisos
- Lovable no da soporte a este despliegue; si falla, la web oficial sigue publicándose con Publish.
- El paso `bun run test` necesita un script `test` en package.json; ahora mismo puede no existir y el flujo saldría en rojo.
- No afecta a la web publicada desde Lovable.
