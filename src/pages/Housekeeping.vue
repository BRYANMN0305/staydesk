<template>
  <div v-if="canView('HOUSEKEEPING')" class="hk-page">
    <div class="hk-container">

      <!-- ── Header ── -->
      <div class="hk-header">
        <div class="hk-header__left">
          <div class="hk-header__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3l-8 8"/>
              <path d="M17.5 5.5L19 7"/>
              <path d="M7 13l-4 8h12l-1-4-7 4"/>
              <path d="M3 21l4-8"/>
            </svg>
          </div>
          <div>
            <h1 class="hk-header__title">Housekeeping</h1>
            <div class="hk-header__meta">
              <span>{{ fechaHoy }}</span>
              <span class="hk-live"><span class="hk-live__dot"></span>En tiempo real</span>
            </div>
          </div>
        </div>
        <div class="hk-header__actions">
          <button class="hk-btn hk-btn--ghost" @click="recargar" :disabled="loading">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :class="{ spin: loading }" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Recargar
          </button>
        </div>
      </div>

      <!-- ── Stats ── -->
      <div class="hk-stats">
        <div
          class="hk-stat-card"
          v-for="s in stats"
          :key="s.label"
          :style="{ '--stat-color': s.color, '--stat-bg': s.bgColor }"
        >
          <div class="hk-stat-card__icon">
            <component :is="s.icon" />
          </div>
          <div class="hk-stat-card__body">
            <div class="hk-stat-card__num">{{ s.value }}</div>
            <div class="hk-stat-card__label">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- ── Filtros ── -->
      <div class="hk-filters">
        <div class="hk-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="busqueda" placeholder="Buscar habitación..." />
        </div>
        <div class="hk-filter-select">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <select v-model="pisoSeleccionado">
            <option value="all">Piso: Todos</option>
            <option v-for="piso in pisos" :key="piso.id_piso" :value="piso.id_piso">
              Piso {{ piso.numero }}
            </option>
          </select>
        </div>
      </div>

      <!-- ── Loading / Error ── -->
      <div v-if="loading" class="hk-loading">
        <div class="hk-spinner"></div>
        <span>Cargando habitaciones...</span>
      </div>
      <div v-else-if="error" class="hk-error">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
        <button @click="recargar">Reintentar</button>
      </div>

      <!-- ── Board Kanban ── -->
      <div v-else class="hk-board">
        <div v-for="col in columnas" :key="col.id" class="hk-col">

          <div class="hk-col__header">
            <div class="hk-col__header-left">
              <span class="hk-col__dot" :style="{ background: col.color }"></span>
              <span class="hk-col__name">{{ col.label }}</span>
              <span class="hk-col__count">{{ habitacionesPorEstado(col.id).length }}</span>
            </div>
          </div>

          <div class="hk-col__cards">
            <transition-group name="card">
              <div
                v-for="hab in habitacionesPorEstado(col.id)"
                :key="hab.id_habitacion"
                class="hk-card"
                :class="`hk-card--${col.id.toLowerCase()}`"
              >
                <div class="hk-card__header">
                  <div>
                    <div class="hk-card__num">Hab. {{ hab.numero }}</div>
                    <div class="hk-card__sub">
                      Piso {{ hab.piso?.numero ?? hab.id_piso }}
                      <span v-if="hab.tipo"> · {{ hab.tipo }}</span>
                    </div>
                  </div>
                  <div class="hk-card__time" :class="elapsedClass(hab.estado_limpieza_desde, col.id)">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {{ tiempoTranscurrido(hab.estado_limpieza_desde) }}
                  </div>
                </div>

                <button
                  v-if="col.siguiente && can('HOUSEKEEPING', 'CAMBIAR_ESTADO')"
                  class="hk-card__action"
                  :class="`hk-card__action--${col.id.toLowerCase()}`"
                  :disabled="avanzando[hab.id_habitacion]"
                  @click="avanzarEstado(hab)"
                >
                  <span v-if="avanzando[hab.id_habitacion]">
                    <span class="hk-mini-spin"></span> Actualizando...
                  </span>
                  <span v-else class="hk-card__action-inner">
                    {{ col.nextLabel }}
                    <svg v-if="col.id === 'PENDIENTE'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                    <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                </button>

                <div v-if="col.id === 'LIMPIA'" class="hk-card__done">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Lista para reserva
                </div>
              </div>
            </transition-group>

            <div v-if="habitacionesPorEstado(col.id).length === 0" class="hk-col__empty">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              <span>Sin habitaciones</span>
            </div>
          </div>

        </div>
      </div>

      <!-- ── Actividad reciente ── -->
      <div v-if="actividad.length > 0" class="hk-activity">
        <div class="hk-activity__title">Actividad reciente</div>
        <div class="hk-activity__list">
          <div v-for="(item, i) in actividad" :key="i" class="hk-activity__item">
            <span class="hk-activity__dot" :style="{ background: item.color }"></span>
            <div>
              <div class="hk-activity__text">{{ item.texto }}</div>
              <div class="hk-activity__time">{{ item.tiempo }}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div v-else class="hk-no-access">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
    <p>No tienes permiso para ver esta sección.</p>
  </div>
