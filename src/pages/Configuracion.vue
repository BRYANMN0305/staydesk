<template>
  <div class="config-wrapper">
    <!-- HEADER -->
    <div class="config-header mb-4">
      <h2 class="fw-bold mb-0" style="font-size:24px;color:#211A1D">Panel de Configuración</h2>
      <p class="text-muted mb-0" style="font-size:13px">Personaliza el sistema según las necesidades de tu hotel</p>
    </div>

    <!-- TABS -->
    <div class="config-tabs mb-4">
      <button v-for="tab in tabs" :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="cambiarTab(tab.key)">
        <span>{{ tab.icon }}</span> {{ tab.label }}
      </button>
    </div>

    <!-- CONTENIDO -->
    <div class="config-content">
      <TabHotel       v-if="activeTab === 'hotel'"       ref="tabHotelRef"       @cambio="marcarCambio" />
      <TabFacturacion v-if="activeTab === 'facturacion'" ref="tabFacturacionRef" @cambio="marcarCambio" />
      <TabSmtp        v-if="activeTab === 'correo'"      ref="tabSmtpRef"        @cambio="marcarCambio" />
      <TabRoles       v-if="activeTab === 'roles'" />
      <TabAuditoria   v-if="activeTab === 'auditoria'" />
    </div>

    <!-- FOOTER: solo tabs con guardado -->
    <div v-if="tabsConGuardado.includes(activeTab)" class="config-footer">
      <span class="footer-estado" :class="{ 'tiene-cambios': hayCambios }">
        {{ hayCambios ? 'Cambios sin guardar' : 'Todo guardado' }}
      </span>
      <button class="btn-descartar" @click="descartar" :disabled="!hayCambios">
        Descartar
      </button>
      <button class="btn-guardar" @click="guardar" :disabled="!hayCambios || guardando">
        <svg v-if="!guardando" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        <span v-if="guardando" class="spinner-sm"></span>
        {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </div>

    <!-- TOAST de feedback -->
    <Transition name="toast">
      <div v-if="toast.visible" class="toast" :class="toast.tipo">
        <span>{{ toast.tipo === 'ok' ? '✅' : '❌' }}</span>
        {{ toast.mensaje }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TabHotel      from '@/components/ConfiguracionComps/TabHotel.vue'
import TabFacturacion from '@/components/ConfiguracionComps/TabFacturacion.vue'
import TabSmtp       from '@/components/ConfiguracionComps/TabSmtp.vue'
import TabRoles      from '@/components/ConfiguracionComps/TabRoles.vue'
import TabAuditoria  from '@/components/ConfiguracionComps/TabAuditoria.vue'

// ── Refs a los hijos que exponen guardar() ─────────────────────────────────
const tabHotelRef       = ref(null)
const tabFacturacionRef = ref(null)
const tabSmtpRef        = ref(null)

// ── Estado ─────────────────────────────────────────────────────────────────
const activeTab  = ref('hotel')
const hayCambios = ref(false)
const guardando  = ref(false)
const toast      = ref({ visible: false, tipo: 'ok', mensaje: '' })

// ── Tabs ───────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'hotel',       label: 'Hotel',        icon: '🏨' },
  { key: 'facturacion', label: 'Facturación',   icon: '💰' },
  { key: 'correo',      label: 'Correo SMTP',   icon: '📧' },
  { key: 'roles',       label: 'Roles',         icon: '🔒' },
  { key: 'auditoria',   label: 'Auditoría',     icon: '📋' },
]

// Tabs que tienen botón guardar en el footer
const tabsConGuardado = ['hotel', 'facturacion', 'correo']

// ── Helpers ────────────────────────────────────────────────────────────────
const mostrarToast = (tipo, mensaje) => {
  toast.value = { visible: true, tipo, mensaje }
  setTimeout(() => { toast.value.visible = false }, 3000)
}

// Al cambiar de tab, no perder el estado de cambios no guardados
const cambiarTab = (key) => {
  activeTab.value = key
  // Resetear flag solo si entramos a un tab sin guardar
  if (!tabsConGuardado.includes(key)) hayCambios.value = false
}

const marcarCambio = () => { hayCambios.value = true }

const descartar = () => {
  // Recargar el tab actual volviendo a montarlo
  const tab = activeTab.value
  activeTab.value = ''
  // Micro tick para forzar unmount + remount y que el tab recargue desde la API
  setTimeout(() => { activeTab.value = tab }, 50)
  hayCambios.value = false
}

// ── GUARDAR REAL ────────────────────────────────────────────────────────────
// Cada tab hijo expone guardar() via defineExpose.
// El padre simplemente delega al hijo activo.
const guardar = async () => {
  guardando.value = true
  try {
    if (activeTab.value === 'hotel'       && tabHotelRef.value)       await tabHotelRef.value.guardar()
    if (activeTab.value === 'facturacion' && tabFacturacionRef.value) await tabFacturacionRef.value.guardar()
    if (activeTab.value === 'correo'      && tabSmtpRef.value)        await tabSmtpRef.value.guardar()

    hayCambios.value = false
    mostrarToast('ok', 'Cambios guardados correctamente')
  } catch (e) {
    console.error('Error al guardar:', e)
    mostrarToast('error', 'Ocurrió un error al guardar. Intenta de nuevo.')
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.config-wrapper {
  font-family: 'Outfit', sans-serif;
  position: relative;
  padding-bottom: 80px;
}

/* ── Tabs ── */
.config-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid rgba(99,32,238,0.08);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 2px 12px rgba(33,26,29,0.05);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border: none;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  background: transparent;
  color: #6b7280;
  transition: all .2s;
  white-space: nowrap;
}

.tab-btn:hover  { background: rgba(99,32,238,0.06); color: #6320EE; }
.tab-btn.active { background: #6320EE; color: #fff; box-shadow: 0 4px 12px rgba(99,32,238,0.3); }

/* ── Footer ── */
.config-footer {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 240px;   /* ancho del sidebar — ajusta si tu sidebar tiene otro ancho */
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(99,32,238,0.1);
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  z-index: 50;
}

.footer-estado { font-size: 13px; color: #9ca3af; margin-right: auto; }
.footer-estado.tiene-cambios { color: #d97706; font-weight: 600; }

.btn-descartar {
  padding: 9px 20px;
  border-radius: 10px;
  border: 1.5px solid rgba(99,32,238,0.2);
  background: none;
  color: #6b7280;
  font-size: 13.5px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all .2s;
}
.btn-descartar:hover:not(:disabled) { background: rgba(99,32,238,0.05); color: #6320EE; }
.btn-descartar:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-guardar {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 22px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #6320EE, #8075FF);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99,32,238,0.35);
  transition: all .2s;
}
.btn-guardar:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,32,238,0.45); }
.btn-guardar:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* ── Spinner ── */
.spinner-sm {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 80px;
  right: 32px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.toast.ok    { background: #f0fdf4; color: #15803d; border: 1px solid rgba(22,163,74,0.25); }
.toast.error { background: #fef2f2; color: #dc2626; border: 1px solid rgba(220,38,38,0.25); }

.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>