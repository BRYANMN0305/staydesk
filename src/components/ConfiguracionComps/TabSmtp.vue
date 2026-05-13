<template>
  <div class="tab-grid">
    <!-- Conexión SMTP -->
    <div class="config-card">
      <div class="card-title">
        <span class="card-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </span>
        <h4>Conexión SMTP</h4>
      </div>

      <!-- Estado conexión -->
      <div class="conexion-badge mb-4" :class="estadoConexion">
        <span class="dot"></span>
        {{ estadoConexion === 'ok' ? 'Conexión activa y verificada' : estadoConexion === 'error' ? 'Error de conexión' : 'Sin verificar' }}
      </div>

      <!-- Toggle activo -->
      <div class="toggle-row mb-4">
        <div>
          <p class="toggle-label">Envío de correos activo</p>
          <p class="toggle-sub">Habilita el envío de facturas y notificaciones</p>
        </div>
        <button class="toggle-btn" :class="{ on: form.activo }" @click="form.activo = !form.activo; $emit('cambio')">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>Servidor SMTP</label>
          <input v-model="form.servidor" @input="$emit('cambio')" placeholder="smtp.gmail.com"/>
        </div>
        <div class="field">
          <label>Puerto</label>
          <input v-model.number="form.puerto" @input="$emit('cambio')" type="number" placeholder="587"/>
        </div>
        <div class="field">
          <label>Usuario</label>
          <input v-model="form.usuario" @input="$emit('cambio')" placeholder="facturas@hotel.co"/>
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input v-model="form.contrasena" @input="$emit('cambio')" type="password" placeholder="••••••••••••••"/>
        </div>
      </div>

      <button class="btn-probar mt-3" @click="probarConexion" :disabled="probando">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        {{ probando ? 'Probando...' : 'Probar conexión' }}
      </button>
    </div>

    <!-- Configuración de envíos -->
    <div class="config-card">
      <div class="card-title">
        <span class="card-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </span>
        <h4>Configuración de envíos</h4>
      </div>

      <div class="toggle-row mb-3">
        <div>
          <p class="toggle-label">Enviar factura al huésped</p>
          <p class="toggle-sub">Al realizar el checkout</p>
        </div>
        <button class="toggle-btn" :class="{ on: form.enviar_huesped }" @click="form.enviar_huesped = !form.enviar_huesped; $emit('cambio')">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <div class="toggle-row mb-3">
        <div>
          <p class="toggle-label">Copia interna al hotel</p>
          <p class="toggle-sub">Copia de cada factura al correo del hotel</p>
        </div>
        <button class="toggle-btn" :class="{ on: form.copia_interna }" @click="form.copia_interna = !form.copia_interna; $emit('cambio')">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <div class="toggle-row mb-4">
        <div>
          <p class="toggle-label">Notificaciones por email</p>
          <p class="toggle-sub">Alertas críticas del sistema</p>
        </div>
        <button class="toggle-btn" :class="{ on: form.notificaciones }" @click="form.notificaciones = !form.notificaciones; $emit('cambio')">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <div class="form-grid">
        <div class="field full">
          <label>Correo de copia interna</label>
          <input v-model="form.correo_copia" @input="$emit('cambio')" type="email" placeholder="admin@hotel.co"/>
        </div>
        <div class="field full">
          <label>Asunto por defecto de la factura</label>
          <input v-model="form.asunto_factura" @input="$emit('cambio')" placeholder="Factura de estadía — Hotel"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['cambio'])
const API_URL = import.meta.env.VITE_API_URL
const estadoConexion = ref('sinverificar')
const probando = ref(false)

const form = ref({
  activo: true, servidor: '', puerto: 587, usuario: '', contrasena: '',
  enviar_huesped: true, copia_interna: true, notificaciones: false,
  correo_copia: '', asunto_factura: ''
})

const authHeaders = (json = true) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const h = token ? { Authorization: `Bearer ${token}` } : {}
  if (json) h['Content-Type'] = 'application/json'
  return h
}

const cargar = async () => {
  try {
    const res = await fetch(`${API_URL}/configuracion`, { headers: authHeaders() })
    if (!res.ok) return
    const data = await res.json()
    if (data.smtp) {
      form.value.servidor       = data.smtp.servidor       || ''
      form.value.puerto         = data.smtp.puerto         || 587
      form.value.usuario        = data.smtp.usuario        || ''
      form.value.activo         = data.smtp.activo         ?? true
      form.value.enviar_huesped = data.smtp.enviar_huesped ?? true
      form.value.copia_interna  = data.smtp.copia_interna  ?? true
      form.value.notificaciones = data.smtp.notificaciones ?? false
      form.value.correo_copia   = data.smtp.correo_copia   || ''
      form.value.asunto_factura = data.smtp.asunto_factura || ''
    }
  } catch (e) { console.error(e) }
}

