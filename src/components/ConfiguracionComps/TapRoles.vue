<template>
  <div class="config-card">
    <div class="roles-header">
      <div class="card-section-title mb-0">
        <span class="card-icon">🔒</span> Gestión de roles
      </div>
      <div class="roles-actions">
        <div class="search-wrap">
          <span class="search-ico">🔍</span>
          <input v-model="busqueda" class="field-input search-input" placeholder="Buscar rol..." />
        </div>
        <button class="btn-new" @click="abrirModalCrear">+ Nuevo rol</button>
      </div>
    </div>

    <div v-if="loading" class="state-msg">⏳ Cargando roles...</div>

    <table v-else class="roles-table">
      <thead>
        <tr>
          <th>ROL</th>
          <th>PERMISOS ASIGNADOS</th>
          <th>USUARIOS</th>
          <th>ESTADO</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rol in rolesFiltrados" :key="rol.id">
          <td>
            <div class="rol-name-cell">
              <span class="rol-dot" :style="{ background: colorPorNombre(rol.nombre) }"></span>
              <span class="rol-name-text">{{ rol.nombre }}</span>
            </div>
          </td>
          <td>
            <div class="permisos-tags">
              <span v-for="p in (rol.permisos ?? []).slice(0, 3)" :key="p.id ?? p" class="permiso-tag">
                {{ p.nombre ?? p }}
              </span>
              <span v-if="(rol.permisos ?? []).length > 3" class="permiso-tag extra">
                +{{ (rol.permisos ?? []).length - 3 }} más
              </span>
            </div>
          </td>
          <td><span class="usuarios-count">👤 {{ rol.total_usuarios ?? rol.usuarios ?? 0 }}</span></td>
          <td>
            <span class="estado-badge" :class="rol.activo !== false ? 'activo' : 'inactivo'">
              ● {{ rol.activo !== false ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td>
            <div class="rol-actions">
              <button class="btn-icon edit"   title="Editar"   @click="abrirModalEditar(rol)">✏️</button>
              <button class="btn-icon delete" title="Eliminar" @click="confirmarEliminar(rol)">🗑️</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="error" class="state-msg error mt-2">⚠️ {{ error }}</div>
  </div>

  <!-- Modal crear/editar -->
  <ModalRol
    v-if="modalVisible"
    :rol="rolSeleccionado"
    :permisos-disponibles="permisosDisponibles"
    @guardar="onGuardarRol"
    @cerrar="modalVisible = false"
  />

  <!-- Confirm eliminar -->
  <div v-if="confirmEliminar" class="overlay" @click.self="confirmEliminar = null">
    <div class="confirm-box">
      <p class="confirm-title">¿Eliminar rol "{{ confirmEliminar.nombre }}"?</p>
      <p class="confirm-hint">Esta acción no se puede deshacer.</p>
      <div class="confirm-btns">
        <button class="btn-cancel" @click="confirmEliminar = null">Cancelar</button>
        <button class="btn-delete" @click="eliminarRol(confirmEliminar)">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalRol from './ModalRol.vue'

const BASE = 'https://staydesk-apis-dev.duckdns.org'

const loading             = ref(false)
const error               = ref(null)
const roles               = ref([])
const permisosDisponibles = ref([])
const busqueda            = ref('')
const modalVisible        = ref(false)
const rolSeleccionado     = ref(null)
const confirmEliminar     = ref(null)

const rolesFiltrados = computed(() =>
  roles.value.filter(r =>
    r.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  )
)

const colores = ['#7c3aed','#10b981','#f59e0b','#ef4444','#6b7280','#3b82f6','#ec4899']
function colorPorNombre(nombre) {
  let h = 0
  for (const c of nombre) h = (h * 31 + c.charCodeAt(0)) % colores.length
  return colores[h]
}

// ── API ───────────────────────────────────────────────
async function cargarRoles() {
  loading.value = true
  error.value   = null
  try {
    const res    = await fetch(`${BASE}/roles`)
    roles.value  = await res.json()
  } catch {
    error.value = 'No se pudieron cargar los roles.'
  } finally {
    loading.value = false
  }
}

async function cargarPermisos() {
  try {
    const res = await fetch(`${BASE}/permisos`)
    permisosDisponibles.value = await res.json()
  } catch { /* silencioso */ }
}

async function onGuardarRol({ rol, permisosIds }) {
  error.value = null
  try {
    let rolGuardado
    if (rol.id) {
      // Editar
      const res = await fetch(`${BASE}/roles/${rol.id}/editar`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: rol.nombre, descripcion: rol.descripcion }),
      })
      rolGuardado = await res.json()
    } else {
      // Crear
      const res = await fetch(`${BASE}/roles`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: rol.nombre, descripcion: rol.descripcion }),
      })
      rolGuardado = await res.json()
    }

    // Asignar permisos
    if (permisosIds.length) {
      await fetch(`${BASE}/roles/${rolGuardado.id}/obtener/permisos`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permisos: permisosIds }),
      })
    }

    modalVisible.value = false
    await cargarRoles()
  } catch {
    error.value = 'Error al guardar el rol.'
  }
}

