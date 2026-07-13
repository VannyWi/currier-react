import { apiRequest } from '../../../common/services/api-client.js'

export function getCategorias() {
  return apiRequest('/v1/categorias')
}

export function createCategoria(payload) {
  return apiRequest('/v1/categorias', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
