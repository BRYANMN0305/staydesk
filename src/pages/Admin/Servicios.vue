<template>
  <div class="servicios-wrapper">

    <!-- Header catálogo -->
    <div class="header-area">
      <div>
        <span class="eyebrow">Oferta disponible</span>
        <h2 class="fw-bold mb-0" style="font-size:25px;color:#211A1D">Servicios</h2>
      </div>
      <button class="btn-agregar" @click="mostrarModal = true">
        <span>＋</span> Nuevo servicio
      </button>
    </div>

    <div class="separador">
      <span>Catálogo de servicios</span>
    </div>

    <div v-if="cargando" class="estado-carga">
      <div class="spinner"></div>
      <span>Cargando servicios...</span>
    </div>

    <div v-else class="grid-servicios">
      <div v-for="(s, i) in servicios" :key="s.id_servicio" class="card-servicio" :style="{ '--delay': i * 60 + 'ms' }">
        <div class="card-icono">
          <span v-html="renderIcono(s.nombre)"></span>
        </div>
        <div class="card-body">
          <p class="card-nombre">{{ s.nombre }}</p>
          <p class="card-precio-unidad">por unidad</p>
        </div>
        <div class="card-derecha">
          <template v-if="editandoPrecio === s.id_servicio">
            <div class="precio-edit-wrap">
              <span class="precio-prefix">$</span>
              <input v-model.number="precioEditando" type="number" min="0" class="precio-input"
                @keyup.enter="guardarPrecio(s)" @keyup.escape="cancelarEdicion" ref="precioInputRef" />
            </div>
            <div class="precio-edit-btns">
              <button class="btn-precio-ok" @click="guardarPrecio(s)" :disabled="guardandoPrecio === s.id_servicio"
                title="Guardar">✓</button>
              <button class="btn-precio-cancel" @click="cancelarEdicion" title="Cancelar">✕</button>
            </div>
          </template>
          <template v-else>
            <div class="precio-row">
              <span class="precio-valor">${{ formatearPrecio(s.precio_unidad) }}</span>
              <button class="btn-editar-precio" @click="iniciarEdicion(s)" title="Editar precio">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
            <button class="btn-eliminar" @click="confirmarEliminar(s)" title="Eliminar">✕</button>
          </template>
        </div>
      </div>
    </div>

    <div v-if="!cargando && servicios.length === 0" class="estado-vacio">
      No hay servicios registrados. ¡Agrega el primero!
    </div>

    <div class="separador">
      <span>Reservas Activas</span>
    </div>

    <div class="seccion-checkin">
      <div class="checkin-header">
        <span class="checkin-eyebrow">En estadía</span>
        <h3 class="checkin-titulo">Habitaciones activas</h3>
        <p class="checkin-sub">Asigna los servicios antes de hacer check-out</p>
      </div>

      <div v-if="reservasEnCheckin.length === 0" class="checkin-vacio">
        <span class="checkin-vacio-icono">🏨</span>
        <p>No hay habitaciones activas en este momento</p>
      </div>

      <div v-else class="grid-checkin">
        <div v-for="reserva in reservasEnCheckin" :key="reserva.id_reserva" class="card-checkin" :class="{
          'card-confirmada': reserva._confirmado && !reserva._checkout,
          'card-checkout': reserva._checkout
        }">
          <div class="cc-top">
            <div class="cc-hab-badge">
              <span class="cc-hab-icon">🏨</span>
              <span class="cc-hab-num">Hab. {{ reserva.habitacion?.numero }}</span>
            </div>
            <span v-if="reserva._checkout" class="cc-badge-checkout">✓ Check-out</span>
            <span v-else-if="reserva._confirmado" class="cc-badge-ok">✓ Confirmado</span>
            <span v-else class="cc-badge-pendiente">En curso</span>
          </div>

          <div class="cc-huesped">
            <span class="cc-huesped-nombre">{{ reserva.huesped?.nombre }} {{ reserva.huesped?.apellido }}</span>
            <span class="cc-huesped-fecha">Entrada: {{ formatFecha(reserva.fecha_entrada) }}</span>
          </div>

          <div class="cc-servicios-lista" v-if="(reserva._serviciosAsignados || []).length > 0">
            <div v-for="(item, idx) in reserva._serviciosAsignados" :key="idx" class="cc-servicio-item">
              <span class="cc-srv-icono" v-html="renderIcono(item.nombre)"></span>
              <span class="cc-srv-nombre">{{ item.nombre }}</span>
              <div class="cc-srv-controles">
                <button class="cc-qty-btn" @click="decrementarCantidad(reserva, idx)"
                  :disabled="reserva._checkout">−</button>
                <span class="cc-qty-val">{{ item.cantidad }}</span>
                <button class="cc-qty-btn" @click="incrementarCantidad(reserva, idx)"
                  :disabled="reserva._checkout">＋</button>
              </div>
              <span class="cc-srv-subtotal">${{ formatearPrecio(item.precio_unidad * item.cantidad) }}</span>
              <button class="cc-srv-remove" @click="quitarServicio(reserva, idx)" :disabled="reserva._checkout"
                title="Quitar">✕</button>
            </div>
          </div>
          <p v-else class="cc-sin-servicios">Sin servicios agregados aún</p>

          <div class="cc-total" v-if="(reserva._serviciosAsignados || []).length > 0">
            <span>Total servicios</span>
            <span class="cc-total-valor">${{ formatearPrecio(calcularTotal(reserva)) }}</span>
          </div>

          <button v-if="!reserva._checkout" class="btn-add-srv" @click="abrirSelectorServicio(reserva)">
            <span>＋</span> Agregar servicio
          </button>

          <div class="cc-acciones" v-if="!reserva._checkout">
            <button class="btn-sin-servicio" @click="confirmarSinServicios(reserva)" :disabled="reserva._guardando">
              <span>✓</span> Sin servicios
            </button>
            <button class="btn-confirmar-srv" @click="confirmarServicios(reserva)"
              :disabled="reserva._guardando || (reserva._serviciosAsignados || []).length === 0">
              <span v-if="reserva._guardando" class="spinner-sm"></span>
              {{ reserva._guardando ? 'Guardando...' : reserva._confirmado ? 'Actualizar servicios' :
                'Confirmarservicios'
              }}
            </button>
          </div>

          <div class="cc-checkout-msg" v-if="reserva._checkout">
            <span>✓</span> Check-out realizado — no se pueden modificar servicios
          </div>

          <div class="cc-confirmado-msg" v-if="reserva._confirmado && !reserva._checkout">
            <span>✓</span> Servicios confirmados correctamente
          </div>
        </div>
      </div>
    </div>

    <!-- Modal crear servicio -->
    <Transition name="modal">
      <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-box">
          <h3 class="modal-titulo">Nuevo servicio</h3>
          <div class="campo">
            <label>Nombre del servicio</label>
            <input v-model="nuevoServicio.nombre" type="text" placeholder="Ej: Desayuno buffet"
              :class="{ error: errores.nombre }" @input="errores.nombre = ''" />
            <span v-if="errores.nombre" class="error-msg">{{ errores.nombre }}</span>
          </div>
          <div class="campo">
            <label>Precio por unidad</label>
            <div class="input-prefix" :class="{ 'input-prefix-error': errores.precio_unidad }">
              <span>$</span>
              <input v-model.number="nuevoServicio.precio_unidad" type="number" placeholder="0" min="0"
                @input="errores.precio_unidad = ''" />
            </div>
            <span v-if="errores.precio_unidad" class="error-msg">{{ errores.precio_unidad }}</span>
          </div>
          <!-- Vista previa del icono autogenerado -->
          <div class="campo" v-if="nuevoServicio.nombre">
            <label>Icono detectado</label>
            <div class="icono-preview">
              <span v-html="renderIcono(nuevoServicio.nombre)"></span>
              <span class="icono-preview-texto">Generado automáticamente según el nombre</span>
            </div>
          </div>
          <div class="modal-acciones">
            <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
            <button class="btn-guardar" @click="crearServicio" :disabled="guardando">
              <span v-if="guardando" class="spinner-sm"></span>
              {{ guardando ? 'Guardando...' : 'Guardar servicio' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal confirmar eliminar -->
    <ModalFormulario v-if="servicioAEliminar" titulo="¿Eliminar servicio?"
      :subtitulo="`Se eliminará ${servicioAEliminar.nombre}. Esta acción no se puede deshacer.`" :cargando="eliminando"
      textoConfirmar="Eliminar" :peligroso="true" @cerrar="servicioAEliminar = null" @confirmar="eliminarServicio" />

    <!-- Modal error al eliminar -->
    <ModalFormulario v-if="errorEliminar" titulo="No se pudo eliminar" :subtitulo="errorEliminar"
      textoConfirmar="Entendido" :peligroso="true" @cerrar="errorEliminar = ''" @confirmar="errorEliminar = ''" />
    <!-- Modal selector de servicio para habitación -->
    <Transition name="modal">
      <div v-if="modalSelectorVisible" class="modal-overlay" @click.self="modalSelectorVisible = false">
        <div class="modal-box modal-selector">
          <h3 class="modal-titulo">Agregar servicio</h3>
          <p class="selector-sub">
            Hab. {{ reservaSeleccionada?.habitacion?.numero }} — {{ reservaSeleccionada?.huesped?.nombre }}
          </p>
          <div class="selector-lista">
            <div v-for="s in servicios" :key="s.id_servicio" class="selector-item" @click="agregarServicioAReserva(s)">
              <span class="sel-icono" v-html="renderIcono(s.nombre)"></span>
              <div class="sel-info">
                <span class="sel-nombre">{{ s.nombre }}</span>
                <span class="sel-precio">${{ formatearPrecio(s.precio_unidad) }} / unidad</span>
              </div>
              <span class="sel-add">＋</span>
            </div>
          </div>
          <div class="modal-acciones">
            <button class="btn-cancelar" @click="modalSelectorVisible = false">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="toast.visible" :class="['toast', toast.tipo]">{{ toast.mensaje }}</div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { checkoutStore } from '@/services/checkoutService.js'
import ModalFormulario from '@/components/ModalFormulario.vue'

const API_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function getStorageKey() {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return `staydesk_reservas_completas_${payload.sub || payload.id || 'default'}`
    }
  } catch { /* noop */ }
  return 'staydesk_reservas_completas_default'
}

