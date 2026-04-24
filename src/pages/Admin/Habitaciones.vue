<template>
  <div class="position-relative">
    <div class="bg-white rounded-3 border p-4">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-0" style="font-size:25px;color:#211A1D">Habitaciones</h2>
          <span class="text-muted small">
            {{ habitaciones.length }} habitación{{ habitaciones.length !== 1 ? 'es' : '' }}
            registrada{{ habitaciones.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <button class="toggle-desactivadas d-none d-md-inline-flex" :class="{ activo: mostrarDesactivadas }"
            @click="mostrarDesactivadas = !mostrarDesactivadas">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Inactivas
            <span v-if="cantidadDesactivadas > 0" class="badge-pill-count">{{ cantidadDesactivadas }}</span>
          </button>

          <button class="btn-primary-custom" @click="abrirModalCrear">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Crear habitación
          </button>
        </div>
      </div>

      <div v-if="cargando" class="text-muted py-3 text-center">Cargando habitaciones...</div>

      <div v-else-if="habitaciones.length === 0" class="text-muted fst-italic py-3 text-center">
        No hay habitaciones registradas.
      </div>

      <div v-else class="row g-3">
        <div class="col-12 col-sm-6 col-md-4 col-xl-3" v-for="h in habitacionesFiltradas" :key="h.id_habitacion">
          <div class="card-habitacion d-flex flex-column gap-1" :class="{ 'card-inactiva': esDesactivada(h) }">

            <div v-if="esDesactivada(h)" class="badge-inactiva">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              Habitación inactiva
            </div>

            <Habitacion_Card :number="String(h.numero)" :type="h.tipo || 'Estándar'"
              :floor="Number(pisos.find(p => p.id_piso === h.id_piso)?.numero || h.id_piso || 1)"
              :status="mapEstado(h.estado)" :price="Number(h.precio_noche || 0)" :guest="h.huesped || ''" />

            <select class="form-select form-select-sm estado-manual" :value="h.estado?.toUpperCase()"
              :disabled="actualizando === h.id_habitacion || esDesactivada(h)"
              @change="cambiarEstado(h, $event.target.value)">
              <option value="DISPONIBLE">✅ Disponible</option>
              <option value="RESERVADO" disabled>🟠 Reservada (auto)</option>
              <option value="OCUPADO" disabled>🔴 Ocupada (auto)</option>
              <option value="LIMPIEZA">🧹 Limpieza</option>
              <option value="MANTENIMIENTO">🔧 Mantenimiento</option>
            </select>

            <!-- Editar precio -->
            <div v-if="editandoPrecio === h.id_habitacion" class="precio-edit-row">
              <div class="precio-edit-wrap">
                <span class="precio-prefix">$</span>
                <input v-model.number="precioEditando" type="number" min="0" class="precio-input"
                  @keyup.enter="guardarPrecioHabitacion(h)" @keyup.escape="cancelarEdicionPrecio"
                  ref="precioHabInputRef" />
                <span class="precio-suffix">/noche</span>
              </div>
              <div class="precio-edit-btns">
                <button class="btn-precio-ok" @click="guardarPrecioHabitacion(h)"
                  :disabled="guardandoPrecioHab === h.id_habitacion" title="Guardar">✓</button>
                <button class="btn-precio-cancel" @click="cancelarEdicionPrecio" title="Cancelar">✕</button>
              </div>
            </div>
            <button v-else class="btn-editar-precio-hab" :disabled="esDesactivada(h)" @click="iniciarEdicionPrecio(h)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar precio
            </button>


            <button class="action-btn delete-btn w-100 mt-1" :disabled="esDesactivada(h)" @click="confirmarEliminar(h)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
              Eliminar
            </button>

            <button v-if="esDesactivada(h)" class="btn-reactivar w-100 mt-1"
              :disabled="actualizando === h.id_habitacion" @click="reactivarHabitacion(h)">
              <svg v-if="actualizando !== h.id_habitacion" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5">
                <path d="M1 4v6h6" />
                <path d="M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              <span v-if="actualizando === h.id_habitacion" class="spinner-reactivar"></span>
              {{ actualizando === h.id_habitacion ? 'Reactivando...' : 'Reactivar habitación' }}
            </button>

          </div>
        </div>
      </div>

      <div v-if="mostrarDesactivadas && cantidadDesactivadas > 0" class="banner-info mt-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Mostrando {{ cantidadDesactivadas }} habitación{{ cantidadDesactivadas !== 1 ? 'es' : '' }} inactiva{{
          cantidadDesactivadas !== 1 ? 's' : '' }}.
        Las habitaciones inactivas no pueden recibir reservas ni cambios de estado.
      </div>

      <p v-if="errorGeneral" class="text-danger mt-3 mb-0 small">{{ errorGeneral }}</p>

    </div>

    <!-- MODAL CREAR -->
    <ModalFormulario v-if="modalAbierto" titulo="Nueva habitación" subtitulo="Completa los datos de la nueva habitación"
      :campos="camposHabitacion" :valorInicial="form" :error="errorModal" :cargando="guardando"
      textoConfirmar="Crear habitación" @cerrar="cerrarModal" @guardar="guardar" />

    <!-- MODAL ELIMINAR -->
    <ModalFormulario v-if="modalEliminar" titulo="¿Eliminar habitación?"
      :subtitulo="`La habitación ${habitacionAEliminar?.numero} será eliminada. Si tiene historial de reservas, se desactivará en lugar de eliminarse.`"
      :cargando="guardando" :error="errorModal" textoConfirmar="Eliminar" :peligroso="true"
      @cerrar="modalEliminar = false" @confirmar="eliminar" />

    <Transition name="toast-anim">
      <div v-if="toastMsg" class="toast-precio">{{ toastMsg }}</div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import Habitacion_Card from '../../components/Habitacion_Card.vue'
