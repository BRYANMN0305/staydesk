<template>
  <div class="calendario-wrapper">

    <!-- Navegación del calendario -->
    <div class="cal-nav d-flex align-items-center justify-content-between mb-3">
      <button class="cal-nav-btn" @click="mesAnterior">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="text-center">
        <p class="fw-bold mb-0" style="font-size:16px;color:#211A1D">{{ nombreMes }} {{ anio }}</p>
        <button class="cal-hoy-btn" @click="irAHoy">Hoy</button>
      </div>
      <button class="cal-nav-btn" @click="mesSiguiente">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <!-- Leyenda -->
    <div class="d-flex gap-3 flex-wrap mb-3">
      <span v-for="(item, key) in leyenda" :key="key" class="d-flex align-items-center gap-1">
        <span class="leyenda-punto" :style="{ background: item.color }"></span>
        <span style="font-size:11px;color:#6b7280">{{ item.label }}</span>
      </span>
    </div>

    <!-- Grid días de semana -->
    <div class="cal-grid-header">
      <div v-for="dia in diasSemana" :key="dia" class="cal-dia-semana">{{ dia }}</div>
    </div>

    <!-- Grid del calendario -->
    <div class="cal-grid">
      <div v-for="(celda, i) in celdasCalendario" :key="i" class="cal-celda" :class="{
        'cal-celda-otro-mes': !celda.esMesActual,
        'cal-celda-hoy': celda.esHoy,
        'cal-celda-con-eventos': celda.reservas.length > 0
      }" @click="celda.reservas.length > 0 && abrirDia(celda)">
        <span class="cal-num" :class="{ 'cal-num-hoy': celda.esHoy }">{{ celda.dia }}</span>

        <div class="cal-eventos">
          <div v-for="(r, ri) in celda.reservas.slice(0, 3)" :key="ri" class="cal-evento"
            :class="claseEventoCal(estado(r.estado))"
            :title="`${r.huesped?.nombre} ${r.huesped?.apellido} — Hab. ${r.habitacion?.numero}`">
            <span class="cal-evento-punto" :style="{ background: colorBorde(estado(r.estado)) }"></span>
            <span class="cal-evento-texto">
              {{ r.huesped?.nombre }} · Hab.{{ r.habitacion?.numero }}
            </span>
          </div>
          <div v-if="celda.reservas.length > 3" class="cal-mas">
            +{{ celda.reservas.length - 3 }} más
          </div>
        </div>
      </div>
    </div>

    <!-- Modal día -->
    <Teleport to="body">
      <div v-if="diaSeleccionado" class="modal-overlay d-flex align-items-center justify-content-center p-3"
        @click.self="diaSeleccionado = null">
        <div class="modal-dia bg-white rounded-4 p-4 position-relative">
          <div class="modal-top-bar"></div>
          <button
            class="position-absolute border-0 rounded-2 d-flex align-items-center justify-content-center modal-close"
            @click="diaSeleccionado = null">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h3 class="fw-bold mb-1" style="font-size:16px">Reservas del {{ diaSeleccionado.fecha }}</h3>
          <p class="text-muted mb-4" style="font-size:12px">{{ diaSeleccionado.reservas.length }} reserva(s) activas</p>

          <div class="d-flex flex-column gap-3">
            <div v-for="r in diaSeleccionado.reservas" :key="r.id_reserva" class="reserva-card-dia">
              <div class="reserva-card-barra" :style="{ background: colorBorde(estado(r.estado)) }"></div>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="fw-semibold mb-0" style="font-size:13px">
                      {{ r.huesped?.nombre }} {{ r.huesped?.apellido }}
                    </p>
                    <p class="text-muted mb-0" style="font-size:12px">
                      Hab. {{ r.habitacion?.numero }} · {{ r.habitacion?.tipo }}
                    </p>
                  </div>
                  <span class="badge-estado-cal" :class="claseEstadoCal(estado(r.estado))">
                    {{ estado(r.estado) }}
                  </span>
                </div>
                <div class="d-flex gap-3 mt-2">
                  <span style="font-size:11px;color:#9ca3af">
                    Entrada: {{ formatFecha(r.fecha_entrada) }}
                  </span>
                  <span style="font-size:11px;color:#9ca3af">
                    Salida: {{ formatFecha(r.fecha_salida_real ?? r.fecha_salida) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button class="modal-btn-secondary w-100 rounded-3 mt-4" @click="diaSeleccionado = null">Cerrar</button>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  reservas: { type: Array, default: () => [] }
})

const hoyObj = new Date()
const mesActual = ref(hoyObj.getMonth())
const anio = ref(hoyObj.getFullYear())
const diaSeleccionado = ref(null)

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const nombreMes = computed(() => nombresMeses[mesActual.value])

