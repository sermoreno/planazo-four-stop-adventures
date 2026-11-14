export async function requireAdminRole(checkRole: () => Promise<boolean>) {
  if (!(await checkRole())) throw new Error('Acceso restringido a administradores.');
}