const props = defineProps({
  reservasCheckin: { type: Array, default: () => [] }
})
const emit = defineEmits(['servicios-confirmados'])

const servicios = ref([])
const cargando = ref(true)
const guardando = ref(false)
const eliminando = ref(false)
const mostrarModal = ref(false)
const servicioAEliminar = ref(null)
const errorEliminar = ref('')

const editandoPrecio = ref(null)
const precioEditando = ref(0)
const guardandoPrecio = ref(null)
const precioInputRef = ref([])

const nuevoServicio = reactive({ nombre: '', precio_unidad: null })
const errores = reactive({ nombre: '', precio_unidad: '' })
const toast = reactive({ visible: false, mensaje: '', tipo: 'success' })

function getIconoSVG(nombre = '') {
  const n = nombre.toLowerCase()

  const map = [
    {
      keys: ['desayuno', 'almuerzo', 'cena', 'comida', 'restaurante', 'buffet', 'café', 'cafe', 'bar', 'bebida', 'snack'],
      path: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
      color: '#f59e0b',
    },
    {
      keys: ['limpieza', 'aseo', 'lavandería', 'lavanderia', 'plancha', 'sábanas', 'sabanas', 'toallas', 'housekeeping'],
      path: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
      color: '#06b6d4',
    },
    {
      keys: ['parking', 'parqueadero', 'carro', 'coche', 'auto', 'vehículo', 'vehiculo', 'garaje'],
      path: 'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5M14 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      color: '#8b5cf6',
    },
    {
      keys: ['spa', 'masaje', 'relajación', 'relajacion', 'wellness', 'sauna', 'jacuzzi'],
      path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
      color: '#ec4899',
    },
    {
      keys: ['piscina', 'pool', 'natación', 'natacion', 'gym', 'gimnasio', 'fitness', 'deporte', 'tenis'],
      path: 'M2 20h20M6 20V10M18 20V10M12 20V4M2 10h4M18 10h4M6 10a6 6 0 0 1 12 0',
      color: '#3b82f6',
    },
    {
      keys: ['wifi', 'internet', 'conexión', 'conexion', 'red', 'tv', 'televisión', 'television', 'entretenimiento'],
      path: 'M1.42 9a16 16 0 0 1 21.16 0M5 12.55a11 11 0 0 1 14.08 0M10.54 16.1a6 6 0 0 1 2.92 0M12 20h.01',
      color: '#10b981',
    },
    {
      keys: ['transporte', 'traslado', 'transfer', 'aeropuerto', 'taxi', 'shuttle'],
      path: 'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5M14 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      color: '#f97316',
    },
    {
      keys: ['bebé', 'bebe', 'cuna', 'niño', 'niña', 'kids', 'baby'],
      path: 'M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zM3 21v-1a9 9 0 0 1 18 0v1',
      color: '#a78bfa',
    },
    {
      keys: ['tour', 'excursión', 'excursion', 'guía', 'guia', 'visita', 'ciudad'],
      path: 'M3 11l19-9-9 19-2-8-8-2z',
      color: '#0ea5e9',
    },
    {
      keys: ['minibar', 'vino', 'wine', 'cerveza', 'bebidas', 'alcohol'],
      path: 'M8 22h8M7 10h10l-1 7H8L7 10zM9 10V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4',
      color: '#dc2626',
    },
  ]

  for (const { keys, path, color } of map) {
    if (keys.some(k => n.includes(k))) return { path, color }
  }

  return {
    path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    color: '#7c6af7',
  }
}

