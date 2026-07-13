import { apiRequest } from '../../../common/services/api-client.js'

export function login(credentials) {
  return apiRequest('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function register(payload) {
  return apiRequest('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
