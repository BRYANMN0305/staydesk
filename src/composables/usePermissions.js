// composables/usePermissions.js
// Tarea 7 — Composable usePermissions()
// Lee los permisos directamente del JWT (ya vienen en el token)

import { computed } from 'vue'

/**
 * Decodifica el payload del JWT sin librerías externas
 */
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

/**
 * Obtiene los permisos del usuario desde el token guardado en localStorage
 * Estructura del JWT:
 * {
 *   id_usuario, nombre, apellido, id_rol, nombre_rol,
 *   permisos: [{ modulo: "RESERVAS", accion: "VER" }, ...]
 * }
 */
function getPayload() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (!token) return null
  return parseJwt(token)
}

export function usePermissions() {
  // Payload completo del JWT
  const payload = computed(() => getPayload())

  // Lista de permisos: [{ modulo, accion }]
  const permisos = computed(() => payload.value?.permisos || [])

  // Nombre del rol (ej: "ADMINISTRADOR", "Recepcionista")
  const nombreRol = computed(() => payload.value?.nombre_rol || '')

  // ID del rol
  const idRol = computed(() => payload.value?.id_rol || null)

  // Info del usuario
  const usuario = computed(() => ({
    id: payload.value?.id_usuario,
    nombre: payload.value?.nombre,
    apellido: payload.value?.apellido,
  }))

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} modulo  - Ej: 'RESERVAS', 'USUARIOS', 'HOUSEKEEPING'
   * @param {string} accion  - Ej: 'VER', 'CREAR', 'EDITAR', 'ELIMINAR'
   * @returns {boolean}
   *
   * Uso: can('RESERVAS', 'VER')
   */
  const can = (modulo, accion) => {
    return permisos.value.some(
      p => p.modulo === modulo.toUpperCase() && p.accion === accion.toUpperCase()
    )
  }

  /**
   * Verifica si el usuario puede VER un módulo (caso más común)
   * @param {string} modulo - Ej: 'RESERVAS'
   * Uso: canView('RESERVAS')
   */
  const canView = (modulo) => can(modulo, 'VER')

  /**
   * Verifica si el usuario puede CREAR en un módulo
   */
  const canCreate = (modulo) => can(modulo, 'CREAR')

  /**
   * Verifica si el usuario puede EDITAR en un módulo
   */
  const canEdit = (modulo) => can(modulo, 'EDITAR')

  /**
   * Verifica si el usuario puede ELIMINAR en un módulo
   */
  const canDelete = (modulo) => can(modulo, 'ELIMINAR')

  /**
   * Verifica si el usuario tiene AL MENOS UNO de los permisos dados
   * @param {Array<{modulo, accion}>} lista
   * Uso: canAny([{ modulo: 'RESERVAS', accion: 'VER' }, { modulo: 'DASHBOARD', accion: 'VER' }])
   */
  const canAny = (lista) => lista.some(({ modulo, accion }) => can(modulo, accion))

  /**
   * Verifica si el usuario está autenticado (tiene token válido)
   */
  const isAuthenticated = computed(() => !!payload.value)

  /**
   * Verifica si el token ha expirado
   */
  const isTokenExpired = computed(() => {
    if (!payload.value?.exp) return true
    return Date.now() / 1000 > payload.value.exp
  })

  // ─── Mapeo de tabs/rutas a módulos ───────────────────────────────────────
  // Relaciona cada tab del sidebar con su módulo en el backend
  const TAB_MODULO = {
    dashboard:    'DASHBOARD',
    usuarios:     'USUARIOS',
    pisos:        'PISOS',
    huespedes:    'HUESPEDES',
    habitaciones: 'HABITACIONES',
    reservas:     'RESERVAS',
    servicios:    'RESERVA_SERVICIOS',
    facturas:     'FACTURAS',
    reportes:     'REPORTES',
    housekeeping: 'HOUSEKEEPING',
    mantenimiento:'MANTENIMIENTO',
    configuracion:'CONFIGURACION',
    roles:        'ROLES',
  }

  /**
   * Devuelve true si el usuario puede VER la vista/tab dado
   * @param {string} tab - nombre del tab (ej: 'reservas')
   * Uso: canViewTab('reservas')
   */
  const canViewTab = (tab) => {
    const modulo = TAB_MODULO[tab]
    if (!modulo) return false
    return canView(modulo)
  }

  /**
   * Filtra una lista de items del sidebar y devuelve solo los que el usuario puede ver
   * @param {Array<{ tab: string, ...resto }>} items
   * Uso: filterSidebarItems(allItems)
   */
  const filterSidebarItems = (items) => {
    return items.filter(item => canViewTab(item.tab))
  }

  return {
    // Estado
    payload,
    permisos,
    nombreRol,
    idRol,
    usuario,
    isAuthenticated,
    isTokenExpired,

    // Funciones principales
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canAny,

    // Helpers para el sidebar/router
    canViewTab,
    filterSidebarItems,
    TAB_MODULO,
  }
}