function renderIcono(nombre) {
  const { path, color } = getIconoSVG(nombre)
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="${path}"/>
  </svg>`
}

function cargarReservasGuardadas() {
  try {
    const raw = localStorage.getItem(getStorageKey())
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function persistirReservas(lista) {
  const map = cargarReservasGuardadas()
  for (const r of lista) {
    map[r.id_reserva] = {
      id_reserva: r.id_reserva,
      fecha_entrada: r.fecha_entrada,
      habitacion: r.habitacion,
      huesped: r.huesped,
      _serviciosAsignados: r._serviciosAsignados || [],
      _confirmado: r._confirmado || false,
      _checkout: r._checkout || false,
    }
  }
  try { localStorage.setItem(getStorageKey(), JSON.stringify(map)) } catch { /* noop */ }
}

const estadoReservas = reactive({})

function getEstado(idReserva) {
  if (!estadoReservas[idReserva]) {
    const guardadas = cargarReservasGuardadas()
    const saved = guardadas[idReserva] || {}
    estadoReservas[idReserva] = {
      _serviciosAsignados: saved._serviciosAsignados || [],
      _confirmado: saved._confirmado || false,
      _checkout: saved._checkout || false,
      _guardando: false,
    }
  }
  return estadoReservas[idReserva]
}

const reservasEnCheckin = computed(() => {
  const guardadas = cargarReservasGuardadas()
  const idsProps = new Set(props.reservasCheckin.map(r => r.id_reserva))
  const estadosActivos = new Set(['CHECKIN', 'OCUPADO'])

  const fromProps = props.reservasCheckin
    .map(r => ({ ...r, ...getEstado(r.id_reserva) }))
    .filter(r => !r._checkout && !checkoutStore.idsCheckout.has(r.id_reserva) && estadosActivos.has(r.estado?.toUpperCase()))

  const fromStorage = Object.values(guardadas)
    .filter(r => !idsProps.has(r.id_reserva) && !r._checkout && !checkoutStore.idsCheckout.has(r.id_reserva) && estadosActivos.has(r.estado?.toUpperCase()))
    .map(r => ({ ...r, ...getEstado(r.id_reserva) }))

  return [...fromProps, ...fromStorage]
})

watch(estadoReservas, () => {
  persistirReservas(reservasEnCheckin.value)
}, { deep: true })

const modalSelectorVisible = ref(false)
const reservaSeleccionada = ref(null)

function abrirSelectorServicio(reserva) {
  reservaSeleccionada.value = reserva
  modalSelectorVisible.value = true
}

function agregarServicioAReserva(servicio) {
  const reserva = reservaSeleccionada.value
  if (!reserva) return

  const estado = getEstado(reserva.id_reserva)
  const existente = estado._serviciosAsignados.find(s => s.id_servicio === servicio.id_servicio)

  if (existente) {
    existente.cantidad++
  } else {
    estado._serviciosAsignados.push({
      id_servicio: servicio.id_servicio,
      nombre: servicio.nombre,
      precio_unidad: servicio.precio_unidad,
      cantidad: 1,
    })
  }

  modalSelectorVisible.value = false
  mostrarToast(`${servicio.nombre} agregado a Hab. ${reserva.habitacion?.numero}`)
}

function quitarServicio(reserva, idx) {
  getEstado(reserva.id_reserva)._serviciosAsignados.splice(idx, 1)
}

function incrementarCantidad(reserva, idx) {
  getEstado(reserva.id_reserva)._serviciosAsignados[idx].cantidad++
}

function decrementarCantidad(reserva, idx) {
  const lista = getEstado(reserva.id_reserva)._serviciosAsignados
  if (lista[idx].cantidad <= 1) lista.splice(idx, 1)
  else lista[idx].cantidad--
}

function calcularTotal(reserva) {
  return (reserva._serviciosAsignados || []).reduce(
    (acc, s) => acc + s.precio_unidad * s.cantidad, 0
  )
}

async function confirmarServicios(reserva) {
  const estado = getEstado(reserva.id_reserva)
  if (!estado._serviciosAsignados.length) return

  estado._guardando = true
  try {
    for (const srv of estado._serviciosAsignados) {
      const res = await fetch(`${API_URL}/asignar_servicio/${reserva.id_reserva}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ id_servicio: srv.id_servicio, cantidad: srv.cantidad }),
      })
      if (!res.ok) throw new Error(`Error asignando servicio ${srv.nombre}`)
    }
    estado._confirmado = true
    setTimeout(() => { estado._confirmado = false }, 3000)
    mostrarToast(`Servicios guardados para Hab. ${reserva.habitacion?.numero} ✓`)
    emit('servicios-confirmados', reserva.id_reserva)
  } catch (e) {
    mostrarToast(e.message || 'Error al guardar los servicios.', 'error')
  } finally {
    estado._guardando = false
  }
}

