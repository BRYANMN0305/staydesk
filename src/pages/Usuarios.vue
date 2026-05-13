<template>
  <div class="position-relative">
    <div class="bg-white rounded-3 border p-4">

      <!-- HEADER -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 class="fw-bold mb-0" style="font-size:18px">Usuarios</h2>
          <span class="text-muted small">
            {{ usuarios.length }} usuario{{ usuarios.length !== 1 ? 's' : '' }} registrado{{ usuarios.length !== 1 ? 's' : '' }}
          </span>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <button class="toggle-inactivos d-none d-md-inline-flex" :class="{ activo: mostrarInactivos }"
            @click="mostrarInactivos = !mostrarInactivos">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Inactivos
            <span v-if="cantidadInactivos > 0" class="badge-pill-count">{{ cantidadInactivos }}</span>
          </button>

          <button v-if="can('USUARIOS', 'CREAR')" class="btn-primary-custom" @click="abrirModalCrear">
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
                <span class="badge-role" :style="estiloRol(u.id_rol)">
                  {{ nombreDeRol(u.id_rol) }}
                </span>
              </td>
              <td>
                <span class="badge-estado-usuario" :class="esInactivo(u) ? 'inactivo' : 'activo'">
                  {{ esInactivo(u) ? 'Inactivo' : 'Activo' }}
                </span>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <button v-if="can('USUARIOS', 'EDITAR')" class="btn btn-sm btn-edit"
                    :disabled="esInactivo(u)" @click="abrirModalEditar(u)">Editar</button>

                  <button v-if="can('USUARIOS', 'ELIMINAR') && !esInactivo(u)" class="btn btn-sm btn-delete"
                    @click="confirmarEliminar(u)">Eliminar</button>
                  <button v-else-if="esInactivo(u)" class="btn btn-sm btn-reactivar"
                    @click="confirmarReactivar(u)" :disabled="reactivando === u.id_usuario">
                    <span v-if="reactivando === u.id_usuario" class="spinner-border spinner-border-sm me-1" role="status"></span>
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
              <span class="badge-role" :style="estiloRol(u.id_rol)">
                {{ nombreDeRol(u.id_rol) }}
              </span>
              <span class="badge-estado-usuario" :class="esInactivo(u) ? 'inactivo' : 'activo'">
                {{ esInactivo(u) ? 'Inactivo' : 'Activo' }}
              </span>
            </div>
          </div>
          <div class="d-flex gap-2 mt-2">
            <button v-if="can('USUARIOS', 'EDITAR')" class="btn btn-sm btn-edit w-50"
              :disabled="esInactivo(u)" @click="abrirModalEditar(u)">Editar</button>

            <button v-if="can('USUARIOS', 'ELIMINAR') && !esInactivo(u)" class="btn btn-sm btn-delete w-50"
              @click="confirmarEliminar(u)">Eliminar</button>
            <button v-else-if="esInactivo(u)" class="btn btn-sm btn-reactivar w-50"
              @click="confirmarReactivar(u)" :disabled="reactivando === u.id_usuario">
              <span v-if="reactivando === u.id_usuario" class="spinner-border spinner-border-sm me-1" role="status"></span>
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
        Mostrando {{ cantidadInactivos }} usuario{{ cantidadInactivos !== 1 ? 's' : '' }} inactivo{{ cantidadInactivos !== 1 ? 's' : '' }}.
        Los usuarios inactivos no pueden acceder al sistema.
      </div>

      <!-- MODAL CREAR / EDITAR -->
      <Teleport to="body">
        <div v-if="modalAbierto" class="modal-usuario-overlay" @click.self="cerrarModal">
          <div class="modal-usuario-box">
            <div class="modal-usuario-bar"></div>
            <button class="modal-usuario-close" @click="cerrarModal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            <h3 class="modal-usuario-titulo">{{ editando ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
            <p class="modal-usuario-sub">{{ editando ? 'Modifica los datos del usuario' : 'Completa los datos del nuevo usuario' }}</p>

            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="field-label">Nombre</label>
                <input class="field-input" v-model="form.nombre" placeholder="Nombre" />
              </div>
              <div class="col-6">
                <label class="field-label">Apellido</label>
                <input class="field-input" v-model="form.apellido" placeholder="Apellido" />
              </div>
              <div class="col-12">
                <label class="field-label">Email</label>
                <input class="field-input" type="email" v-model="form.email" placeholder="Email" />
              </div>
              <div class="col-6">
                <label class="field-label">Documento</label>
                <input class="field-input" v-model="form.documento" placeholder="Nº de documento" />
              </div>
              <div class="col-6">
                <label class="field-label">Teléfono</label>
                <input class="field-input" v-model="form.telefono" placeholder="Teléfono" />
              </div>
              <div class="col-12">
                <label class="field-label">Cargo</label>
                <input class="field-input" v-model="form.cargo" placeholder="Ej: Recepcionista, Gerente..." />
              </div>
              <div class="col-12">
                <label class="field-label">{{ editando ? 'Nueva contraseña (obligatoria para guardar cambios)' : 'Contraseña' }}</label>
                <input class="field-input" type="password" v-model="form.contrasena" :placeholder="editando ? 'Mínimo 8 caracteres' : 'Contraseña'" />
              </div>
              <div class="col-12">
                <label class="field-label">Rol</label>
                <select class="field-input" v-model="form.id_rol" @change="form.id_rol = Number(form.id_rol)">
                  <option :value="null" disabled>Selecciona un rol</option>
                  <option v-for="r in opcionesRol" :key="r.value" :value="r.value">{{ r.label }}</option>
                </select>
              </div>
            </div>

            <Transition name="fade-permisos">
              <div v-if="form.id_rol && permisosDelRolSeleccionado.length" class="permisos-resumen">
                <p class="permisos-resumen-titulo">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Permisos del rol seleccionado
                </p>
                <div class="permisos-resumen-chips">
                  <span v-for="p in permisosDelRolSeleccionado" :key="p.id_permiso" class="permiso-chip">
                    {{ p.modulo?.toLowerCase() }}.{{ p.accion?.toLowerCase() }}
                  </span>
                </div>
              </div>
            </Transition>

            <div v-if="errorModal" class="error-msg-usuario mb-3">{{ errorModal }}</div>

            <div class="d-flex gap-2 mt-3">
              <button class="btn-cancelar-usuario flex-1" @click="cerrarModal">Cancelar</button>
              <button class="btn-confirmar-usuario flex-1" @click="guardarDesdeModal" :disabled="guardando">
                <span v-if="guardando" class="spinner-sm-u"></span>
                {{ guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>

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
  </div>
</template>

<script setup>
import { usePermissions } from '@/composables/usePermissions'
const { can } = usePermissions()
import { ref, computed, onMounted, watch } from 'vue'
import ModalFormulario from '@/components/ModalFormulario.vue'
import Paginacion from '@/components/Paginacion.vue'

const API_URL = import.meta.env.VITE_API_URL

const usuarios  = ref([])
const roles     = ref([])
const permisosRol = ref({})
const cargando  = ref(false)

const modalAbierto   = ref(false)
const modalEliminar  = ref(false)
const modalReactivar = ref(false)

const editando   = ref(false)
const guardando  = ref(false)
const reactivando = ref(null)

const usuarioAEliminar  = ref(null)
const usuarioAReactivar = ref(null)

const mostrarInactivos = ref(false)
const errorModal = ref('')

const form = ref({
  id: null,
  nombre: '',
  apellido: '',
  email: '',
  contrasena: '',
  id_rol: null,
  documento: '',
  telefono: '',
  cargo: ''
})

const pagina     = ref(1)
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

// ── Misma paleta y lógica que GestionRoles ──────────────────────────────────
const PALETA_ROLES = [
  '#6320EE', '#16a34a', '#d97706', '#dc2626',
  '#0ea5e9', '#ec4899', '#8b5cf6', '#0d9488',
  '#f97316', '#64748b', '#a21caf', '#0369a1',
]

const colorRol = (id_rol) =>
  PALETA_ROLES[(id_rol - 1) % PALETA_ROLES.length]

const estiloRol = (id_rol) => {
  const color = colorRol(id_rol)
  return {
    background: `${color}18`,
    color,
    border: `1px solid ${color}30`
  }
}
// ────────────────────────────────────────────────────────────────────────────

const nombreDeRol = (id_rol) => {
  const rol = roles.value.find(r => r.id_rol === id_rol)
  return rol?.nombre ?? '—'
}

const permisosDelRolSeleccionado = computed(() =>
  form.value.id_rol ? (permisosRol.value[form.value.id_rol] || []) : []
)

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

const opcionesRol = computed(() =>
  roles.value
    .filter(r => r.activo)
    .map(r => ({ value: r.id_rol, label: r.nombre }))
)

watch(mostrarInactivos, () => { pagina.value = 1 })

const cargarUsuarios = async () => {
  cargando.value = true
  try {
    const res  = await fetch(`${API_URL}/usuarios`, { headers: authHeaders() })
    const data = await res.json()
    usuarios.value = Array.isArray(data) ? data : (data.usuarios || [])
  } catch (e) {
    console.error('Error cargando usuarios:', e)
  } finally {
    cargando.value = false
  }
}

const cargarRoles = async () => {
  try {
    const res = await fetch(`${API_URL}/roles`, { headers: authHeaders() })
    if (res.ok) {
      roles.value = await res.json()
      await Promise.all(roles.value.map(async (r) => {
        try {
          const rp = await fetch(`${API_URL}/roles/${r.id_rol}/obtener/permisos`, { headers: authHeaders() })
          if (rp.ok) permisosRol.value[r.id_rol] = await rp.json()
        } catch {}
      }))
    }
  } catch (e) {
    console.error('Error cargando roles:', e)
  }
}

const abrirModalCrear = async () => {
  editando.value = false
  form.value = { id: null, nombre: '', apellido: '', email: '', contrasena: '', id_rol: null, documento: '', telefono: '', cargo: '' }
  errorModal.value = ''
  modalAbierto.value = true
  await cargarRoles()
}

const abrirModalEditar = async (u) => {
  editando.value = true
  await cargarRoles()
  form.value = {
    id:         u.id_usuario,
    nombre:     u.nombre,
    apellido:   u.apellido,
    email:      u.email,
    contrasena: '',
    id_rol:     u.id_rol ?? null,
    documento:  u.documento || '',
    telefono:   u.telefono  || '',
    cargo:      u.cargo     || ''
  }
  errorModal.value   = ''
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  errorModal.value = ''
}

const guardarDesdeModal = () => guardar(form.value)

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/

const guardar = async (datos) => {
  guardando.value  = true
  errorModal.value = ''

  if (!datos.nombre || !datos.apellido) {
    errorModal.value = 'Nombre y apellido son obligatorios.'
    guardando.value = false
    return
  }
  if (!soloLetras.test(datos.nombre)) {
    errorModal.value = 'El nombre no puede contener números.'
    guardando.value = false
    return
  }
  if (!soloLetras.test(datos.apellido)) {
    errorModal.value = 'El apellido no puede contener números.'
    guardando.value = false
    return
  }
  if (!datos.id_rol) {
    errorModal.value = 'Debes seleccionar un rol.'
    guardando.value = false
    return
  }

  try {
    let res

    if (editando.value) {
      if (!datos.contrasena || datos.contrasena.trim().length < 8) {
        errorModal.value = 'Debes ingresar una contraseña de al menos 8 caracteres para guardar cambios.'
        guardando.value = false
        return
      }
      res = await fetch(`${API_URL}/usuarios/${form.value.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          nombre:     datos.nombre,
          apellido:   datos.apellido,
          email:      datos.email,
          id_rol:     Number(datos.id_rol),
          contrasena: datos.contrasena,
          documento:  datos.documento || '',
          telefono:   datos.telefono  || '',
          cargo:      datos.cargo     || ''
        })
      })
    } else {
      res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          nombre:     datos.nombre,
          apellido:   datos.apellido,
          email:      datos.email,
          id_rol:     Number(datos.id_rol),
          contrasena: datos.contrasena,
          documento:  datos.documento  || '',
          telefono:   datos.telefono   || '',
          cargo:      datos.cargo      || ''
        })
      })
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      errorModal.value = err?.detail || 'Error al guardar usuario.'
      return
    }

    cerrarModal()
    await cargarUsuarios()

  } catch (e) {
    errorModal.value = 'Error de conexión. Intenta de nuevo.'
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (u) => { usuarioAEliminar.value = u; modalEliminar.value = true }

const eliminar = async () => {
  guardando.value = true
  try {
    const res = await fetch(`${API_URL}/usuarios/${usuarioAEliminar.value.id_usuario}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    if (!res.ok) throw new Error()
    modalEliminar.value    = false
    usuarioAEliminar.value = null
    await cargarUsuarios()
  } catch (e) {
    console.error('Error eliminar:', e)
  } finally {
    guardando.value = false
  }
}

const confirmarReactivar = (u) => { usuarioAReactivar.value = u; modalReactivar.value = true }

const reactivar = async () => {
  if (!usuarioAReactivar.value?.id_usuario) return

  reactivando.value = usuarioAReactivar.value.id_usuario

  try {
    const res = await fetch(`${API_URL}/usuarios/${usuarioAReactivar.value.id_usuario}`, {
      method: 'PATCH',
      headers: authHeaders()
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) throw new Error(data?.detail || 'Error al reactivar usuario')

    modalReactivar.value    = false
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
  cargarRoles()
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
  transition: all .2s;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(220, 38, 38, 0.2);
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

.modal-usuario-overlay {
  position: fixed; inset: 0;
  background: rgba(33,26,29,0.55);
  backdrop-filter: blur(4px);
  z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-usuario-box {
  background: #fff; border-radius: 18px; padding: 2rem; width: 100%;
  max-width: 520px; max-height: 90vh; overflow-y: auto; position: relative;
  box-shadow: 0 24px 60px rgba(33,26,29,0.3);
  animation: modalUsuarioIn .3s cubic-bezier(.22,1,.36,1);
}
@keyframes modalUsuarioIn {
  from { opacity:0; transform:scale(.95) translateY(10px) }
  to   { opacity:1; transform:none }
}
.modal-usuario-bar {
  position: absolute; top:0; left:0; right:0; height:4px;
  background: linear-gradient(90deg,#6320EE,#8075FF);
  border-radius: 4px 4px 0 0;
}
.modal-usuario-close {
  position: absolute; top:14px; right:14px;
  background: #f4eeff; border: none; border-radius: 8px;
  width:30px; height:30px; display:flex; align-items:center; justify-content:center;
  color:#9ca3af; cursor:pointer;
}
.modal-usuario-titulo { font-size:18px; font-weight:700; color:#211A1D; margin:.5rem 0 .2rem; }
.modal-usuario-sub    { font-size:12px; color:#9ca3af; margin:0 0 1.25rem; }

.field-label {
  display: block; font-size:11px; font-weight:700; letter-spacing:.6px;
  text-transform:uppercase; color:#9ca3af; margin-bottom:4px;
}
.field-input {
  width:100%; border:1.5px solid rgba(99,32,238,0.15); border-radius:10px;
  padding:9px 13px; font-size:13.5px; font-family:'Outfit',sans-serif;
  color:#211A1D; background:#faf8ff; outline:none; transition:border-color .2s;
  appearance: auto;
}
.field-input:focus { border-color:#6320EE; }
.field-input::placeholder { color:#c4b8d0; }

.permisos-resumen {
  background: rgba(99,32,238,0.04); border:1px solid rgba(99,32,238,0.12);
  border-radius:12px; padding:12px 14px; margin-bottom:1rem;
}
.permisos-resumen-titulo {
  display:flex; align-items:center; gap:6px;
  font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.6px;
  color:#6320EE; margin:0 0 8px;
}
.permisos-resumen-chips { display:flex; flex-wrap:wrap; gap:5px; }
.permiso-chip {
  padding:3px 9px; border-radius:999px; font-size:11px; font-weight:600;
  background:rgba(99,32,238,0.08); color:#6320EE;
  border:1px solid rgba(99,32,238,0.15);
}
.fade-permisos-enter-active, .fade-permisos-leave-active { transition: all .25s ease; }
.fade-permisos-enter-from, .fade-permisos-leave-to { opacity:0; transform:translateY(-6px); }

.error-msg-usuario {
  background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2);
  border-radius:8px; padding:8px 12px; font-size:13px; color:#dc2626;
}
.btn-cancelar-usuario {
  padding:10px; border-radius:10px; border:1.5px solid rgba(99,32,238,0.2);
  background:#f4eeff; color:#6320EE; font-size:13.5px; font-weight:600;
  font-family:'Outfit',sans-serif; cursor:pointer; transition:all .2s;
}
.btn-cancelar-usuario:hover { background:rgba(99,32,238,0.1); }
.btn-confirmar-usuario {
  padding:10px; border-radius:10px; border:none;
  background:linear-gradient(135deg,#6320EE,#8075FF); color:#fff;
  font-size:13.5px; font-weight:700; font-family:'Outfit',sans-serif;
  cursor:pointer; box-shadow:0 4px 14px rgba(99,32,238,0.3); transition:all .2s;
  display:flex; align-items:center; justify-content:center; gap:6px;
}
.btn-confirmar-usuario:disabled { opacity:.6; cursor:not-allowed; }
.spinner-sm-u {
  width:13px; height:13px; border:2px solid rgba(255,255,255,0.3);
  border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block;
}
@keyframes spin { to { transform:rotate(360deg); } }
</style>