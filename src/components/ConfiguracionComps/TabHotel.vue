<template>
  <div class="tab-grid">
    <!-- Identidad visual -->
    <div class="config-card">
      <div class="card-title">
        <span class="card-icon">🖼️</span>
        <h4>Identidad visual</h4>
      </div>

      <!-- Logo -->
      <div class="logo-upload-area">
        <div class="logo-preview">
          <img v-if="form.logo_url" :src="form.logo_url" alt="Logo hotel" class="logo-img"/>
          <div v-else class="logo-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6320EE" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        </div>
        <div class="logo-info">
          <p class="logo-label">Logo del hotel</p>
          <p class="logo-sub">JPG, PNG o WEBP · Máx. 2MB</p>
          <p class="logo-sub">Aparece en el sistema y en las facturas</p>
          <label class="btn-upload">
            📁 Subir imagen
            <input type="file" accept="image/*" @change="subirLogo" hidden/>
          </label>
        </div>
      </div>

      <div class="form-grid">
        <div class="field full">
          <label>Nombre del hotel</label>
          <input v-model="form.nombre" @input="$emit('cambio')" placeholder="Ej: Hotel Gran Palacio"/>
        </div>
        <div class="field full">
          <label>Dirección</label>
          <input v-model="form.direccion" @input="$emit('cambio')" placeholder="Av. Libertador 1234, Bogotá"/>
        </div>
        <div class="field">
          <label>Teléfono</label>
          <input v-model="form.telefono" @input="$emit('cambio')" placeholder="+57 1 234 5678"/>
        </div>
        <div class="field">
          <label>RIF / NIT</label>
          <input v-model="form.nit" @input="$emit('cambio')" placeholder="900.123.456-1"/>
        </div>
        <div class="field full">
          <label>Correo de contacto</label>
          <input v-model="form.email" @input="$emit('cambio')" type="email" placeholder="contacto@hotel.co"/>
        </div>
      </div>
    </div>

    <!-- Redes sociales + Info adicional -->
    <div class="right-col">
      <div class="config-card">
        <div class="card-title">
          <span class="card-icon">🌐</span>
          <h4>Redes sociales</h4>
        </div>
        <div class="form-grid">
          <div class="field full social-field">
            <span class="social-prefix">📸</span>
            <input v-model="form.instagram" @input="$emit('cambio')" placeholder="@hotel"/>
          </div>
          <div class="field full social-field">
            <span class="social-prefix">👤</span>
            <input v-model="form.facebook" @input="$emit('cambio')" placeholder="facebook.com/hotel"/>
          </div>
          <div class="field full social-field">
            <span class="social-prefix">🐦</span>
            <input v-model="form.twitter" @input="$emit('cambio')" placeholder="@hotel..."/>
          </div>
          <div class="field full social-field">
            <span class="social-prefix">💬</span>
            <input v-model="form.whatsapp" @input="$emit('cambio')" placeholder="+57 310 234 5678"/>
          </div>
        </div>
      </div>

      <div class="config-card mt-3">
        <div class="card-title">
          <span class="card-icon">ℹ️</span>
          <h4>Información adicional</h4>
        </div>
        <div class="field full">
          <label>Descripción del hotel</label>
          <textarea v-model="form.descripcion" @input="$emit('cambio')"
            placeholder="Hotel boutique de lujo..." rows="4"></textarea>
        </div>
      </div>
    </div>
  </div>

  <!-- Error -->
  <div v-if="errorGuardar" class="error-banner mt-3">⚠️ {{ errorGuardar }}</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['cambio'])
const API_URL = import.meta.env.VITE_API_URL

const errorGuardar = ref(null)

const form = ref({
  nombre: '', direccion: '', telefono: '', nit: '', email: '',
  logo_url: '', instagram: '', facebook: '', twitter: '', whatsapp: '', descripcion: ''
})

const authHeaders = (json = true) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const h = token ? { Authorization: `Bearer ${token}` } : {}
  if (json) h['Content-Type'] = 'application/json'
  return h
}

// ── Cargar ────────────────────────────────────────────────────────────────
const cargar = async () => {
  errorGuardar.value = null
  try {
    const res = await fetch(`${API_URL}/configuracion`, { headers: authHeaders() })
    if (!res.ok) return
    const data = await res.json()
    form.value = {
      nombre:      data.nombre_hotel  || '',
      direccion:   data.direccion     || '',
      telefono:    data.telefono      || '',
      nit:         data.nit           || '',
      email:       data.email         || '',
      logo_url:    data.logo_url      || '',
      instagram:   data.instagram     || '',
      facebook:    data.facebook      || '',
      twitter:     data.twitter       || '',
      whatsapp:    data.whatsapp      || '',
      descripcion: data.descripcion   || '',
    }
  } catch (e) {
    console.error('Error cargando configuración:', e)
  }
}