async function confirmarSinServicios(reserva) {
  const estado = getEstado(reserva.id_reserva)
  estado._confirmado = true
  setTimeout(() => { estado._confirmado = false }, 3000)
  mostrarToast(`Hab. ${reserva.habitacion?.numero} confirmada sin servicios ✓`)
  emit('servicios-confirmados', reserva.id_reserva)
}

function iniciarEdicion(servicio) {
  editandoPrecio.value = servicio.id_servicio
  precioEditando.value = servicio.precio_unidad
  nextTick(() => {
    if (precioInputRef.value?.[0]) precioInputRef.value[0].focus()
  })
}

function cancelarEdicion() {
  editandoPrecio.value = null
  precioEditando.value = 0
}

async function guardarPrecio(servicio) {
  if (precioEditando.value === null || precioEditando.value === undefined || precioEditando.value <= 0) {
    mostrarToast('Ingresa un precio válido.', 'error')
    return
  }
  guardandoPrecio.value = servicio.id_servicio
  try {
    const res = await fetch(`${API_URL}/actualizar_precio/servicio/${servicio.id_servicio}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ precio_unidad: precioEditando.value }),
    })
    if (!res.ok) throw new Error()
    servicio.precio_unidad = precioEditando.value
    mostrarToast(`Precio de "${servicio.nombre}" actualizado.`)
    cancelarEdicion()
  } catch {
    mostrarToast('No se pudo actualizar el precio.', 'error')
  } finally {
    guardandoPrecio.value = null
  }
}

function formatFecha(f) { return f ? f.split('T')[0] : '—' }

function formatearPrecio(v) {
  const n = Number(v)
  return isNaN(n) ? '0' : n.toLocaleString('es-CO')
}

function mostrarToast(mensaje, tipo = 'success') {
  toast.mensaje = mensaje
  toast.tipo = tipo
  toast.visible = true
  setTimeout(() => (toast.visible = false), 3200)
}

function cerrarModal() {
  mostrarModal.value = false
  nuevoServicio.nombre = ''
  nuevoServicio.precio_unidad = null
  errores.nombre = ''
  errores.precio_unidad = ''
}

function validar() {
  let ok = true
  if (!nuevoServicio.nombre.trim()) { errores.nombre = 'El nombre es obligatorio.'; ok = false }
  if (!nuevoServicio.precio_unidad || nuevoServicio.precio_unidad <= 0) { errores.precio_unidad = 'Ingresa un precio válido.'; ok = false }
  return ok
}

async function listarServicios() {
  cargando.value = true
  try {
    const res = await fetch(`${API_URL}/listar_servicios`, { headers: authHeaders() })
    const data = await res.json()
    servicios.value = Array.isArray(data) ? data : []
  } catch {
    mostrarToast('Error al cargar los servicios.', 'error')
  } finally {
    cargando.value = false
  }
}

async function crearServicio() {
  if (!validar()) return
  guardando.value = true
  try {
    const payload = {
      nombre: nuevoServicio.nombre.trim(),
      precio_unidad: nuevoServicio.precio_unidad,
    }
    const res = await fetch(`${API_URL}/crear_servicio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error()

    const creado = await res.json().catch(() => null)
    servicios.value.push({
      id_servicio: creado?.id_servicio ?? Date.now(),
      nombre: payload.nombre,
      precio_unidad: payload.precio_unidad,
    })

    mostrarToast('Servicio creado correctamente.')
    cerrarModal()
  } catch {
    mostrarToast('No se pudo crear el servicio.', 'error')
  } finally {
    guardando.value = false
  }
}

function confirmarEliminar(s) { servicioAEliminar.value = s }

async function eliminarServicio() {
  eliminando.value = true
  try {
    const res = await fetch(
      `${API_URL}/eliminar_servicio/${servicioAEliminar.value.id_servicio}`,
      { method: 'DELETE', headers: { ...authHeaders() } }
    )

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      const mensaje = data?.detail || 'No se pudo eliminar el servicio.'
      servicioAEliminar.value = null
      errorEliminar.value = mensaje
      return
    }

    const idEliminado = servicioAEliminar.value.id_servicio
    servicios.value = servicios.value.filter(s => s.id_servicio !== idEliminado)
    servicioAEliminar.value = null
    mostrarToast('Servicio eliminado.')
  } catch {
    servicioAEliminar.value = null
    errorEliminar.value = 'Ocurrió un error de conexión al intentar eliminar el servicio.'
  } finally {
    eliminando.value = false
  }
}

