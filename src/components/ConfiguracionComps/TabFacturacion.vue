<template>
  <div class="config-grid">

    <!-- Moneda -->
    <div class="config-card">
      <div class="card-section-title">
        <span class="card-icon">💲</span> Moneda
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
          <input v-model="form.simbolo" class="field-input" placeholder="$" @input="emitDirty" />
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
        <span class="card-icon">📊</span> Impuestos
      </div>

      <!-- Loading impuestos -->
      <div v-if="loadingImpuestos" class="state-msg">⏳ Cargando impuestos...</div>

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
            <select v-model="impuestoForm.nombre" class="field-input" @change="emitDirty">
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
              type="number" min="0" max="100" placeholder="19" @input="emitDirty" />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">¿APLICAR EN TODAS LAS FACTURAS?</label>
          <select v-model="impuestoForm.aplicar" class="field-input" @change="emitDirty">
            <option value="siempre">Sí, siempre</option>
            <option value="manual">Solo cuando se indique</option>
            <option value="nunca">No aplicar</option>
          </select>
        </div>

        <!-- Toggle activo/inactivo del impuesto -->
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

  <div v-if="error" class="state-msg error mt-2">⚠️ {{ error }}</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const emit = defineEmits(['dirty'])
const BASE = 'https://staydesk-apis-dev.duckdns.org'

// ── Estado ───────────────────────────────────────────
const loadingImpuestos = ref(false)
const error            = ref(null)
const impuestos        = ref([])   // lista completa de GET /impuestos

// ── Moneda ───────────────────────────────────────────
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

function onMonedaChange() {
  const found = monedasDisponibles.find(m => m.nombre === form.nombreMoneda)
  if (found) { form.codigoIso = found.codigo; form.simbolo = found.simbolo }
  emitDirty()
}
function onIsoChange() {
  const found = monedasDisponibles.find(m => m.codigo === form.codigoIso)
  if (found) { form.nombreMoneda = found.nombre; form.simbolo = found.simbolo }
  emitDirty()
}

// ── Impuestos ─────────────────────────────────────────
const impuestoActivo = computed(() =>
  impuestos.value.find(i => i.activo) ?? impuestos.value[0] ?? null
)

const impuestoForm = reactive({ nombre: 'IVA', porcentaje: 19, aplicar: 'siempre' })

// ── API ───────────────────────────────────────────────
async function cargarDatos() {
  // Cargar moneda desde /configuracion
  try {
    const res  = await fetch(`${BASE}/configuracion`)
    const data = await res.json()
    form.simbolo      = data.simbolo_moneda  ?? '$'
    form.nombreMoneda = data.nombre_moneda   ?? 'Peso Colombiano'
    form.codigoIso    = data.codigo_iso      ?? 'COP'
  } catch { /* silencioso, se queda con defaults */ }

  // Cargar impuestos
  loadingImpuestos.value = true
  try {
    const res  = await fetch(`${BASE}/impuestos`)
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
    await fetch(`${BASE}/configuracion`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        simbolo_moneda: form.simbolo,
        nombre_moneda:  form.nombreMoneda,
        codigo_iso:     form.codigoIso,
      }),
    })

    // 2. Guardar / actualizar impuesto
    if (impuestoActivo.value?.id) {
      await fetch(`${BASE}/impuestos/${impuestoActivo.value.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:     impuestoForm.nombre,
          porcentaje: impuestoForm.porcentaje,
          aplicar:    impuestoForm.aplicar,
        }),
      })
    } else {
      // No existe aún → crear
      const res = await fetch(`${BASE}/impuestos`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:     impuestoForm.nombre,
          porcentaje: impuestoForm.porcentaje,
          aplicar:    impuestoForm.aplicar,
        }),
      })
      const nuevo = await res.json()
      impuestos.value.push(nuevo)
    }
  } catch {
    error.value = 'Error al guardar la facturación.'
  }
}

async function toggleImpuesto() {
  if (!impuestoActivo.value) return
  const { id, activo } = impuestoActivo.value
  const endpoint = activo
    ? `${BASE}/impuestos/${id}/desactivar`
    : `${BASE}/impuestos/${id}/reactivar`
  try {
    await fetch(endpoint, { method: 'PATCH' })
    impuestoActivo.value.activo = !activo
  } catch {
    error.value = 'Error al cambiar estado del impuesto.'
  }
}

function emitDirty() { emit('dirty') }

defineExpose({ guardar })
onMounted(cargarDatos)
</script>

<style scoped>
.config-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
.config-card  { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 4px rgba(99,32,238,.06), 0 4px 16px rgba(0,0,0,.04); border: 1px solid rgba(99,32,238,.07); }
.card-section-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.card-icon { font-size: 17px; }

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
.state-msg.error { color: #dc2626; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 14px; }

@media (max-width: 900px) { .config-grid { grid-template-columns: 1fr; } }
</style>