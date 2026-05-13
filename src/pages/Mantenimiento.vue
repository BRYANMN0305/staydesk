<template>
  <div v-if="canView('MANTENIMIENTO')" class="mt">

    <!-- ── Contenedor principal ── -->
    <div class="mt-container">

      <!-- HEADER dentro del contenedor -->
      <div class="mt-header">
        <div class="mt-header__left">
          <div class="mt-header__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6320EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div>
            <h1 class="mt-header__title">Mantenimiento</h1>
            <div class="mt-header__meta">
              <span class="mt-header__fecha">{{ fechaHoy }}</span>
              <span v-if="retrasados > 0" class="mt-badge-alerta">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                {{ retrasados }} retrasado{{ retrasados > 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </div>
        <div class="mt-header__right">
          <button class="mt-btn mt-btn--ghost" @click="recargar" :disabled="loading">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :class="{ spin: loading }">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Recargar
          </button>
          <button v-if="can('MANTENIMIENTO', 'CREAR')" class="mt-btn mt-btn--primary" @click="abrirModal()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo mantenimiento
          </button>
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="mt-divider"></div>

      <!-- STATS -->
      <div class="mt-stats">
        <div class="mt-stat" v-for="s in statsData" :key="s.label" :style="{ '--accent': s.color }">
          <div class="mt-stat__icon" v-html="s.icon"></div>
          <div class="mt-stat__body">
            <span class="mt-stat__num" :style="{ color: s.color }">{{ s.value }}</span>
            <span class="mt-stat__label">{{ s.label }}</span>
            <span class="mt-stat__sub">{{ s.sub }}</span>
          </div>
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="mt-divider"></div>

      <!-- TABS + FILTROS -->
      <div class="mt-toolbar">
        <div class="mt-tabs">
          <button class="mt-tab" :class="{ 'mt-tab--active': vista === 'lista' }" @click="vista = 'lista'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Lista
          </button>
          <button class="mt-tab" :class="{ 'mt-tab--active': vista === 'calendario' }" @click="vista = 'calendario'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Calendario
          </button>
        </div>

        <div v-if="vista === 'lista'" class="mt-filters">
          <div class="mt-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="busqueda" placeholder="Buscar habitación o descripción..."/>
          </div>
          <select class="mt-select" v-model="filtroEstado">
            <option value="">Estado: Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="COMPLETADO">Completado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          <select class="mt-select" v-model="filtroPrioridad">
            <option value="">Prioridad: Todas</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>
          <select class="mt-select" v-model="filtroPiso">
            <option value="">Piso: Todos</option>
            <option v-for="p in pisos" :key="p.id_piso" :value="p.id_piso">Piso {{ p.numero }}</option>
          </select>
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="mt-divider"></div>

      <!-- LOADING / ERROR -->
      <div v-if="loading" class="mt-loading">
        <div class="mt-spinner"></div>
        <span>Cargando mantenimientos...</span>
      </div>
      <div v-else-if="error" class="mt-error">
        {{ error }}
        <button @click="recargar">Reintentar</button>
      </div>

      <!-- ── VISTA LISTA ── -->
      <template v-else-if="vista === 'lista'">
        <div v-if="mantenimientosFiltrados.length === 0" class="mt-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="color:#c4b8d0">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <p>Sin mantenimientos registrados</p>
        </div>

        <div v-else class="mt-table-wrap">
          <!-- Cabecera tabla -->
          <div class="mt-table-head">
            <span>Habitación</span>
            <span>Descripción</span>
            <span>Prioridad</span>
            <span>Estado</span>
            <span>Fecha programada</span>
            <span>Asignado a</span>
            <span>Acciones</span>
          </div>

          <!-- Filas -->
          <div
            v-for="m in mantenimientosFiltrados" :key="m.id"
            class="mt-table-row"
            :class="{ 'mt-table-row--retrasado': esRetrasado(m) }"
          >
            <div class="mt-cell-hab">
              <span class="mt-hab__num">Hab. {{ m.habitacion }}</span>
              <span class="mt-hab__piso">Piso {{ m.piso }}</span>
            </div>

            <div class="mt-cell-desc">
              <span>{{ m.descripcion }}</span>
              <span v-if="esRetrasado(m)" class="mt-retrasado-badge">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Retrasado
              </span>
            </div>

            <div>
              <span class="mt-prioridad" :class="`mt-prioridad--${m.prioridad.toLowerCase()}`">{{ m.prioridad }}</span>
            </div>

            <div>
              <select
                v-if="can('MANTENIMIENTO', 'CAMBIAR_ESTADO')"
                class="mt-estado-select"
                :class="`mt-estado-select--${m.estado.toLowerCase()}`"
                :value="m.estado"
                @change="cambiarEstado(m, $event.target.value)"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROCESO">En proceso</option>
                <option value="COMPLETADO">Completado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
              <span v-else class="mt-estado-badge" :class="`mt-estado-badge--${m.estado.toLowerCase()}`">
                {{ estadoLabel(m.estado) }}
              </span>
            </div>

            <div class="mt-cell-fecha">{{ formatFecha(m.fecha_programada) }}</div>
            <div class="mt-cell-asignado">{{ m.asignado_nombre || '—' }}</div>

            <div class="mt-cell-acciones">
              <button v-if="can('MANTENIMIENTO', 'EDITAR')" class="mt-accion mt-accion--edit" @click="abrirModal(m)" title="Editar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button v-if="can('MANTENIMIENTO', 'ELIMINAR')" class="mt-accion mt-accion--del" @click="eliminar(m)" title="Eliminar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ── VISTA CALENDARIO ── -->
      <template v-else>
        <div class="mt-cal">
          <div class="mt-cal__nav">
            <button class="mt-btn mt-btn--ghost mt-btn--sm" @click="mesAnterior">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="mt-cal__titulo">{{ nombreMes }}</span>
            <button class="mt-btn mt-btn--ghost mt-btn--sm" @click="mesSiguiente">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div class="mt-cal__grid">
            <div class="mt-cal__dia-header" v-for="d in ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']" :key="d">{{ d }}</div>
            <div
              v-for="(dia, i) in diasDelMes" :key="i"
              class="mt-cal__dia"
              :class="{ 'mt-cal__dia--vacio': !dia, 'mt-cal__dia--hoy': dia && esHoy(dia) }"
            >
              <span v-if="dia" class="mt-cal__dia-num">{{ dia }}</span>
              <div v-if="dia" class="mt-cal__eventos">
                <div
                  v-for="m in mantenimientosDia(dia)" :key="m.id"
                  class="mt-cal__evento"
                  :class="`mt-cal__evento--${m.prioridad.toLowerCase()}`"
                  @click="abrirModal(m)" :title="m.descripcion"
                >
                  Hab.{{ m.habitacion }}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-cal__leyenda">
            <span><span class="dot dot--alta"></span> Alta</span>
            <span><span class="dot dot--media"></span> Media</span>
            <span><span class="dot dot--baja"></span> Baja</span>
          </div>
        </div>
      </template>

    </div><!-- /mt-container -->

    <!-- ── MODAL ── -->
    <div v-if="modalAbierto" class="mt-modal-overlay" @click.self="cerrarModal">
      <div class="mt-modal">
        <div class="mt-modal__bar"></div>
        <button class="mt-modal__close" @click="cerrarModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="mt-modal__header">
          <h2>{{ editando ? 'Editar mantenimiento' : 'Nuevo mantenimiento' }}</h2>
          <p>{{ editando ? 'Modifica los datos del registro' : 'Registra una nueva tarea de mantenimiento' }}</p>
        </div>
        <div class="mt-modal__body">
          <div class="mt-form-grid">
            <div class="mt-form-group">
              <label>Habitación *</label>
              <select v-model="form.id_habitacion">
                <option value="">Seleccionar habitación</option>
                <option v-for="h in habitaciones" :key="h.id_habitacion" :value="h.id_habitacion">
                  Hab. {{ h.numero }} — Piso {{ h.piso?.numero ?? h.id_piso }}
                </option>
              </select>
            </div>
            <div class="mt-form-group">
              <label>Prioridad *</label>
              <select v-model="form.prioridad">
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
            <div class="mt-form-group mt-form-group--full">
              <label>Descripción *</label>
              <textarea v-model="form.descripcion" rows="3" placeholder="Describe el mantenimiento..."></textarea>
            </div>
            <div class="mt-form-group">
              <label>Fecha programada *</label>
              <input type="date" v-model="form.fecha_programada"/>
            </div>
            <div class="mt-form-group">
              <label>Asignar a</label>
              <select v-model="form.id_usuario">
                <option value="">Sin asignar</option>
                <option v-for="u in usuarios" :key="u.id_usuario" :value="u.id_usuario">
                  {{ u.nombre }} {{ u.apellido }}
                </option>
              </select>
            </div>
            <div v-if="editando" class="mt-form-group">
              <label>Estado</label>
              <select v-model="form.estado">
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROCESO">En proceso</option>
                <option value="COMPLETADO">Completado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div class="mt-form-group mt-form-group--full">
              <label>Notas adicionales</label>
              <textarea v-model="form.notas" rows="2" placeholder="Notas opcionales..."></textarea>
            </div>
          </div>
        </div>
        <div class="mt-modal__footer">
          <button class="mt-btn mt-btn--ghost" @click="cerrarModal">Cancelar</button>
          <button class="mt-btn mt-btn--primary" @click="guardar" :disabled="guardando">
            <span v-if="guardando" class="mt-mini-spin"></span>
            {{ guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear mantenimiento' }}
          </button>
        </div>
      </div>
    </div>

  </div>

  <div v-else class="mt-no-access">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c4b8d0" stroke-width="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
    <p>No tienes permiso para ver esta sección.</p>
  </div>
</template>

<script>
import { usePermissions } from '@/composables/usePermissions'

const BASE_URL = 'https://staydesk-apis-dev.duckdns.org'

const STAT_ICONS = {
  total:      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  pendiente:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  proceso:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  completado: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
}

let _nextId = 1

export default {
  name: 'MantenimientoView',
  setup() {
    const { canView, can } = usePermissions()
    return { canView, can }
  },
  data() {
    const hoy = new Date()
    return {
      mantenimientos: [], habitaciones: [], usuarios: [], pisos: [],
      loading: false, error: null, vista: 'lista',
      busqueda: '', filtroEstado: '', filtroPrioridad: '', filtroPiso: '',
      mesActual: hoy.getMonth(), anioActual: hoy.getFullYear(),
      modalAbierto: false, editando: false, guardando: false,
      form: this.formVacio(),
    }
  },
  computed: {
    retrasados() {
      const hoy = new Date(); hoy.setHours(0,0,0,0)
      return this.mantenimientos.filter(m =>
        m.estado !== 'COMPLETADO' && m.estado !== 'CANCELADO' && new Date(m.fecha_programada) < hoy
      ).length
    },
    statsData() {
      const total      = this.mantenimientos.length
      const pendiente  = this.mantenimientos.filter(m => m.estado === 'PENDIENTE').length
      const proceso    = this.mantenimientos.filter(m => m.estado === 'EN_PROCESO').length
      const completado = this.mantenimientos.filter(m => m.estado === 'COMPLETADO').length
      return [
        { value: total,      label: 'Total',       sub: 'Registrados', icon: STAT_ICONS.total,      color: '#6b7280' },
        { value: pendiente,  label: 'Pendientes',  sub: 'Sin iniciar', icon: STAT_ICONS.pendiente,  color: '#d97706' },
        { value: proceso,    label: 'En proceso',  sub: 'En curso',    icon: STAT_ICONS.proceso,    color: '#6320EE' },
        { value: completado, label: 'Completados', sub: 'Finalizados', icon: STAT_ICONS.completado, color: '#16a34a' },
      ]
    },
    mantenimientosFiltrados() {
      return this.mantenimientos.filter(m => {
        const matchBusq  = !this.busqueda || String(m.habitacion).includes(this.busqueda) || m.descripcion.toLowerCase().includes(this.busqueda.toLowerCase())
        const matchEstado = !this.filtroEstado || m.estado === this.filtroEstado
        const matchPrior  = !this.filtroPrioridad || m.prioridad === this.filtroPrioridad
        const matchPiso   = !this.filtroPiso || Number(m.id_piso) === Number(this.filtroPiso)
        return matchBusq && matchEstado && matchPrior && matchPiso
      })
    },
    fechaHoy() {
      return new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    },
    nombreMes() {
      return new Date(this.anioActual, this.mesActual, 1)
        .toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase())
    },
    diasDelMes() {
      const primerDia = new Date(this.anioActual, this.mesActual, 1).getDay()
      const offset    = primerDia === 0 ? 6 : primerDia - 1
      const totalDias = new Date(this.anioActual, this.mesActual + 1, 0).getDate()
      const celdas = []
      for (let i = 0; i < offset; i++) celdas.push(null)
      for (let d = 1; d <= totalDias; d++) celdas.push(d)
      return celdas
    },
  },
  methods: {
    formVacio() {
      return { id_habitacion: '', prioridad: 'MEDIA', descripcion: '', fecha_programada: '', id_usuario: '', estado: 'PENDIENTE', notas: '' }
    },
    async cargarHabitaciones() {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/habitaciones`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Error al cargar habitaciones')
      const data = await res.json()
      this.habitaciones = data.filter(h => h.activa !== false)
    },
    async cargarUsuarios() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BASE_URL}/usuarios`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) { this.usuarios = []; return }
        const data = await res.json()
        this.usuarios = data.filter(u => u.activo !== false)
      } catch { this.usuarios = [] }
    },
    async cargarPisos() {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/pisos`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Error al cargar pisos')
      this.pisos = await res.json()
    },
    _habNumero(hab)      { return hab?.numero ?? '—' },
    _habIdPiso(hab)      { return hab?.piso?.id_piso ?? hab?.id_piso ?? null },
    _habNumeroPiso(hab)  { return hab?.piso?.numero ?? hab?.id_piso ?? '—' },
    _normalizarMantenimiento(m, habOverride, usrOverride) {
      const hab = habOverride ?? this.habitaciones.find(h => h.id_habitacion === m.id_habitacion)
      const usr = usrOverride ?? this.usuarios.find(u => u.id_usuario === m.id_usuario)
      return { ...m, habitacion: this._habNumero(hab), id_piso: this._habIdPiso(hab), piso: this._habNumeroPiso(hab), asignado_nombre: usr ? `${usr.nombre} ${usr.apellido}` : null }
    },
    async cargarMantenimientos() {
      const mockHabs = [
        { id_habitacion: 1, numero: '101', id_piso: 1, piso: { id_piso: 1, numero: 1 } },
        { id_habitacion: 2, numero: '102', id_piso: 1, piso: { id_piso: 1, numero: 1 } },
        { id_habitacion: 3, numero: '103', id_piso: 1, piso: { id_piso: 1, numero: 1 } },
      ]
      const mockUsrs = [{ id_usuario: 1, nombre: 'Bryan', apellido: 'Admin' }]
      const raw = [
        { id: _nextId++, id_habitacion: 1, descripcion: 'Cambio de bombillas en baño',      prioridad: 'BAJA',  estado: 'PENDIENTE',  fecha_programada: this.fechaRelativa(1),  id_usuario: null, notas: '' },
        { id: _nextId++, id_habitacion: 2, descripcion: 'Reparación de aire acondicionado', prioridad: 'ALTA',  estado: 'EN_PROCESO', fecha_programada: this.fechaRelativa(0),  id_usuario: 1,    notas: '' },
        { id: _nextId++, id_habitacion: 3, descripcion: 'Revisión de plomería',             prioridad: 'MEDIA', estado: 'PENDIENTE',  fecha_programada: this.fechaRelativa(-2), id_usuario: null, notas: 'Verificar grifo del baño' },
      ]
      this.mantenimientos = raw.map(m => {
        const hab = mockHabs.find(h => h.id_habitacion === m.id_habitacion)
        const usr = mockUsrs.find(u => u.id_usuario === m.id_usuario)
        return this._normalizarMantenimiento(m, hab, usr)
      })
    },
    fechaRelativa(dias) {
      const d = new Date(); d.setDate(d.getDate() + dias); return d.toISOString().split('T')[0]
    },
    async recargar() {
      this.loading = true; this.error = null
      try {
        await Promise.all([this.cargarMantenimientos(), this.cargarHabitaciones(), this.cargarPisos()])
        await this.cargarUsuarios()
      } catch (e) { this.error = e.message }
      finally { this.loading = false }
    },
    abrirModal(m = null) {
      if (m) { this.editando = true; this.form = { ...m } }
      else   { this.editando = false; this.form = this.formVacio() }
      this.modalAbierto = true
    },
    cerrarModal() { this.modalAbierto = false; this.form = this.formVacio() },
    async guardar() {
      if (!this.form.id_habitacion || !this.form.descripcion || !this.form.fecha_programada) { alert('Completa los campos obligatorios.'); return }
      this.guardando = true
      await new Promise(r => setTimeout(r, 400))
      if (this.editando) {
        const idx = this.mantenimientos.findIndex(m => m.id === this.form.id)
        if (idx !== -1) this.mantenimientos[idx] = this._normalizarMantenimiento({ ...this.form })
      } else {
        this.mantenimientos.unshift(this._normalizarMantenimiento({ ...this.form, id: _nextId++ }))
      }
      this.guardando = false; this.cerrarModal()
    },
    async eliminar(m) {
      if (!confirm(`¿Eliminar mantenimiento de Hab. ${m.habitacion}?`)) return
      this.mantenimientos = this.mantenimientos.filter(x => x.id !== m.id)
    },
    async cambiarEstado(m, nuevoEstado) {
      const idx = this.mantenimientos.findIndex(x => x.id === m.id)
      if (idx !== -1) this.mantenimientos[idx].estado = nuevoEstado
    },
    esRetrasado(m) {
      if (m.estado === 'COMPLETADO' || m.estado === 'CANCELADO') return false
      const hoy = new Date(); hoy.setHours(0,0,0,0)
      return new Date(m.fecha_programada) < hoy
    },
    estadoLabel(e) {
      return { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', COMPLETADO: 'Completado', CANCELADO: 'Cancelado' }[e] ?? e
    },
    formatFecha(f) {
      if (!f) return '—'
      return new Date(f + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    esHoy(dia) {
      const hoy = new Date()
      return dia === hoy.getDate() && this.mesActual === hoy.getMonth() && this.anioActual === hoy.getFullYear()
    },
    mantenimientosDia(dia) {
      const fecha = `${this.anioActual}-${String(this.mesActual+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
      return this.mantenimientos.filter(m => m.fecha_programada === fecha)
    },
    mesAnterior() { if (this.mesActual === 0) { this.mesActual = 11; this.anioActual-- } else this.mesActual-- },
    mesSiguiente() { if (this.mesActual === 11) { this.mesActual = 0; this.anioActual++ } else this.mesActual++ },
  },
  async created() { await this.recargar() },
}
</script>

<style scoped>
.mt { font-family: 'Outfit', sans-serif; }

/* ── Contenedor principal ── */
.mt-container {
  background: #fff;
  border: 1px solid rgba(99,32,238,0.07);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(33,26,29,0.05);
  overflow: hidden;
}

/* ── Header ── */
.mt-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; padding: 1.5rem 1.75rem;
}
.mt-header__left { display: flex; align-items: center; gap: 14px; }
.mt-header__icon {
  width: 42px; height: 42px; border-radius: 11px;
  background: rgba(99,32,238,0.08);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mt-header__title { margin: 0; font-size: 20px; font-weight: 700; color: #211A1D; }
.mt-header__meta { display: flex; align-items: center; gap: 10px; margin-top: 3px; }
.mt-header__fecha { font-size: 12px; color: #9ca3af; text-transform: capitalize; }
.mt-header__right { display: flex; gap: 8px; align-items: center; }

.mt-badge-alerta {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(217,119,6,0.1); color: #b45309;
  font-size: 11.5px; font-weight: 700;
  padding: 3px 10px; border-radius: 999px;
  border: 1px solid rgba(217,119,6,0.2);
  animation: pulse-warn 2s infinite;
}
@keyframes pulse-warn { 0%,100%{opacity:1} 50%{opacity:.7} }

/* ── Divider ── */
.mt-divider { height: 1px; background: rgba(99,32,238,0.06); }

/* ── Stats ── */
.mt-stats {
  display: grid; grid-template-columns: repeat(4, 1fr);
  padding: 1.25rem 1.75rem; gap: 1rem;
}
.mt-stat {
  display: flex; align-items: center; gap: 14px;
  background: #faf8ff; border: 1px solid rgba(99,32,238,0.08);
  border-radius: 12px; padding: 1rem 1.25rem;
  border-left: 3px solid var(--accent);
}
.mt-stat__icon { display: flex; align-items: center; color: var(--accent); opacity: .7; flex-shrink: 0; }
.mt-stat__body { display: flex; flex-direction: column; }
.mt-stat__num   { font-size: 26px; font-weight: 800; line-height: 1; }
.mt-stat__label { font-size: 13px; font-weight: 600; color: #211A1D; margin-top: 2px; }
.mt-stat__sub   { font-size: 11px; color: #9ca3af; }

/* ── Toolbar (tabs + filtros) ── */
.mt-toolbar {
  display: flex; align-items: center; flex-wrap: wrap;
  gap: 10px; padding: 1rem 1.75rem;
}

.mt-tabs {
  display: flex; gap: 4px;
  background: #f4eeff; border-radius: 10px; padding: 4px;
}
.mt-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: 7px; border: none;
  font-size: 13px; font-weight: 600; cursor: pointer;
  color: #6b7280; background: transparent;
  transition: all .15s; font-family: 'Outfit', sans-serif;
}
.mt-tab--active { background: #6320EE; color: #fff; box-shadow: 0 2px 8px rgba(99,32,238,0.3); }
.mt-tab:not(.mt-tab--active):hover { background: rgba(99,32,238,0.08); color: #6320EE; }

.mt-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-left: auto; }

.mt-search {
  display: flex; align-items: center; gap: 7px;
  background: #f4eeff; border: 1px solid rgba(99,32,238,0.12);
  border-radius: 8px; padding: 7px 12px; color: #9ca3af;
}
.mt-search input {
  border: none; outline: none; font-size: 13px; color: #211A1D;
  background: transparent; font-family: 'Outfit', sans-serif; width: 200px;
}
.mt-search input::placeholder { color: #c4b8d0; }

.mt-select {
  border: 1px solid rgba(99,32,238,0.15); border-radius: 8px;
  padding: 7px 12px; font-size: 13px; color: #211A1D;
  background: #faf8ff; cursor: pointer; outline: none;
  font-family: 'Outfit', sans-serif;
}

/* ── Botones ── */
.mt-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 600;
  cursor: pointer; border: none; transition: all .15s; font-family: 'Outfit', sans-serif;
}
.mt-btn--ghost {
  background: #f4eeff; border: 1px solid rgba(99,32,238,0.2); color: #6b7280;
}
.mt-btn--ghost:hover { border-color: #6320EE; color: #6320EE; }
.mt-btn--ghost:disabled { opacity: .5; cursor: not-allowed; }
.mt-btn--primary { background: linear-gradient(135deg,#6320EE,#8075FF); color: #fff; box-shadow: 0 4px 12px rgba(99,32,238,0.3); }
.mt-btn--primary:hover { box-shadow: 0 6px 18px rgba(99,32,238,0.4); transform: translateY(-1px); }
.mt-btn--primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.mt-btn--sm { padding: 6px 12px; }

/* ── Loading / Error / Empty ── */
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin .8s linear infinite; }

.mt-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 3rem; color: #9ca3af; font-size: 13.5px;
}
.mt-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(99,32,238,0.15);
  border-top-color: #6320EE;
  border-radius: 50%; animation: spin .7s linear infinite;
}
.mt-error {
  display: flex; align-items: center; gap: 10px; margin: 1rem 1.75rem;
  background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.2);
  border-radius: 10px; padding: 12px 16px; color: #dc2626; font-size: 13.5px;
}
.mt-error button {
  margin-left: auto; padding: 5px 12px; border-radius: 7px;
  border: 1px solid rgba(220,38,38,0.2); background: #fff; color: #dc2626; cursor: pointer; font-size: 12px;
}
.mt-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 4rem 1.75rem; color: #9ca3af; font-size: 13.5px;
}

/* ── Tabla ── */
.mt-table-wrap { padding: 0 1.75rem 1.75rem; }

.mt-table-head {
  display: grid;
  grid-template-columns: 110px 1fr 100px 140px 130px 120px 90px;
  padding: 10px 12px;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .6px; color: #9ca3af;
  border-bottom: 1px solid rgba(99,32,238,0.07);
}

.mt-table-row {
  display: grid;
  grid-template-columns: 110px 1fr 100px 140px 130px 120px 90px;
  padding: 14px 12px; align-items: center;
  border-bottom: 1px solid rgba(99,32,238,0.05);
  transition: background .15s;
}
.mt-table-row:last-child { border-bottom: none; }
.mt-table-row:hover { background: rgba(99,32,238,0.02); border-radius: 10px; }
.mt-table-row--retrasado { background: rgba(217,119,6,0.04) !important; }
.mt-table-row--retrasado:hover { background: rgba(217,119,6,0.08) !important; }

.mt-cell-hab { display: flex; flex-direction: column; gap: 2px; }
.mt-hab__num  { font-size: 13.5px; font-weight: 700; color: #211A1D; }
.mt-hab__piso { font-size: 11px; color: #9ca3af; }

.mt-cell-desc { display: flex; flex-direction: column; gap: 4px; font-size: 13.5px; color: #374151; padding-right: 8px; }
.mt-retrasado-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(217,119,6,0.12); color: #b45309;
  font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 6px; width: fit-content;
}

.mt-cell-fecha   { font-size: 12.5px; color: #9ca3af; white-space: nowrap; }
.mt-cell-asignado { font-size: 12.5px; color: #9ca3af; }
.mt-cell-acciones { display: flex; gap: 6px; }

.mt-prioridad {
  font-size: 11px; font-weight: 700; padding: 3px 10px;
  border-radius: 999px; text-transform: uppercase; letter-spacing: .04em;
}
.mt-prioridad--alta  { background: rgba(220,38,38,0.1);   color: #b91c1c; }
.mt-prioridad--media { background: rgba(217,119,6,0.1);   color: #b45309; }
.mt-prioridad--baja  { background: rgba(22,163,74,0.1);   color: #15803d; }

.mt-estado-select {
  border: none; border-radius: 8px; padding: 5px 10px;
  font-size: 12px; font-weight: 600; cursor: pointer;
  outline: none; font-family: 'Outfit', sans-serif;
}
.mt-estado-select--pendiente  { background: rgba(217,119,6,0.1);   color: #b45309; }
.mt-estado-select--en_proceso { background: rgba(99,32,238,0.1);   color: #6320EE; }
.mt-estado-select--completado { background: rgba(22,163,74,0.1);   color: #15803d; }
.mt-estado-select--cancelado  { background: rgba(107,114,128,0.1); color: #6b7280; }

.mt-estado-badge {
  font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 8px;
}
.mt-estado-badge--pendiente  { background: rgba(217,119,6,0.1);   color: #b45309; }
.mt-estado-badge--en_proceso { background: rgba(99,32,238,0.1);   color: #6320EE; }
.mt-estado-badge--completado { background: rgba(22,163,74,0.1);   color: #15803d; }
.mt-estado-badge--cancelado  { background: rgba(107,114,128,0.1); color: #6b7280; }

.mt-accion {
  width: 30px; height: 30px; border-radius: 8px; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s;
}
.mt-accion--edit { background: rgba(99,32,238,0.08);  color: #6320EE; }
.mt-accion--edit:hover { background: rgba(99,32,238,0.18); }
.mt-accion--del  { background: rgba(220,38,38,0.08);  color: #dc2626; }
.mt-accion--del:hover  { background: rgba(220,38,38,0.18); }

/* ── Calendario ── */
.mt-cal { padding: 1rem 1.75rem 1.75rem; }
.mt-cal__nav { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.mt-cal__titulo { font-size: 15px; font-weight: 700; color: #211A1D; flex: 1; text-align: center; text-transform: capitalize; }
.mt-cal__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.mt-cal__dia-header { text-align: center; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; padding: 6px 0; letter-spacing: .05em; }
.mt-cal__dia { min-height: 72px; border-radius: 8px; border: 1px solid rgba(99,32,238,0.06); padding: 6px; background: #faf8ff; }
.mt-cal__dia--vacio  { background: transparent; border-color: transparent; }
.mt-cal__dia--hoy    { border-color: #6320EE; background: rgba(99,32,238,0.06); }
.mt-cal__dia-num     { font-size: 12px; font-weight: 600; color: #211A1D; display: block; margin-bottom: 4px; }
.mt-cal__dia--hoy .mt-cal__dia-num { color: #6320EE; }
.mt-cal__eventos     { display: flex; flex-direction: column; gap: 3px; }
.mt-cal__evento { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: opacity .15s; }
.mt-cal__evento:hover { opacity: .8; }
.mt-cal__evento--alta  { background: rgba(220,38,38,0.12);  color: #b91c1c; }
.mt-cal__evento--media { background: rgba(217,119,6,0.12);  color: #b45309; }
.mt-cal__evento--baja  { background: rgba(22,163,74,0.12);  color: #15803d; }
.mt-cal__leyenda { display: flex; gap: 16px; margin-top: 14px; font-size: 12px; color: #9ca3af; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; vertical-align: middle; }
.dot--alta  { background: #dc2626; }
.dot--media { background: #d97706; }
.dot--baja  { background: #16a34a; }

/* ── Modal ── */
.mt-modal-overlay {
  position: fixed; inset: 0; background: rgba(33,26,29,0.55);
  backdrop-filter: blur(4px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.mt-modal {
  background: #fff; border-radius: 18px; width: 100%; max-width: 580px;
  max-height: 90vh; overflow-y: auto; position: relative;
  box-shadow: 0 24px 60px rgba(33,26,29,0.3);
  animation: modalIn .3s cubic-bezier(.22,1,.36,1);
}
@keyframes modalIn { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:none} }

.mt-modal__bar { position: absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,#6320EE,#8075FF); border-radius:4px 4px 0 0; }
.mt-modal__close { position:absolute; top:14px; right:14px; background:#f4eeff; border:none; border-radius:8px; width:30px; height:30px; display:flex; align-items:center; justify-content:center; color:#9ca3af; cursor:pointer; }
.mt-modal__close:hover { background: rgba(99,32,238,0.1); color:#6320EE; }

.mt-modal__header { padding: 1.5rem 1.5rem .75rem; }
.mt-modal__header h2 { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: #211A1D; }
.mt-modal__header p  { margin: 0; font-size: 12.5px; color: #9ca3af; }

.mt-modal__body   { padding: .75rem 1.5rem 1rem; }
.mt-modal__footer { display: flex; justify-content: flex-end; gap: 10px; padding: 1rem 1.5rem; border-top: 1px solid rgba(99,32,238,0.07); }

.mt-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.mt-form-group { display: flex; flex-direction: column; gap: 6px; }
.mt-form-group--full { grid-column: 1 / -1; }
.mt-form-group label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #9ca3af; }
.mt-form-group input,
.mt-form-group select,
.mt-form-group textarea {
  border: 1.5px solid rgba(99,32,238,0.15); border-radius: 10px;
  padding: 9px 12px; font-size: 13.5px; color: #211A1D;
  background: #faf8ff; font-family: 'Outfit', sans-serif; outline: none;
  transition: border-color .2s; resize: vertical;
}
.mt-form-group input:focus,
.mt-form-group select:focus,
.mt-form-group textarea:focus { border-color: #6320EE; }

.mt-mini-spin {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .7s linear infinite; display: inline-block;
}

/* ── Sin acceso ── */
.mt-no-access {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; padding: 5rem; color: #9ca3af; font-size: 14px;
}

/* ── Responsive ── */
@media(max-width:900px) {
  .mt-stats { grid-template-columns: repeat(2,1fr); }
  .mt-table-head, .mt-table-row { grid-template-columns: 90px 1fr 85px 110px; }
  .mt-table-head span:nth-child(n+5),
  .mt-table-row > div:nth-child(n+5) { display: none; }
  .mt-form-grid { grid-template-columns: 1fr; }
  .mt-form-group--full { grid-column: 1; }
  .mt-toolbar { flex-direction: column; align-items: flex-start; }
  .mt-filters { margin-left: 0; }
}
</style>