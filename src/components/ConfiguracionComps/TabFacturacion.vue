<template>
  <div class="config-grid">

    <!-- Moneda -->
    <div class="config-card">
      <div class="card-section-title">
        <span class="card-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </span>
        Moneda
      </div>

      <div class="price-preview-box">
        <div>
          <p class="preview-label">Vista previa del precio</p>
          <p class="price-preview-value">{{ form.simbolo }} 250,000.00 {{ form.codigoIso }}</p>
        </div>
        <span class="price-preview-icon">$</span>
      </div>

      <div class="field-row mt-3">
        <div class="field-group">
          <label class="field-label">SÍMBOLO</label>
          <input v-model="form.simbolo" class="field-input" placeholder="$" @input="emitCambio" />
        </div>
        <div class="field-group">
          <label class="field-label">NOMBRE DE LA MONEDA</label>
          <select v-model="form.nombreMoneda" class="field-input" @change="onMonedaChange">
            <option v-for="m in monedasDisponibles" :key="m.codigo" :value="m.nombre">
              {{ m.nombre }}
            </option>
          </select>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label">CÓDIGO ISO</label>
        <select v-model="form.codigoIso" class="field-input" @change="onIsoChange">
          <option v-for="m in monedasDisponibles" :key="m.codigo" :value="m.codigo">
            {{ m.codigo }} — {{ m.nombre }}
          </option>
        </select>
      </div>
    </div>

    <!-- Impuestos -->
    <div class="config-card">
      <div class="card-section-title">
        <span class="card-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6"  y1="20" x2="6"  y2="14"/>
            <line x1="2"  y1="20" x2="22" y2="20"/>
          </svg>
        </span>
        Impuestos
      </div>

      <div v-if="loadingImpuestos" class="state-msg loading-msg">
        <svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Cargando impuestos...
      </div>

      <template v-else>
        <div class="tax-preview-box">
          <div>
            <p class="preview-label tax-label-text">Impuesto aplicado sobre el total</p>
            <p class="tax-preview-value">
              {{ impuestoActivo?.nombre ?? '—' }} · {{ impuestoActivo?.porcentaje ?? 0 }}%
            </p>
          </div>
          <span class="tax-preview-icon">%</span>
        </div>

        <div class="field-row mt-3">
          <div class="field-group">
            <label class="field-label">NOMBRE DEL IMPUESTO</label>
            <select v-model="impuestoForm.nombre" class="field-input" @change="emitCambio">
              <option value="IVA">IVA</option>
              <option value="IGV">IGV</option>
              <option value="IVA+INC">IVA + INC</option>
              <option value="ISV">ISV</option>
              <option value="Sin impuesto">Sin impuesto</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">PORCENTAJE (%)</label>
            <input v-model.number="impuestoForm.porcentaje" class="field-input"
              type="number" min="0" max="100" placeholder="19" @input="emitCambio" />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">¿APLICAR EN TODAS LAS FACTURAS?</label>
          <select v-model="impuestoForm.aplicar" class="field-input" @change="emitCambio">
            <option value="siempre">Sí, siempre</option>
            <option value="manual">Solo cuando se indique</option>
            <option value="nunca">No aplicar</option>
          </select>
        </div>

        <div class="toggle-row" v-if="impuestoActivo">
          <div>
            <p class="toggle-label">Impuesto activo</p>
            <p class="toggle-hint">Aplica automáticamente en facturación</p>
          </div>
          <button class="toggle-btn" :class="{ on: impuestoActivo.activo }"
            @click="toggleImpuesto">
            <span class="toggle-knob" />
          </button>
        </div>
      </template>
    </div>

  </div>

  <div v-if="error" class="state-msg error mt-2">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
    {{ error }}
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// ── CORREGIDO: emit usa 'cambio' para coincidir con lo que escucha el padre ─
const emit = defineEmits(['cambio'])
const API_URL = import.meta.env.VITE_API_URL

const loadingImpuestos = ref(false)
const error            = ref(null)
const impuestos        = ref([])