const probarConexion = async () => {
  probando.value = true
  estadoConexion.value = 'sinverificar'
  try {
    const res = await fetch(`${API_URL}/configuracion/smtp/test`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        servidor:   form.value.servidor,
        puerto:     form.value.puerto,
        usuario:    form.value.usuario,
        contrasena: form.value.contrasena,
      })
    })
    estadoConexion.value = res.ok ? 'ok' : 'error'
  } catch {
    estadoConexion.value = 'error'
  } finally {
    probando.value = false
  }
}

// ── NUEVO: guardar() expuesto al padre via defineExpose ────────────────────
// Hace PUT /configuracion con todos los campos SMTP.
// El padre (Configuracion.vue) llama tabSmtpRef.value.guardar() desde su
// método guardar() cuando activeTab === 'correo'.
const guardar = async () => {
  const res = await fetch(`${API_URL}/configuracion`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      smtp: {
        servidor:       form.value.servidor,
        puerto:         form.value.puerto,
        usuario:        form.value.usuario,
        // Solo enviamos contraseña si el usuario la modificó (no está vacía)
        ...(form.value.contrasena ? { contrasena: form.value.contrasena } : {}),
        activo:         form.value.activo,
        enviar_huesped: form.value.enviar_huesped,
        copia_interna:  form.value.copia_interna,
        notificaciones: form.value.notificaciones,
        correo_copia:   form.value.correo_copia,
        asunto_factura: form.value.asunto_factura,
      }
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail || 'Error al guardar la configuración SMTP.')
  }
}

defineExpose({ guardar })
onMounted(cargar)
</script>

<style scoped>
.tab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media(max-width:900px){ .tab-grid { grid-template-columns: 1fr; } }

.config-card {
  background: #fff; border: 1px solid rgba(99,32,238,0.08);
  border-radius: 16px; padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(33,26,29,0.05);
}

.card-title { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; }
.card-title h4 { margin: 0; font-size: 15px; font-weight: 700; color: #211A1D; }
.card-icon {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  background: rgba(99,32,238,0.08);
  border-radius: 8px;
  color: #6320EE;
  flex-shrink: 0;
}

.conexion-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600;
}
.conexion-badge.ok          { background: rgba(22,163,74,0.08);  color: #15803d; border: 1px solid rgba(22,163,74,0.2);  }
.conexion-badge.error       { background: rgba(220,38,38,0.08);  color: #dc2626; border: 1px solid rgba(220,38,38,0.2);  }
.conexion-badge.sinverificar{ background: rgba(99,32,238,0.06);  color: #6b7280; border: 1px solid rgba(99,32,238,0.1);  }

.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ok .dot          { background: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.2); }
.error .dot       { background: #dc2626; }
.sinverificar .dot{ background: #9ca3af; }

.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.toggle-label { font-size: 13.5px; font-weight: 600; color: #211A1D; margin: 0 0 2px; }
.toggle-sub   { font-size: 12px; color: #9ca3af; margin: 0; }

.toggle-btn {
  width: 44px; height: 24px; border-radius: 999px;
  background: #e5e7eb; border: none; cursor: pointer;
  position: relative; transition: background .2s; flex-shrink: 0;
}
.toggle-btn.on { background: #6320EE; }
.toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2);
  transition: transform .2s;
}
.toggle-btn.on .toggle-knob { transform: translateX(20px); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field.full { grid-column: 1 / -1; }

.field label { font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #9ca3af; }
.field input {
  border: 1.5px solid rgba(99,32,238,0.15); border-radius: 10px;
  padding: 9px 13px; font-size: 13.5px; font-family: 'Outfit', sans-serif;
  color: #211A1D; background: #faf8ff; outline: none; transition: border-color .2s;
}
.field input:focus { border-color: #6320EE; }
.field input::placeholder { color: #c4b8d0; }

.btn-probar {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 10px;
  background: rgba(99,32,238,0.08);
  border: 1.5px solid rgba(99,32,238,0.2);
  color: #6320EE; font-size: 13px; font-weight: 700;
  font-family: 'Outfit', sans-serif; cursor: pointer; transition: all .2s;
}
.btn-probar:hover:not(:disabled) { background: rgba(99,32,238,0.15); }
.btn-probar:disabled { opacity: .5; cursor: not-allowed; }

.mb-3 { margin-bottom: .75rem; }
.mb-4 { margin-bottom: 1.25rem; }
.mt-3 { margin-top: .75rem; }
</style>