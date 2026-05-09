<template>
  <div class="config-grid">

    <!-- Conexión SMTP -->
    <div class="config-card">
      <div class="card-section-title">
        <span class="card-icon">🔌</span> Conexión SMTP
      </div>

      <div class="smtp-status" :class="statusClass">
        <span class="smtp-dot"></span>
        {{ statusLabel }}
      </div>

      <div class="toggle-row mt-3">
        <div>
          <p class="toggle-label">Envío de correos activo</p>
          <p class="toggle-hint">Habilita el envío de facturas y notificaciones</p>
        </div>
        <button class="toggle-btn" :class="{ on: form.activo }" @click="form.activo = !form.activo; emitDirty()">
          <span class="toggle-knob" />
        </button>
      </div>

      <div class="field-row mt-2">
        <div class="field-group">
          <label class="field-label">SERVIDOR SMTP</label>
          <input v-model="form.host" class="field-input" placeholder="smtp.gmail.com" @input="resetStatus(); emitDirty()" />
        </div>
        <div class="field-group">
          <label class="field-label">PUERTO</label>
          <input v-model="form.puerto" class="field-input" placeholder="587" @input="resetStatus(); emitDirty()" />
        </div>
      </div>

      <div class="field-row">
        <div class="field-group">
          <label class="field-label">USUARIO</label>
          <input v-model="form.usuario" class="field-input" placeholder="facturas@hotel.co" @input="resetStatus(); emitDirty()" />
        </div>
        <div class="field-group">
          <label class="field-label">CONTRASEÑA</label>
          <input v-model="form.password" class="field-input" type="password" placeholder="••••••••••••" @input="resetStatus(); emitDirty()" />
        </div>
      </div>

      <button class="btn-test" :disabled="testando" @click="probarConexion">
        <span v-if="testando">⏳ Probando...</span>
        <span v-else>⚡ Probar conexión</span>
      </button>
    </div>

    <!-- Configuración de envíos -->
    <div class="config-card">
      <div class="card-section-title">
        <span class="card-icon">✉️</span> Configuración de envíos
      </div>

      <div v-for="t in togglesEnvio" :key="t.key" class="toggle-row">
        <div>
          <p class="toggle-label">{{ t.label }}</p>
          <p class="toggle-hint">{{ t.hint }}</p>
        </div>
        <button class="toggle-btn" :class="{ on: envios[t.key] }"
          @click="envios[t.key] = !envios[t.key]; emitDirty()">
          <span class="toggle-knob" />
        </button>
      </div>

      <div class="field-group mt-3">
        <label class="field-label">CORREO DE COPIA INTERNA</label>
        <input v-model="envios.correoInterno" class="field-input"
          placeholder="admin@hotel.co" @input="emitDirty" />
      </div>

      <div class="field-group">
        <label class="field-label">ASUNTO POR DEFECTO DE LA FACTURA</label>
        <input v-model="envios.asuntoFactura" class="field-input"
          placeholder="Factura de estadía — Hotel Gran Palacio" @input="emitDirty" />
      </div>
    </div>

  </div>

  <div v-if="error" class="state-msg error mt-2">⚠️ {{ error }}</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const emit = defineEmits(['dirty'])
const BASE = 'https://staydesk-apis-dev.duckdns.org'

const error   = ref(null)
const testando = ref(false)
// 'idle' | 'ok' | 'fail'
const smtpStatus = ref('idle')

const statusClass = computed(() => ({
  verified:   smtpStatus.value === 'ok',
  unverified: smtpStatus.value === 'fail',
  idle:       smtpStatus.value === 'idle',
}))
const statusLabel = computed(() => ({
  ok:   'Conexión activa y verificada',
  fail: 'No se pudo conectar al servidor',
  idle: 'Conexión no probada',
}[smtpStatus.value]))

const form = reactive({
  activo:   true,
  host:     '',
  puerto:   '',
  usuario:  '',
  password: '',
})

const envios = reactive({
  facturaHuesped: true,
  copiaInterna:   true,
  notificaciones: false,
  correoInterno:  '',
  asuntoFactura:  '',
})

const togglesEnvio = [
  { key: 'facturaHuesped', label: 'Enviar factura al huésped', hint: 'Al realizar el checkout'              },
  { key: 'copiaInterna',   label: 'Copia interna al hotel',    hint: 'Copia de cada factura al correo del hotel' },
  { key: 'notificaciones', label: 'Notificaciones por email',  hint: 'Alertas críticas del sistema'        },
]