import ModalFormulario from '@/components/ModalFormulario.vue'

const emit = defineEmits(['habitacion-actualizada'])

const BASE = 'https://staydesk-apis.duckdns.org'

const habitaciones = ref([])
const pisos = ref([])
const cargando = ref(false)
const cargandoPisos = ref(false)
const guardando = ref(false)
const modalAbierto = ref(false)
const modalEliminar = ref(false)
const habitacionAEliminar = ref(null)
const errorModal = ref('')
const errorGeneral = ref('')
const actualizando = ref(null)
const mostrarDesactivadas = ref(false)

const editandoPrecio = ref(null)
const precioEditando = ref(0)
const guardandoPrecioHab = ref(null)
const precioHabInputRef = ref(null)

const form = ref({
  numero: '',
  tipo: 'SIMPLE',
  precio_noche: '',
  capacidad: '',
  estado: 'DISPONIBLE',
  id_piso: ''
})

const camposHabitacion = computed(() => [
  { key: 'numero', label: 'Número', type: 'number', placeholder: 'Ej: 101', colClass: 'col-6' },
  { key: 'capacidad', label: 'Capacidad', type: 'number', placeholder: 'Ej: 2', colClass: 'col-6' },
  { key: 'precio_noche', label: 'Precio / noche', type: 'number', placeholder: 'Ej: 50', colClass: 'col-6' },
  {
    key: 'tipo', label: 'Tipo', type: 'select', colClass: 'col-6', placeholder: 'Selecciona un tipo',
    opciones: [
      { value: 'SIMPLE', label: 'Simple' },
      { value: 'DOBLE', label: 'Doble' },
      { value: 'SUITE', label: 'Suite' },
      { value: 'FAMILIAR', label: 'Familiar' }
    ]
  },
  {
    key: 'estado', label: 'Estado inicial', type: 'select', colClass: 'col-6', placeholder: 'Selecciona un estado',
    opciones: [
      { value: 'DISPONIBLE', label: 'Disponible' },
      { value: 'LIMPIEZA', label: 'Limpieza' },
      { value: 'MANTENIMIENTO', label: 'Mantenimiento' }
    ]
  },
  {
    key: 'id_piso', label: 'Piso', type: 'select', colClass: 'col-6',
    placeholder: cargandoPisos.value ? 'Cargando...' : 'Selecciona un piso',
    opciones: pisos.value.map(p => ({ value: p.id_piso, label: `Piso ${p.numero}` }))
  }
])

const mapEstado = (estado) => {
  if (!estado) return 'available'
  const e = estado.toUpperCase()
  if (e === 'DISPONIBLE') return 'available'
  if (e === 'OCUPADO' || e === 'OCUPADA') return 'occupied'
  if (e === 'RESERVADO' || e === 'RESERVADA') return 'reserved'
  if (e === 'LIMPIEZA') return 'cleaning'
  if (e === 'MANTENIMIENTO') return 'maintenance'
  return 'available'
}

const authHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

const esDesactivada = (h) =>
  h.activo === 0 || h.activo === false || h.estado?.toUpperCase() === 'INACTIVO'

const cantidadDesactivadas = computed(() =>
  habitaciones.value.filter(h => esDesactivada(h)).length
)

