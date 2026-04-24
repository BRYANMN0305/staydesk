<template>
  <div class="dashboard-layout">

    <div class="sidebar-overlay" v-if="sidebarOpen" @click="sidebarOpen = false"></div>

    <Sidebar v-model="sidebarOpen" :activeTab="activeTab" @update:activeTab="handleTabChange"
      @logout="confirmarLogout" />

    <div class="d-flex flex-column overflow-hidden flex-grow-1 min-w-0">

      <header
        class="d-flex align-items-center justify-content-between px-3 px-md-4 bg-white border-bottom flex-shrink-0 topbar">
        <div class="d-flex align-items-center gap-3">
          <button class="d-md-none border-0 bg-transparent p-1" @click="sidebarOpen = true"
            style="cursor:pointer;color:#211A1D">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h1 class="fw-bold mb-0" style="font-size:20px;color:#211A1D">{{ tituloHeader }}</h1>
            <p class="text-muted mb-0 text-capitalize" style="font-size:12px">{{ today }}</p>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="search-wrap d-none d-md-flex align-items-center gap-2 rounded-3 px-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
              style="color:#9ca3af;flex-shrink:0">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input class="search-input" type="text" placeholder="Buscar habitación..." v-model="searchQuery" />
          </div>
        </div>
      </header>

      <div class="flex-grow-1 overflow-auto p-3 p-md-4" style="background:#f4eeff">

        <template v-if="activeTab === 'dashboard'">

          <!-- BIENVENIDA Y ESTADÍSTICAS -->
          <div class="bg-white rounded-3 border p-3 p-md-4 mb-4"
            style="border-color:rgba(99,32,238,0.07)!important;box-shadow:0 2px 12px rgba(33,26,29,0.05)">
            <div class="mb-4">
              <p class="mb-0" style="font-size:13px; color:rgba(99,32,238,0.6); font-weight:600; letter-spacing:.5px">
                BIENVENIDO DE VUELTA 👋
              </p>
              <h2 class="fw-bold mb-0" style="font-size:22px; color:#211A1D">Estadisticas generales</h2>
            </div>

            <div class="row g-2 g-sm-3 g-lg-3">
              <div class="col-12 col-sm-6 col-lg-3">
                <Estadistica_Card label="Habitaciones disponibles"
                  :value="String(estadisticas.habitaciones_disponibles)" color="#16a34a" bg="rgba(22, 163, 74, 0.12)"
                  icon="<path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/>" />
              </div>
              <div class="col-12 col-sm-6 col-lg-3">
                <Estadistica_Card label="Total de habitaciones" :value="String(estadisticas.habitaciones_total)"
                  color="#6320EE" bg="rgba(99, 32, 238, 0.12)"
                  icon="<rect x='2' y='3' width='20' height='14' rx='2' ry='2'/><line x1='16' y1='1' x2='16' y2='3'/><line x1='8' y1='1' x2='8' y2='3'/><line x1='2' y1='8' x2='22' y2='8'/>" />
              </div>
              <div class="col-12 col-sm-6 col-lg-3">
                <Estadistica_Card label="Check-ins hoy" :value="String(estadisticas.checkins_hoy)" color="#d97706"
                  bg="rgba(217, 119, 6, 0.12)"
                  icon="<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/><path d='M12 12v6M9 15h6'/>" />
              </div>
              <div class="col-12 col-sm-6 col-lg-3">
                <Estadistica_Card label="Check-outs hoy" :value="String(estadisticas.checkouts_hoy)" color="#dc2626"
                  bg="rgba(220, 38, 38, 0.12)"
                  icon="<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/><path d='M9 12h6'/>" />
              </div>
            </div>
          </div>

          <!-- HABITACIONES -->
          <div class="bg-white rounded-3 border p-3 p-md-4 mb-4"
            style="border-color:rgba(99,32,238,0.07)!important;box-shadow:0 2px 12px rgba(33,26,29,0.05)">
            <div class="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h2 class="fw-bold mb-0" style="font-size:17px">Habitaciones</h2>
                <p class="text-muted mb-0" style="font-size:12px">Estado en tiempo real</p>
              </div>
              <div class="d-flex align-items-center gap-3 flex-wrap">
                <span class="d-flex align-items-center gap-1">
                  <span class="rounded-circle" style="width:10px;height:10px;background:#16a34a;flex-shrink:0"></span>
                  <span class="text-secondary" style="font-size:12.5px">Disponible</span>
                </span>
                <span class="d-flex align-items-center gap-1">
                  <span class="rounded-circle" style="width:10px;height:10px;background:#d97706;flex-shrink:0"></span>
                  <span class="text-secondary" style="font-size:12.5px">Reservada</span>
                </span>
                <span class="d-flex align-items-center gap-1">
                  <span class="rounded-circle" style="width:10px;height:10px;background:#dc2626;flex-shrink:0"></span>
                  <span class="text-secondary" style="font-size:12.5px">Ocupada</span>
                </span>
                <span class="d-flex align-items-center gap-1">
                  <span class="rounded-circle" style="width:10px;height:10px;background:#0ea5e9;flex-shrink:0"></span>
                  <span class="text-secondary" style="font-size:12.5px">Limpieza</span>
                </span>
                <span class="d-flex align-items-center gap-1">
                  <span class="rounded-circle" style="width:10px;height:10px;background:#6b7280;flex-shrink:0"></span>
                  <span class="text-secondary" style="font-size:12.5px">Mantenimiento</span>
                </span>
              </div>
            </div>

            <div class="d-md-none mb-3">
              <div class="search-wrap d-flex align-items-center gap-2 rounded-3 px-3 w-100">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                  style="color:#9ca3af;flex-shrink:0">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input class="search-input" type="text" placeholder="Buscar habitación..." v-model="searchQuery" />
              </div>
            </div>

            <div v-if="cargandoHabitaciones" class="text-muted text-center py-3" style="font-size:13.5px">
              Cargando habitaciones...
            </div>
            <div v-else-if="rooms.length === 0" class="text-muted fst-italic text-center py-3" style="font-size:13.5px">
              No hay habitaciones registradas.
            </div>
            <div v-else class="row g-2 g-md-3">
              <div class="col-6 col-sm-4 col-lg-3 col-xl-2" v-for="room in filteredRooms" :key="room.id">
                <Habitacion_Card v-bind="room" @click="selectRoom(room)" />
              </div>
            </div>
          </div>

          <!-- FACTURACIÓN -->
          <div class="bg-white rounded-3 border p-3 p-md-4"
            style="border-color:rgba(99,32,238,0.07)!important;box-shadow:0 2px 12px rgba(33,26,29,0.05)">
            <div class="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h2 class="fw-bold mb-0" style="font-size:17px">Facturación reciente</h2>
                <p class="text-muted mb-0" style="font-size:12px">Últimas transacciones</p>
              </div>
              <button class="btn-outline" @click="setTab('facturas')">Ver todo</button>
            </div>

            <div v-if="cargandoFacturas" class="text-muted text-center py-3" style="font-size:13.5px">
              Cargando facturas...
            </div>

            <div v-else-if="billing.length === 0" class="text-muted fst-italic text-center py-3"
              style="font-size:13.5px">
              No hay facturas registradas.
            </div>

            <template v-else>
              <div class="d-none d-md-block">
                <div class="row g-0 px-3 py-2 text-uppercase fw-semibold"
                  style="font-size:11.5px;color:#9ca3af;letter-spacing:.8px;border-bottom:1px solid rgba(99,32,238,0.07)">
                  <div class="col-4">Huésped</div>
                  <div class="col-2">Reserva</div>
                  <div class="col-2">Fecha</div>
                  <div class="col-2">Total</div>
                  <div class="col-2">Estado</div>
                </div>
                <div class="row g-0 align-items-center px-3 py-3 table-row" v-for="bill in billing.slice(0, 6)"
                  :key="bill.id" style="border-bottom:1px solid rgba(99,32,238,0.05)">
                  <div class="col-4 d-flex align-items-center gap-2">
                    <div
                      class="bill-avatar rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0">
                      {{ bill.guest ? bill.guest[0].toUpperCase() : '?' }}
                    </div>
                    <span class="fw-medium" style="font-size:13.5px">{{ bill.guest }}</span>
                  </div>
                  <div class="col-2 text-secondary" style="font-size:13.5px">Reserva #{{ bill.room }}</div>
                  <div class="col-2 text-secondary" style="font-size:13.5px">{{ bill.checkout }}</div>
                  <div class="col-2 fw-bold" style="font-size:14px">${{ bill.total.toLocaleString() }}</div>
                  <div class="col-2">
                    <span class="rounded-pill px-2 py-1 fw-semibold" style="font-size:11.5px"
                      :class="bill.paid ? 'status-paid' : 'status-pending'">
                      {{ bill.paid ? 'Pagada' : 'Pendiente' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="d-md-none d-flex flex-column gap-2">
                <div class="rounded-3 p-3 border" style="border-color:rgba(99,32,238,0.07)!important"
                  v-for="bill in billing.slice(0, 6)" :key="bill.id">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <div
                        class="bill-avatar rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0">
                        {{ bill.guest ? bill.guest[0].toUpperCase() : '?' }}
                      </div>
                      <span class="fw-medium" style="font-size:13.5px">{{ bill.guest }}</span>
                    </div>
                    <span class="rounded-pill px-2 py-1 fw-semibold" style="font-size:11.5px"
                      :class="bill.paid ? 'status-paid' : 'status-pending'">
                      {{ bill.paid ? 'Pagada' : 'Pendiente' }}
                    </span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted small">Reserva #{{ bill.room }} · {{ bill.checkout }}</span>
                    <span class="fw-bold" style="font-size:14px">${{ bill.total.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>

        <Usuarios v-if="activeTab === 'usuarios'" />
        <Pisos v-if="activeTab === 'pisos'" />
        <Huespedes v-if="activeTab === 'huespedes'" />
        <Habitaciones v-if="activeTab === 'habitaciones'" @habitacion-actualizada="cargarHabitaciones" />
        <Facturas v-if="activeTab === 'facturas'" />
        <Reportes v-if="activeTab === 'reportes'" />

        <Reservas v-show="activeTab === 'reservas'" @reserva-actualizada="cargarHabitaciones"
          @checkin-iniciado="onCheckinIniciado" />
        <Servicios v-show="activeTab === 'servicios'" :reservas-checkin="reservasEnCheckin"
          @servicios-confirmados="onServiciosConfirmados" />

      </div>
    </div>

    <!-- MODAL HABITACIÓN -->
    <div
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-overlay"
      v-if="selectedRoom" @click.self="selectedRoom = null">
      <div class="bg-white rounded-4 p-4 position-relative overflow-hidden modal-box" :class="selectedRoom.status">
        <div class="modal-bar"></div>
        <button
          class="position-absolute border-0 rounded-2 d-flex align-items-center justify-content-center modal-close"
          @click="selectedRoom = null">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <h3 class="fw-bold mb-1" style="font-size:22px">Habitación {{ selectedRoom.number }}</h3>
        <p class="text-muted mb-3" style="font-size:13px">{{ selectedRoom.type }} · Piso {{ selectedRoom.floor }}</p>
        <div class="row g-3 mb-4">
          <div class="col-6">
            <span class="d-block text-muted text-uppercase" style="font-size:11px;letter-spacing:.8px">Estado</span>
            <strong style="font-size:14px">{{ statusLabel(selectedRoom.status) }}</strong>
          </div>
          <div class="col-6">
            <span class="d-block text-muted text-uppercase" style="font-size:11px;letter-spacing:.8px">Precio</span>
            <strong style="font-size:14px">${{ selectedRoom.price.toLocaleString() }}/noche</strong>
          </div>
          <div class="col-6" v-if="selectedRoom.guest">
            <span class="d-block text-muted text-uppercase" style="font-size:11px;letter-spacing:.8px">Huésped</span>
            <strong style="font-size:14px">{{ selectedRoom.guest }}</strong>
          </div>
          <div class="col-6" v-if="selectedRoom.checkout">
            <span class="d-block text-muted text-uppercase" style="font-size:11px;letter-spacing:.8px">Check-out</span>
            <strong style="font-size:14px">{{ selectedRoom.checkout }}</strong>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="modal-btn-primary flex-grow-1 rounded-3 border-0 fw-semibold"
            @click="irAReservas(selectedRoom)" v-if="selectedRoom.status === 'available'">Reservar</button>
        </div>
      </div>
    </div>

    <!-- MODAL CERRAR SESIÓN -->
    <div
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-overlay"
      v-if="showLogoutModal" @click.self="showLogoutModal = false" style="z-index:300">
      <div class="bg-white rounded-4 p-4 position-relative logout-modal-box">
        <div class="logout-modal-bar"></div>

        <button
          class="position-absolute border-0 rounded-2 d-flex align-items-center justify-content-center modal-close"
          @click="showLogoutModal = false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div class="d-flex align-items-center gap-3 mb-3 mt-1">
          <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 logout-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <div>
            <h3 class="fw-bold mb-0" style="font-size:17px;color:#211A1D">Cerrar sesión</h3>
            <p class="mb-0" style="font-size:13px;color:#9ca3af">Esta acción cerrará tu sesión actual</p>
          </div>
        </div>

        <p style="font-size:14px;color:#4b5563;margin-bottom:1.25rem;line-height:1.6">
          ¿Está seguro que desea cerrar sesión?
        </p>

        <div class="d-flex gap-2">
          <button class="logout-btn-cancel flex-grow-1 rounded-3 fw-semibold" @click="showLogoutModal = false">
            Cancelar
          </button>
          <button class="logout-btn-confirm flex-grow-1 rounded-3 fw-semibold" @click="handleLogout">
            Confirmar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Habitacion_Card from '../components/Habitacion_Card.vue'
import Estadistica_Card from '../components/Estadistica_Card.vue'
import Usuarios from './Admin/Usuarios.vue'
import Pisos from './Admin/Pisos.vue'
import Servicios from './Admin/Servicios.vue'
import Huespedes from './Empleado/Huespedes.vue'
import Habitaciones from './Admin/Habitaciones.vue'
import Reservas from './Admin/Reservas.vue'
import Facturas from './Admin/Facturacion.vue'
import Reportes from './Admin/Reportes.vue'

const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(false)

const tabTitulos = {
  dashboard: 'Dashboard',
  usuarios: 'Usuarios',
  pisos: 'Pisos',
  huespedes: 'Huéspedes',
  habitaciones: 'Habitaciones',
  reservas: 'Reservas',
  servicios: 'Servicios',
  facturas: 'Facturación',
  reportes: 'Reportes',
}

const vistas = ['dashboard', 'usuarios', 'pisos', 'huespedes', 'habitaciones', 'reservas', 'servicios', 'facturas', 'reportes']

const initialTab = route.params.vista || sessionStorage.getItem('activeTab') || 'dashboard'
const activeTab = ref(initialTab)

const setTab = (tab) => {
  activeTab.value = tab
  sessionStorage.setItem('activeTab', tab)
  router.replace(`/${tab}`)
}

watch(() => route.params.vista, (vista) => {
  if (vista && vista !== activeTab.value) {
    activeTab.value = vista
    sessionStorage.setItem('activeTab', vista)
  }
})

const tituloHeader = computed(() => tabTitulos[activeTab.value] || 'Dashboard')


const searchQuery = ref('')
const selectedRoom = ref(null)
const showLogoutModal = ref(false)
const cargandoFacturas = ref(false)
const cargandoHabitaciones = ref(false)
const estadisticas = ref({
  habitaciones_disponibles: 0,
  habitaciones_total: 0,
  checkins_hoy: 0,
  checkouts_hoy: 0
})

const pisos = ref([])

const cargarPisos = async () => {
  try {
    const res = await apiFetch('https://staydesk-apis.duckdns.org/listar_pisos')
    if (res.ok) pisos.value = await res.json()
  } catch { }
}

const reservasEnCheckin = ref(
  JSON.parse(sessionStorage.getItem('reservasEnCheckin') || '[]')
)

function guardarCheckinEnStorage() {
  const plano = reservasEnCheckin.value.map(r => ({
    id_reserva: r.id_reserva,
    habitacion: r.habitacion,
    huesped: r.huesped,
    fecha_entrada: r.fecha_entrada,
    _confirmado: r._confirmado || false,
    _serviciosAsignados: r._serviciosAsignados || [],
    _guardando: false,
    _inicializado: true,
  }))
  sessionStorage.setItem('reservasEnCheckin', JSON.stringify(plano))
}

function onCheckinIniciado(reserva) {
  const yaExiste = reservasEnCheckin.value.find(r => r.id_reserva === reserva.id_reserva)
  if (!yaExiste) {
    reserva._serviciosAsignados = []
    reserva._confirmado = false
    reserva._guardando = false
    reserva._inicializado = true
    reservasEnCheckin.value.push(reserva)
    guardarCheckinEnStorage()
  }
  setTab('servicios')
}

function onServiciosConfirmados(id_reserva) {
  const r = reservasEnCheckin.value.find(r => r.id_reserva === id_reserva)
  if (r) r._confirmado = true
  guardarCheckinEnStorage()
}
// ────────────────────────────────────────────────────────────────────────────

const getToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token')

const apiFetch = (url, options = {}) => {
  const token = getToken()
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })
}

const today = new Date().toLocaleDateString('es-CO', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const rooms = ref([])

const mapEstadoAPI = (estado) => {
  if (!estado) return 'available'
  const e = estado.toString().trim().toUpperCase()
  if (e === 'DISPONIBLE') return 'available'
  if (e === 'OCUPADO' || e === 'OCUPADA') return 'occupied'
  if (e === 'RESERVADO' || e === 'RESERVADA') return 'reserved'
  if (e === 'LIMPIEZA') return 'cleaning'
  if (e === 'MANTENIMIENTO') return 'maintenance'
  return 'available'
}

const cargarHabitaciones = async () => {
  cargandoHabitaciones.value = true
  try {
    const res = await apiFetch('https://staydesk-apis.duckdns.org/listar_todas_habitaciones')
    const data = await res.json()
    if (!res.ok) return
    const lista = data.habitaciones || data
    rooms.value = lista
      .filter(h => h.activo !== 0 && h.activo !== false)
      .map(h => ({
        id: h.id_habitacion,
        number: h.numero,
        type: h.tipo || 'Estándar',
        floor: h.piso?.numero || h.numero_piso || pisos.value.find(p => p.id_piso === h.id_piso)?.numero || h.id_piso || 1,
        status: mapEstadoAPI(h.estado),
        price: h.precio_noche || h.precio || 100000,
        guest: h.huesped || null,
        checkout: h.checkout || null
      }))

    estadisticas.value.habitaciones_total = rooms.value.length
    estadisticas.value.habitaciones_disponibles = rooms.value.filter(r => r.status === 'available').length
  } catch (e) {
    console.error('Error habitaciones:', e)
  } finally {
    cargandoHabitaciones.value = false
  }
}

const cargarEstadisticas = async () => {
  try {
    const res = await apiFetch('https://staydesk-apis.duckdns.org/estadisticas')
    if (!res.ok) return
    const data = await res.json()
    estadisticas.value = {
      habitaciones_disponibles: data.habitaciones_disponibles || 0,
      habitaciones_total: data.habitaciones_total || 0,
      checkins_hoy: data.checkins_hoy || 0,
      checkouts_hoy: data.checkouts_hoy || 0
    }
  } catch (e) {
    console.error('Error estadísticas:', e)
  }
}

const billing = ref([])

const cargarFacturas = async () => {
  cargandoFacturas.value = true
  try {
    const res = await apiFetch('https://staydesk-apis.duckdns.org/listar_facturas')
    if (!res.ok) throw new Error('Error API facturas: ' + res.status)
    const data = await res.json()
    billing.value = data.sort((a, b) => b.id_factura - a.id_factura).map(f => ({
      id: f.id_factura,
      guest: `${f.nombre_huesped || ''} ${f.apellido_huesped || ''}`.trim() || 'Sin nombre',
      room: f.id_reserva,
      checkout: new Date(f.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
      total: Number(f.total) || 0,
      paid: f.estado === 'PAGADA'
    }))
  } catch (e) {
    console.error('Error facturas:', e)
    billing.value = []
  } finally {
    cargandoFacturas.value = false
  }
}

const handleTabChange = (tab) => {
  setTab(tab)
  if (tab === 'dashboard') {
    cargarPisos()
    cargarHabitaciones()
    cargarEstadisticas()
    cargarFacturas()
  }
}

const confirmarLogout = () => { showLogoutModal.value = true }

const handleLogout = () => {
  showLogoutModal.value = false
  localStorage.removeItem('token')
  localStorage.removeItem('nombre')
  localStorage.removeItem('rol')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('reservasEnCheckin')
  sessionStorage.removeItem('activeTab')
  router.push('/login')
}

const filteredRooms = computed(() => {
  if (!searchQuery.value) return rooms.value.slice(0, 18)
  return rooms.value.filter(r =>
    r.number?.toString().includes(searchQuery.value) ||
    r.type?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (r.guest && r.guest.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const statusLabel = (s) => ({
  available: 'Disponible',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  cleaning: 'En limpieza',
  maintenance: 'Mantenimiento'
}[s] || s)

const selectRoom = (room) => { selectedRoom.value = room }
const irAReservas = () => { selectedRoom.value = null; setTab('reservas') }

onMounted(async () => {
  if (activeTab.value === 'dashboard') {
    await cargarPisos()
    cargarHabitaciones()
    cargarEstadisticas()
    cargarFacturas()
  }
  if (!vistas.includes(route.params.vista)) {
    router.replace('/dashboard')
  }
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
}

.min-w-0 {
  min-width: 0;
}

.topbar {
  height: 68px;
  border-color: rgba(99, 32, 238, 0.08) !important;
}

.search-wrap {
  background: #f4eeff;
  border: 1px solid rgba(99, 32, 238, 0.12);
  height: 38px;
  transition: border-color .2s;
}

.search-wrap:focus-within {
  border-color: #6320EE;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13.5px;
  color: #211A1D;
  font-family: 'Outfit', sans-serif;
  width: 180px;
}

.search-input::placeholder {
  color: #c4b8d0;
}

.table-row:hover {
  background: rgba(99, 32, 238, 0.03);
  border-radius: 10px;
}

.table-row:last-child {
  border-bottom: none !important;
}

.bill-avatar {
  width: 30px;
  height: 30px;
  font-size: 12px;
  background: linear-gradient(135deg, #6320EE, #8075FF);
}

.status-paid {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.status-pending {
  background: rgba(217, 119, 6, 0.12);
  color: #b45309;
}

.btn-outline {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1.5px solid rgba(99, 32, 238, 0.25);
  color: #6320EE;
  font-size: 13px;
  font-weight: 600;
  background: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all .2s;
  white-space: nowrap;
}

.btn-outline:hover {
  background: rgba(99, 32, 238, 0.06);
}

.modal-overlay {
  background: rgba(33, 26, 29, 0.55);
  backdrop-filter: blur(4px);
  z-index: 200;
}

.modal-box {
  width: 100%;
  max-width: 380px;
  box-shadow: 0 24px 60px rgba(33, 26, 29, 0.3);
  animation: modalIn .3s cubic-bezier(.22, 1, .36, 1);
}

.logout-modal-box {
  width: 100%;
  max-width: 360px;
  box-shadow: 0 24px 60px rgba(33, 26, 29, 0.3);
  animation: modalIn .3s cubic-bezier(.22, 1, .36, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.modal-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 4px 4px 0 0;
}

.logout-modal-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 4px 4px 0 0;
  background: #dc2626;
}

.available .modal-bar {
  background: #16a34a;
}

.reserved .modal-bar {
  background: #d97706;
}

.occupied .modal-bar {
  background: #dc2626;
}

.cleaning .modal-bar {
  background: #0ea5e9;
}

.maintenance .modal-bar {
  background: #6b7280;
}

.modal-close {
  top: 16px;
  right: 16px;
  background: #f4eeff;
  width: 30px;
  height: 30px;
  color: #9ca3af;
  cursor: pointer;
}

.modal-btn-primary {
  padding: 11px;
  background: linear-gradient(135deg, #6320EE, #8075FF);
  color: #fff;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 32, 238, 0.35);
  transition: all .2s;
}

.modal-btn-primary:hover {
  box-shadow: 0 6px 20px rgba(99, 32, 238, 0.45);
  transform: translateY(-1px);
}

.modal-btn-secondary {
  padding: 11px;
  background: #f4eeff;
  color: #6320EE;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  border: 1.5px solid rgba(99, 32, 238, 0.18);
  cursor: pointer;
  transition: all .2s;
}

.modal-btn-secondary:hover {
  background: rgba(99, 32, 238, 0.08);
}

.logout-icon-wrap {
  width: 42px;
  height: 42px;
  background: rgba(220, 38, 38, 0.1);
}

.logout-btn-cancel {
  padding: 10px;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  background: #f4eeff;
  color: #6320EE;
  border: 1.5px solid rgba(99, 32, 238, 0.2);
  cursor: pointer;
  transition: all .2s;
}

.logout-btn-cancel:hover {
  background: rgba(99, 32, 238, 0.08);
}

.logout-btn-confirm {
  padding: 10px;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  background: #dc2626;
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
  transition: all .2s;
}

.logout-btn-confirm:hover {
  background: #b91c1c;
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.45);
  transform: translateY(-1px);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(33, 26, 29, 0.6);
  backdrop-filter: blur(2px);
  z-index: 90;
}
</style>