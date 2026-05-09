<template>
  <div class="config-card">
    <div class="roles-header">
      <div class="card-title">
        <span class="card-icon">🔒</span>
        <h4>Gestión de roles</h4>
      </div>
      <button class="btn-nuevo" @click="abrirModalCrear">+ Nuevo rol</button>
    </div>

    <!-- Buscador -->
    <div class="search-wrap mb-4">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#9ca3af;flex-shrink:0">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <input class="search-input" type="text" placeholder="Buscar rol..." v-model="busqueda"/>
    </div>

    <!-- Cargando -->
    <div v-if="cargando" class="state-empty">
      <span class="spinner-lg"></span>
      <p>Cargando roles...</p>
    </div>

    <!-- Tabla -->
    <div v-else class="roles-table">
      <div class="table-head">
        <span>ROL</span>
        <span>PERMISOS ASIGNADOS</span>
        <span>ESTADO</span>
        <span></span>
      </div>

      <div v-for="rol in rolesFiltrados" :key="rol.id_rol" class="table-row">
        <!-- Nombre -->
        <div class="rol-nombre">
          <span class="rol-dot" :style="{ background: colorRol(rol.nombre) }"></span>
          <span class="fw-semibold" style="font-size:14px">{{ rol.nombre }}</span>
        </div>

        <!-- Permisos chips -->
        <div class="permisos-chips">
          <span v-for="p in (permisosRol[rol.id_rol] || []).slice(0, 3)" :key="p.id_permiso" class="chip">
            {{ p.modulo?.toLowerCase() }}.{{ p.accion?.toLowerCase() }}
          </span>
          <span v-if="(permisosRol[rol.id_rol] || []).length > 3" class="chip chip-mas">
            +{{ (permisosRol[rol.id_rol] || []).length - 3 }} más
          </span>
          <span v-if="!(permisosRol[rol.id_rol] || []).length" class="sin-permisos">
            Sin permisos
          </span>
        </div>

        <!-- Estado -->
        <div>
          <span class="badge-activo" :class="rol.activo ? 'activo' : 'inactivo'">
            <span class="badge-dot"></span>
            {{ rol.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <!-- Acciones -->
        <div class="acciones">
          <button class="btn-accion edit" @click="abrirModalEditar(rol)" title="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>

          <!-- Reactivar (solo si inactivo) -->
          <button v-if="!rol.activo" class="btn-accion reactivar" @click="confirmarReactivar(rol)" title="Reactivar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>

          <!-- Eliminar (solo si activo) -->
          <button v-if="rol.activo" class="btn-accion delete" @click="confirmarEliminar(rol)" title="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="rolesFiltrados.length === 0" class="state-empty">
        <span style="font-size:32px">🔍</span>
        <p>No se encontraron roles.</p>
      </div>
    </div>

    <div v-if="errorGlobal" class="error-banner mt-3">⚠️ {{ errorGlobal }}</div>
  </div>

  <!-- Aviso sesión afectada -->
  <Transition name="slide-down">
    <div v-if="rolSesionAfectado" class="sesion-banner mt-3">
      <div class="sesion-banner-left">
        <span class="sesion-icon">⚠️</span>
        <div>
          <p class="sesion-titulo">Tu rol fue modificado</p>
          <p class="sesion-sub">Los cambios de permisos aplican al cerrar e iniciar sesión nuevamente.</p>
        </div>
      </div>
      <button class="sesion-btn" @click="cerrarSesion">Cerrar sesión ahora</button>
    </div>
  </Transition>

  <!-- ══════════════════════════════════════════
       MODAL CREAR / EDITAR
  ══════════════════════════════════════════ -->
  <Teleport to="body">
    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-box">
        <div class="modal-bar"></div>
        <button class="modal-close" @click="cerrarModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <h3 class="modal-titulo">{{ editando ? 'Editar rol' : 'Nuevo rol' }}</h3>
        <p class="modal-sub">{{ editando ? 'Modifica el nombre y permisos del rol' : 'Define el nombre y asigna permisos' }}</p>

        <div class="field mb-3">
          <label>Nombre del rol</label>
          <input v-model="form.nombre" placeholder="Ej: Recepcionista"/>
        </div>

        <div class="field mb-4">
          <div class="desc-label-row">
            <label>Descripción</label>
            <button
              type="button"
              class="btn-generar"
              :disabled="!form.permisos_ids.length"
              @click="generarDescripcion"
            >✨ Generar </button>
          </div>
          <input v-model="form.descripcion" placeholder="Ej: Acceso a reservas y huéspedes"/>
        </div>

        <div class="field mb-4">
          <label>Permisos</label>
          <div v-if="cargandoPermisos" class="state-empty-sm">
            <span class="spinner-sm-purple"></span> Cargando permisos...
          </div>
          <div v-else class="permisos-grid">
            <div v-for="grupo in permisosAgrupados" :key="grupo.modulo" class="permiso-grupo">
              <div class="grupo-header">
                <p class="grupo-label">{{ grupo.modulo }}</p>
                <button class="btn-sel-todo" type="button" @click="toggleGrupo(grupo)">
                  {{ grupoCompleto(grupo) ? 'Quitar todos' : 'Seleccionar todos' }}
                </button>
              </div>
              <div class="grupo-checks">
                <label v-for="p in grupo.permisos" :key="p.id_permiso" class="check-item">
                  <input type="checkbox" :value="p.id_permiso" v-model="form.permisos_ids"/>
                  <span>{{ p.accion }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div v-if="errorModal" class="error-msg mb-3">{{ errorModal }}</div>

        <div class="d-flex gap-2">
          <button class="btn-cancelar flex-1" @click="cerrarModal">Cancelar</button>
          <button class="btn-confirmar flex-1" @click="guardar" :disabled="guardando">
            <span v-if="guardando" class="spinner-sm"></span>
            {{ guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear rol' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ══════════════════════════════════════════
       MODAL ELIMINAR
  ══════════════════════════════════════════ -->
  <Teleport to="body">
    <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
      <div class="modal-box" style="max-width:400px">
        <div class="modal-bar" style="background:#dc2626"></div>
        <h3 class="modal-titulo">¿Eliminar rol?</h3>
        <p class="modal-sub">
          Se eliminará el rol <strong>{{ rolAccion?.nombre }}</strong>.
          Esta acción no se puede deshacer.
        </p>
        <div class="d-flex gap-2 mt-4">
          <button class="btn-cancelar flex-1" @click="modalEliminar = false">Cancelar</button>
          <button class="btn-danger flex-1" @click="eliminar" :disabled="guardando">
            {{ guardando ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ══════════════════════════════════════════
       MODAL REACTIVAR
  ══════════════════════════════════════════ -->
  <Teleport to="body">
    <div v-if="modalReactivar" class="modal-overlay" @click.self="modalReactivar = false">
      <div class="modal-box" style="max-width:400px">
        <div class="modal-bar" style="background:#16a34a"></div>
        <h3 class="modal-titulo">¿Reactivar rol?</h3>
        <p class="modal-sub">
          El rol <strong>{{ rolAccion?.nombre }}</strong> volverá a estar disponible
          para asignarse a usuarios.
        </p>
        <div class="d-flex gap-2 mt-4">
          <button class="btn-cancelar flex-1" @click="modalReactivar = false">Cancelar</button>
          <button class="btn-reactivar flex-1" @click="reactivar" :disabled="guardando">
            {{ guardando ? 'Reactivando...' : 'Reactivar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const API_URL = import.meta.env.VITE_API_URL

// ── Estado ─────────────────────────────────────────────────────────────────
const roles            = ref([])
const todosLosPermisos = ref([])
const permisosRol      = ref({})   // { id_rol: [permisos] }
const cargando         = ref(false)
const cargandoPermisos = ref(false)
const guardando        = ref(false)
const busqueda         = ref('')
const errorGlobal      = ref('')
const errorModal       = ref('')

const modalAbierto  = ref(false)
const modalEliminar = ref(false)
const modalReactivar = ref(false)
const editando      = ref(false)
const rolAccion          = ref(null)   // rol objetivo para eliminar / reactivar
const rolSesionAfectado = ref(false)   // true si se editó el rol del usuario en sesión

const form = ref({ id_rol: null, nombre: '', descripcion: '', permisos_ids: [] })

// ── Auth ────────────────────────────────────────────────────────────────────
const authHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── Computed ────────────────────────────────────────────────────────────────
const rolesFiltrados = computed(() =>
  busqueda.value
    ? roles.value.filter(r => r.nombre.toLowerCase().includes(busqueda.value.toLowerCase()))
    : roles.value
)

const permisosAgrupados = computed(() => {
  const grupos = {}
  todosLosPermisos.value.forEach(p => {
    if (!grupos[p.modulo]) grupos[p.modulo] = []
    grupos[p.modulo].push(p)
  })
  return Object.entries(grupos).map(([modulo, permisos]) => ({ modulo, permisos }))
})

const grupoCompleto = (grupo) =>
  grupo.permisos.every(p => form.value.permisos_ids.includes(p.id_permiso))

// ── Auto-selección de VER ───────────────────────────────────────────────────
// Si se marca CREAR/EDITAR/ELIMINAR/cualquier acción de un módulo,
// el permiso VER de ese módulo se activa automáticamente como prerequisito.
watch(
  () => [...form.value.permisos_ids],
  (nuevos, anteriores) => {
    if (!todosLosPermisos.value.length) return
    const agregados = nuevos.filter(id => !anteriores.includes(id))
    if (!agregados.length) return
    const idsAAgregar = []
    for (const idAgregado of agregados) {
      const permiso = todosLosPermisos.value.find(p => p.id_permiso === idAgregado)
      if (!permiso || permiso.accion?.toUpperCase() === 'VER') continue
      const verDelModulo = todosLosPermisos.value.find(
        p => p.modulo === permiso.modulo && p.accion?.toUpperCase() === 'VER'
      )
      if (verDelModulo && !form.value.permisos_ids.includes(verDelModulo.id_permiso)) {
        idsAAgregar.push(verDelModulo.id_permiso)
      }
    }
    if (idsAAgregar.length) form.value.permisos_ids.push(...idsAAgregar)
  }
)

const toggleGrupo = (grupo) => {
  const ids = grupo.permisos.map(p => p.id_permiso)
  if (grupoCompleto(grupo)) {
    form.value.permisos_ids = form.value.permisos_ids.filter(id => !ids.includes(id))
  } else {
    const nuevos = ids.filter(id => !form.value.permisos_ids.includes(id))
    form.value.permisos_ids.push(...nuevos)
  }
}

const colorRol = (nombre) => {
  const colores = ['#6320EE', '#16a34a', '#d97706', '#dc2626', '#0ea5e9', '#8b5cf6', '#ec4899']
  return colores[(nombre?.charCodeAt(0) ?? 0) % colores.length]
}

// ── Cargar roles + permisos de cada rol ─────────────────────────────────────
const cargar = async () => {
  cargando.value = true
  errorGlobal.value = ''
  try {
    const res = await fetch(`${API_URL}/roles`, { headers: authHeaders() })
    if (!res.ok) throw new Error()
    roles.value = await res.json()
    // Cargar permisos de cada rol en paralelo
    await Promise.all(roles.value.map(rol => cargarPermisosRol(rol.id_rol)))
  } catch {
    errorGlobal.value = 'No se pudieron cargar los roles.'
  } finally {
    cargando.value = false
  }
}

const cargarPermisosRol = async (id_rol) => {
  try {
    const res = await fetch(`${API_URL}/roles/${id_rol}/obtener/permisos`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      permisosRol.value[id_rol] = Array.isArray(data) ? data : []
    }
  } catch {}
}

const cargarTodosPermisos = async () => {
  cargandoPermisos.value = true
  try {
    const res = await fetch(`${API_URL}/permisos`, { headers: authHeaders() })
    if (res.ok) todosLosPermisos.value = await res.json()
  } catch {}
  finally { cargandoPermisos.value = false }
}

// ── Abrir modales ───────────────────────────────────────────────────────────
const abrirModalCrear = async () => {
  editando.value = false
  form.value = { id_rol: null, nombre: '', descripcion: '', permisos_ids: [] }
  errorModal.value = ''
  modalAbierto.value = true
  await cargarTodosPermisos()
}

const abrirModalEditar = async (rol) => {
  editando.value = true
  form.value = {
    id_rol: rol.id_rol,
    nombre: rol.nombre,
    descripcion: rol.descripcion || '',
    permisos_ids: [],
  }
  errorModal.value = ''
  modalAbierto.value = true
  await cargarTodosPermisos()
  // Precargar checkboxes con los permisos actuales del rol
  const permisos = permisosRol.value[rol.id_rol] || []
  form.value.permisos_ids = permisos.map(p => p.id_permiso)
}

const cerrarModal = () => {
  modalAbierto.value = false
  errorModal.value = ''
}

// ── GUARDAR (crear o editar) ─────────────────────────────────────────────────
//
// Flujo correcto según los endpoints disponibles:
//
// CREAR:
//   1. POST /roles            → crea el rol (sin permisos)
//   2. POST /roles/:id/obtener/permisos  → asigna los permisos seleccionados
//
// EDITAR:
//   1. PUT  /roles/:id/editar → actualiza nombre y descripción
//   2. Diff de permisos:
//      - Para los permisos nuevos → POST /roles/:id/obtener/permisos
//      - Para los permisos eliminados → DELETE /roles/:id/permisos/:id_permiso
//
const guardar = async () => {
  if (!form.value.nombre.trim()) {
    errorModal.value = 'El nombre es obligatorio.'
    return
  }
  guardando.value = true
  errorModal.value = ''

  try {
    if (editando.value) {
      // 1. Actualizar nombre / descripción
      const res = await fetch(`${API_URL}/roles/${form.value.id_rol}/editar`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          nombre:      form.value.nombre,
          descripcion: form.value.descripcion,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        errorModal.value = err?.detail || 'Error al actualizar el rol.'
        return
      }

      // 2. El POST reemplaza TODOS los permisos del rol.
      //    Enviamos siempre la lista completa final (lo que el usuario dejó marcado).
      await fetch(`${API_URL}/roles/${form.value.id_rol}/obtener/permisos`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form.value.permisos_ids),
      })

    } else {
      // 1. Crear rol
      const res = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          nombre:      form.value.nombre,
          descripcion: form.value.descripcion,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        errorModal.value = err?.detail || 'Error al crear el rol.'
        return
      }
      const nuevoRol = await res.json()

      // 2. Asignar permisos si se seleccionaron
      if (form.value.permisos_ids.length) {
        await fetch(`${API_URL}/roles/${nuevoRol.id_rol}/obtener/permisos`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(form.value.permisos_ids),
        })
      }
    }

    cerrarModal()
    await cargar()

    // Detectar si el rol que se editó es el del usuario actualmente en sesión
    if (editando.value) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload.id_rol === form.value.id_rol) {
            rolSesionAfectado.value = true
          }
        } catch {}
      }
    }

  } catch {
    errorModal.value = 'Error de conexión. Intenta de nuevo.'
  } finally {
    guardando.value = false
  }
}

// ── Eliminar ────────────────────────────────────────────────────────────────
const confirmarEliminar = (rol) => { rolAccion.value = rol; modalEliminar.value = true }

const eliminar = async () => {
  guardando.value = true
  try {
    await fetch(`${API_URL}/roles/${rolAccion.value.id_rol}/eliminar`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    modalEliminar.value = false
    rolAccion.value = null
    await cargar()
  } catch {
    errorGlobal.value = 'Error al eliminar el rol.'
  } finally {
    guardando.value = false
  }
}

// ── Reactivar ───────────────────────────────────────────────────────────────
const confirmarReactivar = (rol) => { rolAccion.value = rol; modalReactivar.value = true }

const reactivar = async () => {
  guardando.value = true
  try {
    const res = await fetch(`${API_URL}/roles/${rolAccion.value.id_rol}/reactivar`, {
      method: 'PATCH',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error()
    modalReactivar.value = false
    rolAccion.value = null
    await cargar()
  } catch {
    errorGlobal.value = 'Error al reactivar el rol.'
  } finally {
    guardando.value = false
  }
}

// ── Generar descripción automática ──────────────────────────────────────────
const generarDescripcion = () => {
  if (!form.value.permisos_ids.length) return

  // Obtener módulos únicos que tienen al menos un permiso seleccionado
  const modulosSeleccionados = [
    ...new Set(
      todosLosPermisos.value
        .filter(p => form.value.permisos_ids.includes(p.id_permiso))
        .map(p => p.modulo)
    )
  ]

  // Mapa de nombres legibles por módulo
  const NOMBRES = {
    RESERVAS:         'reservas',
    HABITACIONES:     'habitaciones',
    PISOS:            'pisos',
    HUESPEDES:        'huéspedes',
    USUARIOS:         'usuarios',
    ROLES:            'roles',
    CONFIGURACION:    'configuración',
    HOUSEKEEPING:     'housekeeping',
    MANTENIMIENTO:    'mantenimiento',
    NOTIFICACIONES:   'notificaciones',
    AUDITORIA:        'auditoría',
    REPORTES:         'reportes',
    DASHBOARD:        'dashboard',
    FACTURAS:         'facturas',
    SERVICIOS:        'servicios',
    RESERVA_SERVICIOS:'servicios de reserva',
  }

  const nombres = modulosSeleccionados.map(m => NOMBRES[m] || m.toLowerCase())

  if (nombres.length === 1) {
    form.value.descripcion = `Acceso a ${nombres[0]}`
  } else {
    const ultimo = nombres.pop()
    form.value.descripcion = `Acceso a ${nombres.join(', ')} y ${ultimo}`
  }
}

const cerrarSesion = () => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
  window.location.href = '/login'
}

onMounted(cargar)
</script>

<style scoped>
.config-card {
  background: #fff; border: 1px solid rgba(99,32,238,0.08);
  border-radius: 16px; padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(33,26,29,0.05);
}

.roles-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.card-title { display: flex; align-items: center; gap: 10px; }
.card-title h4 { margin: 0; font-size: 15px; font-weight: 700; color: #211A1D; }
.card-icon { font-size: 18px; }

.btn-nuevo {
  padding: 9px 20px; border-radius: 10px; border: none;
  background: linear-gradient(135deg,#6320EE,#8075FF); color: #fff;
  font-size: 13.5px; font-weight: 700; font-family: 'Outfit',sans-serif;
  cursor: pointer; box-shadow: 0 4px 14px rgba(99,32,238,0.3); transition: all .2s;
}
.btn-nuevo:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,32,238,0.4); }

/* Buscador */
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #f4eeff; border: 1px solid rgba(99,32,238,0.12);
  border-radius: 10px; padding: 8px 14px; max-width: 300px;
}
.search-input { border: none; outline: none; background: transparent; font-size: 13.5px; color: #211A1D; font-family: 'Outfit',sans-serif; width: 100%; }
.search-input::placeholder { color: #c4b8d0; }
.mb-4 { margin-bottom: 1.25rem; }

/* Tabla */
.table-head {
  display: grid; grid-template-columns: 200px 1fr 130px 90px;
  padding: 8px 12px; font-size: 11px; font-weight: 700; color: #9ca3af;
  text-transform: uppercase; letter-spacing: .6px;
  border-bottom: 1px solid rgba(99,32,238,0.07);
}
.table-row {
  display: grid; grid-template-columns: 200px 1fr 130px 90px;
  padding: 14px 12px; align-items: center;
  border-bottom: 1px solid rgba(99,32,238,0.05); transition: background .15s;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(99,32,238,0.02); border-radius: 10px; }

.rol-nombre { display: flex; align-items: center; gap: 10px; }
.rol-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.fw-semibold { font-weight: 600; }

.permisos-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.chip {
  padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 600;
  background: rgba(99,32,238,0.08); color: #6320EE;
  border: 1px solid rgba(99,32,238,0.15);
}
.chip-mas { background: rgba(107,114,128,0.1); color: #6b7280; border-color: rgba(107,114,128,0.2); }
.sin-permisos { font-size: 12px; color: #9ca3af; font-style: italic; }

.badge-activo {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
}
.badge-activo.activo  { background: rgba(22,163,74,0.1);  color: #15803d; }
.badge-activo.inactivo { background: rgba(220,38,38,0.1); color: #dc2626; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.acciones { display: flex; gap: 6px; }
.btn-accion {
  width: 30px; height: 30px; border-radius: 8px; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s;
}
.btn-accion.edit      { background: rgba(99,32,238,0.08);  color: #6320EE; }
.btn-accion.edit:hover { background: rgba(99,32,238,0.18); }
.btn-accion.delete      { background: rgba(220,38,38,0.08);  color: #dc2626; }
.btn-accion.delete:hover { background: rgba(220,38,38,0.18); }
.btn-accion.reactivar      { background: rgba(22,163,74,0.08);  color: #16a34a; }
.btn-accion.reactivar:hover { background: rgba(22,163,74,0.18); }

/* Estados vacíos */
.state-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 32px; color: #9ca3af; font-size: 13px;
}
.state-empty-sm { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9ca3af; padding: 8px 0; }

/* Error */
.error-banner {
  background: rgba(220,38,38,0.07); border: 1px solid rgba(220,38,38,0.2);
  border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #dc2626;
}
.mt-3 { margin-top: .75rem; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(33,26,29,0.55);
  backdrop-filter: blur(4px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-box {
  background: #fff; border-radius: 18px; padding: 2rem; width: 100%;
  max-width: 560px; max-height: 90vh; overflow-y: auto; position: relative;
  box-shadow: 0 24px 60px rgba(33,26,29,0.3);
  animation: modalIn .3s cubic-bezier(.22,1,.36,1);
}
@keyframes modalIn { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:none} }

.modal-bar { position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,#6320EE,#8075FF); border-radius:4px 4px 0 0; }
.modal-close { position:absolute; top:14px; right:14px; background:#f4eeff; border:none; border-radius:8px; width:30px; height:30px; display:flex; align-items:center; justify-content:center; color:#9ca3af; cursor:pointer; }
.modal-titulo { font-size:18px; font-weight:700; color:#211A1D; margin:.5rem 0 .2rem; }
.modal-sub { font-size:12px; color:#9ca3af; margin:0 0 1.25rem; }

/* Campos del modal */
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #9ca3af; }
.field input {
  border: 1.5px solid rgba(99,32,238,0.15); border-radius: 10px;
  padding: 9px 13px; font-size: 13.5px; font-family: 'Outfit',sans-serif;
  color: #211A1D; background: #faf8ff; outline: none; transition: border-color .2s;
}
.field input:focus { border-color: #6320EE; }
.field input::placeholder { color: #c4b8d0; }
.mb-3 { margin-bottom: .75rem; }

/* Permisos */
.permisos-grid { display: flex; flex-direction: column; gap: .75rem; max-height: 300px; overflow-y: auto; padding: 2px 2px 4px; }
.permiso-grupo { background: #f4eeff; border-radius: 10px; padding: .75rem; }
.grupo-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: .5rem; }
.grupo-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #6320EE; margin: 0; }
.btn-sel-todo {
  font-size: 11px; font-weight: 600; color: #6320EE; background: none;
  border: none; cursor: pointer; font-family: 'Outfit',sans-serif;
  text-decoration: underline; padding: 0;
}
.grupo-checks { display: flex; flex-wrap: wrap; gap: 8px; }
.check-item { display: flex; align-items: center; gap: 5px; font-size: 12.5px; color: #374151; cursor: pointer; }
.check-item input { accent-color: #6320EE; }

/* Error modal */
.error-msg { background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2); border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #dc2626; }

/* Botones footer modal */
.d-flex { display: flex; }
.gap-2 { gap: .5rem; }
.flex-1 { flex: 1; }
.mt-4 { margin-top: 1.25rem; }

.btn-cancelar {
  padding: 10px; border-radius: 10px; border: 1.5px solid rgba(99,32,238,0.2);
  background: #f4eeff; color: #6320EE; font-size: 13.5px; font-weight: 600;
  font-family: 'Outfit',sans-serif; cursor: pointer; transition: all .2s;
}
.btn-cancelar:hover { background: rgba(99,32,238,0.1); }

.btn-confirmar {
  padding: 10px; border-radius: 10px; border: none;
  background: linear-gradient(135deg,#6320EE,#8075FF); color: #fff;
  font-size: 13.5px; font-weight: 700; font-family: 'Outfit',sans-serif;
  cursor: pointer; box-shadow: 0 4px 14px rgba(99,32,238,0.3); transition: all .2s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-confirmar:disabled { opacity: .6; cursor: not-allowed; }

.btn-danger {
  padding: 10px; border-radius: 10px; border: none;
  background: #dc2626; color: #fff; font-size: 13.5px; font-weight: 700;
  font-family: 'Outfit',sans-serif; cursor: pointer; transition: all .2s;
}
.btn-danger:hover:not(:disabled) { background: #b91c1c; }
.btn-danger:disabled { opacity: .6; cursor: not-allowed; }

.btn-reactivar {
  padding: 10px; border-radius: 10px; border: none;
  background: #16a34a; color: #fff; font-size: 13.5px; font-weight: 700;
  font-family: 'Outfit',sans-serif; cursor: pointer; transition: all .2s;
}
.btn-reactivar:hover:not(:disabled) { background: #15803d; }
.btn-reactivar:disabled { opacity: .6; cursor: not-allowed; }

/* Spinners */
.spinner-sm {
  width:13px; height:13px; border:2px solid rgba(255,255,255,0.3);
  border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block;
}
.spinner-sm-purple {
  width:13px; height:13px; border:2px solid rgba(99,32,238,0.2);
  border-top-color:#6320EE; border-radius:50%; animation:spin .7s linear infinite; display:inline-block;
}
.spinner-lg {
  width:28px; height:28px; border:3px solid rgba(99,32,238,0.15);
  border-top-color:#6320EE; border-radius:50%; animation:spin .7s linear infinite; display:inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Banner sesión afectada */
.sesion-banner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; flex-wrap: wrap;
  background: rgba(217,119,6,0.08);
  border: 1px solid rgba(217,119,6,0.25);
  border-radius: 12px; padding: 14px 18px;
}
.sesion-banner-left { display: flex; align-items: center; gap: 12px; }
.sesion-icon { font-size: 20px; flex-shrink: 0; }
.sesion-titulo { font-size: 13.5px; font-weight: 700; color: #92400e; margin: 0 0 2px; }
.sesion-sub { font-size: 12px; color: #a16207; margin: 0; }
.sesion-btn {
  padding: 8px 18px; border-radius: 9px; border: none;
  background: #d97706; color: #fff;
  font-size: 13px; font-weight: 700; font-family: 'Outfit', sans-serif;
  cursor: pointer; white-space: nowrap; transition: background .2s;
}
.sesion-btn:hover { background: #b45309; }

/* Generar descripción */
.desc-label-row {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;
}
.desc-label-row label { margin-bottom: 0 !important; }
.btn-generar {
  font-size: 11.5px; font-weight: 700; color: #6320EE;
  background: rgba(99,32,238,0.07); border: 1px solid rgba(99,32,238,0.18);
  border-radius: 7px; padding: 3px 10px; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all .2s; white-space: nowrap;
}
.btn-generar:hover:not(:disabled) { background: rgba(99,32,238,0.15); }
.btn-generar:disabled { opacity: 0.35; cursor: not-allowed; }

/* Transición del banner */
.slide-down-enter-active, .slide-down-leave-active { transition: all .35s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

</style>