async function eliminarRol(rol) {
  try {
    await fetch(`${BASE}/roles/${rol.id}/eliminar`, { method: 'DELETE' })
    roles.value = roles.value.filter(r => r.id !== rol.id)
  } catch {
    error.value = 'Error al eliminar el rol.'
  } finally {
    confirmEliminar.value = null
  }
}

function abrirModalCrear() {
  rolSeleccionado.value = null
  modalVisible.value    = true
}

async function abrirModalEditar(rol) {
  // Cargar permisos actuales del rol
  try {
    const res   = await fetch(`${BASE}/roles/${rol.id}/obtener/permisos`)
    const data  = await res.json()
    rolSeleccionado.value = { ...rol, permisos: data }
  } catch {
    rolSeleccionado.value = { ...rol }
  }
  modalVisible.value = true
}

function confirmarEliminar(rol) { confirmEliminar.value = rol }

onMounted(async () => {
  await Promise.all([cargarRoles(), cargarPermisos()])
})
</script>

<style scoped>
.config-card  { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 4px rgba(99,32,238,.06), 0 4px 16px rgba(0,0,0,.04); border: 1px solid rgba(99,32,238,.07); }
.card-section-title { font-size: 15px; font-weight: 700; color: #1a1a2e; display: flex; align-items: center; gap: 8px; }
.card-section-title.mb-0 { margin-bottom: 0; }
.card-icon { font-size: 17px; }

.roles-header  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.roles-actions { display: flex; align-items: center; gap: 10px; }
.search-wrap   { position: relative; display: flex; align-items: center; }
.search-ico    { position: absolute; left: 10px; font-size: 13px; pointer-events: none; }
.search-input  { padding-left: 32px; width: 180px; }

.btn-new { padding: 9px 18px; border: none; border-radius: 9px; background: #6320EE; color: #fff; font-size: 13.5px; font-weight: 600; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 12px rgba(99,32,238,.3); transition: background .15s; }
.btn-new:hover { background: #5318cc; }

.roles-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 4px; }
.roles-table th { text-align: left; font-size: 10.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #8888aa; padding: 8px 12px; border-bottom: 1.5px solid #ece8f8; }
.roles-table td { padding: 14px 12px; border-bottom: 1px solid #f5f2fc; vertical-align: middle; }
.roles-table tr:last-child td { border-bottom: none; }

.rol-name-cell { display: flex; align-items: center; gap: 10px; }
.rol-dot       { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.rol-name-text { font-weight: 600; color: #1a1a2e; font-size: 13.5px; }

.permisos-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.permiso-tag   { padding: 3px 9px; border-radius: 6px; background: #f0edf8; color: #5b21b6; font-size: 11px; font-weight: 500; }
.permiso-tag.extra { background: rgba(99,32,238,.12); color: #6320EE; }

.usuarios-count { color: #8888aa; font-size: 13px; }

.estado-badge        { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.estado-badge.activo  { background: rgba(16,185,129,.10); color: #059669; border: 1px solid rgba(16,185,129,.25); }
.estado-badge.inactivo{ background: rgba(239,68,68,.08);  color: #dc2626; border: 1px solid rgba(239,68,68,.2);  }

.rol-actions { display: flex; gap: 8px; }
.btn-icon    { width: 30px; height: 30px; border-radius: 7px; border: none; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; transition: background .15s; }
.btn-icon.edit   { background: rgba(245,158,11,.10); }
.btn-icon.edit:hover   { background: rgba(245,158,11,.2); }
.btn-icon.delete { background: rgba(239,68,68,.10); }
.btn-icon.delete:hover { background: rgba(239,68,68,.2); }

/* Confirm */
.overlay     { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 100; }
.confirm-box { background: #fff; border-radius: 14px; padding: 28px 32px; max-width: 360px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,.18); }
.confirm-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.confirm-hint  { font-size: 13px; color: #8888aa; margin: 0 0 20px; }
.confirm-btns  { display: flex; gap: 10px; justify-content: flex-end; }
.btn-cancel { padding: 8px 18px; border: 1.5px solid #d0cce8; border-radius: 8px; background: #fff; color: #5a5a7a; font-size: 13px; cursor: pointer; }
.btn-delete { padding: 8px 18px; border: none; border-radius: 8px; background: #ef4444; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }

.field-input { width: 100%; padding: 9px 13px; border: 1.5px solid #e2ddf0; border-radius: 8px; font-size: 13.5px; color: #1a1a2e; background: #fdfdff; box-sizing: border-box; outline: none; transition: border-color .15s; }
.field-input:focus { border-color: #7c5cbf; box-shadow: 0 0 0 3px rgba(99,32,238,.08); }

.state-msg       { font-size: 13px; color: #8888aa; padding: 12px 0; }
.state-msg.error { color: #dc2626; }
.mt-2 { margin-top: 8px; }
</style>