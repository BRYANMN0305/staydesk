<template>
  <div class="bg-white rounded-3 border p-4">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div>
        <h2 class="fw-bold mb-0" style="font-size:18px">Usuarios</h2>
        <span class="text-muted small">
          {{ usuarios.length }} usuario{{ usuarios.length !== 1 ? 's' : '' }} registrado{{ usuarios.length !== 1 ? 's' :
            '' }}
        </span>
      </div>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <!--  inactivos -->
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
          Nuevo usuario
        </button>
      </div>
    </div>
    <!-- TABLA DESKTOP -->
    <div class="d-none d-md-block table-responsive">
      <table class="table align-middle">
        <thead class="table-header">
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuariosFiltrados" :key="u.id_usuario" class="table-row"
            :class="{ 'fila-inactiva': esInactivo(u) }">
            <td class="d-flex align-items-center gap-2" style="font-size:14px">
              <div class="avatar" :class="{ 'avatar-inactivo': esInactivo(u) }">{{ u.nombre?.charAt(0) }}</div>
              <div class="fw-semibold">{{ u.nombre }} {{ u.apellido }}</div>
            </td>
            <td style="font-size:14px">{{ u.email }}</td>
            <td>
              <span class="badge-role" :class="u.rol === 'ADMINISTRADOR' ? 'admin' : 'empleado'">
                {{ u.rol }}
              </span>
            </td>
            <td>
              <span class="badge-estado-usuario" :class="esInactivo(u) ? 'inactivo' : 'activo'">
                {{ esInactivo(u) ? 'Inactivo' : 'Activo' }}
              </span>
            </td>
            <td>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-edit" @click="abrirModalEditar(u)"
                  :disabled="esInactivo(u)">Editar</button>
                <button v-if="!esInactivo(u)" class="btn btn-sm btn-delete"
                  @click="confirmarEliminar(u)">Eliminar</button>
                <button v-else class="btn btn-sm btn-reactivar" @click="confirmarReactivar(u)"
                  :disabled="reactivando === u.id_usuario">
                  <span v-if="reactivando === u.id_usuario" class="spinner-border spinner-border-sm me-1"
                    role="status"></span>
                  {{ reactivando === u.id_usuario ? 'Reactivando...' : 'Reactivar' }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="usuariosFiltrados.length === 0">
            <td colspan="5" class="text-center text-muted py-4" style="font-size:13px">No hay usuarios registrados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CARDS MOBILE -->
    <div class="d-md-none d-flex flex-column gap-2 mt-2">
      <div v-if="usuariosFiltrados.length === 0" class="text-center text-muted py-4 fst-italic" style="font-size:13px">
        No hay usuarios registrados
      </div>
      <div v-for="u in usuariosFiltrados" :key="u.id_usuario" class="rounded-3 p-3 border"
        :class="{ 'fila-inactiva': esInactivo(u) }" style="border-color:rgba(99,32,238,0.07)!important">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="d-flex align-items-center gap-2">
            <div class="avatar" :class="{ 'avatar-inactivo': esInactivo(u) }">{{ u.nombre?.charAt(0) }}</div>
            <div>
              <span class="fw-semibold d-block" style="font-size:13.5px">{{ u.nombre }} {{ u.apellido }}</span>
              <span class="text-muted" style="font-size:12px">{{ u.email }}</span>
            </div>
          </div>
          <div class="d-flex flex-column align-items-end gap-1">
            <span class="badge-role" :class="u.rol === 'ADMINISTRADOR' ? 'admin' : 'empleado'">
              {{ u.rol === 'ADMINISTRADOR' ? 'Admin' : 'Empleado' }}
            </span>
            <span class="badge-estado-usuario" :class="esInactivo(u) ? 'inactivo' : 'activo'">
              {{ esInactivo(u) ? 'Inactivo' : 'Activo' }}
            </span>
          </div>
        </div>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-sm btn-edit w-50" @click="abrirModalEditar(u)"
            :disabled="esInactivo(u)">Editar</button>
          <button v-if="!esInactivo(u)" class="btn btn-sm btn-delete w-50"
            @click="confirmarEliminar(u)">Eliminar</button>
          <button v-else class="btn btn-sm btn-reactivar w-50" @click="confirmarReactivar(u)"
            :disabled="reactivando === u.id_usuario">
            <span v-if="reactivando === u.id_usuario" class="spinner-border spinner-border-sm me-1"
              role="status"></span>
            {{ reactivando === u.id_usuario ? 'Reactivando...' : 'Reactivar' }}
          </button>
        </div>
      </div>
    </div>

    <Paginacion v-model="pagina" :total="totalUsuarios" etiqueta="usuarios" />

    <div v-if="mostrarInactivos && cantidadInactivos > 0" class="banner-info mt-3">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      Mostrando {{ cantidadInactivos }} usuario{{ cantidadInactivos !== 1 ? 's' : '' }} inactivo{{ cantidadInactivos !==
        1 ? 's' : '' }}.
      Los usuarios inactivos no pueden acceder al sistema.
    </div>

    <!-- MODAL CREAR / EDITAR -->
    <ModalFormulario v-if="modalAbierto" :titulo="editando ? 'Editar usuario' : 'Nuevo usuario'"
      :subtitulo="editando ? 'Modifica los datos del usuario' : 'Completa los datos del nuevo usuario'"
      :campos="camposUsuario" :valorInicial="form" :error="errorModal" :cargando="guardando"
      :textoConfirmar="editando ? 'Guardar cambios' : 'Crear usuario'" @cerrar="cerrarModal" @guardar="guardar" />

    <!-- MODAL CONFIRMAR ELIMINAR -->
    <ModalFormulario v-if="modalEliminar" titulo="¿Eliminar usuario?"
      :subtitulo="`Se desactivará a ${usuarioAEliminar?.nombre} ${usuarioAEliminar?.apellido}. El usuario quedará inactivo y no podrá acceder al sistema.`"
      :cargando="guardando" textoConfirmar="Eliminar" :peligroso="true" @cerrar="modalEliminar = false"
      @confirmar="eliminar" />

    <!-- MODAL CONFIRMAR REACTIVAR -->
    <ModalFormulario v-if="modalReactivar" titulo="¿Reactivar usuario?"
      :subtitulo="`Se reactivará a ${usuarioAReactivar?.nombre} ${usuarioAReactivar?.apellido}. El usuario podrá acceder al sistema nuevamente.`"
      :cargando="reactivando !== null" textoConfirmar="Reactivar" :peligroso="true" @cerrar="modalReactivar = false"
      @confirmar="reactivar" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ModalFormulario from '@/components/ModalFormulario.vue'
import Paginacion from '@/components/Paginacion.vue'

const API = 'https://staydesk-apis.duckdns.org'


const usuarios = ref([])
const cargando = ref(false)

const modalAbierto = ref(false)
const modalEliminar = ref(false)
const modalReactivar = ref(false)

const editando = ref(false)
const guardando = ref(false)
const reactivando = ref(null)

const usuarioAEliminar = ref(null)
const usuarioAReactivar = ref(null)

const mostrarInactivos = ref(false)
const errorModal = ref('')

const form = ref({
  id: null,
  nombre: '',
  apellido: '',
  email: '',
  contrasena: '',
  rol: ''
})

const pagina = ref(1)
const POR_PAGINA = 15


const authHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

const esInactivo = (u) =>
  Number(u.activo) === 0 || u.estado?.toUpperCase() === 'INACTIVO'

const usuariosFiltrados = computed(() => {
  const lista = mostrarInactivos.value
    ? usuarios.value
    : usuarios.value.filter(u => !esInactivo(u))
  return lista.slice((pagina.value - 1) * POR_PAGINA, pagina.value * POR_PAGINA)
})

const totalUsuarios = computed(() =>
  mostrarInactivos.value
    ? usuarios.value.length
    : usuarios.value.filter(u => !esInactivo(u)).length
)

const cantidadInactivos = computed(() =>
  usuarios.value.filter(u => esInactivo(u)).length
)

watch(mostrarInactivos, () => { pagina.value = 1 })

const camposUsuario = computed(() => [
  { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre', colClass: 'col-6' },
  { key: 'apellido', label: 'Apellido', type: 'text', placeholder: 'Apellido', colClass: 'col-6' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'Email', colClass: 'col-12' },
  ...(!editando.value
    ? [{ key: 'contrasena', label: 'Contraseña', type: 'password', placeholder: 'Contraseña', colClass: 'col-12' }]
    : []
  ),
  {
    key: 'rol', label: 'Rol', type: 'select', colClass: 'col-12',
    placeholder: 'Selecciona un rol',
    opciones: [
      { value: 'ADMINISTRADOR', label: 'Administrador' },
      { value: 'EMPLEADO', label: 'Empleado' }
    ]
  }
])

const cargarUsuarios = async () => {
  cargando.value = true

  try {
    const res = await fetch(`${API}/listar_usuarios`, {
      headers: authHeaders()
    })

    const data = await res.json()

    usuarios.value = Array.isArray(data)
      ? data
      : (data.usuarios || [])

    console.log('USUARIOS RAW:', usuarios.value)

  } catch (e) {
    console.error('Error cargando usuarios:', e)
  } finally {
    cargando.value = false
  }
}

const abrirModalCrear = () => {
  editando.value = false
  form.value = {
    id: null,
    nombre: '',
    apellido: '',
    email: '',
    contrasena: '',
    rol: ''
  }
  modalAbierto.value = true
}

const abrirModalEditar = (u) => {
  editando.value = true
  form.value = {
    id: u.id_usuario,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    contrasena: '',
    rol: u.rol
  }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const guardar = async (datos) => {
  guardando.value = true
  errorModal.value = ''

  try {
    let res

    if (editando.value) {
      res = await fetch(`${API}/actualizar_usuario/${form.value.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          nombre: datos.nombre,
          apellido: datos.apellido,
          email: datos.email,
          rol: datos.rol
        })
      })
    } else {
      res = await fetch(`${API}/crear_usuario`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(datos)
      })
    }

    if (!res.ok) throw new Error()

    cerrarModal()
    await cargarUsuarios()

  } catch (e) {
    errorModal.value = 'Error al guardar usuario'
  } finally {
    guardando.value = false
  }
}

const eliminar = async () => {
  guardando.value = true

  try {
    const res = await fetch(
      `${API}/eliminar_usuario/${usuarioAEliminar.value.id_usuario}`,
      {
        method: 'DELETE',
        headers: authHeaders()
      }
    )

    if (!res.ok) throw new Error()

    modalEliminar.value = false
    usuarioAEliminar.value = null

    await cargarUsuarios()

  } catch (e) {
    console.error('Error eliminar:', e)
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (u) => {
  usuarioAEliminar.value = u
  modalEliminar.value = true
}

const confirmarReactivar = (u) => {
  usuarioAReactivar.value = u
  modalReactivar.value = true
}

const reactivar = async () => {
  if (!usuarioAReactivar.value?.id_usuario) {
    console.error('No hay usuario seleccionado')
    return
  }

  reactivando.value = usuarioAReactivar.value.id_usuario

  try {
    const url = `${API}/reactivar_usuario/${usuarioAReactivar.value.id_usuario}`

    console.log('Reactivando usuario:', url)

    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders()
    })

    const data = await res.json().catch(() => null)

    console.log('Respuesta backend:', res.status, data)

    if (!res.ok) {
      throw new Error(data?.detail || 'Error al reactivar usuario')
    }

    modalReactivar.value = false
    usuarioAReactivar.value = null

    await cargarUsuarios()

  } catch (e) {
    console.error('Error reactivando usuario:', e)
    alert('No se pudo reactivar: ' + e.message)
  } finally {
    reactivando.value = null
  }
}

onMounted(() => {
  cargarUsuarios()
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

.table-header {
  font-size: 12px;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
}

.table-row:hover {
  background: rgba(99, 32, 238, 0.05);
}

.fila-inactiva {
  opacity: 0.6;
}

.avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6320EE, #8075FF);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 13px;
  flex-shrink: 0;
}

.avatar-inactivo {
  background: #9ca3af;
}

.badge-role {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.admin {
  background: rgba(99, 32, 238, 0.1);
  color: #6320EE;
}

.empleado {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.badge-estado-usuario {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
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

.btn-edit {
  background: rgba(99, 32, 238, 0.08);
  color: #6320EE;
  transition: all .2s;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(99, 32, 238, 0.2);
  font-weight: 450;
}

.btn-edit:hover:not(:disabled) {
  background: rgba(99, 32, 238, 0.1);
  border-color: rgba(99, 32, 238, 0.4);
}

.btn-edit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-delete {
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

.btn-delete:hover {
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(220, 38, 38, 0.4);
}

.btn-reactivar {
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

.btn-reactivar:hover:not(:disabled) {
  background: rgba(99, 32, 238, 0.14);
}

.btn-reactivar:disabled {
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