const habitacionesFiltradas = computed(() =>
  mostrarDesactivadas.value
    ? habitaciones.value
    : habitaciones.value.filter(h => !esDesactivada(h))
)

async function cargar() {
  cargando.value = true
  errorGeneral.value = ''
  try {
    const res = await fetch(`${BASE}/listar_todas_habitaciones`, { headers: authHeaders() })
    const data = await res.json()
    habitaciones.value = Array.isArray(data) ? data : data.habitaciones || []
  } catch {
    errorGeneral.value = 'Error al cargar habitaciones.'
  } finally {
    cargando.value = false
  }
}

async function cargarPisos() {
  cargandoPisos.value = true
  try {
    const res = await fetch(`${BASE}/listar_pisos`, { headers: authHeaders() })
    pisos.value = await res.json()
  } catch {
    pisos.value = []
  } finally {
    cargandoPisos.value = false
  }
}

const abrirModalCrear = () => {
  form.value = {
    numero: '',
    tipo: 'SIMPLE',
    precio_noche: '',
    capacidad: '',
    estado: 'DISPONIBLE',
    id_piso: ''
  }
  errorModal.value = ''
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  errorModal.value = ''
}

const guardar = async (datos) => {
  if (!datos.numero || !datos.precio_noche || !datos.capacidad || !datos.id_piso) {
    errorModal.value = 'Completa todos los campos.'
    return
  }
  guardando.value = true
  errorModal.value = ''
  try {
    const res = await fetch(`${BASE}/crear_habitacion`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        numero: Number(datos.numero),
        tipo: datos.tipo,
        precio_noche: Number(datos.precio_noche),
        capacidad: Number(datos.capacidad),
        estado: datos.estado,
        id_piso: Number(datos.id_piso)
      })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Error ${res.status}`)
    }
    cerrarModal()
    await cargar()
    emit('habitacion-actualizada')
  } catch (e) {
    errorModal.value = typeof e.message === 'string' ? e.message : 'No se pudo crear la habitación.'
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (habitacion) => {
  habitacionAEliminar.value = habitacion
  modalEliminar.value = true
}

const eliminar = async () => {
  if (!habitacionAEliminar.value?.id_habitacion) {
    errorModal.value = 'Habitación inválida.'
    return
  }
  guardando.value = true
  errorModal.value = ''
  try {
    const res = await fetch(
      `${BASE}/eliminar_habitacion/${habitacionAEliminar.value.id_habitacion}`,
      { method: 'DELETE', headers: authHeaders() }
    )
    if (!res.ok) throw new Error()
    modalEliminar.value = false
    habitacionAEliminar.value = null
    await cargar()
    emit('habitacion-actualizada')
  } catch {
    errorModal.value = 'No se pudo eliminar la habitación.'
  } finally {
    guardando.value = false
  }
}

const iniciarEdicionPrecio = async (habitacion) => {
  editandoPrecio.value = habitacion.id_habitacion
  precioEditando.value = habitacion.precio_noche
  await nextTick()
  precioHabInputRef.value?.focus()
}

const cancelarEdicionPrecio = () => {
  editandoPrecio.value = null
  precioEditando.value = 0
}

const guardarPrecioHabitacion = async (habitacion) => {
  if (!habitacion?.id_habitacion) return
  guardandoPrecioHab.value = habitacion.id_habitacion
  try {
    const res = await fetch(
      `${BASE}/actualizar_precio/${habitacion.id_habitacion}`,
      {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ precio_noche: Number(precioEditando.value) })
      }
    )
    if (!res.ok) throw new Error()
    habitacion.precio_noche = Number(precioEditando.value)
    editandoPrecio.value = null
    await cargar()
    emit('habitacion-actualizada')
  } catch {
    alert('No se pudo actualizar el precio')
  } finally {
    guardandoPrecioHab.value = null
  }
}

async function reactivarHabitacion(habitacion) {
  actualizando.value = habitacion.id_habitacion
  try {
    const res = await fetch(
      `${BASE}/reactivar_habitacion/${habitacion.id_habitacion}`,
      { method: 'PATCH', headers: authHeaders() }
    )
    if (!res.ok) throw new Error()
    await cargar()
    emit('habitacion-actualizada')
  } catch {
    alert('No se pudo reactivar la habitación')
  } finally {
    actualizando.value = null
  }
}

async function cambiarEstado(habitacion, nuevoEstado) {
  const permitidos = ['DISPONIBLE', 'LIMPIEZA', 'MANTENIMIENTO']
  if (!permitidos.includes(nuevoEstado) || habitacion.estado?.toUpperCase() === nuevoEstado) return
  actualizando.value = habitacion.id_habitacion
  try {
    const res = await fetch(
      `${BASE}/cambiar_estado/${habitacion.id_habitacion}`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ nuevo_estado: nuevoEstado })
      }
    )
    if (!res.ok) throw new Error()
    habitacion.estado = nuevoEstado
    emit('habitacion-actualizada')
  } catch {
    alert('No se pudo cambiar el estado')
  } finally {
    actualizando.value = null
  }
}

const toastMsg = ref('')

onMounted(() => {
  cargar()
  cargarPisos()
})
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
  white-space: nowrap;   /* ← evita que el texto se parta en dos líneas */
}

.btn-primary-custom:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 32, 238, 0.4);
}

.toggle-desactivadas {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
  white-space: nowrap;
}

.toggle-desactivadas:hover {
  background: #ede9fe;
  border-color: #c4b5fd;
  color: #6320EE;
}

.toggle-desactivadas.activo {
  background: #ede9fe;
  border-color: #6320EE;
  color: #6320EE;
  box-shadow: 0 0 0 3px rgba(99, 32, 238, 0.1);
}

.badge-pill-count {
  background: #6320EE;
  color: white;
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.6;
}

.toggle-desactivadas:not(.activo) .badge-pill-count {
  background: #9ca3af;
}

.card-habitacion {
  transition: opacity 0.25s, filter 0.25s;
}

.card-inactiva {
  opacity: 0.55;
  filter: grayscale(0.35);
}

.badge-inactiva {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: rgba(220, 38, 38, 0.07);
  border: 1px dashed rgba(220, 38, 38, 0.35);
  color: #dc2626;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  padding: 5px 8px;
  text-align: center;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.btn-editar-precio-hab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 5px 8px;
  background: rgba(99, 32, 238, 0.06);
  color: #6320EE;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid rgba(99, 32, 238, 0.18);
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.btn-editar-precio-hab:hover:not(:disabled) {
  background: rgba(99, 32, 238, 0.12);
  border-color: #6320EE;
}

.btn-editar-precio-hab:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.precio-edit-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.precio-edit-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #6320EE;
  border-radius: 8px;
  overflow: hidden;
  background: #faf8ff;
}

.precio-prefix {
  padding: 0 6px;
  color: #6320EE;
  font-size: 13px;
  font-weight: 600;
  border-right: 1px solid rgba(99, 32, 238, 0.15);
}

.precio-suffix {
  padding: 0 6px;
  color: #9ca3af;
  font-size: 11px;
  border-left: 1px solid rgba(99, 32, 238, 0.15);
}

.precio-input {
  border: none;
  padding: 5px 6px;
  font-size: 13px;
  color: #211A1D;
  outline: none;
  background: transparent;
  flex: 1;
  min-width: 0;
}

.precio-edit-btns {
  display: flex;
  gap: 4px;
}

.btn-precio-ok {
  flex: 1;
  background: #6320EE;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 5px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-precio-ok:hover:not(:disabled) {
  background: #5010cc;
}

.btn-precio-ok:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-precio-cancel {
  flex: 1;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 5px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-precio-cancel:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

.estado-manual {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  border-color: rgba(99, 32, 238, 0.15);
  color: #374151;
  background: #fafafa;
  cursor: pointer;
}

.estado-manual:focus {
  border-color: #6320EE;
  box-shadow: 0 0 0 2px rgba(99, 32, 238, 0.12);
  outline: none;
}

.estado-manual:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn {
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  padding: 5px 8px;
  font-family: 'Outfit', sans-serif;
}

.action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

.delete-btn {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.18);
}

.btn-reactivar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(99, 32, 238, 0.07);
  color: #6320EE;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid rgba(99, 32, 238, 0.25);
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.btn-reactivar:hover:not(:disabled) {
  background: rgba(99, 32, 238, 0.14);
  border-color: #6320EE;
  transform: translateY(-1px);
}

.btn-reactivar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-reactivar {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(99, 32, 238, 0.25);
  border-top-color: #6320EE;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.banner-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(99, 32, 238, 0.05);
  border: 1px solid rgba(99, 32, 238, 0.15);
  border-radius: 10px;
  padding: 10px 14px;
  color: #5b21b6;
  font-size: 12.5px;
  font-weight: 500;
}

.toast-precio {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: #1a1033;
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(26, 16, 51, 0.2);
  border-left: 4px solid #6320EE;
  z-index: 300;
}

.toast-anim-enter-active,
.toast-anim-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-anim-enter-from,
.toast-anim-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>