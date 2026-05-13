<template>
  <div class="position-relative">
    <div class="bg-white rounded-3 border p-4">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-0" style="font-size:25px;color:#211A1D">Pisos</h2>
          <span class="text-muted small">
            {{ pisos.length }} piso{{ pisos.length !== 1 ? 's' : '' }} registrado{{ pisos.length !== 1 ? 's' : '' }}
          </span>
        </div>
       <button v-if="can('PISOS', 'CREAR')" class="btn-primary-custom" @click="abrirModalCrear">

          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo piso
        </button>
      </div>

      <transition name="fade">
        <div v-if="errorEliminar" class="toast-error mb-3 d-flex align-items-start gap-3 p-3 rounded-3">
          <div class="toast-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div class="flex-grow-1">
            <p class="fw-semibold mb-0" style="font-size:13.5px;color:#7f1d1d">No se puede eliminar el piso</p>
            <p class="mb-0" style="font-size:12.5px;color:#991b1b;opacity:.85">{{ errorEliminar }}</p>
          </div>
          <button class="btn-close-toast" @click="errorEliminar = ''">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </transition>

      <!-- Cargando -->
      <div v-if="cargando" class="text-muted py-3 text-center">Cargando pisos...</div>

      <!-- Sin pisos -->
      <div v-else-if="pisos.length === 0" class="text-muted fst-italic py-3 text-center">
        No hay pisos registrados.
      </div>

      <!-- Tabla -->
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">

          <thead class="table-light">
            <tr class="text-uppercase fw-bold"
              style="font-size:13px;color:#000;letter-spacing:.8px;border-bottom:1px solid rgba(99,32,238,0.07)">

              <th class="ps-4">Piso</th>
              <th>Habitaciones</th>
              <th class="ps-3" style="width:180px;">Acciones</th>

            </tr>
          </thead>

          <tbody>
            <template v-for="p in pisos" :key="p.id_piso">
              <tr>

                <td>
                  <span class="badge-piso">Piso {{ p.numero }}</span>
                </td>

                <td>
                  <span v-if="habitacionesPorPiso[p.id_piso] === undefined" class="text-muted small">—</span>

                  <span v-else-if="habitacionesPorPiso[p.id_piso].length === 0"
                    class="badge bg-light text-secondary border small">
                    Sin habitaciones
                  </span>

                  <span v-else
                    class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 small">
                    {{ habitacionesPorPiso[p.id_piso].length }}
                    habitacion{{ habitacionesPorPiso[p.id_piso].length !== 1 ? 'es' : '' }}
                  </span>
                </td>

                <td class="text-end">
                  <div class="d-flex gap-2 justify-content-end">
                    <button class="btn btn-sm btn-ver-habs" style="font-size: 13px; padding: 4px 8px ;"
                      @click="toggleHabitaciones(p.id_piso)" :disabled="cargandoHabitaciones === p.id_piso">

                      {{ cargandoHabitaciones === p.id_piso
                        ? 'Cargando...'
                        : pisoExpandido === p.id_piso
                          ? 'Ocultar'
                          : 'Observar' }}
                    </button>

<button v-if="can('PISOS', 'ELIMINAR')" class="btn btn-sm btn-outline-danger" @click="confirmarEliminar(p)"
                      :disabled="eliminando === p.id_piso">

                      {{ eliminando === p.id_piso ? '...' : 'Eliminar' }}
                    </button>
                  </div>
                </td>

              </tr>

              <!-- Fila expandida habitaciones -->
              <tr v-if="pisoExpandido === p.id_piso">
                <td colspan="4" class="p-0">
                  <div class="habitaciones-panel px-4 py-3">

                    <p class="fw-semibold small text-muted mb-2 text-uppercase" style="letter-spacing:.05em">
                      Habitaciones — Piso {{ p.numero }}
                    </p>

                    <div v-if="!habitacionesPorPiso[p.id_piso] || habitacionesPorPiso[p.id_piso].length === 0"
                      class="text-muted small fst-italic">
                      Este piso no tiene habitaciones asignadas.
                    </div>

                    <div v-else class="d-flex flex-wrap gap-2">
                      <div v-for="h in habitacionesPorPiso[p.id_piso]" :key="h.id_habitacion" class="hab-chip">

                        <span class="hab-num">{{ h.numero }}</span>
                        <span class="hab-tipo">{{ h.tipo || 'Estándar' }}</span>

                      </div>
                    </div>

                  </div>
                </td>
              </tr>

            </template>
          </tbody>

        </table>
      </div>

      <p v-if="errorGeneral" class="text-danger mt-3 mb-0 small">{{ errorGeneral }}</p>

    </div>

    <!-- MODAL CREAR -->
    <ModalFormulario v-if="modalAbierto" titulo="Nuevo piso" subtitulo="Ingresa el número del nuevo piso"
      :campos="camposPiso" :valorInicial="form" :error="errorModal" :cargando="guardando" textoConfirmar="Crear piso"
      @cerrar="cerrarModal" @guardar="guardar" />

    <!-- MODAL ELIMINAR -->
    <ModalFormulario v-if="modalEliminar" titulo="¿Eliminar piso?"
      :subtitulo="`Se eliminará el Piso ${pisoAEliminar?.numero}. Esta acción no se puede deshacer.`"
      :cargando="eliminando !== null" textoConfirmar="Eliminar" :peligroso="true" @cerrar="modalEliminar = false"
      @confirmar="eliminarPiso" />

  </div>
</template>