// ── API ───────────────────────────────────────────────
async function cargarDatos() {
  try {
    const res  = await fetch(`${BASE}/configuracion`)
    const data = await res.json()
    form.activo         = data.smtp_activo          ?? true
    form.host           = data.smtp_host            ?? ''
    form.puerto         = data.smtp_puerto          ?? ''
    form.usuario        = data.smtp_usuario         ?? ''
    // Nunca cargar la contraseña en texto plano — dejar vacío
    envios.facturaHuesped = data.envio_factura_huesped ?? true
    envios.copiaInterna   = data.envio_copia_interna   ?? true
    envios.notificaciones = data.envio_notificaciones  ?? false
    envios.correoInterno  = data.correo_copia_interna  ?? ''
    envios.asuntoFactura  = data.asunto_factura        ?? ''

    if (data.smtp_verificado) smtpStatus.value = 'ok'
  } catch { /* silencioso */ }
}

async function probarConexion() {
  testando.value   = true
  smtpStatus.value = 'idle'
  error.value      = null
  try {
    const res = await fetch(`${BASE}/configuracion/smtp/test`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host:     form.host,
        puerto:   form.puerto,
        usuario:  form.usuario,
        password: form.password,
      }),
    })
    smtpStatus.value = res.ok ? 'ok' : 'fail'
  } catch {
    smtpStatus.value = 'fail'
    error.value = 'No se pudo conectar al servidor SMTP.'
  } finally {
    testando.value = false
  }
}

async function guardar() {
  error.value = null
  try {
    const body = {
      smtp_activo:            form.activo,
      smtp_host:              form.host,
      smtp_puerto:            form.puerto,
      smtp_usuario:           form.usuario,
      envio_factura_huesped:  envios.facturaHuesped,
      envio_copia_interna:    envios.copiaInterna,
      envio_notificaciones:   envios.notificaciones,
      correo_copia_interna:   envios.correoInterno,
      asunto_factura:         envios.asuntoFactura,
    }
    // Solo incluir password si el usuario lo modificó
    if (form.password) body.smtp_password = form.password

    await fetch(`${BASE}/configuracion`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    error.value = 'Error al guardar la configuración SMTP.'
  }
}

function resetStatus() { smtpStatus.value = 'idle' }
function emitDirty()   { emit('dirty') }

defineExpose({ guardar })
onMounted(cargarDatos)
</script>

<style scoped>
.config-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
.config-card  { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 4px rgba(99,32,238,.06), 0 4px 16px rgba(0,0,0,.04); border: 1px solid rgba(99,32,238,.07); }
.card-section-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.card-icon { font-size: 17px; }

.smtp-status           { display: flex; align-items: center; gap: 10px; padding: 11px 15px; border-radius: 9px; font-size: 13.5px; font-weight: 600; background: #f5f5f5; color: #888; border: 1px solid #e0e0e0; }
.smtp-status.verified  { background: rgba(16,185,129,.09); border-color: rgba(16,185,129,.28); color: #059669; }
.smtp-status.unverified{ background: rgba(239,68,68,.08);  border-color: rgba(239,68,68,.28);  color: #dc2626; }
.smtp-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 5px currentColor; flex-shrink: 0; }

.btn-test { margin-top: 16px; padding: 9px 20px; border: 1.5px solid #d0cce8; border-radius: 8px; background: #f7f4ff; color: #5b21b6; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
.btn-test:hover:not(:disabled) { background: #ede9ff; border-color: #7c5cbf; }
.btn-test:disabled { opacity: .6; cursor: not-allowed; }

.field-group  { margin-bottom: 14px; }
.field-label  { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: 1.2px; color: #8888aa; margin-bottom: 5px; text-transform: uppercase; }
.field-input  { width: 100%; padding: 9px 13px; border: 1.5px solid #e2ddf0; border-radius: 8px; font-size: 13.5px; color: #1a1a2e; background: #fdfdff; transition: border-color .15s; box-sizing: border-box; outline: none; }
.field-input:focus { border-color: #7c5cbf; box-shadow: 0 0 0 3px rgba(99,32,238,.08); }
.field-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.toggle-row   { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0edf8; gap: 12px; }
.toggle-row:last-of-type { border-bottom: none; }
.toggle-label { font-size: 13.5px; font-weight: 600; color: #1a1a2e; margin: 0 0 2px; }
.toggle-hint  { font-size: 11.5px; color: #8888aa; margin: 0; }
.toggle-btn   { width: 46px; height: 26px; border-radius: 13px; border: none; background: #d0cce8; cursor: pointer; position: relative; transition: background .2s; flex-shrink: 0; }
.toggle-btn.on { background: #6320EE; }
.toggle-knob  { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
.toggle-btn.on .toggle-knob { transform: translateX(20px); }

.state-msg       { font-size: 13px; color: #8888aa; }
.state-msg.error { color: #dc2626; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 14px; }

@media (max-width: 900px) { .config-grid { grid-template-columns: 1fr; } }
</style>