</template>

<script>
import { usePermissions } from '@/composables/usePermissions'
import { defineComponent, h } from 'vue'

const BASE_URL = 'https://staydesk-apis-dev.duckdns.org'

const IconPendiente = defineComponent({
  render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('polyline', { points: '12 6 12 12 16 14' }),
  ])
})

const IconEnLimpieza = defineComponent({
  render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M15 3l-8 8' }),
    h('path', { d: 'M17.5 5.5L19 7' }),
    h('path', { d: 'M7 13l-4 8h12l-1-4-7 4' }),
    h('path', { d: 'M3 21l4-8' }),
  ])
})

const IconLimpia = defineComponent({
  render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }),
  ])
})

const IconTotal = defineComponent({
  render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
    h('polyline', { points: '9 22 9 12 15 12 15 22' }),
  ])
})

export default {
  name: 'HousekeepingView',
  components: { IconPendiente, IconEnLimpieza, IconLimpia, IconTotal },

  setup() {
    const { canView, can } = usePermissions()
    return { canView, can }
  },

  data() {
    return {
      habitaciones: [],
      pisos: [],
      pisoSeleccionado: 'all',
      busqueda: '',
      loading: false,
      error: null,
      avanzando: {},
      actividad: [],
      columnas: [
        { id: 'PENDIENTE',  label: 'Pendiente',   color: '#F59E0B', siguiente: 'EN_PROCESO', nextLabel: 'Iniciar limpieza' },
        { id: 'EN_PROCESO', label: 'En limpieza',  color: '#7C3AED', siguiente: 'LIMPIA',     nextLabel: 'Marcar como limpia' },
        { id: 'LIMPIA',     label: 'Limpia',       color: '#10B981', siguiente: null,          nextLabel: null },
      ],
    }
  },

  computed: {
    fechaHoy() {
      return new Date().toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }).replace(/^\w/, c => c.toUpperCase())
    },

    habitacionesFiltradas() {
      let list = this.habitaciones
      if (this.pisoSeleccionado !== 'all')
        list = list.filter(h => h.id_piso === this.pisoSeleccionado || h.piso?.id_piso === this.pisoSeleccionado)
      if (this.busqueda.trim())
        list = list.filter(h => String(h.numero).includes(this.busqueda.trim()))
      return list
    },

    stats() {
      const pendiente = this.habitaciones.filter(h => h.estado_limpieza === 'PENDIENTE').length
      const enProceso = this.habitaciones.filter(h => h.estado_limpieza === 'EN_PROCESO').length
      const limpia    = this.habitaciones.filter(h => h.estado_limpieza === 'LIMPIA').length
      const total     = this.habitaciones.length
      return [
        { value: pendiente, label: 'Pendientes',        sub: 'Por limpiar',         icon: 'IconPendiente',  color: '#F59E0B', bgColor: '#FFFBEB' },
        { value: enProceso, label: 'En limpieza',       sub: 'En progreso',          icon: 'IconEnLimpieza', color: '#7C3AED', bgColor: '#EDE9FE' },
        { value: limpia,    label: 'Limpias',            sub: 'Listas para reserva',  icon: 'IconLimpia',     color: '#10B981', bgColor: '#ECFDF5' },
        { value: total,     label: 'Total habitaciones', sub: 'En el sistema',        icon: 'IconTotal',      color: '#6B7280', bgColor: '#F3F4F6' },
      ]
    },
  },

  methods: {
    async cargarPisos() {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/pisos`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Error al cargar pisos')
      this.pisos = await res.json()
    },

    async cargarHabitaciones() {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/habitaciones`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Error al cargar habitaciones')
      const data = await res.json()
      this.habitaciones = data.filter(h => h.activa !== false)
    },

    async recargar() {
      this.loading = true
      this.error = null
      try {
        await Promise.all([this.cargarPisos(), this.cargarHabitaciones()])
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async avanzarEstado(habitacion) {
      const col = this.columnas.find(c => c.id === habitacion.estado_limpieza)
      if (!col?.siguiente) return

      this.avanzando = { ...this.avanzando, [habitacion.id_habitacion]: true }
      const token = localStorage.getItem('token')

      try {
        const res = await fetch(`${BASE_URL}/habitaciones/${habitacion.id_habitacion}/limpieza`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nuevo_estado: col.siguiente }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail))
        }

        this.actividad.unshift({
          texto: `Hab. ${habitacion.numero} → ${col.siguiente === 'EN_PROCESO' ? 'En limpieza' : 'Limpia'}`,
          tiempo: 'Ahora',
          color: col.siguiente === 'LIMPIA' ? '#10B981' : '#7C3AED',
        })
        if (this.actividad.length > 5) this.actividad.pop()

        habitacion.estado_limpieza = col.siguiente
        habitacion.estado_limpieza_desde = new Date().toISOString()
      } catch (e) {
        alert(`Error: ${e.message}`)
      } finally {
        this.avanzando = { ...this.avanzando, [habitacion.id_habitacion]: false }
      }
    },

    habitacionesPorEstado(estado) {
      return this.habitacionesFiltradas.filter(h => h.estado_limpieza === estado)
    },

    tiempoTranscurrido(desde) {
      if (!desde) return '—'
      const m = Math.round((Date.now() - new Date(desde).getTime()) / 60000)
      if (m < 1) return 'Ahora'
      if (m < 60) return `${m} min`
      return `${Math.floor(m / 60)}h ${m % 60}min`
    },

    elapsedClass(desde, estado) {
      if (estado === 'LIMPIA') return 'hk-card__time--verde'
      if (!desde) return 'hk-card__time--gris'
      const m = (Date.now() - new Date(desde).getTime()) / 60000
      if (m > 60) return 'hk-card__time--rojo'
      if (m > 30) return 'hk-card__time--naranja'
      return 'hk-card__time--azul'
    },
  },

  async created() {
    await this.recargar()
  },
}
</script>