<script setup>
import { usePermissions } from '@/composables/usePermissions'
const { can } = usePermissions()
import { ref, onMounted } from 'vue'
import ModalFormulario from '@/components/ModalFormulario.vue'

const BASE = import.meta.env.VITE_API_URL

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

const pisos = ref([])
const cargando = ref(false)
const guardando = ref(false)
const eliminando = ref(null)
const modalAbierto = ref(false)
const modalEliminar = ref(false)
const pisoAEliminar = ref(null)
const errorModal = ref('')
const errorGeneral = ref('')
const errorEliminar = ref('')
const pisoExpandido = ref(null)
const habitacionesPorPiso = ref({})
const cargandoHabitaciones = ref(null)

const form = ref({ numero: '' })

const camposPiso = [
  { key: 'numero', label: 'Número de piso', type: 'number', placeholder: 'Ej: 1', colClass: 'col-12' }
]

async function cargarPisos() {
  cargando.value = true
  errorGeneral.value = ''

  try {
    const [resPisos, resHabs] = await Promise.all([
      apiFetch(`${BASE}/pisos`),
      apiFetch(`${BASE}/habitaciones`)
    ])

    pisos.value = await resPisos.json()
    const todasLasHabs = await resHabs.json()

    const agrupadas = {}
    pisos.value.forEach(p => { agrupadas[p.id_piso] = [] })

    todasLasHabs.forEach(h => {
      if (agrupadas[h.id_piso] !== undefined) {
        agrupadas[h.id_piso].push(h)
      }
    })

    habitacionesPorPiso.value = agrupadas

  } catch {
    errorGeneral.value = 'Error al cargar los pisos.'
  } finally {
    cargando.value = false
  }
}

const abrirModalCrear = () => {
  form.value = { numero: '' }
  errorModal.value = ''
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const guardar = async (datos) => {
  if (!datos.numero) {
    errorModal.value = 'El número de piso es obligatorio.'
    return
  }

  guardando.value = true
  errorModal.value = ''

  try {
    const res = await apiFetch(`${BASE}/crear_piso`, {
      method: 'POST',
      body: JSON.stringify({ numero: Number(datos.numero) })
    })

    if (!res.ok) throw new Error()

    cerrarModal()
    await cargarPisos()

  } catch {
    errorModal.value = 'El piso que intenta crear ya existe.'
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (p) => {
  const habs = habitacionesPorPiso.value[p.id_piso]

  if (habs && habs.length > 0) {
    errorEliminar.value =
      `El piso tiene ${habs.length} habitacion(es) asignada(s). Elimínalas primero.`
    return
  }

  pisoAEliminar.value = p
  modalEliminar.value = true
}

const eliminarPiso = async () => {
  eliminando.value = pisoAEliminar.value.id_piso
  errorEliminar.value = ''

  try {
    const res = await apiFetch(
      `${BASE}/pisos/${pisoAEliminar.value.id_piso}`,
      { method: 'DELETE' }
    )

    if (!res.ok) {
      errorEliminar.value = 'El piso contiene habitaciones. No puede ser eliminado.'
      modalEliminar.value = false
      return
    }

    pisos.value = pisos.value.filter(
      p => p.id_piso !== pisoAEliminar.value.id_piso
    )

    if (pisoExpandido.value === pisoAEliminar.value.id_piso) {
      pisoExpandido.value = null
    }

    modalEliminar.value = false

  } catch {
    errorEliminar.value = 'No se pudo conectar al servidor.'
    modalEliminar.value = false
  } finally {
    eliminando.value = null
  }
}

async function toggleHabitaciones(idPiso) {
  if (pisoExpandido.value === idPiso) {
    pisoExpandido.value = null
    return
  }

  if (habitacionesPorPiso.value[idPiso] !== undefined) {
    pisoExpandido.value = idPiso
    return
  }

  cargandoHabitaciones.value = idPiso

  try {
    const res = await apiFetch(`${BASE}/pisos`)
    const todas = await res.json()

    habitacionesPorPiso.value = {
      ...habitacionesPorPiso.value,
      [idPiso]: todas.filter(h => h.id_piso === idPiso)
    }

  } catch {
    habitacionesPorPiso.value = {
      ...habitacionesPorPiso.value,
      [idPiso]: []
    }
  } finally {
    cargandoHabitaciones.value = null
    pisoExpandido.value = idPiso
  }
}

onMounted(cargarPisos)
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
  margin: 0px 0px 0px 20px;
  font-weight: 450;
}

.btn-primary-custom:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 32, 238, 0.4);
}

.toast-error {
  background: #fff1f2;
  border: 1px solid #fecaca;
}

.btn-outline-danger {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
  transition: all .2s;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(99, 32, 238, 0.2);
  font-weight: 450;
}


.toast-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #dc2626;
}

.btn-close-toast {
  background: none;
  border: none;
  padding: 2px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
}

.btn-close-toast:hover {
  color: #6b7280;
}

.badge-piso {
  display: inline-flex;
  align-items: center;
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ede9fe;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 14px;
  font-weight: 600;
}

.habitaciones-panel {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.hab-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 14px;
  min-width: 70px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
}

.hab-num {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.hab-tipo {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 3px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.btn-ver-habs {
  background: rgba(99, 32, 238, 0.08);
  color: #6320EE;
  transition: all .2s;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(99, 32, 238, 0.2);
  font-weight: 450;
}

.btn-ver-habs:hover {
  background: rgba(99, 32, 238, 0.15);
  border-color: rgba(99, 32, 238, 0.4);
}

.btn-ver-habs:disabled {
  opacity: 0.5;
}
</style>