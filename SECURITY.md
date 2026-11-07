# Política de Seguridad (Security Policy)

## Reglas de Seguridad de XtremGen (XG)

1. **Protección de Credenciales y Tokens**:
   - Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` ni tokens personales (`GITHUB_PERSONAL_ACCESS_TOKEN`) en el frontend ni en el historial de Git.
   - En Next.js, cualquier variable con prefijo `NEXT_PUBLIC_` se envía al navegador: utilízalo únicamente para `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

2. **Seguridad en Base de Datos (Supabase RLS)**:
   - Todas las tablas en el esquema `public` deben tener **Row Level Security (RLS)** habilitado (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
   - Las políticas de autorización nunca deben basarse en `user_metadata` editable por el usuario; deben validar `(select auth.uid()) = user_id` junto con la cláusula `TO authenticated`.

## Reporte de Vulnerabilidades

Si descubres una vulnerabilidad de seguridad en este repositorio, por favor **no abras un Issue público**. Envía un reporte detallado a [javierbrega@gmail.com](mailto:javierbrega@gmail.com) para coordinar su resolución.