<style scoped>
/* ─── Variables ─── */
.hk-page {
  --purple:      #7C3AED;
  --purple-soft: #EDE9FE;
  --purple-mid:  #DDD6FE;
  --text:        #1E1B4B;
  --text-2:      #6B7280;
  --border:      #E5E7EB;
  --bg:          #F5F3FF;
  --white:       #FFFFFF;
  --radius:      14px;
  --shadow:      0 2px 12px rgba(124, 58, 237, 0.07);

  padding: 1.75rem 2rem 3rem;
  background: var(--bg);
  min-height: 100%;
  font-family: inherit;
}

/* ─── Contenedor principal ─── */
.hk-container {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
}

/* ─── Header ─── */
.hk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 12px;
}
.hk-header__left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.hk-header__icon {
  width: 42px;
  height: 42px;
  background: var(--purple-soft);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--purple);
  flex-shrink: 0;
}
.hk-header__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}
.hk-header__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 3px;
  font-size: 12.5px;
  color: var(--text-2);
}
.hk-live {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #10B981;
  font-weight: 600;
}
.hk-live__dot {
  width: 7px;
  height: 7px;
  background: #10B981;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.35); }
}
.hk-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ─── Botones ─── */
.hk-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  font-family: inherit;
}
.hk-btn--ghost {
  background: var(--white);
  border: 1px solid var(--border);
  color: var(--text-2);
}
.hk-btn--ghost:hover  { border-color: var(--purple); color: var(--purple); }
.hk-btn--ghost:disabled { opacity: 0.5; cursor: not-allowed; }

