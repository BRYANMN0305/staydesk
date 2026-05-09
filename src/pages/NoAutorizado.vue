<template>
  <div class="no-auth-wrap d-flex flex-column align-items-center justify-content-center min-vh-100"
    style="background:#f4eeff;font-family:'Outfit',sans-serif">
    <div class="text-center p-4">
      <div class="icon-wrap mb-4 mx-auto d-flex align-items-center justify-content-center rounded-circle">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6320EE" stroke-width="1.8">
          <rect x="5" y="11" width="14" height="10" rx="2"/>
          <path d="M8 11V7a4 4 0 018 0v4"/>
          <circle cx="12" cy="16" r="1" fill="#6320EE"/>
        </svg>
      </div>
      <h2 class="fw-bold mb-2" style="color:#211A1D;font-size:22px">Sin acceso</h2>
      <p class="text-muted mb-4" style="font-size:14px;max-width:280px;margin:0 auto 1.5rem">
        No tienes permisos para ver esta sección. Contacta a tu administrador.
      </p>
      <button class="btn-back rounded-3 fw-semibold px-4 py-2 border-0" @click="goBack">
        Volver al inicio
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.push('/dashboard')
</script>

<style scoped>
.icon-wrap {
  width: 72px;
  height: 72px;
  background: rgba(99,32,238,0.1);
}
.btn-back {
  background: linear-gradient(135deg,#6320EE,#8075FF);
  color: #fff;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99,32,238,0.3);
  transition: all .2s;
}
.btn-back:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99,32,238,0.4);
}
</style>