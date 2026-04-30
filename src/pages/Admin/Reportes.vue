<template>
  <div class="reportes-wrapper">

    <!-- HEADER -->
    <div class="rep-header">
      <div class="rep-header-top">
        <div>
          <p class="rep-eyebrow">Panel de análisis</p>
          <h2 class="rep-titulo">Informe General</h2>
          <p class="rep-sub">Resumen acumulativo de toda la actividad del hotel</p>
        </div>
        <div class="rep-controles">
          <div class="control-group">
            <label class="control-label">Tipo</label>
            <select class="sel-custom" v-model="filtro.tipo" disabled>
              <option value="GENERAL">General</option>
            </select>
          </div>
          <div class="control-group">
            <label class="control-label">Filtro</label>
            <select class="sel-custom" v-model="filtro.periodo" @change="onPeriodoChange">
              <option value="HOY">Hoy</option>
              <option value="SEMANA">Semana</option>
              <option value="MES">Mes</option>
              <option value="ANIO">Año</option>
              <option value="PERSONALIZADO">Personalizado</option>
            </select>
          </div>
          <template v-if="filtro.periodo === 'PERSONALIZADO'">
            <div class="control-group">
              <label class="control-label">Desde</label>
              <input type="date" class="sel-custom" v-model="filtro.fecha_inicio"
                @change="onFechasPersonalizadasChange" />
            </div>
            <div class="control-group">
              <label class="control-label">Hasta</label>
              <input type="date" class="sel-custom" v-model="filtro.fecha_fin" @change="onFechasPersonalizadasChange" />
            </div>
          </template>
          <div class="d-flex gap-2 align-items-end guardar-wrap">
            <div v-if="cargando" class="cargando-indicator">
              <span class="spinner-sm-purple"></span>
              <span>Generando...</span>
            </div>
            <button class="btn-guardar" @click="guardarReporte" :disabled="!datos || guardando || cargando">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="datos && !cargando" class="kpi-grid mt-3">
        <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label" :style="{ borderLeftColor: kpi.color }">
          <div class="kpi-icon-wrap" :style="{ background: kpi.iconBg }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="kpi.color" stroke-width="2"
              v-html="kpi.icon"></svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.value }}</span>
            <span class="kpi-label">{{ kpi.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="cargando" class="estado-carga">
      <div class="spinner-grande"></div>
      <span>Generando reporte...</span>
    </div>

    <!-- ERROR -->
    <div v-else-if="error && !datos" class="estado-error">
      <span>⚠️</span> {{ error }}
    </div>

    <template v-else-if="datos">


      <!-- GRÁFICO INGRESOS -->
      <div class="chart-panel">
        <div class="chart-panel-header">
          <div>
            <p class="section-label mb-0">Gráfico de ingresos</p>
            <p class="chart-sub">Evolución de ingresos en el período seleccionado</p>
          </div>
          <div class="legend-row">
            <span class="legend-item">
              <span class="legend-dot" style="background:#6320EE"></span>Ingresos
            </span>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- TOP 3 -->
      <div class="top3-grid">
        <div class="top-panel">
          <p class="section-label mb-3">Top Habitaciones</p>
          <div v-if="topHabitaciones.length === 0" class="top-vacio">Sin datos disponibles</div>
          <div v-else class="top-lista">
            <div class="top-item" v-for="(h, i) in topHabitaciones" :key="h.id_habitacion">
              <span class="top-rank" :class="`rank-${i + 1}`">{{ i + 1 }}</span>
              <div class="top-info">
                <span class="top-name">Hab. {{ h.numero }} — {{ h.tipo }}</span>
                <span class="top-meta">{{ h.total_reservas }} reservas · ${{ fmt(h.ingreso) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="top-panel">
          <p class="section-label mb-3">Top Servicios</p>
          <div v-if="!topServicios.length" class="top-vacio">Sin datos disponibles</div>
          <div v-else class="top-lista">
            <div class="top-item" v-for="(s, i) in topServicios" :key="s.id_servicio ?? i">
              <span class="top-rank" :class="`rank-${i + 1}`">{{ i + 1 }}</span>
              <div class="top-info">
                <span class="top-name">{{ s.nombre }}</span>
                <span class="top-meta">{{ s.total_veces }} veces · ${{ fmt(s.ingreso_generado) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="top-panel">
          <p class="section-label mb-3">Top Huéspedes</p>
          <div v-if="!topHuespedes.length" class="top-vacio">Sin datos disponibles</div>
          <div v-else class="top-lista">
            <div class="top-item" v-for="(h, i) in topHuespedes" :key="h.id_huesped ?? i">
              <span class="top-rank" :class="`rank-${i + 1}`">{{ i + 1 }}</span>
              <div class="top-info">
                <span class="top-name">{{ h.nombre }} {{ h.apellido }}</span>
                <span class="top-meta">{{ h.total_reservas }} reservas · ${{ fmt(h.gasto_total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- REPORTES GUARDADOS -->
      <div class="reportes-guardados-panel">
        <div class="rg-header">
          <div>
            <p class="section-label mb-0">Reportes guardados</p>
            <p class="chart-sub">Historial de reportes generados</p>
          </div>

        </div>

        <div v-if="cargandoReportes" class="estado-carga-sm">
          <div class="spinner-sm-dark"></div> Cargando reportes...
        </div>

        <div v-else-if="!reportes.length" class="top-vacio" style="padding:2rem 0">
          No hay reportes guardados aún.
        </div>

        <template v-else>
          <div class="d-none d-md-block">
            <div class="rg-table-head">
              <span>Tipo</span><span>Filtro</span>
              <span>Período</span><span>Generado</span><span>Acción</span>
            </div>
            <div class="rg-table-row" v-for="r in reportesPaginados" :key="r.id_reporte">
              <span class="rg-badge-tipo">{{ r.tipo }}</span>
              <span class="rg-filtro">{{ r.filtro }}</span>
              <span class="rg-periodo">{{ fmtDate(r.fecha_inicio) }} → {{ fmtDate(r.fecha_fin) }}</span>
              <span class="rg-fecha">{{ fmtDatetime(r.fecha_generacion) }}</span>
              <button class="btn-detalle" @click="verDetalle(r)">Detalle</button>
            </div>
          </div>

          <div class="d-md-none d-flex flex-column gap-2">
            <div class="rg-card-mobile" v-for="r in reportesPaginados" :key="r.id_reporte">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="rg-id">#{{ r.id_reporte }}</span>
                <span class="rg-badge-tipo">{{ r.tipo }}</span>
              </div>
              <div class="rg-meta-mobile">{{ r.filtro }} · {{ fmtDate(r.fecha_inicio) }} → {{ fmtDate(r.fecha_fin) }}
              </div>
              <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="rg-fecha">{{ fmtDatetime(r.fecha_generacion) }}</span>
                <button class="btn-detalle" @click="verDetalle(r)">Detalle</button>
              </div>
            </div>
          </div>

          <div class="pag-wrap" v-if="reportes.length > porPagina">
            <button class="pag-btn" @click="pagina--" :disabled="pagina === 1">‹</button>
            <span class="pag-info">{{ pagina }} / {{ totalPaginas }}</span>
            <button class="pag-btn" @click="pagina++" :disabled="pagina >= totalPaginas">›</button>
          </div>
        </template>
      </div>
    </template>

    <!-- MODAL -->
    <Transition name="modal">
      <div v-if="reporteDetalle" class="modal-overlay" @click.self="reporteDetalle = null">
        <div class="modal-box">
          <div class="modal-bar"></div>
          <button class="modal-close" @click="reporteDetalle = null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <h3 class="modal-titulo">Reporte #{{ reporteDetalle.id_reporte }}</h3>
          <p class="modal-sub">{{ reporteDetalle.tipo }} · {{ reporteDetalle.filtro }} · {{
            fmtDate(reporteDetalle.fecha_inicio) }} → {{ fmtDate(reporteDetalle.fecha_fin) }}</p>
          <div v-if="reporteDetalle.resultado" class="detalle-resultado">
            <template v-if="typeof parsedResultado === 'object' && parsedResultado">
              <div class="det-kpi-mini" v-for="(val, key) in resultadoResumen" :key="key">
                <span class="det-key">{{ formatKey(key) }}</span>
                <span class="det-val">{{ val }}</span>
              </div>
            </template>
            <pre v-else class="resultado-raw">{{ reporteDetalle.resultado }}</pre>
          </div>
          <div v-else class="top-vacio" style="padding:1rem 0">Sin resultado almacenado.</div>
          <div class="modal-acciones">
            <button class="btn-cancelar" @click="reporteDetalle = null">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="toast.visible" :class="['toast-notif', toast.tipo]">{{ toast.mensaje }}</div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const BASE = import.meta.env.VITE_API_URL

const cargando = ref(false)
const guardando = ref(false)
const cargandoReportes = ref(false)
const datos = ref(null)
const error = ref(null)
const reportes = ref([])
const reporteDetalle = ref(null)
const chartCanvas = ref(null)
const pagina = ref(1)
const porPagina = 10
const toast = ref({ visible: false, mensaje: '', tipo: 'success' })

const toLocalISO = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const hoy = () => toLocalISO(new Date())
const primerDiaMes = () => { const d = new Date(); d.setDate(1); return toLocalISO(d) }
const ultimoDiaMes = () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return toLocalISO(d) }
const primerDiaSemana = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return toLocalISO(d) }
const primerDiaAnio = () => { const d = new Date(); d.setMonth(0, 1); return toLocalISO(d) }

const filtro = ref({
  tipo: 'GENERAL',
  periodo: 'MES',
  fecha_inicio: primerDiaMes(),
  fecha_fin: ultimoDiaMes(),
})

function onPeriodoChange() {
  const p = filtro.value.periodo
  if (p === 'HOY') { filtro.value.fecha_inicio = hoy(); filtro.value.fecha_fin = hoy() }
  if (p === 'SEMANA') { filtro.value.fecha_inicio = primerDiaSemana(); filtro.value.fecha_fin = hoy() }
  if (p === 'MES') { filtro.value.fecha_inicio = primerDiaMes(); filtro.value.fecha_fin = ultimoDiaMes() }
  if (p === 'ANIO') { filtro.value.fecha_inicio = primerDiaAnio(); filtro.value.fecha_fin = hoy() }
  if (p !== 'PERSONALIZADO') generarReporte()
}

function onFechasPersonalizadasChange() {
  if (filtro.value.fecha_inicio && filtro.value.fecha_fin && filtro.value.fecha_inicio <= filtro.value.fecha_fin) {
    generarReporte()
  }
}

function authHeaders() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

async function generarReporte() {
  cargando.value = true
  error.value = null
  datos.value = null
  try {
    const res = await fetch(`${BASE}/generar_reporte`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        tipo: 'GENERAL',
        filtro: filtro.value.periodo,
        fecha_inicio: filtro.value.fecha_inicio,
        fecha_fin: filtro.value.fecha_fin,
      }),
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const raw = await res.json()
    datos.value = typeof raw === 'string' ? JSON.parse(raw) : raw
    mostrarToast('Reporte generado correctamente ✓')
  } catch (e) {
    error.value = 'No se pudo generar el reporte. Verifica la conexión con el servidor.'
    mostrarToast('Error al generar el reporte', 'error')
  } finally {
    cargando.value = false
  }
}

async function guardarReporte() {
  guardando.value = true
  try {
    const res = await fetch(`${BASE}/guardar_reporte`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        tipo: 'GENERAL',
        filtro: filtro.value.periodo,
        fecha_inicio: filtro.value.fecha_inicio,
        fecha_fin: filtro.value.fecha_fin,
      }),
    })
    if (!res.ok) throw new Error()
    mostrarToast('Reporte guardado correctamente ✓')
    await listarReportes()
  } catch {
    mostrarToast('Error al guardar el reporte', 'error')
  } finally {
    guardando.value = false
  }
}

async function listarReportes() {
  cargandoReportes.value = true
  try {
    const res = await fetch(`${BASE}/listar_reportes`, { headers: authHeaders() })
    if (!res.ok) throw new Error()
    const raw = await res.json()
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
    reportes.value = Array.isArray(arr) ? arr.sort((a, b) => b.id_reporte - a.id_reporte) : []
    pagina.value = 1
  } catch {
    reportes.value = []
  } finally {
    cargandoReportes.value = false
  }
}

const kpis = computed(() => {
  const d = datos.value
  if (!d) return []

  const canceladas = d.reservas_canceladas
  const cantCanceladas = typeof canceladas === 'object' && canceladas !== null
    ? (canceladas.cantidad ?? 0) : (canceladas ?? 0)
  const pctCanceladas = typeof canceladas === 'object' && canceladas !== null
    ? (canceladas.porcentaje ?? null) : null

  return [
    {
      label: 'Ingreso Total',
      value: '$' + fmt(d.ingreso_total ?? 0),
      color: '#16A34A',
      iconBg: 'rgba(22,163,74,0.10)',
      icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'
    },
    {
      label: 'Ingreso Prom. Reserva',
      value: '$' + fmt(d.ingreso_promedio_por_reserva ?? 0),
      color: '#16A34A',
      iconBg: 'rgba(22,163,74,0.10)',
      icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'
    },
    {
      label: 'Reservas Completadas',
      value: fmt(d.reservas_completadas ?? 0),
      color: '#3b82f6',
      iconBg: 'rgba(59,130,246,0.10)',
      icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
    },
    {
      label: 'Estadía Promedio',
      value: (d.estadia_promedio != null ? Number(d.estadia_promedio).toFixed(1) : '0') + ' noches',
      color: '#6320EE',
      iconBg: 'rgba(99,32,238,0.10)',
      icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'
    },
    {
      label: 'Usuarios Activos',
      value: fmt(d.usuarios_activos ?? 0),
      color: '#3b82f6',
      iconBg: 'rgba(59,130,246,0.10)',
      icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
    },
    {
      label: 'Huéspedes Registrados',
      value: fmt(d.huespedes_registrados ?? 0),
      color: '#6320EE',
      iconBg: 'rgba(99,32,238,0.10)',
      icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
    },
    {
      label: 'Reservas Canceladas',
      value: fmt(cantCanceladas) + (pctCanceladas != null ? ` (${pctCanceladas}%)` : ''),
      color: '#DC2626',
      iconBg: 'rgba(220,38,38,0.10)',
      icon: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
    },
    {
      label: 'Tasa de Ocupación',
      value: (d.tasa_ocupacion != null ? Number(d.tasa_ocupacion).toFixed(1) : '0') + '%',
      color: '#6320EE',
      iconBg: 'rgba(99,32,238,0.10)',
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'
    },
  ]
})

const topHabitaciones = computed(() => (datos.value?.top_habitaciones ?? []).slice(0, 5))
const topServicios = computed(() => (datos.value?.top_servicios ?? []).slice(0, 5))
const topHuespedes = computed(() => (datos.value?.top_huespedes ?? []).slice(0, 5))

const totalPaginas = computed(() => Math.ceil(reportes.value.length / porPagina))
const reportesPaginados = computed(() =>
  reportes.value.slice((pagina.value - 1) * porPagina, pagina.value * porPagina)
)

function verDetalle(r) { reporteDetalle.value = r }

const parsedResultado = computed(() => {
  if (!reporteDetalle.value?.resultado) return null
  try { return typeof reporteDetalle.value.resultado === 'string' ? JSON.parse(reporteDetalle.value.resultado) : reporteDetalle.value.resultado }
  catch { return null }
})

const resultadoResumen = computed(() => {
  const p = parsedResultado.value
  if (!p || typeof p !== 'object') return {}
  const claves = ['ingreso_total', 'ingreso_promedio_por_reserva', 'reservas_completadas', 'estadia_promedio', 'usuarios_activos', 'huespedes_registrados', 'tasa_ocupacion']
  const res = {}
  for (const k of claves) { if (p[k] != null) res[k] = p[k] }
  return res
})

const formatKey = (k) => k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

let chartInst = null

watch(datos, async () => {
  if (!datos.value) return
  await nextTick()
  renderChart()
})

function renderChart() {
  if (chartInst) { chartInst.destroy(); chartInst = null }
  if (!chartCanvas.value || !datos.value) return

  const grafico = datos.value.grafico_ingresos ?? []
  if (!grafico.length) return

  const periodo = filtro.value.periodo

  const labels = grafico.map(r => {
    const p = r.periodo ?? ''
    if (periodo === 'HOY') {
      const hora = p.includes('T') ? p.split('T')[1]?.slice(0, 5) : p
      return hora || p
    }
    if (periodo === 'SEMANA') {
      const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      const d = new Date(p + 'T12:00:00')
      return isNaN(d) ? p : `${dias[d.getDay()]} ${d.getDate()}`
    }
    if (periodo === 'MES' || periodo === 'PERSONALIZADO') {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const d = new Date(p + 'T12:00:00')
      return isNaN(d) ? p : `${d.getDate()} ${meses[d.getMonth()]}`
    }
    if (periodo === 'ANIO') {
      if (/\d{4}-\d{2}$/.test(p)) {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        return meses[parseInt(p.split('-')[1], 10) - 1] ?? p
      }
      if (/\d{4}-W\d+/.test(p)) return p.replace(/\d{4}-W/, 'Sem ')
      return p
    }
    return p
  })

  chartInst = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: grafico.map(r => Math.round(r.ingreso ?? 0)),
          borderColor: '#6320EE',
          backgroundColor: 'rgba(99,32,238,0.08)',
          fill: true,
          tension: 0.45,
          pointRadius: 5,
          pointBackgroundColor: '#6320EE',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          ticks: {
            font: { size: 11, family: 'Outfit' },
            color: '#9ca3af',
            maxRotation: periodo === 'MES' ? 45 : 0,
            autoSkip: true,
            maxTicksLimit: periodo === 'MES' ? 15 : 12,
          },
          grid: { color: 'rgba(99,32,238,0.05)' },
        },
        y: {
          beginAtZero: false,
          ticks: {
            font: { size: 11, family: 'Outfit' },
            color: '#6320EE',
            callback: v => {
              if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M'
              if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'k'
              return '$' + v
            },
          },
          grid: { color: 'rgba(99,32,238,0.07)' },
          position: 'left',
        },
      },
    },
  })
}