const leyenda = {
  pendiente: { label: 'Pendiente', color: '#d97706' },
  confirmada: { label: 'Confirmada', color: '#1d4ed8' },
  checkin: { label: 'Check-in', color: '#6320EE' },
  finalizada: { label: 'Finalizada', color: '#15803d' },
  cancelada: { label: 'Cancelada', color: '#b91c1c' },
}


const colorBorde = (e) => {
  const s = (e || '').toUpperCase()
  if (s === 'PENDIENTE') return '#d97706'
  if (s === 'CONFIRMADA') return '#1d4ed8'
  if (s === 'CHECKIN') return '#6320EE'
  if (s === 'FINALIZADA') return '#15803d'
  if (s === 'CANCELADA') return '#b91c1c'
  return '#9ca3af'
}

const claseEventoCal = (e) => ({
  'evento-pendiente': e === 'PENDIENTE',
  'evento-confirmada': e === 'CONFIRMADA',
  'evento-checkin': e === 'CHECKIN',
  'evento-finalizada': e === 'FINALIZADA',
  'evento-cancelada': e === 'CANCELADA',
  'evento-default': !['PENDIENTE', 'CONFIRMADA', 'CHECKIN', 'FINALIZADA', 'CANCELADA'].includes(e),
})

const claseEstadoCal = (e) => ({
  'cal-est-pendiente': e === 'PENDIENTE',
  'cal-est-confirmada': e === 'CONFIRMADA',
  'cal-est-checkin': e === 'CHECKIN',
  'cal-est-finalizada': e === 'FINALIZADA',
  'cal-est-cancelada': e === 'CANCELADA',
})

const estado = (e) => e ? e.toString().trim().toUpperCase() : ''
const formatFecha = (f) => f ? f.split('T')[0] : '—'
const reservasEnDia = (fecha) => {
  return props.reservas.filter(r => {
    if (!r.fecha_entrada || !r.fecha_salida) return false

    const entrada = new Date(r.fecha_entrada); entrada.setHours(0, 0, 0, 0)
    const salida = new Date(r.fecha_salida); salida.setHours(0, 0, 0, 0)
    const finalizacion = r.fecha_salida_real ? new Date(r.fecha_salida_real) : null
    if (finalizacion) finalizacion.setHours(0, 0, 0, 0)

    const dia = new Date(fecha); dia.setHours(0, 0, 0, 0)

    const fechaSalidaEfectiva = finalizacion ?? salida

    return dia.getTime() === entrada.getTime() || dia.getTime() === fechaSalidaEfectiva.getTime()
  })
}

const celdasCalendario = computed(() => {
  const celdas = []
  const primerDia = new Date(anio.value, mesActual.value, 1)
  const ultimoDia = new Date(anio.value, mesActual.value + 1, 0)
  const hoyStr = hoyObj.toISOString().split('T')[0]

  const diasVacioInicio = primerDia.getDay()
  for (let i = diasVacioInicio - 1; i >= 0; i--) {
    const fecha = new Date(anio.value, mesActual.value, -i)
    const fechaStr = fecha.toISOString().split('T')[0]
    celdas.push({ dia: fecha.getDate(), esMesActual: false, esHoy: false, fecha: fechaStr, reservas: reservasEnDia(fechaStr) })
  }

  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    const fecha = new Date(anio.value, mesActual.value, d)
    const fechaStr = fecha.toISOString().split('T')[0]
    celdas.push({ dia: d, esMesActual: true, esHoy: fechaStr === hoyStr, fecha: fechaStr, reservas: reservasEnDia(fechaStr) })
  }

  const diasFaltantes = 42 - celdas.length
  for (let d = 1; d <= diasFaltantes; d++) {
    const fecha = new Date(anio.value, mesActual.value + 1, d)
    const fechaStr = fecha.toISOString().split('T')[0]
    celdas.push({ dia: d, esMesActual: false, esHoy: false, fecha: fechaStr, reservas: reservasEnDia(fechaStr) })
  }

  return celdas
})

const mesAnterior = () => { if (mesActual.value === 0) { mesActual.value = 11; anio.value-- } else { mesActual.value-- } }
const mesSiguiente = () => { if (mesActual.value === 11) { mesActual.value = 0; anio.value++ } else { mesActual.value++ } }
const irAHoy = () => { mesActual.value = hoyObj.getMonth(); anio.value = hoyObj.getFullYear() }

const abrirDia = (celda) => {
  diaSeleccionado.value = {
    ...celda,
    fecha: new Date(celda.fecha).toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }
}
</script>

<style scoped>
.calendario-wrapper {
  font-family: 'Outfit', sans-serif;
}

