# RapidoCourier Frontend

Frontend en React para gestionar clientes, envios, categorias y rastreo de paquetes del sistema RapidoCourier.

## Stack

| Tecnologia | Uso |
|---|---|
| React 19 | Interfaz de usuario |
| Vite | Desarrollo y build |
| React Router | Rutas publicas y protegidas |
| Tailwind CSS | Estilos |
| SweetAlert2 | Alertas de acciones |
| Oxlint | Lint |

## Requisitos

- Node.js compatible con Vite 8.
- Yarn.
- Backend RapidoCourier levantado en `http://localhost:8080`.

## Instalacion

```bash
yarn install
```

## Configuracion

El proyecto usa `.env` con:

```env
VITE_API_BASE_URL=/api
```

En desarrollo, Vite proxya `/api` hacia el gateway del backend:

```js
server: {
  proxy: {
    '/api': 'http://localhost:8080',
  },
}
```

Por eso las llamadas salen como `/api/v1/...` desde el navegador.

## Scripts

```bash
yarn dev      # Levanta Vite en modo desarrollo
yarn build    # Genera build de produccion en dist/
yarn lint     # Ejecuta oxlint
yarn preview  # Sirve el build localmente
```

`dist/` es salida generada y esta ignorada por git.

## Rutas

| Ruta | Acceso | Descripcion |
|---|---|---|
| `/login` | Publico | Inicio de sesion |
| `/register` | Publico | Registro de usuario |
| `/clientes` | ADMIN, OPERADOR | Gestion de clientes |
| `/paquetes` | ADMIN, OPERADOR | Gestion de envios |
| `/paquetes/:id` | ADMIN, OPERADOR | Detalle, estado, historial y categorias del envio |
| `/categorias` | ADMIN, OPERADOR | Gestion de categorias |
| `/rastreo` | CLIENTE | Rastreo por codigo y cambios de estado |

El rol `CLIENTE` no ve `Clientes` ni `Envios`; solo ve `Rastreo`.

## Funcionalidad Por Rol

| Rol | Funciones |
|---|---|
| ADMIN | Crear, editar, consultar y eliminar donde aplique |
| OPERADOR | Crear, editar y consultar |
| CLIENTE | Rastrear envio por codigo |

La sesion se guarda en `localStorage` con la clave `rapidocourier.session` y el token JWT se envia como `Authorization: Bearer <token>`.

## Funcionalidades Implementadas

- Login real contra `POST /api/v1/auth/login`.
- Registro contra `POST /api/v1/auth/register`.
- Sidebar por rol.
- Clientes con busqueda por DNI, creacion, edicion y eliminacion mediante modales.
- Envios con filtros, creacion, edicion y eliminacion mediante modales.
- Detalle de envio con cambio de estado, historial y asignacion de categorias.
- Rastreo para clientes usando `GET /api/v1/paquetes?busqueda=<codigo>`.
- Vista de cambios de estado desde rastreo usando `GET /api/v1/paquetes/{id}/historial`.

## Endpoints Consumidos

| Metodo | Endpoint | Uso |
|---|---|---|
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/register` | Registro |
| GET | `/api/v1/clientes` | Listar clientes |
| GET | `/api/v1/clientes/dni/{dni}` | Buscar cliente por DNI |
| POST | `/api/v1/clientes` | Crear cliente |
| PUT | `/api/v1/clientes/{id}` | Editar cliente |
| DELETE | `/api/v1/clientes/{id}` | Eliminar cliente |
| GET | `/api/v1/paquetes` | Listar o buscar envios |
| GET | `/api/v1/paquetes/{id}` | Detalle de envio |
| POST | `/api/v1/paquetes` | Crear envio |
| PUT | `/api/v1/paquetes/{id}` | Editar envio |
| DELETE | `/api/v1/paquetes/{id}` | Eliminar envio |
| GET | `/api/v1/paquetes/{id}/historial` | Historial de estados |
| PATCH | `/api/v1/paquetes/{id}/estado` | Cambiar estado |
| POST | `/api/v1/paquetes/{id}/categorias/{categoriaId}` | Asignar categoria |
| GET | `/api/v1/categorias` | Listar categorias |
| POST | `/api/v1/categorias` | Crear categoria |

## Estructura

```text
src/
  app/                 # Wrappers de rutas
  common/
    components/        # Componentes reutilizables
    hooks/             # Hooks compartidos
    layouts/           # Layout autenticado
    security/          # Proteccion de rutas y permisos
    services/          # Cliente HTTP base
    store/             # AuthContext
    styles/            # Estilos globales
  features/
    auth/              # Login y registro
    categorias/        # Categorias
    clientes/          # Clientes
    paquetes/          # Envios y detalle
    rastreo/           # Rastreo de cliente
  router/              # Definicion de rutas
```

## Flujo De Uso

1. Levantar backend en `http://localhost:8080`.
2. Instalar dependencias con `yarn install`.
3. Ejecutar `yarn dev`.
4. Ingresar por `/login`.
5. Segun el rol, el sistema redirige a `/clientes` o `/rastreo`.

## Verificacion

Antes de entregar cambios ejecutar:

```bash
yarn lint
yarn build
```
