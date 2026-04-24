<template>
  <div>

    <!-- BUSCADOR -->
    <div class="bg-white rounded-3 border p-3 mb-3" style="border-color:rgba(99,32,238,0.07)!important">
      <div class="search-wrap d-flex align-items-center gap-2 rounded-3 px-3" style="max-width:340px">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          style="color:#9ca3af;flex-shrink:0">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input class="search-input" type="text" placeholder="Buscar por documento..." v-model="busqueda"
          @input="buscarPorDocumento" />
        <button v-if="busqueda" class="border-0 bg-transparent p-0" style="color:#9ca3af;cursor:pointer"
          @click="limpiarBusqueda">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- TABLA -->
    <div class="bg-white rounded-3 border overflow-hidden"
      style="border-color:rgba(99,32,238,0.07)!important;box-shadow:0 2px 12px rgba(33,26,29,0.05)">

      <!-- HEADER -->
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 ps-4 pt-4 pe-4">
        <div>
          <h2 class="fw-bold mb-0" style="font-size:25px;color:#211A1D">Huéspedes</h2>
          <p class="text-muted mb-0" style="font-size:12px">Gestión de huéspedes registrados</p>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Toggle inactivos -->
          <button class="toggle-inactivos d-none d-md-inline-flex" :class="{ activo: mostrarInactivos }"
            @click="mostrarInactivos = !mostrarInactivos">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Inactivos
            <span v-if="cantidadInactivos > 0" class="badge-pill-count">{{ cantidadInactivos }}</span>
          </button>

          <button class="btn-primary-custom" @click="abrirModalCrear">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo huésped
          </button>
        </div>
      </div>

      <div v-if="cargando" class="text-muted text-center py-5" style="font-size:13.5px">
        Cargando huéspedes...
      </div>

      <div v-else-if="listaFiltrada.length === 0" class="text-muted fst-italic text-center py-5"
        style="font-size:13.5px">
        No se encontraron huéspedes.
      </div>

      <template v-else>

        <!-- Desktop -->
        <div class="d-none d-md-block">
          <div class="row g-0 px-4 py-2 text-uppercase fw-semibold"
            style="font-size:11.5px;color:#000;letter-spacing:.8px;border-bottom:1px solid rgba(99,32,238,0.07)">
            <div class="col-3">Nombre</div>
            <div class="col-2">Documento</div>
            <div class="col-2">Teléfono</div>
            <div class="col-2">Email</div>
            <div class="col-1">Estado</div>
            <div class="col-2 text-end">Acciones</div>
          </div>
          <div class="row g-0 align-items-center px-4 py-3 table-row" v-for="h in listaFiltrada" :key="h.id_huesped"
            :class="{ 'fila-inactiva': esInactivo(h) }" style="border-bottom:1px solid rgba(99,32,238,0.05)">
            <div class="col-3 d-flex align-items-center gap-2">
              <div
                class="huesped-avatar rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                :class="{ 'avatar-inactivo': esInactivo(h) }">
                {{ iniciales(h) }}
              </div>
              <span class="fw-medium" style="font-size:14px">{{ h.nombre }} {{ h.apellido }}</span>
            </div>
            <div class="col-2 text-black" style="font-size:14px">{{ h.documento }}</div>
            <div class="col-2 text-black" style="font-size:14px">{{ h.telefono || '—' }}</div>
            <div class="col-2 text-black text-truncate" style="font-size:14px">{{ h.email || '—' }}</div>
            <div class="col-1">
              <span class="badge-estado" :class="esInactivo(h) ? 'inactivo' : 'activo'">
                {{ esInactivo(h) ? 'Inactivo' : 'Activo' }}
              </span>
            </div>
            <div class="col-2 d-flex justify-content-end gap-2">
              <button class="action-btn edit-btn" @click="abrirModalEditar(h)" :disabled="esInactivo(h)" title="Editar">
                Editar
              </button>
              <button v-if="!esInactivo(h)" class="action-btn delete-btn" @click="confirmarEliminar(h)"
                title="Eliminar">
                Eliminar
              </button>
              <button v-else class="action-btn reactivar-btn" @click="confirmarReactivar(h)"
                :disabled="reactivando === h.id_huesped">
                <span v-if="reactivando === h.id_huesped" class="spinner-border spinner-border-sm me-1"
                  role="status"></span>
                {{ reactivando === h.id_huesped ? 'Reactivando...' : 'Reactivar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile -->
        <div class="d-md-none d-flex flex-column gap-2 p-3">
          <div class="rounded-3 p-3 border" :class="{ 'fila-inactiva': esInactivo(h) }"
            style="border-color:rgba(99,32,238,0.07)!important" v-for="h in listaFiltrada" :key="h.id_huesped">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <div class="d-flex align-items-center gap-2">
                <div
                  class="huesped-avatar rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                  :class="{ 'avatar-inactivo': esInactivo(h) }">
                  {{ iniciales(h) }}
                </div>
                <div>
                  <span class="fw-medium d-block" style="font-size:13.5px">{{ h.nombre }} {{ h.apellido }}</span>
                  <span class="text-muted" style="font-size:12px">{{ h.documento }}</span>
                </div>
              </div>
              <div class="d-flex flex-column align-items-end gap-1">
                <span class="badge-estado" :class="esInactivo(h) ? 'inactivo' : 'activo'">
                  {{ esInactivo(h) ? 'Inactivo' : 'Activo' }}
                </span>
              </div>
            </div>

            <div class="d-flex gap-3 mb-2" style="font-size:12px;color:#6b7280">
              <span>📞 {{ h.telefono || '—' }}</span>
              <span class="text-truncate">✉️ {{ h.email || '—' }}</span>
            </div>

            <div class="d-flex gap-2">
              <button v-if="!esInactivo(h)" class="action-btn edit-btn flex-grow-1" @click="abrirModalEditar(h)">
                Editar
              </button>
              <button v-if="!esInactivo(h)" class="action-btn delete-btn flex-grow-1" @click="confirmarEliminar(h)">
                Eliminar
              </button>
              <button v-if="esInactivo(h)" class="action-btn reactivar-btn w-100" @click="confirmarReactivar(h)"
                :disabled="reactivando === h.id_huesped">
                <span v-if="reactivando === h.id_huesped" class="spinner-border spinner-border-sm me-1"
                  role="status"></span>
                {{ reactivando === h.id_huesped ? 'Reactivando...' : 'Reactivar' }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Banner inactivos -->
      <div v-if="mostrarInactivos && cantidadInactivos > 0" class="banner-info mx-4 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Mostrando {{ cantidadInactivos }} huésped{{ cantidadInactivos !== 1 ? 'es' : '' }} inactivo{{ cantidadInactivos
          !== 1
          ? 's' : '' }}.
        Los huéspedes inactivos no pueden hacer reservas.
      </div>

    </div>

    <!-- MODAL CREAR / EDITAR -->
    <ModalFormulario v-if="modalAbierto" :titulo="modoEdicion ? 'Editar huésped' : 'Nuevo huésped'"
      :subtitulo="modoEdicion ? 'Modifica los datos del huésped' : 'Completa los datos del nuevo huésped'"
      :campos="camposHuesped" :valorInicial="form" :error="errorModal" :cargando="guardando"
      :textoConfirmar="modoEdicion ? 'Guardar cambios' : 'Crear huésped'" @cerrar="cerrarModal" @guardar="guardar" />

    <!-- MODAL CONFIRMAR ELIMINAR -->
    <ModalFormulario v-if="modalEliminar" titulo="¿Eliminar huésped?"
      :subtitulo="`Se desactivará a ${huespedAEliminar?.nombre} ${huespedAEliminar?.apellido}. El huésped quedará inactivo.`"
      :cargando="guardando" textoConfirmar="Eliminar" :peligroso="true" @cerrar="modalEliminar = false"
      @confirmar="eliminar" />

    <!-- MODAL CONFIRMAR REACTIVAR -->
    <ModalFormulario v-if="modalReactivar" titulo="¿Reactivar huésped?"
      :subtitulo="`Se reactivará a ${huespedAReactivar?.nombre} ${huespedAReactivar?.apellido}. Podrá hacer reservas nuevamente.`"
      :cargando="reactivando !== null" textoConfirmar="Reactivar" :peligroso="true" @cerrar="modalReactivar = false"
      @confirmar="reactivar" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalFormulario from '@/components/ModalFormulario.vue'

const BASE = 'https://staydesk-apis.duckdns.org'
const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token')
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

const lista = ref([])
const cargando = ref(false)
const busqueda = ref('')

const modalAbierto = ref(false)
const modalEliminar = ref(false)
const modalReactivar = ref(false)

const modoEdicion = ref(false)
const guardando = ref(false)
const reactivando = ref(null)

const mostrarInactivos = ref(false)
const errorModal = ref('')

const huespedAEliminar = ref(null)
const huespedAReactivar = ref(null)

const form = ref({ nombre: '', apellido: '', documento: '', telefono: '', email: '' })

const iniciales = (h) =>
  `${h.nombre?.[0] || ''}${h.apellido?.[0] || ''}`.toUpperCase()

const esInactivo = (h) =>
  Number(h.activo) === 0 || h.estado?.toUpperCase() === 'INACTIVO'

const listaFiltrada = computed(() =>
  mostrarInactivos.value
    ? lista.value
    : lista.value.filter(h => !esInactivo(h))
)

const cantidadInactivos = computed(() =>
  lista.value.filter(h => esInactivo(h)).length
)

const camposHuesped = computed(() => [
  { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre', colClass: 'col-6' },
  { key: 'apellido', label: 'Apellido', type: 'text', placeholder: 'Apellido', colClass: 'col-6' },
  ...(!modoEdicion.value
    ? [{ key: 'documento', label: 'Documento', type: 'text', placeholder: 'Número de documento', colClass: 'col-12' }]
    : []
  ),
  { key: 'telefono', label: 'Teléfono', type: 'text', placeholder: 'Teléfono', colClass: 'col-6' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'Email', colClass: 'col-6' },
])

const cargar = async () => {
  cargando.value = true
  try {
    const res = await apiFetch(`${BASE}/listar_huespedes`)
    const data = await res.json()
    lista.value = Array.isArray(data) ? data : data.huespedes || []
  } catch (e) {
    console.error('Error huéspedes:', e)
  } finally {
    cargando.value = false
  }
}

let busquedaTimer = null
const buscarPorDocumento = () => {
  clearTimeout(busquedaTimer)
  if (!busqueda.value.trim()) { cargar(); return }
  busquedaTimer = setTimeout(async () => {
    cargando.value = true
    try {
      const res = await apiFetch(`${BASE}/listar_huesped/documento/${busqueda.value.trim()}`)
      const data = await res.json()
      lista.value = Array.isArray(data) ? data : data ? [data] : []
    } catch {
      lista.value = []
    } finally {
      cargando.value = false
    }
  }, 400)
}

const limpiarBusqueda = () => { busqueda.value = ''; cargar() }

const abrirModalCrear = () => {
  modoEdicion.value = false
  form.value = { nombre: '', apellido: '', documento: '', telefono: '', email: '' }
  errorModal.value = ''
  modalAbierto.value = true
}

const abrirModalEditar = (h) => {
  modoEdicion.value = true
  form.value = { id: h.id_huesped, nombre: h.nombre, apellido: h.apellido, telefono: h.telefono || '', email: h.email || '' }
  errorModal.value = ''
  modalAbierto.value = true
}

const cerrarModal = () => { modalAbierto.value = false }

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/

const guardar = async (datos) => {
  if (!datos.nombre || !datos.apellido) {
    errorModal.value = 'Nombre y apellido son obligatorios.'
    return
  }
  if (!soloLetras.test(datos.nombre)) {
    errorModal.value = 'El nombre no puede contener números.'
    return
  }
  if (!soloLetras.test(datos.apellido)) {
    errorModal.value = 'El apellido no puede contener números.'
    return
  }
  if (!modoEdicion.value && !datos.documento) {
    errorModal.value = 'El documento es obligatorio.'
    return
  }
  guardando.value = true
  errorModal.value = ''
  try {
    let res
    if (modoEdicion.value) {
      res = await apiFetch(`${BASE}/actualizar_huesped/${form.value.id}`, {
        method: 'PUT',
        body: JSON.stringify({ nombre: datos.nombre, apellido: datos.apellido, telefono: datos.telefono, email: datos.email })
      })
    } else {
      res = await apiFetch(`${BASE}/crear_huesped`, {
        method: 'POST',
        body: JSON.stringify({ nombre: datos.nombre, apellido: datos.apellido, documento: datos.documento, telefono: datos.telefono, email: datos.email })
      })
    }
    if (!res.ok) throw new Error()
    cerrarModal()
    cargar()
  } catch {
    errorModal.value = 'Ocurrió un error al guardar. Intenta de nuevo.'
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (h) => {
  huespedAEliminar.value = h
  modalEliminar.value = true
}

const eliminar = async () => {
  guardando.value = true
  try {
    await apiFetch(`${BASE}/eliminar_huesped/${huespedAEliminar.value.id_huesped}`, { method: 'DELETE' })
    modalEliminar.value = false
    huespedAEliminar.value = null
    await cargar()
  } catch (e) {
    console.error('Error al eliminar:', e)
  } finally {
    guardando.value = false
  }
}

const confirmarReactivar = (h) => {
  huespedAReactivar.value = h
  modalReactivar.value = true
}

const reactivar = async () => {
  if (!huespedAReactivar.value?.id_huesped) return
  reactivando.value = huespedAReactivar.value.id_huesped
  try {
    const res = await apiFetch(`${BASE}/reactivar_huesped/${huespedAReactivar.value.id_huesped}`, {
      method: 'PATCH'
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.detail || 'Error al reactivar')
    }
    modalReactivar.value = false
    huespedAReactivar.value = null
    await cargar()
  } catch (e) {
    console.error('Error reactivando huésped:', e)
    alert('No se pudo reactivar: ' + e.message)
  } finally {
    reactivando.value = null
  }
}

onMounted(cargar)
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

.toggle-inactivos {
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

.toggle-inactivos:hover {
  background: #ede9fe;
  border-color: #c4b5fd;
  color: #6320EE;
}

.toggle-inactivos.activo {
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

.toggle-inactivos:not(.activo) .badge-pill-count {
  background: #9ca3af;
}

.search-wrap {
  background: #f4eeff;
  border: 1px solid rgba(99, 32, 238, 0.12);
  height: 38px;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13.5px;
  color: #211A1D;
  font-family: 'Outfit', sans-serif;
  width: 100%;
}

.search-input::placeholder {
  color: #c4b8d0;
}

.fila-inactiva {
  opacity: 0.6;
}

.table-row:hover {
  background: rgba(99, 32, 238, 0.03);
}

.table-row:last-child {
  border-bottom: none !important;
}

.huesped-avatar {
  width: 32px;
  height: 32px;
  font-size: 12px;
  background: linear-gradient(135deg, #6320EE, #8075FF);
}

.avatar-inactivo {
  background: #9ca3af !important;
}

.badge-estado {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.activo {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.inactivo {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
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

.edit-btn {
  background: rgba(99, 32, 238, 0.08);
  color: #6320EE;
  transition: all .2s;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(99, 32, 238, 0.2);
}

.edit-btn:hover:not(:disabled) {
  background: rgba(99, 32, 238, 0.18);
}

.edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
  transition: all .2s;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(99, 32, 238, 0.2);
}

.delete-btn:hover {
  background: rgba(220, 38, 38, 0.18);
}

.reactivar-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(99, 32, 238, 0.07);
  color: #6320EE;
  border: 1.5px solid rgba(99, 32, 238, 0.25);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.reactivar-btn:hover:not(:disabled) {
  background: rgba(99, 32, 238, 0.14);
}

.reactivar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  font-size: 12px;
  font-weight: 500;
}
</style>