/* ─── Stats ─── */
.hk-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--white);
}
.hk-stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--white);
  border: 1px solid var(--border);
  border-left: 3px solid var(--stat-color);
  border-radius: 12px;
  padding: 1rem 1.1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  transition: box-shadow 0.15s, transform 0.15s;
}
.hk-stat-card:hover {
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}
.hk-stat-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--stat-bg);
  color: var(--stat-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hk-stat-card__num   { font-size: 26px; font-weight: 700; line-height: 1; color: var(--text); }
.hk-stat-card__label { font-size: 12.5px; color: var(--text-2); margin-top: 3px; }

/* ─── Filtros ─── */
.hk-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.85rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: #FAFAFA;
  flex-wrap: wrap;
}
.hk-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 14px;
  color: var(--text-2);
  flex: 1;
  max-width: 260px;
}
.hk-search input {
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text);
  background: transparent;
  width: 100%;
  font-family: inherit;
}
.hk-search input::placeholder { color: #9CA3AF; }
.hk-filter-select {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 14px;
  color: var(--text-2);
  font-size: 13px;
}
.hk-filter-select select {
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text);
  background: transparent;
  cursor: pointer;
  font-family: inherit;
}

/* ─── Loading / Error ─── */
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

.hk-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 4rem;
  color: var(--text-2);
  font-size: 14px;
}
.hk-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #DDD6FE;
  border-top-color: var(--purple);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.hk-error {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 1rem 1.5rem;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 10px;
  padding: 12px 16px;
  color: #DC2626;
  font-size: 13.5px;
}
.hk-error button {
  margin-left: auto;
  padding: 5px 14px;
  border-radius: 6px;
  border: 1px solid #FECACA;
  background: white;
  color: #DC2626;
  cursor: pointer;
  font-size: 13px;
}

/* ─── Board ─── */
.hk-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 1.25rem 1.5rem;
  background: #FAFAFA;
  gap: 0;
}

/* ─── Columna ─── */
.hk-col {
  padding: 0 1rem;
  border-right: 1px solid var(--border);
}
.hk-col:first-child { padding-left: 0; }
.hk-col:last-child  { border-right: none; padding-right: 0; }

.hk-col__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 2px;
}
.hk-col__header-left { display: flex; align-items: center; gap: 8px; }
.hk-col__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.hk-col__name  { font-size: 13.5px; font-weight: 700; color: var(--text); }
.hk-col__count {
  font-size: 11.5px;
  font-weight: 600;
  background: #F3F4F6;
  color: var(--text-2);
  border-radius: 20px;
  padding: 1px 9px;
}
.hk-col__cards { display: flex; flex-direction: column; gap: 9px; }

