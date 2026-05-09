<template>
  <div class="config-grid">

    <!-- Identidad visual -->
    <div class="config-card">
      <div class="card-section-title">
        <span class="card-icon">🖼️</span> Identidad visual
      </div>

      <div class="logo-upload-row">
        <div class="logo-preview">
          <img v-if="logoPreview" :src="logoPreview" alt="Logo" />
          <span v-else>🏨</span>
        </div>
        <div class="logo-info">
          <p class="logo-label">Logo del hotel</p>
          <p class="logo-hint">JPG, PNG o WEBP · Máx. 2MB</p>
          <p class="logo-hint">Aparece en el sistema y en las facturas</p>
          <label class="btn-upload">
            📁 Subir imagen
            <input type="file" accept="image/*" @change="onLogoChange" hidden />
          </label>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label">NOMBRE DEL HOTEL</label>
        <input v-model="form.nombre" class="field-input" placeholder="Hotel Gran Palacio" @input="emitDirty" />
      </div>
      <div class="field-group">
        <label class="field-label">DIRECCIÓN</label>
        <input v-model="form.direccion" class="field-input" placeholder="Av. Libertador 1234, Bogotá" @input="emitDirty" />
      </div>
      <div class="field-row">
        <div class="field-group">
          <label class="field-label">TELÉFONO</label>
          <input v-model="form.telefono" class="field-input" placeholder="+57 1 234 5678" @input="emitDirty" />
        </div>
        <div class="field-group">
          <label class="field-label">RIF / NIT</label>
          <input v-model="form.nit" class="field-input" placeholder="900.123.456-1" @input="emitDirty" />
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">CORREO DE CONTACTO</label>
        <input v-model="form.correo" class="field-input" type="email" placeholder="contacto@hotel.co" @input="emitDirty" />
      </div>
    </div>

    <!-- Redes sociales + Info adicional -->
    <div class="config-col-right">
      <div class="config-card">
        <div class="card-section-title">
          <span class="card-icon">🌐</span> Redes sociales
        </div>
        <div v-for="s in socialFields" :key="s.key" class="field-group">
          <div class="social-input-wrap">
            <span class="social-icon">{{ s.icon }}</span>
            <input v-model="form[s.key]" class="field-input social" :placeholder="s.placeholder" @input="emitDirty" />
          </div>
        </div>
      </div>

      <div class="config-card mt-3">
        <div class="card-section-title">
          <span class="card-icon">🔖</span> Información adicional
        </div>
        <div class="field-group">
          <label class="field-label">DESCRIPCIÓN DEL HOTEL</label>
          <textarea v-model="form.descripcion" class="field-input field-textarea"
            rows="4" placeholder="Breve descripción del hotel..." @input="emitDirty" />
        </div>
      </div>
    </div>

  </div>

  <!-- Estado de carga / error -->
  <div v-if="loading" class="state-msg">⏳ Cargando configuración...</div>
  <div v-if="error"   class="state-msg error">⚠️ {{ error }}</div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const emit = defineEmits(['dirty'])

const BASE = 'https://staydesk-apis-dev.duckdns.org'

const loading    = ref(false)
const error      = ref(null)
const logoPreview = ref(null)
let   configId   = null   // guardamos el id que devuelve GET /configuracion

const form = reactive({
  nombre:      '',
  direccion:   '',
  telefono:    '',
  nit:         '',
  correo:      '',
  instagram:   '',
  facebook:    '',
  twitter:     '',
  whatsapp:    '',
  descripcion: '',
})

const socialFields = [
  { key: 'instagram', icon: '🖼️', placeholder: '@granpalacio_bta'       },
  { key: 'facebook',  icon: '👤', placeholder: 'facebook.com/granpalacio' },
  { key: 'twitter',   icon: '🩷', placeholder: '@hotel...'               },
  { key: 'whatsapp',  icon: '💬', placeholder: '+57 310 234 5678'        },
]