function sincronizarCheckouts() {
  const guardadas = cargarReservasGuardadas()
  for (const [id, data] of Object.entries(guardadas)) {
    if (data._checkout) {
      const idNum = Number(id)
      if (!estadoReservas[idNum]) {
        estadoReservas[idNum] = {
          _serviciosAsignados: data._serviciosAsignados || [],
          _confirmado: data._confirmado || false,
          _checkout: true,
          _guardando: false,
        }
      } else {
        estadoReservas[idNum]._checkout = true
      }
    }
  }
}

onMounted(() => {
  listarServicios()
  sincronizarCheckouts()
})
</script>

<style scoped>
.servicios-wrapper {
  background: #f0f0f8;
  border-radius: 16px;
  padding: 2rem;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  position: relative;
}

.header-area {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.eyebrow {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #7c6af7;
  display: block;
  margin-bottom: 0.25rem;
}

.btn-agregar {
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
  margin: 0px 0px 0px 20px;
}

.btn-agregar:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 32, 238, 0.4);
}

.grid-servicios {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 0.85rem;
}

.card-servicio {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: fadeUp 0.4s ease both;
  animation-delay: var(--delay);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  box-shadow: 0 1px 3px rgba(26, 16, 51, 0.06);
}

.card-servicio:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 106, 247, 0.14);
  border-color: #c4bbf9;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-icono {
  width: 42px;
  height: 42px;
  background: #ede9fe;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-nombre {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1a1033;
  margin: 0 0 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-precio-unidad {
  font-size: 0.7rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 0;
}

