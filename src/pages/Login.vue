<template>
    <div class="container-fluid min-vh-100 p-0">
        <div class="row g-0 min-vh-100">
            <div class="col-12 col-md-5 col-xl-4 left-panel d-flex flex-column justify-content-center align-items-center px-4 px-md-5">
                <div class="align-self-start mb-4">
                    <AppLogo />
                </div>
                <div class="card login-card w-100">
                    <div class="card-body p-4">
                        <div class="mb-4">
                            <h2 class="fw-bold mb-1">Iniciar Sesión</h2>
                            <p class="text-muted small mb-0">Accede al panel de gestión</p>
                        </div>
                        <form @submit.prevent="login" novalidate>
                            <EntradaFormulario label="Usuario" v-model="email" placeholder="Ingresa tu usuario"
                                :error="errors.email" @blur="validateEmail">
                                <template #icon>
                                    <svg class="field-icon me-2" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="1.8">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                    </svg>
                                </template>
                            </EntradaFormulario>
                            <EntradaFormulario label="Contraseña" v-model="password" placeholder="••••••••"
                                type="password" :error="errors.password" @blur="validatePassword">
                                <template #icon>
                                    <svg class="field-icon me-2" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="1.8">
                                        <rect x="5" y="11" width="14" height="10" rx="2" />
                                        <path d="M8 11V7a4 4 0 018 0v4" />
                                    </svg>
                                </template>
                            </EntradaFormulario>
                            <div v-if="apiError" class="alert-error mb-3 rounded-3 px-3 py-2 d-flex align-items-center gap-2">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" style="flex-shrink:0;color:#dc2626">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 8v4M12 16h.01" />
                                </svg>
                                <span style="font-size:13px;color:#dc2626">{{ apiError }}</span>
                            </div>
                            <button type="submit" class="btn-login w-100 mt-4" :disabled="loading">
                                <span v-if="!loading" class="d-flex align-items-center justify-content-center gap-2">
                                    Iniciar Sesión
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </span>
                                <span v-else class="spinner"></span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-md-7 col-xl-8 d-none d-md-flex right-panel align-items-end p-5">
                <div class="right-overlay"></div>
                <div class="right-content position-relative">
                    <div class="badge-premium mb-3"><span>✦</span> Panel Administrativo</div>
                    <h3 class="text-white fw-bold">Gestiona tu hotel<br />desde un solo lugar</h3>
                    <p class="right-desc">Control total de reservas, habitaciones, personal y reportes.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import AppLogo from '@/components/AppLogo.vue'
import EntradaFormulario from '@/components/EntradaFormulario.vue'
import AuthService from '@/services/AuthService'
import { getPrimeraVista } from '@/router'   // ← importar helper

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authService = new AuthService()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errors = reactive({ email: '', password: '' })
const apiError = ref('')

const validateEmail = () => { errors.email = !email.value ? 'El usuario es requerido' : '' }
const validatePassword = () => {
  errors.password = !password.value ? 'La contraseña es requerida'
    : password.value.length < 4 ? 'Mínimo 4 caracteres' : ''
}

const login = async () => {
  validateEmail()
  validatePassword()
  if (errors.email || errors.password) return
  apiError.value = ''
  loading.value = true
  const emailNormalizado = email.value.trim().toLowerCase()
  try {
    const data = await authService.login(emailNormalizado, password.value)
    const token = data.access_token || data.token || data.access
    localStorage.setItem('token', token)

    const payload = JSON.parse(atob(token.split('.')[1]))
    const nombre = `${payload.nombre || ''} ${payload.apellido || ''}`.trim()
    localStorage.setItem('nombre', nombre)
    localStorage.setItem('rol', payload.nombre_rol || 'Sin rol')

    // Redirigir a la primera vista a la que tiene acceso
    router.push(`/${getPrimeraVista()}`)
  } catch (error) {
    apiError.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
.left-panel { background: linear-gradient(155deg, #211A1D 0%, #3a1060 45%, #6320EE 100%); min-height: 100vh; }
.login-card { border-radius: 20px; border: none; background: #F8F0FB; box-shadow: 0 28px 60px rgba(33,26,29,0.45); }
.login-card .card-body h2 { color: #211A1D; font-size: 25px; }
.login-card::before { content:''; position:absolute; top:0; left:34px; right:34px; height:3px; background:linear-gradient(90deg,#6320EE,#8075FF); border-radius:0 0 4px 4px; }
.btn-login { padding:13.5px; background:linear-gradient(135deg,#6320EE,#8075FF 55%,#9a8fff); color:#fff; font-size:15px; font-weight:700; border:none; border-radius:10px; cursor:pointer; box-shadow:0 6px 20px rgba(99,32,238,0.42); transition:transform .2s,box-shadow .2s; }
.btn-login:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(99,32,238,0.52); }
.btn-login:disabled { opacity:0.65; cursor:not-allowed; }
.spinner { width:20px; height:20px; border:2.5px solid rgba(255,255,255,0.35); border-top-color:white; border-radius:50%; display:inline-block; animation:spin .75s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.right-panel { background:url('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=85') no-repeat center/cover; position:relative; min-height:100vh; }
.right-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(33,26,29,0.92) 0%,rgba(99,32,238,0.25) 55%,transparent 100%); }
.right-content h3 { font-size:36px; letter-spacing:-0.8px; line-height:1.2; margin-bottom:12px; }
.right-desc { color:rgba(248,240,251,0.65); font-size:15px; font-weight:300; line-height:1.6; }
.badge-premium { display:inline-flex; align-items:center; gap:6px; background:rgba(128,117,255,0.18); border:1px solid rgba(128,117,255,0.35); backdrop-filter:blur(8px); border-radius:999px; padding:5px 14px; font-size:12px; font-weight:600; color:#c4b5fd; letter-spacing:0.5px; }
.field-icon { color:#9ca3af; flex-shrink:0; }
.alert-error { background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); }
</style>