const fmt = (n) => n != null ? Number(n).toLocaleString('es-CO') : '0'

const fmtDate = (s) => {
  if (!s) return '—'
  const d = new Date(s)
  return isNaN(d) ? s : d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fmtDatetime = (s) => {
  if (!s) return '—'
  const d = new Date(s)
  return isNaN(d) ? s : d.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function mostrarToast(mensaje, tipo = 'success') {
  toast.value = { visible: true, mensaje, tipo }
  setTimeout(() => { toast.value.visible = false }, 3200)
}

onMounted(async () => {
  await Promise.all([generarReporte(), listarReportes()])
})
</script>

<style scoped>
.reportes-wrapper {
  font-family: 'Outfit', sans-serif;
  color: #211A1D;
}

/* HEADER */
.rep-header {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fff;
  border: 1px solid rgba(99, 32, 238, 0.08);
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 12px rgba(33, 26, 29, 0.05);
}

.rep-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.rep-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: rgba(99, 32, 238, .6);
  margin: 0 0 .2rem;
}

.rep-titulo {
  font-size: 22px;
  font-weight: 700;
  color: #211A1D;
  margin: 0 0 .15rem;
}

.rep-sub {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.rep-controles {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.control-label {
  font-size: 10.5px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.sel-custom {
  border: 1.5px solid rgba(99, 32, 238, 0.2);
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 13px;
  background: #faf8ff;
  color: #211A1D;
  outline: none;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: border-color .2s;
  min-width: 130px;
}

.sel-custom:focus {
  border-color: #6320EE;
}

.sel-custom:disabled {
  opacity: .6;
  cursor: default;
}

.btn-guardar {
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

.btn-guardar:hover:not(:disabled) {
  opacity: .9;
  transform: translateY(-1px);
}

.btn-guardar:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .75rem;
  margin-bottom: 1.25rem;
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .kpi-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.kpi-card {
  background: #fff;
  border: 1px solid rgba(99, 32, 238, 0.12);
  border-left: 4px solid transparent;
  border-radius: 14px;
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: .9rem;
  box-shadow: 0 2px 12px rgba(99, 32, 238, 0.08), 0 1px 3px rgba(33, 26, 29, 0.06);
  transition: transform .2s, box-shadow .2s;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(99, 32, 238, 0.14);
}

.kpi-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.kpi-value {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  color: #211A1D;
}

.kpi-label {
  font-size: 11px;
  margin-top: .15rem;
  line-height: 1.3;
  font-weight: 600;
  color: #6b7280;
}

/* CHART */
.chart-panel {
  background: #fff;
  border: 1px solid rgba(99, 32, 238, 0.07);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 12px rgba(33, 26, 29, .05);
}

.chart-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: .75rem;
  margin-bottom: 1rem;
}

.chart-sub {
  font-size: 13px;
  color: #9ca3af;
  margin: .15rem 0 0;
}

.chart-wrap {
  position: relative;
  height: 220px;
}

.legend-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6b7280;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* TOP 3 */
.top3-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .75rem;
  margin-bottom: 1.25rem;
}

@media (max-width: 900px) {
  .top3-grid {
    grid-template-columns: 1fr;
  }
}

.top-panel {
  background: #fff;
  border: 1px solid rgba(99, 32, 238, 0.07);
  border-radius: 14px;
  padding: 1.2rem 1.25rem;
  box-shadow: 0 1px 6px rgba(33, 26, 29, .04);
}

.section-label {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  color: #0a0b0e;
}

.top-lista {
  display: flex;
  flex-direction: column;
  gap: .65rem;
}

.top-item {
  display: flex;
  align-items: center;
  gap: .7rem;
}

.top-rank {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.rank-1 {
  background: rgba(234, 179, 8, .15);
  color: #b45309;
}

.rank-2 {
  background: rgba(156, 163, 175, .15);
  color: #6b7280;
}

.rank-3 {
  background: rgba(180, 83, 9, .1);
  color: #92400e;
}

.rank-4,
.rank-5 {
  background: rgba(99, 32, 238, .08);
  color: #6320EE;
}

.top-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.top-name {
  font-size: 14px;
  font-weight: 600;
  color: #211A1D;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-meta {
  font-size: 14px;
  color: #9ca3af;
}

.top-vacio {
  font-size: 14px;
  color: #9ca3af;
  font-style: italic;
  text-align: center;
  padding: 1rem 0;
}

/* REPORTES GUARDADOS */
.reportes-guardados-panel {
  background: #fff;
  border: 1px solid rgba(99, 32, 238, 0.07);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 12px rgba(33, 26, 29, .05);
}

.rg-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: .5rem;
}

.btn-outline-sm {
  display: flex;
  align-items: center;
  gap: .35rem;
  background: none;
  border: 1.5px solid rgba(99, 32, 238, .2);
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #6320EE;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all .2s;
}

.btn-outline-sm:hover:not(:disabled) {
  background: rgba(99, 32, 238, .05);
}

.btn-outline-sm:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.rg-table-head {
  display: grid;
  grid-template-columns: 100px 100px 1fr 1fr 90px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: #000;
  border-bottom: 1px solid rgba(99, 32, 238, .07);
}

.rg-table-row {
  display: grid;
  grid-template-columns: 100px 100px 1fr 1fr 90px;
  padding: 10px 12px;
  align-items: center;
  border-bottom: 1px solid rgba(99, 32, 238, .05);
  transition: background .15s;
}

.rg-table-row:last-child {
  border-bottom: none;
}

.rg-table-row:hover {
  background: rgba(99, 32, 238, .02);
  border-radius: 8px;
}

.rg-id {
  font-size: 13px;
  color: #6320EE;
  font-weight: 600;
}

.rg-filtro {
  font-size: 13px;
  color: #000;
}

.rg-periodo {
  font-size: 13px;
  color: #211A1D;
}

.rg-fecha {
  font-size: 13px;
  color: #000;
}

@media (max-width: 576px) {
  .rep-header {
    padding: 1rem;
  }

  .rep-header-top {
    flex-direction: column;
    gap: 1rem;
  }

  .rep-controles {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: end;
    gap: 0.75rem;
  }

  .control-group {
    width: 100%;
  }

  .sel-custom {
    min-width: unset;
    width: 100%;
  }

  .guardar-wrap {
    grid-column: 1 / -1;
    width: 100%;
    flex-direction: column;
  }

  .btn-guardar {
    width: 100%;
    justify-content: center;
    margin: 0;
  }

  .kpi-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .kpi-card {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .kpi-value {
    font-size: 14px;
  }

  .kpi-label {
    font-size: 10px;
  }

  .kpi-icon-wrap {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
  }
}

.rg-badge-tipo {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: rgba(99, 32, 238, .1);
  color: #6320EE;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  width: fit-content;
}

.btn-detalle {
  border-radius: 8px;
  border: 1.5px solid rgba(99, 32, 238, .2);
  background: rgba(99, 32, 238, .08);
  color: #6320EE;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all .2s;
}

.btn-detalle:hover {
  background: rgba(99, 32, 238, .15);
}

.rg-card-mobile {
  border: 1px solid rgba(99, 32, 238, .1);
  border-radius: 10px;
  padding: .85rem;
}

.rg-meta-mobile {
  font-size: 12px;
  color: #6b7280;
}

/* PAGINACIÓN */
.pag-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .75rem;
  margin-top: 1rem;
}

.pag-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid rgba(99, 32, 238, .2);
  background: #faf8ff;
  color: #6320EE;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s;
}

.pag-btn:hover:not(:disabled) {
  background: rgba(99, 32, 238, .1);
}

.pag-btn:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.pag-info {
  font-size: 13px;
  color: #6b7280;
}

/* ESTADOS */
.estado-carga {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  padding: 3rem 0;
  color: #9ca3af;
}

.estado-error {
  text-align: center;
  padding: 2rem;
  color: #dc2626;
  font-size: 13.5px;
}

.estado-carga-sm {
  display: flex;
  align-items: center;
  gap: .5rem;
  color: #9ca3af;
  font-size: 13px;
  padding: .75rem 0;
}

.spinner-grande {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(99, 32, 238, .15);
  border-top-color: #6320EE;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.spinner-sm-purple {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(99, 32, 238, .2);
  border-top-color: #6320EE;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

.cargando-indicator {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: 13px;
  color: #6320EE;
  font-weight: 500;
}

.spinner-sm-dark {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(99, 32, 238, .15);
  border-top-color: #6320EE;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(33, 26, 29, .55);
  backdrop-filter: blur(4px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: #fff;
  border-radius: 18px;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  position: relative;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(33, 26, 29, .3);
}

.modal-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6320EE, #8075FF);
  border-radius: 4px 4px 0 0;
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  background: #f4eeff;
  border: none;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: pointer;
}

.modal-titulo {
  font-size: 18px;
  font-weight: 700;
  margin: .5rem 0 .2rem;
}

.modal-sub {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 1.25rem;
}

.detalle-resultado {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgba(99, 32, 238, .1);
  border-radius: 10px;
  overflow: hidden;
}

.det-kpi-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 14px;
  border-bottom: 1px solid rgba(99, 32, 238, .07);
}

.det-kpi-mini:last-child {
  border-bottom: none;
}

.det-key {
  font-size: 12px;
  color: #9ca3af;
}

.det-val {
  font-size: 13px;
  font-weight: 600;
  color: #211A1D;
}

.resultado-raw {
  font-size: 11px;
  color: #6b7280;
  background: #f9f8ff;
  border-radius: 8px;
  padding: .75rem;
  max-height: 220px;
  overflow: auto;
  white-space: pre-wrap;
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
}

.btn-cancelar {
  background: #f4eeff;
  color: #6320EE;
  border: 1.5px solid rgba(99, 32, 238, .18);
  border-radius: 10px;
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all .2s;
}

.btn-cancelar:hover {
  background: rgba(99, 32, 238, .1);
}

/* TOAST */
.toast-notif {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  padding: .75rem 1.25rem;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(33, 26, 29, .2);
  z-index: 400;
}

.toast-notif.success {
  background: #211A1D;
  color: #fff;
  border-left: 4px solid #6320EE;
}

.toast-notif.error {
  background: #dc2626;
  color: #fff;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity .2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity .3s, transform .3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>