.card-derecha {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;
}

.precio-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.precio-valor {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1033;
}

.btn-editar-precio {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-editar-precio:hover {
  background: #ede9fe;
  border-color: #c4bbf9;
  color: #7c6af7;
}

.precio-edit-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #7c6af7;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.precio-prefix {
  padding: 0 6px;
  color: #7c6af7;
  font-size: 0.85rem;
  font-weight: 600;
  border-right: 1px solid #e5e7eb;
}

.precio-input {
  width: 80px;
  border: none;
  padding: 4px 6px;
  font-size: 0.9rem;
  color: #1a1033;
  outline: none;
  background: transparent;
}

.precio-edit-btns {
  display: flex;
  gap: 4px;
}

.btn-precio-ok {
  background: #7c6af7;
  color: #fff;
  border: none;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.btn-precio-ok:hover:not(:disabled) {
  background: #6355d4;
}

.btn-precio-ok:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-precio-cancel {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.btn-precio-cancel:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

.btn-eliminar {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  color: #9ca3af;
  width: 26px;
  height: 26px;
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.btn-eliminar:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #ef4444;
}

.icono-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #ede9fe;
  border: 1.5px solid #c4bbf9;
  border-radius: 10px;
  padding: 0.65rem 1rem;
}

.icono-preview-texto {
  font-size: 0.75rem;
  color: #7c6af7;
  font-style: italic;
}

/* ── Check-in ── */
.seccion-checkin {
  margin-bottom: 2rem;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(26, 16, 51, 0.06);
}

.checkin-header {
  margin-bottom: 1.25rem;
}

.checkin-eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7c6af7;
  display: block;
  margin-bottom: 0.25rem;
}

