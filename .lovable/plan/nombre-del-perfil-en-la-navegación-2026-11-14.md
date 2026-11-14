# Nombre del perfil en la navegación

## Qué verás
- Con sesión iniciada, el botón "Mi cuenta" de la cabecera pasa a mostrar un círculo con la inicial y el nombre del perfil (p. ej. "Familia de prueba"). Sin nombre, se usa la parte del correo antes de la @.
- Al pulsarlo se abre un menú desplegable con: saludo "Hola, {nombre}", correo, enlaces a Mi cuenta, Mis planes (con cuántos tienes guardados, p. ej. "1 de 3"), Crear plan y Cerrar sesión.
- Sin sesión sigue apareciendo "Entrar".
- Mientras se comprueba la sesión se muestra un hueco neutro, para que no parpadee "Entrar" a quien ya está conectado.
- Si cambias el nombre en Mi cuenta, la cabecera se actualiza al momento.
- En móvil se ve solo el círculo con la inicial; el menú ocupa el ancho cómodo.
- Mis planes y Cuenta muestran "Hola, {nombre}" en su título.
- Al cerrar sesión desde el menú vuelves a la portada con aviso "Sesión cerrada".

## Detalles técnicos
- Contexto Planazo: añadir `profile` (display_name, plan_tier) cargado con useQuery desde `profiles` del usuario (RLS propietario) y `authReady` para evitar el parpadeo; invalidar tras guardar perfil en /cuenta.
- Header: DropdownMenu de shadcn con Avatar; recuento de planes con la consulta existente de listado.
- Estilos con tokens existentes; comprobar en 390px y escritorio que no hay desbordamiento.
- Verificar con la cuenta de prueba en Playwright: nombre visible, menú, cerrar sesión.
