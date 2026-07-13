import { apiRequest, toQueryString } from '../../../common/services/api-client.js'

export function getPaquetes(filters = {}) {
  const query = toQueryString(filters)
  return apiRequest(`/v1/paquetes${query ? `?${query}` : ''}`)
}

export function getPaquete(id) {
  return apiRequest(`/v1/paquetes/${id}`)
}

export function createPaquete(payload) {
  return apiRequest('/v1/paquetes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePaquete(id, payload) {
  return apiRequest(`/v1/paquetes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deletePaquete(id) {
  return apiRequest(`/v1/paquetes/${id}`, { method: 'DELETE' })
}

export function getHistorialPaquete(id) {
  return apiRequest(`/v1/paquetes/${id}/historial`)
}

export function updateEstadoPaquete(id, payload) {
  return apiRequest(`/v1/paquetes/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function assignCategoria(id, categoriaId) {
  return apiRequest(`/v1/paquetes/${id}/categorias/${categoriaId}`, { method: 'POST' })
}