const monedasDisponibles = [
  { nombre: 'Peso Colombiano', codigo: 'COP', simbolo: '$'  },
  { nombre: 'Dólar Americano', codigo: 'USD', simbolo: '$'  },
  { nombre: 'Euro',            codigo: 'EUR', simbolo: '€'  },
  { nombre: 'Peso Mexicano',   codigo: 'MXN', simbolo: '$'  },
  { nombre: 'Sol Peruano',     codigo: 'PEN', simbolo: 'S/' },
  { nombre: 'Quetzal',         codigo: 'GTQ', simbolo: 'Q'  },
]

const form = reactive({
  simbolo:     '$',
  nombreMoneda:'Peso Colombiano',
  codigoIso:   'COP',
})

// ── CORREGIDO: todos los handlers usan emitCambio() ────────────────────────
const emitCambio = () => emit('cambio')

function onMonedaChange() {
  const found = monedasDisponibles.find(m => m.nombre === form.nombreMoneda)
  if (found) { form.codigoIso = found.codigo; form.simbolo = found.simbolo }
  emitCambio()
}
function onIsoChange() {
  const found = monedasDisponibles.find(m => m.codigo === form.codigoIso)
  if (found) { form.nombreMoneda = found.nombre; form.simbolo = found.simbolo }
  emitCambio()
}

const impuestoActivo = computed(() =>
  impuestos.value.find(i => i.activo) ?? impuestos.value[0] ?? null
)

const impuestoForm = reactive({ nombre: 'IVA', porcentaje: 19, aplicar: 'siempre' })

const authHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function cargarDatos() {
  try {
    const res  = await fetch(`${API_URL}/configuracion`, { headers: authHeaders() })
    const data = await res.json()
    form.simbolo      = data.simbolo_moneda  ?? '$'
    form.nombreMoneda = data.nombre_moneda   ?? 'Peso Colombiano'
    form.codigoIso    = data.codigo_iso      ?? 'COP'
  } catch { /* silencioso, se queda con defaults */ }

  loadingImpuestos.value = true
  try {
    const res  = await fetch(`${API_URL}/impuestos`, { headers: authHeaders() })
    impuestos.value = await res.json()
    if (impuestoActivo.value) {
      impuestoForm.nombre     = impuestoActivo.value.nombre      ?? 'IVA'
      impuestoForm.porcentaje = impuestoActivo.value.porcentaje  ?? 19
      impuestoForm.aplicar    = impuestoActivo.value.aplicar     ?? 'siempre'
    }
  } catch {
    error.value = 'No se pudieron cargar los impuestos.'
  } finally {
    loadingImpuestos.value = false
  }
}

async function guardar() {
  error.value = null
  try {
    // 1. Guardar moneda en configuración general
    const resConfig = await fetch(`${API_URL}/configuracion`, {
      method:  'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        simbolo_moneda: form.simbolo,
        nombre_moneda:  form.nombreMoneda,
        codigo_iso:     form.codigoIso,
      }),
    })
    if (!resConfig.ok) {
      const err = await resConfig.json().catch(() => ({}))
      throw new Error(err?.detail || 'Error al guardar la moneda.')
    }

    // 2a. Si ya existe un impuesto, actualizarlo con PATCH /impuestos/{id}
    if (impuestoActivo.value?.id_impuesto) {
      const resImp = await fetch(`${API_URL}/impuestos/${impuestoActivo.value.id_impuesto}`, {
        method:  'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          nombre:     impuestoForm.nombre,
          porcentaje: impuestoForm.porcentaje,
          aplicar:    impuestoForm.aplicar,
        }),
      })
      if (!resImp.ok) {
        const err = await resImp.json().catch(() => ({}))
        throw new Error(err?.detail || 'Error al actualizar el impuesto.')
      }
      // Actualizar valor local para que el computed lo refleje
      const actualizado = await resImp.json().catch(() => null)
      if (actualizado) {
        const idx = impuestos.value.findIndex(i => i.id_impuesto === actualizado.id_impuesto)
        if (idx !== -1) impuestos.value[idx] = actualizado
      }
    } else {
      // 2b. Si no existe, crear uno nuevo con POST /impuestos
      const resImp = await fetch(`${API_URL}/impuestos`, {
        method:  'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          nombre:     impuestoForm.nombre,
          porcentaje: impuestoForm.porcentaje,
          aplicar:    impuestoForm.aplicar,
        }),
      })
      if (!resImp.ok) {
        const err = await resImp.json().catch(() => ({}))
        throw new Error(err?.detail || 'Error al crear el impuesto.')
      }
      const nuevo = await resImp.json()
      impuestos.value.push(nuevo)
    }
  } catch (e) {
    error.value = e.message || 'Error al guardar la facturación.'
    throw e
  }
}