// ── Subir logo ────────────────────────────────────────────────────────────
const subirLogo = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await fetch(`${API_URL}/configuracion`, {
      method: 'POST',
      headers: authHeaders(false), // sin Content-Type, lo pone el browser con el boundary
      body: fd,
    })
    if (res.ok) {
      const data = await res.json()
      form.value.logo_url = data.logo_url || URL.createObjectURL(file)
      emit('cambio')
    }
  } catch (e) {
    console.error('Error subiendo logo:', e)
  }
}

// ── Guardar — expuesto al padre (Configuracion.vue) ───────────────────────
const guardar = async () => {
  errorGuardar.value = null
  const res = await fetch(`${API_URL}/configuracion`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      nombre_hotel: form.value.nombre,
      direccion:    form.value.direccion,
      telefono:     form.value.telefono,
      nit:          form.value.nit,
      email:        form.value.email,
      instagram:    form.value.instagram,
      facebook:     form.value.facebook,
      twitter:      form.value.twitter,
      whatsapp:     form.value.whatsapp,
      descripcion:  form.value.descripcion,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.detail || 'Error al guardar la información del hotel.'
    errorGuardar.value = msg
    throw new Error(msg) // el padre lo captura en su try/catch
  }
}

defineExpose({ guardar })
onMounted(cargar)
</script>

<style scoped>
.tab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media(max-width:900px){ .tab-grid { grid-template-columns: 1fr; } }

.right-col { display: flex; flex-direction: column; gap: .75rem; }

.config-card {
  background: #fff;
  border: 1px solid rgba(99,32,238,0.08);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(33,26,29,0.05);
}

.card-title { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; }
.card-title h4 { margin: 0; font-size: 15px; font-weight: 700; color: #211A1D; }
.card-icon { font-size: 18px; }

/* Logo */
.logo-upload-area {
  display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem;
  background: rgba(99,32,238,0.04);
  border: 1.5px dashed rgba(99,32,238,0.2);
  border-radius: 12px; padding: 1rem;
}
.logo-preview {
  width: 80px; height: 80px; border-radius: 10px;
  background: rgba(99,32,238,0.08);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  overflow: hidden;
}
.logo-img { width: 100%; height: 100%; object-fit: contain; }
.logo-placeholder { display: flex; align-items: center; justify-content: center; }
.logo-label { font-size: 13.5px; font-weight: 700; color: #211A1D; margin: 0 0 3px; }
.logo-sub { font-size: 11.5px; color: #9ca3af; margin: 0 0 2px; }
.btn-upload {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 8px; padding: 6px 14px;
  background: rgba(99,32,238,0.08);
  border: 1.5px solid rgba(99,32,238,0.2);
  border-radius: 8px; font-size: 12.5px; font-weight: 600;
  color: #6320EE; cursor: pointer; font-family: 'Outfit', sans-serif;
  transition: all .2s;
}
.btn-upload:hover { background: rgba(99,32,238,0.15); }

/* Form */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field.full { grid-column: 1 / -1; }

.field label {
  font-size: 11px; font-weight: 700; letter-spacing: .6px;
  text-transform: uppercase; color: #9ca3af;
}
.field input, .field textarea {
  border: 1.5px solid rgba(99,32,238,0.15);
  border-radius: 10px; padding: 9px 13px;
  font-size: 13.5px; font-family: 'Outfit', sans-serif;
  color: #211A1D; background: #faf8ff; outline: none;
  transition: border-color .2s; resize: none;
}
.field input:focus, .field textarea:focus { border-color: #6320EE; }
.field input::placeholder, .field textarea::placeholder { color: #c4b8d0; }

/* Social */
.social-field { flex-direction: row !important; align-items: center; gap: 8px; }
.social-prefix { font-size: 16px; flex-shrink: 0; }
.social-field input { flex: 1; }

/* Error */
.error-banner {
  background: rgba(220,38,38,0.07);
  border: 1px solid rgba(220,38,38,0.2);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  color: #dc2626;
}
.mt-3 { margin-top: .75rem; }
</style>