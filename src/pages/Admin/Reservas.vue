<template>
  <div class="position-relative">
    <div class="bg-white rounded-3 border p-4">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 class="fw-bold mb-0" style="font-size:25px">Reservas</h2>
          <p class="text-muted mb-0" style="font-size:12px">Gestión de reservas</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn-outline-custom" @click="vistaActual = vistaActual === 'tabla' ? 'calendario' : 'tabla'">
            <svg v-if="vistaActual === 'tabla'" width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            {{ vistaActual === 'tabla' ? 'Ver calendario' : 'Ver tabla' }}
          </button>
          <button class="btn-primary-custom" @click="abrirModal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nueva reserva
          </button>
        </div>
      </div>
      <template v-if="vistaActual === 'tabla'">
        <div v-if="cargando" class="text-muted text-center py-5" style="font-size:13px">Cargando reservas...</div>

        <div v-else-if="reservas.length === 0" class="text-muted fst-italic text-center py-5" style="font-size:13px">
          No hay reservas registradas.
        </div>

        <template v-else>

          <!-- TABLA DESKTOP -->
          <div class="d-none d-md-block table-responsive">
            <table class="table align-middle">
              <thead class="table-header">
                <tr>
                  <th>Habitación</th>
                  <th>Huésped</th>
                  <th>Documento</th>
                  <th>Usuario</th>
                  <th>Entrada</th>
                  <th>Salida est.</th>
                  <th>Salida real</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reservasPaginadas" :key="r.id_reserva">
                  <td style="font-size:14px">Hab. {{ r.habitacion?.numero }}</td>
                  <td style="font-size:14px">{{ r.huesped?.nombre }} {{ r.huesped?.apellido }}</td>
                  <td style="font-size:14px">{{ r.huesped?.documento }}</td>
                  <td style="font-size:14px">{{ r.usuario?.nombre }}</td>
                  <td style="font-size:14px">{{ formatFecha(r.fecha_entrada) }}</td>
                  <td style="font-size:14px">{{ formatFecha(r.fecha_salida) }}</td>
                  <td style="font-size:14px">{{ formatFecha(r.fecha_salida_real) || '—' }}</td>
                  <td>
                    <span class="badge-estado" :class="claseEstado(estado(r.estado))">
                      {{ estado(r.estado) }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-2 flex-wrap">
                      <template v-if="estado(r.estado) === 'PENDIENTE'">
                        <button class="action-btn confirm-btn" :disabled="procesando === r.id_reserva"
                          @click="confirmar(r.id_reserva)">{{ procesando === r.id_reserva ? '...' : 'Confirmar'
                          }}</button>
                        <button class="action-btn cancel-btn" :disabled="procesando === r.id_reserva"
                          @click="prepararCancelar(r)">{{ procesando === r.id_reserva ? '...' : 'Cancelar' }}</button>
                      </template>
                      <template v-else-if="estado(r.estado) === 'CONFIRMADA'">
                        <button class="action-btn checkin-btn" :disabled="procesando === r.id_reserva"
                          @click="checkin(r)">{{ procesando === r.id_reserva ? '...' : 'Check-in' }}</button>
                        <button class="action-btn cancel-btn" :disabled="procesando === r.id_reserva"
                          @click="prepararCancelar(r)">{{ procesando === r.id_reserva ? '...' : 'Cancelar' }}</button>
                      </template>
                      <template v-else-if="estado(r.estado) === 'CHECKIN'">
                        <button class="action-btn checkout-btn" :disabled="procesando === r.id_reserva"
                          @click="checkout(r.id_reserva)">{{ procesando === r.id_reserva ? '...' : 'Check-out'
                          }}</button>
                      </template>
                      <template v-else>
                        <span class="text-muted" style="font-size:12px">Sin acciones</span>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS MOBILE -->
          <div class="d-md-none d-flex flex-column gap-2">
            <div v-for="r in reservasPaginadas" :key="r.id_reserva" class="rounded-3 border p-3"
              style="border-color:rgba(99,32,238,0.1)!important">

              <!-- Top: habitación + estado -->
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="fw-bold" style="font-size:15px">Hab. {{ r.habitacion?.numero }}</span>
                <span class="badge-estado" :class="claseEstado(estado(r.estado))">{{ estado(r.estado) }}</span>
              </div>

              <!-- Huésped -->
              <div class="mb-1" style="font-size:13px">
                <span class="fw-semibold">{{ r.huesped?.nombre }} {{ r.huesped?.apellido }}</span>
                <span class="text-muted ms-2">{{ r.huesped?.documento }}</span>
              </div>

              <!-- Fechas -->
              <div class="d-flex gap-3 mb-2" style="font-size:12px;color:#6b7280">
                <span>Entrada: {{ formatFecha(r.fecha_entrada) }}</span>
                <span>Salida: {{ formatFecha(r.fecha_salida) }}</span>
              </div>

              <!-- Salida real si existe -->
              <div v-if="r.fecha_salida_real" class="mb-2" style="font-size:12px;color:#6b7280">Salida real: {{
                formatFecha(r.fecha_salida_real) }}
              </div>

              <!-- Acciones -->
              <div class="d-flex gap-2 mt-2">
                <template v-if="estado(r.estado) === 'PENDIENTE'">
                  <button class="action-btn confirm-btn flex-grow-1" :disabled="procesando === r.id_reserva"
                    @click="confirmar(r.id_reserva)">{{ procesando === r.id_reserva ? '...' : 'Confirmar' }}</button>
                  <button class="action-btn cancel-btn flex-grow-1" :disabled="procesando === r.id_reserva"
                    @click="prepararCancelar(r)">{{ procesando === r.id_reserva ? '...' : 'Cancelar' }}</button>
                </template>
                <template v-else-if="estado(r.estado) === 'CONFIRMADA'">
                  <button class="action-btn checkin-btn flex-grow-1" :disabled="procesando === r.id_reserva"
                    @click="checkin(r)">{{ procesando === r.id_reserva ? '...' : 'Check-in' }}</button>
                  <button class="action-btn cancel-btn flex-grow-1" :disabled="procesando === r.id_reserva"
                    @click="prepararCancelar(r)">{{ procesando === r.id_reserva ? '...' : 'Cancelar' }}</button>
                </template>
                <template v-else-if="estado(r.estado) === 'CHECKIN'">
                  <button class="action-btn checkout-btn w-100" :disabled="procesando === r.id_reserva"
                    @click="checkout(r.id_reserva)">{{ procesando === r.id_reserva ? '...' : 'Check-out' }}</button>
                </template>
                <template v-else>
                  <span class="text-muted" style="font-size:12px">Sin acciones</span>
                </template>
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div v-if="totalPaginas > 1" class="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
            <span class="text-muted" style="font-size:12px">
              Mostrando {{ inicio + 1 }}–{{ Math.min(inicio + POR_PAGINA, reservasOrdenadas.length) }}
              de {{ reservasOrdenadas.length }} reservas
            </span>
            <div class="d-flex gap-2">
              <button class="pag-btn" :disabled="pagina === 1" @click="pagina--">← Anterior</button>
              <span class="pag-info">{{ pagina }} / {{ totalPaginas }}</span>
              <button class="pag-btn" :disabled="pagina === totalPaginas" @click="pagina++">Siguiente →</button>
            </div>
          </div>

        </template>
      </template>

      <!-- VISTA CALENDARIO -->
      <template v-else>
        <CalendarioReservas :reservas="reservas" />
      </template>

    </div>

    <!-- MODAL NUEVA RESERVA -->
    <Teleport to="body">
      <div v-if="modalAbierto" class="modal-overlay d-flex align-items-center justify-content-center p-3"
        @click.self="cerrarModal">
        <div class="modal-box bg-white rounded-4 p-4 position-relative">
          <div class="modal-top-bar"></div>
          <button
            class="position-absolute border-0 rounded-2 d-flex align-items-center justify-content-center modal-close"
            @click="cerrarModal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h3 class="fw-bold mb-1" style="font-size:17px">Nueva reserva</h3>
          <p class="text-muted mb-4" style="font-size:12px">Busca o registra el huésped y completa los datos</p>

          <p class="section-label">Huésped</p>

          <div class="d-flex gap-2 mb-3">
            <input class="input-custom flex-grow-1" type="text" placeholder="Número de documento..."
              v-model="busquedaDoc" @keyup.enter="buscarHuesped" />
            <button class="btn-buscar" @click="buscarHuesped" :disabled="buscando">{{ buscando ? '...' : 'Buscar'
            }}</button>
          </div>

          <div v-if="mensajeBusqueda" class="mb-3 rounded-3 px-3 py-2" :style="huespedEncontrado
            ? 'background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.2);color:#15803d;font-size:13px'
            : 'background:rgba(99,32,238,0.06);border:1px solid rgba(99,32,238,0.15);color:#6320EE;font-size:13px'">
            {{ mensajeBusqueda }}
          </div>

          <div class="row g-3 mb-4">
            <div class="col-6">
              <label class="form-label-custom">Nombre</label>
              <input class="input-custom w-100" v-model="formHuesped.nombre" placeholder="Nombre" />
            </div>
            <div class="col-6">
              <label class="form-label-custom">Apellido</label>
              <input class="input-custom w-100" v-model="formHuesped.apellido" placeholder="Apellido" />
            </div>
            <div class="col-6" v-if="!huespedEncontrado">
              <label class="form-label-custom">Documento</label>
              <input class="input-custom w-100" v-model="formHuesped.documento" placeholder="Documento" />
            </div>
            <div class="col-6">
              <label class="form-label-custom">Teléfono</label>
              <input class="input-custom w-100" v-model="formHuesped.telefono" placeholder="Teléfono" />
            </div>
            <div class="col-12">
              <label class="form-label-custom">Email</label>
              <input class="input-custom w-100" v-model="formHuesped.email" placeholder="Email" type="email" />
            </div>
          </div>

          <p class="section-label">Reserva</p>
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label-custom">Habitación disponible</label>
              <select class="input-custom w-100" v-model="formReserva.id_habitacion">
                <option value="" disabled>Selecciona una habitación</option>
                <option v-for="h in habitacionesDisponibles" :key="h.id_habitacion" :value="h.id_habitacion">
                  Hab. {{ h.numero }} — {{ h.tipo }} — ${{ h.precio_noche?.toLocaleString() }}/noche
                </option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label-custom">Fecha de entrada</label>
              <input class="input-custom w-100" type="date" v-model="formReserva.fecha_entrada" :min="hoy" />
            </div>
            <div class="col-6">
              <label class="form-label-custom">Fecha de salida</label>
              <input class="input-custom w-100" type="date" v-model="formReserva.fecha_salida" :min="minFechaSalida" />
            </div>
          </div>

          <div v-if="errorModal" class="mt-3 rounded-3 px-3 py-2"
            style="background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.2);font-size:13px;color:#dc2626">
            {{ errorModal }}
          </div>

          <div class="d-flex gap-2 mt-4">
            <button class="modal-btn-secondary flex-grow-1 rounded-3" @click="cerrarModal">Cancelar</button>
            <button class="modal-btn-primary flex-grow-1 rounded-3 border-0" @click="crearReserva"
              :disabled="guardando">
              {{ guardando ? 'Creando...' : 'Crear reserva' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL ERROR CHECK-IN (fecha aún no llegó) -->
    <Teleport to="body">
      <div v-if="errorCheckinModal.visible" class="modal-overlay d-flex align-items-center justify-content-center p-3"
        @click.self="errorCheckinModal.visible = false">
        <div class="modal-box bg-white rounded-4 p-4 position-relative" style="max-width:420px">
          <div class="modal-top-bar" style="background:linear-gradient(90deg,#dc2626,#f87171)"></div>

          <button
            class="position-absolute border-0 rounded-2 d-flex align-items-center justify-content-center modal-close"
            @click="errorCheckinModal.visible = false">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div class="d-flex align-items-center gap-3 mb-3 mt-1">
            <div class="checkin-error-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 class="fw-bold mb-0" style="font-size:16px;color:#211A1D">Check-in no disponible</h3>
              <p class="mb-0" style="font-size:12px;color:#9ca3af">La fecha de entrada aún no ha llegado</p>
            </div>
          </div>

          <p style="font-size:13px;color:#4b5563;line-height:1.6">
            La reserva de <strong>{{ errorCheckinModal.huesped }}</strong> tiene fecha de entrada el
            <strong>{{ errorCheckinModal.fechaEntrada }}</strong>.
            No es posible hacer check-in antes de esa fecha.
          </p>

          <div class="d-flex mt-4">
            <button class="modal-btn-primary flex-grow-1 rounded-3 border-0" @click="errorCheckinModal.visible = false">
              Entendido
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL CONFIRMAR CANCELAR -->
    <ModalFormulario v-if="modalCancelar" titulo="¿Cancelar reserva?"
      :subtitulo="`Se cancelará la reserva de ${reservaACancelar?.huesped?.nombre} ${reservaACancelar?.huesped?.apellido} — Hab. ${reservaACancelar?.habitacion?.numero}.`"
      :cargando="procesando !== null" textoConfirmar="Cancelar reserva" :peligroso="true"
      @cerrar="modalCancelar = false" @confirmar="cancelar" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalFormulario from '@/components/ModalFormulario.vue'
import CalendarioReservas from '@/components/Calendarioreservas.vue'
import { checkoutStore } from '@/services/checkoutService.js'

const emit = defineEmits(['reserva-actualizada', 'checkin-iniciado'])

const API_URL = import.meta.env.VITE_API_URL
const POR_PAGINA = 15

const reservas = ref([])
const habitaciones = ref([])
const cargando = ref(false)
const procesando = ref(null)
const guardando = ref(false)
const pagina = ref(1)
const vistaActual = ref('tabla')

const modalAbierto = ref(false)
const modalCancelar = ref(false)
const reservaACancelar = ref(null)

const busquedaDoc = ref('')
const buscando = ref(false)
const huespedEncontrado = ref(false)
const mensajeBusqueda = ref('')
const idHuespedActual = ref(null)
const errorModal = ref('')

const errorCheckinModal = ref({ visible: false, huesped: '', fechaEntrada: '' })

const formHuesped = ref({ nombre: '', apellido: '', documento: '', telefono: '', email: '' })
const formReserva = ref({ id_habitacion: '', fecha_entrada: '', fecha_salida: '' })

const hoy = (() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})()

const minFechaSalida = computed(() => {
  if (!formReserva.value.fecha_entrada) return hoy
  const d = new Date(formReserva.value.fecha_entrada)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const habitacionesDisponibles = computed(() =>
  habitaciones.value.filter(h => h.estado?.toUpperCase() === 'DISPONIBLE')
)

const reservasOrdenadas = computed(() =>
  [...reservas.value].sort((a, b) => b.id_reserva - a.id_reserva)
)
const totalPaginas = computed(() => Math.ceil(reservasOrdenadas.value.length / POR_PAGINA))
const inicio = computed(() => (pagina.value - 1) * POR_PAGINA)
const reservasPaginadas = computed(() =>
  reservasOrdenadas.value.slice(inicio.value, inicio.value + POR_PAGINA)
)

const estado = (e) => e ? e.toString().trim().toUpperCase() : ''
const formatFecha = (f) => f ? f.split('T')[0] : '—'

const claseEstado = (e) => ({
  'estado-pendiente': e === 'PENDIENTE',
  'estado-confirmada': e === 'CONFIRMADA',
  'estado-checkin': e === 'CHECKIN',
  'estado-finalizada': e === 'FINALIZADA',
  'estado-cancelada': e === 'CANCELADA',
})

const authHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (!token) throw new Error('No hay token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

const esperar = (ms) => new Promise(r => setTimeout(r, ms))

const cargarReservas = async () => {
  cargando.value = true
  try {
    const res = await fetch(`${API_URL}/listar_reservas`, { headers: authHeaders() })
    let reservasData = await res.json()
    await Promise.all(
      reservasData
        .filter(r => r.id_huesped)
        .map(async r => {
          try {
            const resH = await fetch(`${API_URL}/listar_huesped/id/${r.id_huesped}`, { headers: authHeaders() })
            if (resH.ok) {
              const hd = await resH.json()
              r.huesped = { ...r.huesped, ...(Array.isArray(hd) ? hd[0] : hd) }
            }
          } catch { /* silencioso */ }
        })
    )
    reservas.value = reservasData
    pagina.value = 1
  } finally { cargando.value = false }
}

const cargarHabitaciones = async () => {
  try {
    const res = await fetch(`${API_URL}/listar_todas_habitaciones`, { headers: authHeaders() })
    let data = await res.json()
    const lista = Array.isArray(data) ? data : data.habitaciones || []
    habitaciones.value = lista.sort((a, b) => Number(a.numero) - Number(b.numero))
  } catch (e) { console.error('Error habitaciones', e) }
}

const abrirModal = async () => {
  busquedaDoc.value = ''; mensajeBusqueda.value = ''; huespedEncontrado.value = false
  idHuespedActual.value = null; errorModal.value = ''
  formHuesped.value = { nombre: '', apellido: '', documento: '', telefono: '', email: '' }
  formReserva.value = { id_habitacion: '', fecha_entrada: '', fecha_salida: '' }
  await cargarHabitaciones()
  modalAbierto.value = true
}

const cerrarModal = () => { modalAbierto.value = false }

const buscarHuesped = async () => {
  if (!busquedaDoc.value.trim()) return
  buscando.value = true; mensajeBusqueda.value = ''; huespedEncontrado.value = false; idHuespedActual.value = null
  try {
    const res = await fetch(`${API_URL}/listar_huesped/documento/${busquedaDoc.value.trim()}`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      const h = Array.isArray(data) ? data[0] : data
      formHuesped.value = { nombre: h.nombre || '', apellido: h.apellido || '', documento: h.documento || '', telefono: h.telefono || '', email: h.email || '' }
      idHuespedActual.value = h.id_huesped; huespedEncontrado.value = true
      mensajeBusqueda.value = `✓ Huésped encontrado: ${h.nombre} ${h.apellido}`
    } else {
      formHuesped.value = { nombre: '', apellido: '', documento: busquedaDoc.value.trim(), telefono: '', email: '' }
      mensajeBusqueda.value = 'Huésped no encontrado. Completa los datos para registrarlo.'
    }
  } catch { mensajeBusqueda.value = 'Error al buscar. Intenta de nuevo.' }
  finally { buscando.value = false }
}

const crearReserva = async () => {
  errorModal.value = ''
  const { nombre, apellido, documento, telefono, email } = formHuesped.value
  const { id_habitacion, fecha_entrada, fecha_salida } = formReserva.value
  if (!nombre || !apellido) { errorModal.value = 'Nombre y apellido del huésped son obligatorios.'; return }
  if (!huespedEncontrado.value && !documento) { errorModal.value = 'El documento es obligatorio para registrar un huésped nuevo.'; return }
  if (!id_habitacion || !fecha_entrada || !fecha_salida) { errorModal.value = 'Completa todos los datos de la reserva.'; return }
  if (new Date(fecha_salida) <= new Date(fecha_entrada)) { errorModal.value = 'La fecha de salida debe ser posterior a la de entrada.'; return }
  guardando.value = true
  try {
    let idHuesped = idHuespedActual.value
    if (huespedEncontrado.value) {
      await fetch(`${API_URL}/actualizar_huesped/${idHuesped}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ nombre, apellido, telefono, email }) })
    } else {
      const resH = await fetch(`${API_URL}/crear_huesped`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ nombre, apellido, documento, telefono, email }) })
      if (!resH.ok) { const err = await resH.json().catch(() => ({})); errorModal.value = err?.detail || 'Error al registrar el huésped.'; return }
      const nuevoHuesped = await resH.json(); idHuesped = nuevoHuesped.id_huesped
    }
    const resR = await fetch(`${API_URL}/crear_reserva`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ id_habitacion: Number(id_habitacion), id_huesped: idHuesped, fecha_entrada: fecha_entrada + 'T00:00:00', fecha_salida: fecha_salida + 'T00:00:00' }) })
    if (!resR.ok) {
      const err = await resR.json().catch(() => ({}))
      errorModal.value = Array.isArray(err?.detail) ? err.detail.map(e => e.msg).join(' | ') : (err?.detail || 'Error al crear la reserva.')
      return
    }
    cerrarModal(); await cargarReservas(); await cargarHabitaciones(); emit('reserva-actualizada')
  } catch (e) { errorModal.value = 'Error de conexión: ' + e.message }
  finally { guardando.value = false }
}

const confirmar = async (id) => {
  procesando.value = id
  try {
    const res = await fetch(`${API_URL}/confirmar_reserva/${id}`, { method: 'PATCH', headers: authHeaders() })
    if (!res.ok) { const err = await res.json().catch(() => ({})); alert('Error: ' + (err?.detail || res.status)); return }
    await esperar(600); await cargarReservas(); await cargarHabitaciones(); emit('reserva-actualizada')
  } finally { procesando.value = null }
}

const prepararCancelar = (r) => { reservaACancelar.value = r; modalCancelar.value = true }

const cancelar = async () => {
  procesando.value = reservaACancelar.value.id_reserva
  try {
    await fetch(`${API_URL}/cancelar_reserva/${reservaACancelar.value.id_reserva}`, { method: 'PATCH', headers: authHeaders() })
    modalCancelar.value = false; await esperar(600); await cargarReservas(); await cargarHabitaciones(); emit('reserva-actualizada')
  } finally { procesando.value = null }
}

const checkin = async (reserva) => {
  const fechaEntrada = new Date(reserva.fecha_entrada)
  fechaEntrada.setHours(0, 0, 0, 0)
  const hoyDate = new Date()
  hoyDate.setHours(0, 0, 0, 0)

  if (fechaEntrada > hoyDate) {
    errorCheckinModal.value = {
      visible: true,
      huesped: `${reserva.huesped?.nombre || ''} ${reserva.huesped?.apellido || ''}`.trim(),
      fechaEntrada: fechaEntrada.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }
    return
  }

  procesando.value = reserva.id_reserva
  try {
    const resCheckin = await fetch(`${API_URL}/checkin_reserva/${reserva.id_reserva}`, { method: 'PATCH', headers: authHeaders() })
    if (!resCheckin.ok) {
      const err = await resCheckin.json().catch(() => ({}))
      const msg = err?.detail || ''
      if (msg.toLowerCase().includes('fecha') || msg.toLowerCase().includes('date') || msg.toLowerCase().includes('antes')) {
        errorCheckinModal.value = {
          visible: true,
          huesped: `${reserva.huesped?.nombre || ''} ${reserva.huesped?.apellido || ''}`.trim(),
          fechaEntrada: new Date(reserva.fecha_entrada).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        }
      } else {
        alert('Error en check-in: ' + (msg || resCheckin.status))
      }
      return
    }
    await esperar(600)
    await cargarReservas()
    emit('reserva-actualizada')
    const reservaActualizada = reservas.value.find(r => r.id_reserva === reserva.id_reserva)
    if (reservaActualizada) emit('checkin-iniciado', reservaActualizada)
  } finally { procesando.value = null }
}

const checkout = async (id) => {
  procesando.value = id
  try {
    await fetch(`${API_URL}/checkout_reserva/${id}`, { method: 'PATCH', headers: authHeaders() })
    const idx = reservas.value.findIndex(r => r.id_reserva === id)
    if (idx !== -1) {
      reservas.value[idx] = { ...reservas.value[idx], estado: 'FINALIZADA', fecha_salida_real: new Date().toISOString() }
    }
    checkoutStore.marcar(id)
    emit('reserva-actualizada')
  } finally { procesando.value = null }
}
onMounted(() => { cargarReservas(); cargarHabitaciones() })
</script>

<style scoped>
.btn-primary-custom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: linear-gradient(135deg, #6320EE, #8075FF);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 4px 14px rgba(99, 32, 238, 0.3);
  transition: all .2s;
}

.btn-primary-custom:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 32, 238, 0.4);
}

.btn-outline-custom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: none;
  color: #6320EE;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid rgba(99, 32, 238, 0.25);
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.btn-outline-custom:hover {
  background: rgba(99, 32, 238, 0.06);
}

.table-header {
  font-size: 12px;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
}

.badge-estado {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.estado-pendiente {
  background: rgba(217, 119, 6, 0.12);
  color: #b45309;
}

.estado-confirmada {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.estado-checkin {
  background: rgba(99, 32, 238, 0.12);
  color: #6320EE;
}

.estado-finalizada {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.estado-cancelada {
  background: rgba(220, 38, 38, 0.12);
  color: #b91c1c;
}

.action-btn {
  padding: 5px 12px;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Outfit', sans-serif;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-btn {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
  border: 1px solid rgba(99, 32, 238, 0.2);

}

.confirm-btn:hover {
  background: rgba(22, 163, 74, 0.2);
}

.cancel-btn {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
  transition: all .2s;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.cancel-btn:hover {
  background: rgba(220, 38, 38, 0.2);
}

.checkin-btn {
  background: rgba(99, 32, 238, 0.08);
  color: #6320EE;
  transition: all .2s;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(99, 32, 238, 0.2);
}

.checkin-btn:hover {
  background: rgba(99, 32, 238, 0.2);
}

.checkout-btn {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
}

.checkout-btn:hover {
  background: rgba(107, 114, 128, 0.2);
}

.pag-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1.5px solid rgba(99, 32, 238, 0.2);
  background: none;
  color: #6320EE;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.pag-btn:hover:not(:disabled) {
  background: rgba(99, 32, 238, 0.07);
}

.pag-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pag-info {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
  padding: 0 4px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(33, 26, 29, 0.55);
  backdrop-filter: blur(4px);
  z-index: 500;
}

.modal-box {
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(33, 26, 29, 0.3);
  animation: modalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
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

.modal-top-bar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 4px;
  width: 90%;
  background: linear-gradient(90deg, #6320EE, #8075FF);
  border-radius: 4px;
}

.modal-close {
  top: 16px;
  right: 16px;
  background: #f4eeff;
  width: 30px;
  height: 30px;
  color: #9ca3af;
  cursor: pointer;
  border: none;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 10px;
}

.btn-buscar {
  padding: 9px 18px;
  background: linear-gradient(135deg, #6320EE, #8075FF);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.btn-buscar:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.form-label-custom {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 5px;
  letter-spacing: 0.3px;
}

.input-custom {
  border: 1.5px solid rgba(99, 32, 238, 0.15);
  border-radius: 10px;
  padding: 9px 13px;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  color: #211A1D;
  outline: none;
  transition: border-color 0.2s;
  background: #faf8ff;
}

.input-custom:focus {
  border-color: #6320EE;
}

.input-custom::placeholder {
  color: #c4b8d0;
}

.modal-btn-primary {
  padding: 11px;
  background: linear-gradient(135deg, #6320EE, #8075FF);
  color: #fff;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 32, 238, 0.35);
  font-weight: 600;
  border: none;
}

.modal-btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.modal-btn-secondary {
  padding: 11px;
  background: #f4eeff;
  color: #6320EE;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  border: 1.5px solid rgba(99, 32, 238, 0.18);
  cursor: pointer;
  font-weight: 600;
}

.modal-btn-secondary:hover {
  background: rgba(99, 32, 238, 0.08);
}

.checkin-error-icon {
  width: 44px;
  height: 44px;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>