// ── API ──────────────────────────────────────────────
async function cargarConfiguracion() {
  loading.value = true
  error.value   = null
  try {
    const res  = await fetch(`${BASE}/configuracion`)
    const data = await res.json()
    configId = data.id ?? data.id_configuracion ?? null

    // Mapear campos — ajusta las keys según lo que devuelva tu API
    form.nombre      = data.nombre      ?? data.nombre_hotel   ?? ''
    form.direccion   = data.direccion   ?? ''
    form.telefono    = data.telefono    ?? ''
    form.nit         = data.nit         ?? data.rif ?? ''
    form.correo      = data.correo      ?? data.email ?? ''
    form.instagram   = data.instagram   ?? ''
    form.facebook    = data.facebook    ?? ''
    form.twitter     = data.twitter     ?? ''
    form.whatsapp    = data.whatsapp    ?? ''
    form.descripcion = data.descripcion ?? ''

    if (data.logo_url) logoPreview.value = data.logo_url
  } catch (e) {
    error.value = 'No se pudo cargar la configuración.'
  } finally {
    loading.value = false
  }
}

async function guardar() {
  loading.value = true
  error.value   = null
  try {
    await fetch(`${BASE}/configuracion`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre:      form.nombre,
        direccion:   form.direccion,
        telefono:    form.telefono,
        nit:         form.nit,
        correo:      form.correo,
        instagram:   form.instagram,
        facebook:    form.facebook,
        twitter:     form.twitter,
        whatsapp:    form.whatsapp,
        descripcion: form.descripcion,
      }),
    })
  } catch (e) {
    error.value = 'Error al guardar la configuración.'
  } finally {
    loading.value = false
  }
}

async function onLogoChange(e) {
  const file = e.target.files[0]
  if (!file) return

  // Preview local inmediato
  const reader = new FileReader()
  reader.onload = ev => { logoPreview.value = ev.target.result }
  reader.readAsDataURL(file)

  // Subir a POST /configuracion (multipart)
  const fd = new FormData()
  fd.append('logo', file)
  try {
    await fetch(`${BASE}/configuracion`, { method: 'POST', body: fd })
    emitDirty()
  } catch {
    error.value = 'Error al subir el logo.'
  }
}

function emitDirty() { emit('dirty') }

// Exponer guardar() para que ConfiguracionView lo llame desde el footer
defineExpose({ guardar })

onMounted(cargarConfiguracion)
</script>

<style scoped>
.config-grid        { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
.config-col-right   { display: flex; flex-direction: column; }
.config-card        { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 4px rgba(99,32,238,.06), 0 4px 16px rgba(0,0,0,.04); border: 1px solid rgba(99,32,238,.07); }
.card-section-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.card-icon          { font-size: 17px; }

.logo-upload-row { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; padding: 16px; background: #f7f4ff; border-radius: 10px; border: 1px dashed #c4b5fd; }
.logo-preview    { width: 72px; height: 72px; border-radius: 12px; background: linear-gradient(135deg,#6320EE,#8075FF); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; overflow: hidden; }
.logo-preview img { width: 100%; height: 100%; object-fit: cover; }
.logo-label  { font-size: 13.5px; font-weight: 600; color: #1a1a2e; margin: 0 0 2px; }
.logo-hint   { font-size: 11.5px; color: #8888aa; margin: 0 0 2px; }
.btn-upload  { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; padding: 6px 14px; background: #fff; border: 1.5px solid #d0cce8; border-radius: 7px; font-size: 12.5px; font-weight: 500; color: #5b21b6; cursor: pointer; transition: all .15s; }
.btn-upload:hover { background: #f5f0ff; border-color: #7c5cbf; }

.field-group  { margin-bottom: 14px; }
.field-label  { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: 1.2px; color: #8888aa; margin-bottom: 5px; text-transform: uppercase; }
.field-input  { width: 100%; padding: 9px 13px; border: 1.5px solid #e2ddf0; border-radius: 8px; font-size: 13.5px; color: #1a1a2e; background: #fdfdff; transition: border-color .15s, box-shadow .15s; box-sizing: border-box; outline: none; }
.field-input:focus { border-color: #7c5cbf; box-shadow: 0 0 0 3px rgba(99,32,238,.08); }
.field-textarea { resize: vertical; min-height: 90px; line-height: 1.5; }
.field-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.social-input-wrap { display: flex; align-items: center; gap: 8px; }
.social-icon       { font-size: 16px; flex-shrink: 0; width: 26px; text-align: center; }
.field-input.social { flex: 1; }

.state-msg       { margin-top: 12px; font-size: 13px; color: #8888aa; }
.state-msg.error { color: #dc2626; }
.mt-3 { margin-top: 12px; }

@media (max-width: 900px) {
  .config-grid { grid-template-columns: 1fr; }
}
</style>