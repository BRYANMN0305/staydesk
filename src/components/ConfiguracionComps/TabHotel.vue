<template>
  <div class="tab-grid">
    <!-- Identidad visual -->
    <div class="config-card">
      <div class="card-title">
        <span class="card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6320EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </span>
        <h4>Identidad visual</h4>
      </div>

      <!-- Logo -->
      <div class="logo-upload-area" :class="{ 'has-preview': logoPreview }">
        <div class="logo-preview">
          <!-- Muestra preview local si existe, si no el logo guardado, si no placeholder -->
          <img v-if="logoPreview || form.logo_url" :src="logoPreview || form.logo_url" alt="Logo hotel" class="logo-img"/>
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

          <!-- Botón seleccionar imagen -->
          <label class="btn-upload" v-if="!logoPreview">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Seleccionar imagen
            <input type="file" accept="image/jpeg,image/png,image/webp" @change="seleccionarLogo" hidden/>
          </label>

          <!-- Acciones cuando hay preview pendiente -->
          <div v-else class="logo-preview-actions">
            <span class="logo-pending-tag">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Sin guardar
            </span>
            <button class="btn-cancel-logo" type="button" @click="cancelarLogo">
              Cancelar
            </button>
            <label class="btn-upload btn-upload-sm">
              Cambiar
              <input type="file" accept="image/jpeg,image/png,image/webp" @change="seleccionarLogo" hidden/>
            </label>
          </div>

          <!-- Error de validación del archivo -->
          <p v-if="errorLogo" class="logo-error">{{ errorLogo }}</p>
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
          <span class="card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6320EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </span>
          <h4>Redes sociales</h4>
        </div>
        <div class="form-grid">
          <div class="field full social-field">
            <span class="social-prefix">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </span>
            <input v-model="form.instagram" @input="$emit('cambio')" placeholder="@hotel"/>
          </div>
          <div class="field full social-field">
            <span class="social-prefix">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </span>
            <input v-model="form.facebook" @input="$emit('cambio')" placeholder="facebook.com/hotel"/>
          </div>
          <div class="field full social-field">
            <span class="social-prefix">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9 9 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.37 4.07 3.58 1.64.9a4.52 4.52 0 0 0-.61 2.27c0 1.57.8 2.95 2.01 3.76a4.49 4.49 0 0 1-2.05-.57v.06c0 2.19 1.56 4.02 3.63 4.43a4.54 4.54 0 0 1-2.04.08 4.53 4.53 0 0 0 4.22 3.14A9.07 9.07 0 0 1 0 19.54a12.8 12.8 0 0 0 6.92 2.03c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.39-.01-.58A9.17 9.17 0 0 0 23 3z"/>
              </svg>
            </span>
            <input v-model="form.twitter" @input="$emit('cambio')" placeholder="@hotel..."/>
          </div>
          <div class="field full social-field">
            <span class="social-prefix">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </span>
            <input v-model="form.whatsapp" @input="$emit('cambio')" placeholder="+57 310 234 5678"/>
          </div>
        </div>
      </div>

      <div class="config-card mt-3">
        <div class="card-title">
          <span class="card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6320EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </span>
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

  <!-- Error guardar -->
  <div v-if="errorGuardar" class="error-banner mt-3">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
    {{ errorGuardar }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['cambio'])
const API_URL = import.meta.env.VITE_API_URL

const errorGuardar = ref(null)
const errorLogo    = ref(null)

// ── NUEVO: estado del preview local ────────────────────────────────────────
// logoPreview: URL temporal (createObjectURL) visible solo antes de guardar.
// logoArchivo: el File real que se sube al guardar.
const logoPreview = ref(null)
const logoArchivo = ref(null)

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

// ── NUEVO: seleccionarLogo — solo crea preview local, NO sube nada ─────────
const seleccionarLogo = (e) => {
  const file = e.target.files[0]
  if (!file) return

  errorLogo.value = null

  // Validar tipo
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']
  if (!tiposPermitidos.includes(file.type)) {
    errorLogo.value = 'Formato no permitido. Usa JPG, PNG o WEBP.'
    e.target.value = ''
    return
  }

  // Validar tamaño (2MB)
  if (file.size > 2 * 1024 * 1024) {
    errorLogo.value = 'El archivo supera el límite de 2MB.'
    e.target.value = ''
    return
  }

  // Liberar URL anterior si existía
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)

  logoArchivo.value = file
  logoPreview.value = URL.createObjectURL(file)
  emit('cambio') // marcar como cambio pendiente en el padre
}

