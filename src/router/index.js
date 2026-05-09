import { createRouter, createWebHistory } from 'vue-router'
import Login from '../../pages/Login.vue'
import Dashboard from '../../pages/Dashboard.vue'
import NoAutorizado from '../../pages/NoAutorizado.vue'

function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])) } catch { return null }
}
function getPermisos() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (!token) return []
  return parseJwt(token)?.permisos || []
}
function isTokenExpired() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (!token) return true
  const payload = parseJwt(token)
  if (!payload?.exp) return true
  return Date.now() / 1000 > payload.exp
}
function can(modulo) {
  return getPermisos().some(p => p.modulo === modulo.toUpperCase() && p.accion === 'VER')
}

const VISTA_MODULO = {
  dashboard: 'DASHBOARD', usuarios: 'USUARIOS', pisos: 'PISOS',
  huespedes: 'HUESPEDES', habitaciones: 'HABITACIONES', reservas: 'RESERVAS',
  servicios: 'RESERVA_SERVICIOS', facturas: 'FACTURAS', reportes: 'REPORTES',
  housekeeping: 'HOUSEKEEPING', mantenimiento: 'MANTENIMIENTO',
  configuracion: 'CONFIGURACION', roles: 'ROLES',
}

const ORDEN_VISTAS = [
  'dashboard', 'reservas', 'habitaciones', 'huespedes', 'facturas',
  'usuarios', 'pisos', 'reportes', 'housekeeping', 'mantenimiento',
  'configuracion', 'roles'
]

export function getPrimeraVista() {
  const permisos = getPermisos()
  return ORDEN_VISTAS.find(vista =>
    permisos.some(p => p.modulo === VISTA_MODULO[vista] && p.accion === 'VER')  // ← sin bypass
  ) || 'no-autorizado'
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/no-autorizado', component: NoAutorizado },
    { path: '/:vista([a-z]+)', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
  ]
})

router.beforeEach((to, from, next) => {
  if (!to.meta.requiresAuth) return next()

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (!token) return next('/login')

  if (isTokenExpired()) {
    localStorage.removeItem('token')
    localStorage.removeItem('nombre')
    localStorage.removeItem('rol')
    sessionStorage.removeItem('token')
    return next('/login')
  }

  const vista = to.params.vista

  // dashboard siempre accesible si está autenticado
  if (vista === 'dashboard') {
  return can('DASHBOARD') ? next() : next(`/${getPrimeraVista()}`)
}

  // vista no reconocida → redirigir a primera vista con acceso
  if (!VISTA_MODULO[vista]) return next(`/${getPrimeraVista()}`)

  // sin permiso VER → sin acceso
  if (!can(VISTA_MODULO[vista])) return next('/no-autorizado')

  next()
})

export default router