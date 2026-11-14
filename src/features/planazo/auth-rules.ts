export function validPassword(password: string) { return password.length >= 8; }
export function authMessage(message: string) {
  if (/invalid login credentials/i.test(message)) return 'El email o la contraseña no son correctos.';
  if (/email not confirmed/i.test(message)) return 'Confirma tu email antes de entrar.';
  if (/rate limit|too many requests/i.test(message)) return 'Demasiados intentos. Espera unos minutos y vuelve a probar.';
  return 'No se pudo completar la solicitud. Revisa los datos o inténtalo más tarde.';
}