.checkin-titulo {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1033;
  margin: 0 0 0.2rem;
}

.checkin-sub {
  font-size: 0.78rem;
  color: #6b7280;
  margin: 0;
}

.checkin-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  color: #9ca3af;
  font-size: 0.85rem;
}

.checkin-vacio-icono {
  font-size: 2rem;
}

.grid-checkin {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.card-checkin {
  background: #fafafa;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.card-checkin:hover {
  box-shadow: 0 4px 16px rgba(124, 106, 247, 0.12);
  border-color: #c4bbf9;
}

.card-confirmada {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.card-checkout {
  border-color: #d1d5db;
  background: #f9fafb;
  opacity: 0.8;
}

.cc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cc-hab-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cc-hab-icon {
  font-size: 1.1rem;
}

.cc-hab-num {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1033;
}

.cc-badge-pendiente {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #fef3c7;
  color: #d97706;
  border-radius: 999px;
  padding: 3px 10px;
  border: 1px solid #fde68a;
}

.cc-badge-ok {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 999px;
  padding: 3px 10px;
  border: 1px solid #bbf7d0;
}

.cc-badge-checkout {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 999px;
  padding: 3px 10px;
  border: 1px solid #d1d5db;
}

.cc-huesped {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.cc-huesped-nombre {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1a1033;
}

.cc-huesped-fecha {
  font-size: 0.72rem;
  color: #7c6af7;
}

.cc-servicios-lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cc-servicio-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #ede9fe;
  border: 1px solid #c4bbf9;
  border-radius: 9px;
  padding: 0.5rem 0.7rem;
}

.cc-srv-icono {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.cc-srv-nombre {
  flex: 1;
  font-size: 0.8rem;
  color: #1a1033;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cc-srv-controles {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.cc-qty-btn {
  width: 22px;
  height: 22px;
  border: 1px solid #c4bbf9;
  border-radius: 6px;
  background: #fff;
  color: #7c6af7;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.cc-qty-btn:hover:not(:disabled) {
  background: #ede9fe;
}

.cc-qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cc-qty-val {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1a1033;
  min-width: 18px;
  text-align: center;
}

.cc-srv-subtotal {
  font-size: 0.88rem;
  font-weight: 700;
  color: #7c6af7;
  flex-shrink: 0;
}

.cc-srv-remove {
  background: none;
  border: none;
  color: #c4bbf9;
  font-size: 0.7rem;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: color 0.15s;
}

.cc-srv-remove:hover:not(:disabled) {
  color: #ef4444;
}

.cc-srv-remove:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.cc-sin-servicios {
  font-size: 0.78rem;
  color: #9ca3af;
  font-style: italic;
  margin: 0;
  text-align: center;
  padding: 0.5rem 0;
}

.cc-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #e5e7eb;
  padding-top: 0.6rem;
  font-size: 0.78rem;
  color: #6b7280;
}

.cc-total-valor {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1033;
}

.btn-add-srv {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: #ede9fe;
  border: 1.5px dashed #7c6af7;
  border-radius: 10px;
  padding: 0.55rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #7c6af7;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.btn-add-srv:hover {
  background: #ddd6fe;
  border-color: #6355d4;
}

.cc-acciones {
  display: flex;
  gap: 0.6rem;
}

.btn-sin-servicio {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  background: #f3f4f6;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-sin-servicio:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-sin-servicio:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirmar-srv {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  background: #7c6af7;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  box-shadow: 0 2px 8px rgba(124, 106, 247, 0.25);
}

.btn-confirmar-srv:hover:not(:disabled) {
  background: #6355d4;
}

.btn-confirmar-srv:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cc-confirmado-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 0.65rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #16a34a;
}

.cc-checkout-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0.65rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
}

.separador {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.75rem 0 1.5rem;
  color: #7c6af7;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.separador::before,
.separador::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

/* ── Modales ── */
.modal-selector {
  max-width: 460px;
}

.selector-sub {
  font-size: 0.8rem;
  color: #6b7280;
  margin: -0.75rem 0 1rem;
}

.selector-lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 320px;
  overflow-y: auto;
  margin-bottom: 0.5rem;
}