async function toggleImpuesto() {
  if (!impuestoActivo.value) return
  const { id_impuesto, activo } = impuestoActivo.value
  const endpoint = activo
    ? `${API_URL}/impuestos/${id_impuesto}/desactivar`
    : `${API_URL}/impuestos/${id_impuesto}/reactivar`
  try {
    const res = await fetch(endpoint, { method: 'PATCH', headers: authHeaders() })
    if (!res.ok) throw new Error()
    // Actualizar estado local sin recargar todo
    const idx = impuestos.value.findIndex(i => i.id_impuesto === id_impuesto)
    if (idx !== -1) impuestos.value[idx].activo = !activo
    emitCambio()
  } catch {
    error.value = 'Error al cambiar estado del impuesto.'
  }
}

defineExpose({ guardar })
onMounted(cargarDatos)
</script>

<style scoped>
.config-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
.config-card  { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 4px rgba(99,32,238,.06), 0 4px 16px rgba(0,0,0,.04); border: 1px solid rgba(99,32,238,.07); }

.card-section-title {
  font-size: 15px; font-weight: 700; color: #1a1a2e;
  margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
}
.card-icon {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px;
  background: rgba(99,32,238,0.08);
  border-radius: 8px; color: #6320EE; flex-shrink: 0;
}

.price-preview-box { background: linear-gradient(135deg,rgba(99,32,238,.10),rgba(128,117,255,.06)); border: 1px solid rgba(99,32,238,.18); border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; }
.tax-preview-box   { background: linear-gradient(135deg,rgba(180,120,10,.10),rgba(245,158,11,.05)); border: 1px solid rgba(245,158,11,.22); border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; }
.preview-label     { font-size: 11.5px; color: #9090b8; margin: 0 0 6px; }
.tax-label-text    { color: #a08040; }
.price-preview-value { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0; }
.tax-preview-value   { font-size: 22px; font-weight: 700; color: #b07000; margin: 0; }
.price-preview-icon  { font-size: 32px; font-weight: 700; color: rgba(99,32,238,.25); line-height: 1; }
.tax-preview-icon    { font-size: 32px; font-weight: 700; color: rgba(245,158,11,.5); line-height: 1; }

.field-group  { margin-bottom: 14px; }
.field-label  { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: 1.2px; color: #8888aa; margin-bottom: 5px; text-transform: uppercase; }
.field-input  { width: 100%; padding: 9px 13px; border: 1.5px solid #e2ddf0; border-radius: 8px; font-size: 13.5px; color: #1a1a2e; background: #fdfdff; transition: border-color .15s; box-sizing: border-box; outline: none; }
.field-input:focus { border-color: #7c5cbf; box-shadow: 0 0 0 3px rgba(99,32,238,.08); }
.field-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.toggle-row   { display: flex; align-items: center; justify-content: space-between; padding: 13px 0; gap: 12px; border-top: 1px solid #f0edf8; margin-top: 4px; }
.toggle-label { font-size: 13.5px; font-weight: 600; color: #1a1a2e; margin: 0 0 2px; }
.toggle-hint  { font-size: 11.5px; color: #8888aa; margin: 0; }
.toggle-btn   { width: 46px; height: 26px; border-radius: 13px; border: none; background: #d0cce8; cursor: pointer; position: relative; transition: background .2s; flex-shrink: 0; }
.toggle-btn.on { background: #6320EE; }
.toggle-knob  { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
.toggle-btn.on .toggle-knob { transform: translateX(20px); }

.state-msg       { font-size: 13px; color: #8888aa; margin-top: 8px; }
.state-msg.error { color: #dc2626; display: flex; align-items: center; gap: 7px; }
.loading-msg     { display: flex; align-items: center; gap: 7px; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin .8s linear infinite; }

.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 14px; }

@media (max-width: 900px) { .config-grid { grid-template-columns: 1fr; } }
</style>