// ── NUEVO: cancelarLogo — descarta el preview sin tocar el logo guardado ───
const cancelarLogo = () => {
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
  logoPreview.value = null
  logoArchivo.value = null
  errorLogo.value   = null
}

// ── guardar — primero sube el logo si hay uno pendiente, luego guarda datos ─
const guardar = async () => {
  errorGuardar.value = null

  // 1. Si hay logo pendiente, subirlo primero con POST /configuracion (multipart)
  if (logoArchivo.value) {
    const fd = new FormData()
    fd.append('file', logoArchivo.value)
    try {
      const res = await fetch(`${API_URL}/configuracion`, {
        method: 'POST',
        headers: authHeaders(false), // sin Content-Type para que el browser ponga el boundary
        body: fd,
      })
      if (res.ok) {
        const data = await res.json()
        // Actualizar logo_url con el definitivo del servidor
        form.value.logo_url = data.logo_url || form.value.logo_url
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || 'Error al subir el logo.')
      }
    } catch (e) {
      errorGuardar.value = e.message
      throw e
    } finally {
      // Limpiar siempre el preview y el archivo pendiente
      if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
      logoPreview.value = null
      logoArchivo.value = null
    }
  }

  // 2. Guardar el resto de datos del hotel con PUT /configuracion
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
    throw new Error(msg)
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
.card-icon {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  background: rgba(99,32,238,0.08);
  border-radius: 8px; flex-shrink: 0;
}

/* Logo */
.logo-upload-area {
  display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem;
  background: rgba(99,32,238,0.04);
  border: 1.5px dashed rgba(99,32,238,0.2);
  border-radius: 12px; padding: 1rem;
  transition: border-color .2s, background .2s;
}
.logo-upload-area.has-preview {
  border-color: rgba(99,32,238,0.4);
  background: rgba(99,32,238,0.06);
}

.logo-preview {
  width: 80px; height: 80px; border-radius: 10px;
  background: rgba(99,32,238,0.08);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  overflow: hidden;
}
.logo-img { width: 100%; height: 100%; object-fit: contain; }
.logo-placeholder { display: flex; align-items: center; justify-content: center; }

.logo-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.logo-label { font-size: 13.5px; font-weight: 700; color: #211A1D; margin: 0 0 3px; }
.logo-sub   { font-size: 11.5px; color: #9ca3af; margin: 0; }
.logo-error { font-size: 12px; color: #dc2626; margin: 4px 0 0; font-weight: 600; }

.btn-upload {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 8px; padding: 6px 14px;
  background: rgba(99,32,238,0.08);
  border: 1.5px solid rgba(99,32,238,0.2);
  border-radius: 8px; font-size: 12.5px; font-weight: 600;
  color: #6320EE; cursor: pointer; font-family: 'Outfit', sans-serif;
  transition: all .2s; white-space: nowrap;
}
.btn-upload:hover { background: rgba(99,32,238,0.15); }
.btn-upload-sm { padding: 5px 10px; font-size: 12px; margin-top: 0; }

/* Acciones del preview pendiente */
.logo-preview-actions {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px;
}
.logo-pending-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; color: #d97706;
  background: rgba(217,119,6,0.1); border: 1px solid rgba(217,119,6,0.25);
  border-radius: 6px; padding: 3px 8px;
}
.btn-cancel-logo {
  font-size: 12px; font-weight: 600; color: #6b7280;
  background: rgba(107,114,128,0.08); border: 1.5px solid rgba(107,114,128,0.2);
  border-radius: 7px; padding: 4px 10px; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all .2s;
}
.btn-cancel-logo:hover { background: rgba(107,114,128,0.15); }

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
.social-prefix { display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #6320EE; }
.social-field input { flex: 1; }

/* Error */
.error-banner {
  display: flex; align-items: center; gap: 8px;
  background: rgba(220,38,38,0.07);
  border: 1px solid rgba(220,38,38,0.2);
  border-radius: 10px; padding: 10px 14px;
  font-size: 13px; color: #dc2626;
}
.mt-3 { margin-top: .75rem; }
</style>