<template>
  <div class="config-card">
    <div class="audit-header">
      <div class="card-section-title mb-0">
        <span class="card-icon">📋</span> Registro de auditoría
      </div>
      <span class="period-label">Últimos 30 días</span>
    </div>

    <div class="audit-filters">
      <select v-model="filtros.modulo" class="field-input filter-sel">
        <option value="">Todos los módulos</option>
        <option v-for="m in modulos" :key="m" :value="m">{{ m }}</option>
      </select>
      <select v-model="filtros.accion" class="field-input filter-sel">
        <option value="">Todas las acciones</option>
        <option value="edit">Editar</option>
        <option value="create">Crear</option>
        <option value="delete">Eliminar</option>
        <option value="login">Login</option>
      </select>
      <div class="search-wrap">
        <span class="search-ico">🔍</span>
        <input v-model="filtros.usuario" class="field-input search-inp" placeholder="Buscar usuario..." />
      </div>
      <select v-model="filtros.dias" class="field-input filter-sel">
        <option value="7">Últimos 7 días</option>
        <option value="30">Últimos 30 días</option>
        <option value="90">Últimos 90 días</option>
      </select>
    </div>

    <div v-if="loading" class="state-msg">⏳ Cargando registros...</div>

    <table v-else class="audit-table">
      <thead>
        <tr>
          <th>FECHA</th>
          <th>USUARIO</th>
          <th>ACCIÓN</th>
          <th>MÓDULO</th>
          <th>DESCRIPCIÓN</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="logsFiltrados.length === 0">
          <td colspan="5" class="empty-row">Sin registros para los filtros aplicados</td>
        </tr>
        <tr v-for="log in logsFiltrados" :key="log.id">
          <td class="audit-date">{{ log.fecha }}</td>
          <td class="audit-usuario">{{ log.usuario }}</td>
          <td><span class="audit-badge" :class="log.tipo">{{ log.accionLabel }}</span></td>
          <td><span class="audit-modulo">{{ log.modulo }}</span></td>
          <td class="audit-desc">{{ log.descripcion }}</td>
        </tr>
      </tbody>
    </table>

    <div class="audit-count">Mostrando {{ logsFiltrados.length }} de {{ logs.length }} registros</div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// ⚠️ No existe GET /auditoria en la API actual.
// Los datos son mock hasta que el backend lo implemente.
// Cuando exista: reemplazar `logs` por el resultado de fetch(`${BASE}/auditoria`)

const loading = ref(false)
const filtros = reactive({ modulo: '', accion: '', usuario: '', dias: '30' })

const modulos = ['Configuración', 'Reservas', 'Usuarios', 'Roles', 'Sistema', 'Facturas']

const logs = ref([
  { id: 1, fecha: '06 May · 14:32', usuario: 'Bryan A.', tipo: 'edit',   accionLabel: 'EDITAR',   modulo: 'Configuración', descripcion: 'Actualizó datos del hotel' },
  { id: 2, fecha: '06 May · 11:18', usuario: 'María L.', tipo: 'create', accionLabel: 'CREAR',    modulo: 'Reservas',      descripcion: 'Creó la reserva #1042 — hab. 201' },
  { id: 3, fecha: '05 May · 19:45', usuario: 'Carlos R.',tipo: 'login',  accionLabel: 'LOGIN',    modulo: 'Sistema',       descripcion: 'Inicio de sesión desde 192.168.1.4' },
  { id: 4, fecha: '05 May · 16:02', usuario: 'Bryan A.', tipo: 'create', accionLabel: 'CREAR',    modulo: 'Roles',         descripcion: 'Creó el rol "Supervisor" con 15 permisos' },
  { id: 5, fecha: '04 May · 09:30', usuario: 'María L.', tipo: 'delete', accionLabel: 'ELIMINAR', modulo: 'Usuarios',      descripcion: 'Desactivó al usuario Pedro M.' },
  { id: 6, fecha: '03 May · 22:10', usuario: 'Bryan A.', tipo: 'edit',   accionLabel: 'EDITAR',   modulo: 'Roles',         descripcion: 'Modificó permisos del rol "Recepcionista"' },
])

const logsFiltrados = computed(() =>
  logs.value.filter(l => {
    if (filtros.modulo  && l.modulo  !== filtros.modulo)  return false
    if (filtros.accion  && l.tipo    !== filtros.accion)  return false
    if (filtros.usuario && !l.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())) return false
    return true
  })
)
</script>

<style scoped>
.config-card  { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 4px rgba(99,32,238,.06), 0 4px 16px rgba(0,0,0,.04); border: 1px solid rgba(99,32,238,.07); }
.card-section-title { font-size: 15px; font-weight: 700; color: #1a1a2e; display: flex; align-items: center; gap: 8px; }
.card-section-title.mb-0 { margin-bottom: 0; }
.card-icon    { font-size: 17px; }
.audit-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.period-label { font-size: 12px; color: #8888aa; }

.audit-filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
.filter-sel    { flex: 1; min-width: 140px; }
.search-wrap   { position: relative; display: flex; align-items: center; flex: 1; min-width: 160px; }
.search-ico    { position: absolute; left: 10px; font-size: 13px; pointer-events: none; }
.search-inp    { padding-left: 32px; width: 100%; }

.field-input   { width: 100%; padding: 9px 13px; border: 1.5px solid #e2ddf0; border-radius: 8px; font-size: 13.5px; color: #1a1a2e; background: #fdfdff; box-sizing: border-box; outline: none; transition: border-color .15s; }
.field-input:focus { border-color: #7c5cbf; box-shadow: 0 0 0 3px rgba(99,32,238,.08); }
select.field-input option { background: #fff; }

.audit-table   { width: 100%; border-collapse: collapse; font-size: 13px; }
.audit-table th { text-align: left; font-size: 10.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #8888aa; padding: 8px 12px; border-bottom: 1.5px solid #ece8f8; }
.audit-table td { padding: 12px 12px; border-bottom: 1px solid #f5f2fc; vertical-align: middle; }
.audit-table tr:last-child td { border-bottom: none; }

.audit-date    { color: #8888aa; font-size: 12.5px; white-space: nowrap; }
.audit-usuario { font-weight: 600; color: #1a1a2e; }
.audit-desc    { color: #7070a0; font-size: 12.5px; }
.audit-modulo  { display: inline-block; padding: 3px 10px; border-radius: 6px; background: #f0edf8; color: #5b21b6; font-size: 11.5px; }

.audit-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: .5px; }
.audit-badge.login  { background: rgba(59,130,246,.10);  color: #1d4ed8; border: 1px solid rgba(59,130,246,.2);  }
.audit-badge.edit   { background: rgba(245,158,11,.10);  color: #92400e; border: 1px solid rgba(245,158,11,.2);  }
.audit-badge.create { background: rgba(16,185,129,.10);  color: #065f46; border: 1px solid rgba(16,185,129,.2);  }
.audit-badge.delete { background: rgba(239,68,68,.10);   color: #991b1b; border: 1px solid rgba(239,68,68,.2);   }

.empty-row    { text-align: center; color: #8888aa; font-size: 13px; padding: 24px; }
.audit-count  { margin-top: 12px; font-size: 12px; color: #8888aa; }
.state-msg    { font-size: 13px; color: #8888aa; padding: 16px 0; }

@media (max-width: 700px) { .audit-filters { flex-direction: column; } }
</style>