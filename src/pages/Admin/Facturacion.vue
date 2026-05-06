<template>
  <div class="bg-white rounded-3 border p-4">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-0" style="font-size:25px">Facturación</h2>
        <p class="text-muted mb-0" style="font-size:12px">Gestión de facturas</p>
      </div>
    </div>

    <div v-if="cargando" class="text-muted text-center py-5" style="font-size:13px">
      Cargando facturas...
    </div>

    <div v-else-if="facturas.length === 0" class="text-muted fst-italic text-center py-5" style="font-size:13px">
      No hay facturas registradas.
    </div>

    <template v-else>

      <!-- TABLA DESKTOP -->
      <div class="d-none d-md-block table-responsive">
        <table class="table align-middle">
          <thead class="table-header">
            <tr>
              <th>Fecha</th>
              <th>Huésped</th>
              <th>Documento</th>
              <th>Habitación</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in facturasPaginadas" :key="f.id_factura">
              <td style="font-size:14px">{{ formatearFechaCorta(f.fecha) }}</td>
              <td style="font-size:14px">{{ f.nombre_huesped }} {{ f.apellido_huesped }}</td>
              <td style="font-size:14px">{{ f.documento_huesped }}</td>
              <td style="font-size:14px">
                <span v-if="f.numero_habitacion">Hab. {{ f.numero_habitacion }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td style="font-size:14px;font-weight:600">${{ Number(f.total).toLocaleString('es-CO') }}</td>
              <td>
                <span class="badge-estado"
                  :class="f.estado?.toUpperCase() === 'PAGADA' ? 'badge-pagada' : 'badge-pendiente'">
                  {{ f.estado?.toUpperCase() === 'PAGADA' ? 'Pagada' : 'Pendiente' }}
                </span>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <button class="action-btn detail-btn" @click="verDetalle(f)">Detalle</button>
                  <button v-if="f.estado?.toUpperCase() !== 'PAGADA'" class="action-btn pay-btn"
                    :disabled="pagando === f.id_factura" @click="pagar(f)">
                    <span v-if="pagando === f.id_factura" class="spinner-border spinner-border-sm me-1"
                      role="status"></span>
                    {{ pagando === f.id_factura ? 'Pagando...' : 'Pagar' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CARDS MOBILE -->
      <div class="d-md-none d-flex flex-column gap-2">
        <div v-for="f in facturasPaginadas" :key="f.id_factura" class="rounded-3 border p-3"
          style="border-color:rgba(99,32,238,0.1)!important">

          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted" style="font-size:12px">{{ formatearFechaCorta(f.fecha) }}</span>
            <span class="badge-estado"
              :class="f.estado?.toUpperCase() === 'PAGADA' ? 'badge-pagada' : 'badge-pendiente'">
              {{ f.estado?.toUpperCase() === 'PAGADA' ? 'Pagada' : 'Pendiente' }}
            </span>
          </div>

          <!-- Huésped -->
          <div class="fw-semibold mb-1" style="font-size:14px">
            {{ f.nombre_huesped }} {{ f.apellido_huesped }}
          </div>
          <div class="text-muted mb-1" style="font-size:12px">{{ f.documento_huesped }}</div>

          <!-- Habitación + total -->
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span style="font-size:12px;color:#6b7280">
              {{ f.numero_habitacion ? `Hab. ${f.numero_habitacion}` : '—' }}
            </span>
            <span style="font-size:15px;font-weight:700;color:#211A1D">
              ${{ Number(f.total).toLocaleString('es-CO') }}
            </span>
          </div>

          <!-- Acciones -->
          <div class="d-flex gap-2 mt-1">
            <button class="action-btn detail-btn flex-grow-1" @click="verDetalle(f)">Detalle</button>
            <button v-if="f.estado?.toUpperCase() !== 'PAGADA'" class="action-btn pay-btn flex-grow-1"
              :disabled="pagando === f.id_factura" @click="pagar(f)">
              <span v-if="pagando === f.id_factura" class="spinner-border spinner-border-sm me-1" role="status"></span>
              {{ pagando === f.id_factura ? 'Pagando...' : 'Pagar' }}
            </button>
          </div>

        </div>
      </div>

      <!-- Paginación -->
      <Paginacion v-model="pagina" :total="facturasOrdenadas.length" etiqueta="facturas" />

    </template>


    <!-- Modal Detalle -->
    <Teleport to="body">
      <div v-if="facturaDetalle" class="modal-overlay d-flex align-items-center justify-content-center p-3"
        @click.self="cerrarDetalle">
        <div class="modal-box bg-white rounded-4 p-4 position-relative">
          <div class="modal-top-bar"></div>

          <button
            class="position-absolute border-0 rounded-2 d-flex align-items-center justify-content-center modal-close"
            @click="cerrarDetalle">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h3 class="fw-bold mb-1" style="font-size:17px">Detalle de factura</h3>
          <p class="text-muted mb-4" style="font-size:12px">Información completa del cobro</p>

          <div v-if="cargandoDetalle" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-purple me-2" role="status"></div>
            <span class="text-muted" style="font-size:13px">Cargando detalles...</span>
          </div>

          <template v-else>
            <div class="detalle-grid">
              <div class="detalle-fila">
                <span class="detalle-label">Huésped</span>
                <span class="detalle-valor">{{ facturaDetalle.nombre_huesped }} {{ facturaDetalle.apellido_huesped
                }}</span>
              </div>
              <div class="detalle-fila">
                <span class="detalle-label">Documento</span>
                <span class="detalle-valor">{{ facturaDetalle.documento_huesped || '—' }}</span>
              </div>
              <div class="detalle-fila">
                <span class="detalle-label">Habitación</span>
                <span class="detalle-valor">
                  {{ facturaDetalle.numero_habitacion ? `Hab. ${facturaDetalle.numero_habitacion}` : '—' }}
                </span>
              </div>
              <div class="detalle-fila">
                <span class="detalle-label">Fecha de emisión</span>
                <span class="detalle-valor">{{ formatearFechaLarga(facturaDetalle.fecha) }}</span>
              </div>
              <div class="detalle-fila">
                <span class="detalle-label">Reserva</span>
                <span class="detalle-valor">{{ facturaDetalle.id_reserva ? ` #${facturaDetalle.id_reserva}` : '—'
                }}</span>
              </div>

              <!-- Precio por noche -->
              <div class="detalle-fila" v-if="detalleReserva?.precio_noche">
                <span class="detalle-label">Precio por noche</span>
                <span class="detalle-valor">${{ Number(detalleReserva.precio_noche).toLocaleString('es-CO') }}</span>
              </div>

              <!-- Cantidad de noches -->
              <div class="detalle-fila" v-if="detalleReserva?.cantidad_noches">
                <span class="detalle-label">Noches</span>
                <span class="detalle-valor">
                  {{ detalleReserva.cantidad_noches }}
                  {{ detalleReserva.cantidad_noches !== 1 ? '' : '' }}
                </span>
              </div>

              <!-- Subtotal habitación -->
              <div class="detalle-fila" v-if="detalleReserva?.precio_noche && detalleReserva?.cantidad_noches">
                <span class="detalle-label">Subtotal habitación</span>
                <span class="detalle-valor">
                  ${{ Number(detalleReserva.precio_noche * detalleReserva.cantidad_noches).toLocaleString('es-CO') }}
                </span>
              </div>

              <div class="detalle-fila">
                <span class="detalle-label">Estado</span>
                <span class="badge-estado"
                  :class="facturaDetalle.estado?.toUpperCase() === 'PAGADA' ? 'badge-pagada' : 'badge-pendiente'">
                  {{ facturaDetalle.estado?.toUpperCase() === 'PAGADA' ? 'Pagada' : 'Pendiente' }}
                </span>
              </div>
            </div>

            <div v-if="detalleReserva && detalleReserva.detalles && detalleReserva.detalles.length > 0" class="mt-3">
              <p class="section-label mb-2">Servicios adicionales</p>
              <div class="servicios-lista">
                <div v-for="(s, i) in detalleReserva.detalles" :key="i" class="servicio-row">
                  <span style="font-size:13px">{{ s.nombre_servicio }}</span>
                  <span style="font-size:13px; color:#9ca3af">x{{ s.cantidad }}</span>
                  <span style="font-size:13px; color:#9ca3af">${{ Number(s.precio_unidad).toLocaleString('es-CO') }}
                    c/u</span>
                  <span style="font-size:13px; font-weight:600">${{ Number(s.subtotal).toLocaleString('es-CO') }}</span>
                </div>
              </div>
            </div>

            <div v-else-if="detalleReserva && (!detalleReserva.detalles || detalleReserva.detalles.length === 0)"
              class="mt-3">
              <p class="section-label mb-1">Servicios adicionales</p>
              <p class="text-muted fst-italic" style="font-size:12px">Sin servicios adicionales registrados.</p>
            </div>

            <div class="total-box mt-3">
              <span style="font-size:13px; color:#6b7280">Total a pagar</span>
              <span style="font-size:22px; font-weight:700; color:#211A1D">${{
                Number(facturaDetalle.total).toLocaleString('es-CO') }}</span>
            </div>

            <div class="d-flex gap-2 mt-4">
              <button class="modal-btn-secondary flex-grow-1 rounded-3" @click="cerrarDetalle">Cerrar</button>
              <button v-if="facturaDetalle.estado?.toUpperCase() !== 'PAGADA'"
                class="modal-btn-primary flex-grow-1 rounded-3 border-0"
                :disabled="pagando === facturaDetalle.id_factura" @click="pagarDesdeDetalle">
                <span v-if="pagando === facturaDetalle.id_factura" class="spinner-border spinner-border-sm me-1"
                  role="status"></span>
                {{ pagando === facturaDetalle.id_factura ? 'Procesando...' : 'Pagar factura' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Paginacion from '@/components/Paginacion.vue'

const API_URL = import.meta.env.VITE_API_URL
const POR_PAGINA = 15


const facturas = ref([])
const pagando = ref(null)
const cargando = ref(false)
const pagina = ref(1)
const facturaDetalle = ref(null)
const detalleReserva = ref(null)
const cargandoDetalle = ref(false)

const facturasOrdenadas = computed(() =>
  [...facturas.value].sort((a, b) => b.id_factura - a.id_factura)
)

const facturasPaginadas = computed(() =>
  facturasOrdenadas.value.slice((pagina.value - 1) * POR_PAGINA, pagina.value * POR_PAGINA)
)



const cargar = async () => {
  cargando.value = true
  try {
    const [resFacturas, resReservas] = await Promise.all([
      fetch(`${API_URL}/factura`, { headers: { accept: 'application/json', ...authHeaders() } }),
      fetch(`${API_URL}/reservas`, { headers: { accept: 'application/json', ...authHeaders() } })
    ])
    if (!resFacturas.ok) throw new Error('Error en la API: ' + resFacturas.status)
    const [dataFacturas, dataReservas] = await Promise.all([
      resFacturas.json(),
      resReservas.ok ? resReservas.json() : Promise.resolve([])
    ])
    const mapaHabitacion = {}
    if (Array.isArray(dataReservas)) {
      dataReservas.forEach(r => {
        if (r.id_reserva && r.habitacion?.numero) {
          mapaHabitacion[r.id_reserva] = r.habitacion.numero
        }
      })
    }
    facturas.value = dataFacturas.map(f => ({
      ...f,
      numero_habitacion: f.numero_habitacion ?? mapaHabitacion[f.id_reserva] ?? null
    }))
    pagina.value = 1
  } catch (error) {
    console.error('Error cargando facturas:', error)
    facturas.value = []
  } finally {
    cargando.value = false
  }
}

function authHeaders() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const pagar = async (factura) => {
  pagando.value = factura.id_factura
  try {
    const res = await fetch(`${API_URL}/factura/${factura.id_factura}/pagar`, {
      method: 'PATCH',
      headers: { accept: 'application/json', ...authHeaders() }
    })
    if (!res.ok) throw new Error('Error al pagar: ' + res.status)

    const enLista = facturas.value.find(f => f.id_factura === factura.id_factura)
    if (enLista) enLista.estado = 'PAGADA'

    if (facturaDetalle.value?.id_factura === factura.id_factura) {
      facturaDetalle.value = { ...facturaDetalle.value, estado: 'PAGADA' }
    }

    if (detalleReserva.value?.id_factura === factura.id_factura) {
      detalleReserva.value = { ...detalleReserva.value, estado: 'PAGADA' }
    }

  } catch (error) {
    console.error('Error al pagar la factura:', error)
    alert('No se pudo procesar el pago. Intenta de nuevo.')
  } finally {
    pagando.value = null
  }
}

const verDetalle = async (f) => {
  facturaDetalle.value = f
  detalleReserva.value = null
  cargandoDetalle.value = true

  if (f.id_reserva) {
    try {
      const res = await fetch(`${API_URL}/factura/${f.id_reserva}/reserva`, {
        headers: { accept: 'application/json', ...authHeaders() }
      })
      if (res.ok) {
        const data = await res.json()
        detalleReserva.value = Array.isArray(data) ? data[0] : data
        facturaDetalle.value = { ...f, ...detalleReserva.value }
      }
    } catch (e) {
      console.error('Error cargando detalle de reserva:', e)
    }
  }
  cargandoDetalle.value = false
}

const cerrarDetalle = () => {
  facturaDetalle.value = null
  detalleReserva.value = null
  cargandoDetalle.value = false
}

const pagarDesdeDetalle = async () => {
  const f = facturaDetalle.value
  if (!f) return
  await pagar(f)
}

const formatearFechaCorta = (fecha) => {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatearFechaLarga = (fecha) => {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

defineExpose({ cargar })
onMounted(cargar)
</script>

<style scoped>
.table-header {
  font-size: 12px;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
}

.badge-estado {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.4px;
}

.badge-pagada {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.badge-pendiente {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.action-btn {
  border-radius: 8px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .2s;
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;
  font-family: 'Outfit', sans-serif;
  border: 1px solid rgba(99, 32, 238, 0.2);

}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.detail-btn {
  background: rgba(99, 32, 238, 0.1);
  color: #6320EE;
  font-weight: 450;
}

.detail-btn:hover {
  background: rgba(99, 32, 238, 0.2);
}

.pay-btn {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}

.pay-btn:hover:not(:disabled) {
  background: rgba(22, 163, 74, 0.2);
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
  max-width: 500px;
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
}

.detalle-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detalle-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(99, 32, 238, 0.07);
}

.detalle-fila:last-child {
  border-bottom: none;
}

.detalle-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.detalle-valor {
  font-size: 13px;
  color: #211A1D;
  font-weight: 500;
}

.servicios-lista {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.servicio-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: #f4eeff;
  border-radius: 8px;
  padding: 8px 12px;
}

.total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(99, 32, 238, 0.05);
  border: 1.5px solid rgba(99, 32, 238, 0.15);
  border-radius: 12px;
  padding: 14px 16px;
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

.text-purple {
  color: #6320EE;
}
</style>