.selector-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
  cursor: pointer;
  background: #fff;
  transition: background 0.15s, border-color 0.15s;
}

.selector-item:hover {
  background: #ede9fe;
  border-color: #7c6af7;
}

.sel-icono {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.sel-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.sel-nombre {
  font-size: 0.87rem;
  font-weight: 600;
  color: #1a1033;
}

.sel-precio {
  font-size: 0.73rem;
  color: #7c6af7;
}

.sel-add {
  font-size: 1.1rem;
  color: #7c6af7;
  flex-shrink: 0;
}

.estado-carga {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #9ca3af;
  font-size: 0.85rem;
  padding: 1.5rem 0;
}

.estado-vacio {
  text-align: center;
  color: #9ca3af;
  font-size: 0.85rem;
  padding: 2.5rem 0;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e5e7eb;
  border-top-color: #7c6af7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-sm {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 16, 51, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-box {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 24px 60px rgba(26, 16, 51, 0.2);
}

.modal-titulo {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1033;
  margin: 0 0 1.5rem;
}

.modal-titulo-error {
  color: #911e1e;
}

.campo {
  margin-bottom: 1.1rem;
}

.campo label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.campo input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  background: #fafafa;
  color: #1a1033;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.campo input:focus {
  border-color: #7c6af7;
  box-shadow: 0 0 0 3px rgba(124, 106, 247, 0.15);
}

.campo input.error {
  border-color: #ef4444;
}

.input-prefix {
  display: flex;
  align-items: center;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-prefix:focus-within {
  border-color: #7c6af7;
  box-shadow: 0 0 0 3px rgba(124, 106, 247, 0.15);
}

.input-prefix-error {
  border-color: #ef4444 !important;
}

.input-prefix span {
  padding: 0 0.75rem;
  color: #7c6af7;
  font-size: 0.95rem;
  font-weight: 600;
  border-right: 1px solid #e5e7eb;
}

.input-prefix input {
  border: none;
  border-radius: 0;
  padding: 0.65rem 0.75rem;
  flex: 1;
  background: transparent;
}

.input-prefix input:focus {
  border-color: transparent;
  box-shadow: none;
}

.error-msg {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.3rem;
  display: block;
}

.modal-acciones {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.75rem;
  justify-content: flex-end;
}

.btn-cancelar {
  background: none;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancelar:hover {
  background: #f3f4f6;
}

.btn-guardar {
  background: #7c6af7;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: background 0.2s, opacity 0.2s;
  box-shadow: 0 2px 8px rgba(124, 106, 247, 0.3);
}

.btn-guardar:hover:not(:disabled) {
  background: #6355d4;
}

.btn-guardar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-confirmar {
  text-align: center;
}

.confirmar-icono {
  font-size: 2.2rem;
  margin-bottom: 0.75rem;
}

.confirmar-texto {
  color: #6b7280;
  font-size: 0.88rem;
  line-height: 1.6;
  margin: 0 0 0.5rem;
}

.btn-eliminar-confirm {
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: background 0.2s, opacity 0.2s;
}

.btn-eliminar-confirm:hover:not(:disabled) {
  background: #dc2626;
}

.btn-eliminar-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-entendido {
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 2rem;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
}

.btn-entendido:hover {
  background: #961919;
}

.toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(26, 16, 51, 0.2);
  z-index: 200;
}

.toast.success {
  background: #1a1033;
  color: #fff;
  border-left: 4px solid #7c6af7;
}

.toast.error {
  background: #ef4444;
  color: #fff;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95) translateY(8px);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 576px) {
  .servicios-wrapper {
    padding: 0.75rem;
    border-radius: 8px;
  }

  .grid-servicios {
    grid-template-columns: 1fr;
  }

  .grid-checkin {
    grid-template-columns: 1fr;
  }

  .card-servicio {
    gap: 0.6rem;
    padding: 0.85rem;
  }

  .card-nombre {
    font-size: 0.8rem;
  }

  .precio-valor {
    font-size: 0.88rem;
  }

  .card-derecha {
    max-width: 90px;
  }

  .seccion-checkin {
    padding: 1rem;
  }

  .btn-agregar {
    margin: 0;
    font-size: 13px;
    padding: 8px 14px;
  }
}
</style>