/* ─── Tarjeta ─── */
.hk-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-left: 3px solid transparent;
  transition: box-shadow 0.15s, transform 0.15s;
}
.hk-card:hover { box-shadow: 0 4px 14px rgba(124, 58, 237, 0.10); transform: translateY(-1px); }
.hk-card--pendiente  { border-left-color: #F59E0B; }
.hk-card--en_proceso { border-left-color: #7C3AED; }
.hk-card--limpia     { border-left-color: #10B981; }

.hk-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}
.hk-card__num { font-size: 14px; font-weight: 700; color: var(--text); }
.hk-card__sub { font-size: 11.5px; color: var(--text-2); margin-top: 2px; }

.hk-card__time {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.hk-card__time--azul    { background: #EFF6FF; color: #1D4ED8; }
.hk-card__time--naranja { background: #FFFBEB; color: #D97706; }
.hk-card__time--rojo    { background: #FEF2F2; color: #DC2626; }
.hk-card__time--verde   { background: #ECFDF5; color: #059669; }
.hk-card__time--gris    { background: #F3F4F6; color: #6B7280; }

.hk-card__action {
  width: 100%;
  padding: 7px 12px;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.hk-card__action-inner { display: flex; align-items: center; gap: 6px; }
.hk-card__action--pendiente  { background: var(--purple-soft); color: var(--purple); }
.hk-card__action--pendiente:hover:not(:disabled) { background: var(--purple-mid); }
.hk-card__action--en_proceso { background: #ECFDF5; color: #059669; }
.hk-card__action--en_proceso:hover:not(:disabled) { background: #D1FAE5; }
.hk-card__action:disabled { opacity: 0.5; cursor: not-allowed; }

.hk-card__done {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #059669;
  background: #ECFDF5;
  border-radius: 8px;
  padding: 7px;
}

.hk-mini-spin {
  width: 11px;
  height: 11px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

.hk-col__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 2rem 0;
  color: #9CA3AF;
  font-size: 12.5px;
  background: var(--white);
  border: 1px dashed var(--border);
  border-radius: 10px;
}

/* ─── Actividad ─── */
.hk-activity {
  padding: 1.1rem 1.5rem;
  border-top: 1px solid var(--border);
}
.hk-activity__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}
.hk-activity__list  { display: flex; flex-direction: column; gap: 0; }
.hk-activity__item  {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #F3F4F6;
}
.hk-activity__item:last-child { border-bottom: none; }
.hk-activity__dot  { width: 7px; height: 7px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
.hk-activity__text { font-size: 13px; color: var(--text); font-weight: 500; }
.hk-activity__time { font-size: 11px; color: var(--text-2); margin-top: 1px; }

/* ─── Sin acceso ─── */
.hk-no-access {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 5rem;
  color: #9CA3AF;
  font-size: 15px;
}

/* ─── Animaciones de tarjetas ─── */
.card-move, .card-enter-active, .card-leave-active { transition: all 0.3s ease; }
.card-enter-from { opacity: 0; transform: translateY(-6px); }
.card-leave-to   { opacity: 0; transform: translateY(6px); }

/* ─── Responsive ─── */

/* Tablet: 600px – 900px → stats 2x2, board columna única con labels de color */
@media (max-width: 900px) {
  .hk-page { padding: 1rem 1rem 2rem; }

  .hk-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .hk-board {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .hk-col {
    padding: 0;
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
  }
  .hk-col:last-child { border-bottom: none; padding-bottom: 0; }
}

/* Mobile: < 600px → stats apiladas, header compacto */
@media (max-width: 600px) {
  .hk-page { padding: 0.75rem 0.75rem 2rem; }

  .hk-header { padding: 1rem; }
  .hk-header__title { font-size: 17px; }
  .hk-header__meta  { flex-direction: column; align-items: flex-start; gap: 4px; }

  .hk-stats {
    grid-template-columns: repeat(2, 1fr);
    padding: 0.85rem 1rem;
    gap: 10px;
  }
  .hk-stat-card { padding: 0.75rem 0.9rem; gap: 10px; }
  .hk-stat-card__num { font-size: 20px; }
  .hk-stat-card__icon { width: 34px; height: 34px; }

  .hk-filters { padding: 0.75rem 1rem; }
  .hk-search  { max-width: 100%; flex: 1; }

  .hk-board { padding: 1rem; }

  .hk-activity { padding: 1rem; }
}

/* Extra pequeño: < 400px → stats en columna única */
@media (max-width: 400px) {
  .hk-stats {
    grid-template-columns: 1fr;
  }
}
</style>