import { apiRequest } from '../../../common/services/api-client.js'

export function getClientes() {
  return apiRequest('/v1/clientes')
}

export function getCliente(id) {
  return apiRequest(`/v1/clientes/${id}`)
}

export function getClienteByDni(dni) {
  return apiRequest(`/v1/clientes/dni/${dni}`)
}

export function createCliente(payload) {
  return apiRequest('/v1/clientes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCliente(id, payload) {
  return apiRequest(`/v1/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteCliente(id) {
  return apiRequest(`/v1/clientes/${id}`, { method: 'DELETE' })
}