.cal-nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1.5px solid rgba(99, 32, 238, 0.2);
  background: none;
  color: #6320EE;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.cal-nav-btn:hover {
  background: rgba(99, 32, 238, 0.07);
}

.cal-hoy-btn {
  background: none;
  border: none;
  color: #6320EE;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.cal-hoy-btn:hover {
  background: rgba(99, 32, 238, 0.08);
}

.leyenda-punto {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Grid encabezado */
.cal-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid rgba(99, 32, 238, 0.08);
  margin-bottom: 2px;
}

.cal-dia-semana {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #9ca3af;
  padding: 6px 0;
  letter-spacing: 0.5px;
}


.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-celda {
  min-height: 90px;
  border-radius: 8px;
  padding: 6px;
  border: 1.5px solid transparent;
  background: #fafafa;
  transition: all 0.18s;
  position: relative;
  overflow: hidden;
}

.cal-celda-otro-mes {
  opacity: 0.35;
}

.cal-celda-hoy {
  background: rgba(99, 32, 238, 0.04);
  border-color: rgba(99, 32, 238, 0.18);
}

.cal-celda-con-eventos {
  cursor: pointer;
}

.cal-celda-con-eventos:hover {
  background: rgba(99, 32, 238, 0.06);
  border-color: rgba(99, 32, 238, 0.2);
  transform: translateY(-1px);
}

.cal-num {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  display: block;
  margin-bottom: 4px;
}

.cal-num-hoy {
  background: linear-gradient(135deg, #6320EE, #8075FF);
  color: #fff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.cal-eventos {
  display: flex;
  flex-direction: column;
  gap: 2px;
}


.cal-evento {
  border-radius: 4px;
  padding: 2px 5px 2px 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cal-evento-punto {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cal-evento-texto {
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.evento-pendiente {
  background: rgba(217, 119, 6, 0.12);
}

.evento-pendiente .cal-evento-texto {
  color: #b45309;
}

.evento-confirmada {
  background: rgba(59, 130, 246, 0.12);
}

.evento-confirmada .cal-evento-texto {
  color: #1d4ed8;
}

.evento-checkin {
  background: rgba(99, 32, 238, 0.12);
}

.evento-checkin .cal-evento-texto {
  color: #6320EE;
}

.evento-finalizada {
  background: rgba(22, 163, 74, 0.12);
}

.evento-finalizada .cal-evento-texto {
  color: #15803d;
}

.evento-cancelada {
  background: rgba(220, 38, 38, 0.12);
}

.evento-cancelada .cal-evento-texto {
  color: #b91c1c;
}

.evento-default {
  background: rgba(107, 114, 128, 0.10);
}

.evento-default .cal-evento-texto {
  color: #6b7280;
}

.cal-mas {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 600;
  padding: 1px 4px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(33, 26, 29, 0.55);
  backdrop-filter: blur(4px);
  z-index: 500;
}

.modal-dia {
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(33, 26, 29, 0.3);
  animation: modalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.modal-top-bar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 4px;
  width: 90%;
  background: linear-gradient(90deg, #6320EE, #8075FF);
  border-radius: 4px;
}

.modal-close {
  top: 16px;
  right: 16px;
  background: #f4eeff;
  width: 30px;
  height: 30px;
  color: #9ca3af;
  cursor: pointer;
  border: none;
}

.modal-btn-secondary {
  padding: 11px;
  background: #f4eeff;
  color: #6320EE;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  border: 1.5px solid rgba(99, 32, 238, 0.18);
  cursor: pointer;
  font-weight: 600;
}

.modal-btn-secondary:hover {
  background: rgba(99, 32, 238, 0.08);
}

/* Tarjeta reserva dentro del modal */
.reserva-card-dia {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border: 1px solid rgba(99, 32, 238, 0.1);
  border-radius: 10px;
  padding: 12px;
  background: #fafafa;
}

.reserva-card-barra {
  width: 4px;
  min-height: 40px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 2px;
}

.badge-estado-cal {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.cal-est-pendiente {
  background: rgba(217, 119, 6, 0.12);
  color: #b45309;
}

.cal-est-confirmada {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.cal-est-checkin {
  background: rgba(99, 32, 238, 0.12);
  color: #6320EE;
}

.cal-est-finalizada {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.cal-est-cancelada {
  background: rgba(220, 38, 38, 0.12);
  color: #b91c1c;
}

/* Mobile */
@media (max-width: 576px) {
  .cal-celda {
    min-height: 64px;
    padding: 4px;
  }

  .cal-evento {
    display: none;
  }

  .cal-celda-con-eventos::after {
    content: '•';
    position: absolute;
    bottom: 4px;
    right: 6px;
    font-size: 14px;
    color: #6320EE;
  }
}
</style>