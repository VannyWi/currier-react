export const writeRoles = ['ADMIN', 'OPERADOR']

export function canWrite(role) {
  return writeRoles.includes(role)
}

export function canDelete(role) {
  return role === 'ADMIN'
}
