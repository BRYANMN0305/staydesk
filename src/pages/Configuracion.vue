<template>
  <div class="config-wrapper">

    <!-- PANEL ÚNICO: header + tabs + contenido (igual que Mantenimiento) -->
    <div class="config-panel">

      <!-- HEADER dentro del panel -->
      <div class="panel-header">
        <div class="panel-header-left">
          <div class="panel-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6320EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <div>
            <h2 class="panel-title">Panel de Configuración</h2>
            <p class="panel-subtitle">Personaliza el sistema según las necesidades de tu hotel</p>
          </div>
        </div>
      </div>

      <div class="panel-divider"></div>

      <!-- TABS -->
      <div class="config-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="cambiarTab(tab.key)"
        >
          <component :is="tab.icon" class="tab-icon" />
          {{ tab.label }}
        </button>
      </div>

      <div class="panel-divider"></div>

      <!-- CONTENIDO -->
      <div class="config-content">
        <TabHotel       v-if="activeTab === 'hotel'"       ref="tabHotelRef"       @cambio="marcarCambio" />
        <TabFacturacion v-if="activeTab === 'facturacion'" ref="tabFacturacionRef" @cambio="marcarCambio" />
        <TabSmtp        v-if="activeTab === 'correo'"      ref="tabSmtpRef"        @cambio="marcarCambio" />
        <TabRoles       v-if="activeTab === 'roles'" />
        <TabAuditoria   v-if="activeTab === 'auditoria'" />
      </div>

    </div>

    <!-- FOOTER fijo -->
    <div v-if="tabsConGuardado.includes(activeTab)" class="config-footer">
      <span class="footer-estado" :class="{ 'tiene-cambios': hayCambios }">
        {{ hayCambios ? 'Cambios sin guardar' : 'Todo guardado' }}
      </span>
      <button class="btn-descartar" @click="descartar" :disabled="!hayCambios">
        Descartar
      </button>
      <button class="btn-guardar" @click="guardar" :disabled="!hayCambios || guardando">
        <svg v-if="!guardando" width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        <span v-if="guardando" class="spinner-sm"></span>
        {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </div>

    <!-- TOAST -->
    <Transition name="toast">
      <div v-if="toast.visible" class="toast" :class="toast.tipo">
        <svg v-if="toast.tipo === 'ok'" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ toast.mensaje }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, defineComponent, h } from 'vue'
import TabHotel       from '@/components/ConfiguracionComps/TabHotel.vue'
import TabFacturacion from '@/components/ConfiguracionComps/TabFacturacion.vue'
import TabSmtp        from '@/components/ConfiguracionComps/TabSmtp.vue'
import TabRoles       from '@/components/ConfiguracionComps/TabRoles.vue'
import TabAuditoria   from '@/components/ConfiguracionComps/TabAuditoria.vue'

const IconHotel = defineComponent({
  render: () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
    h('polyline', { points: '9 22 9 12 15 12 15 22' }),
  ])
})
const IconFacturacion = defineComponent({
  render: () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('line', { x1: 12, y1: 1, x2: 12, y2: 23 }),
    h('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }),
  ])
})
const IconCorreo = defineComponent({
  render: () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
    h('polyline', { points: '22,6 12,13 2,6' }),
  ])
})
const IconRoles = defineComponent({
  render: () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 }),
    h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }),
  ])
})
const IconAuditoria = defineComponent({
  render: () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
    h('line', { x1: 16, y1: 13, x2: 8, y2: 13 }),
    h('line', { x1: 16, y1: 17, x2: 8, y2: 17 }),
    h('polyline', { points: '10 9 9 9 8 9' }),
  ])
})

const tabHotelRef       = ref(null)
const tabFacturacionRef = ref(null)
const tabSmtpRef        = ref(null)

const activeTab  = ref('hotel')
const hayCambios = ref(false)
const guardando  = ref(false)
const toast      = ref({ visible: false, tipo: 'ok', mensaje: '' })

const tabs = [
  { key: 'hotel',       label: 'Hotel',      icon: IconHotel },
  { key: 'facturacion', label: 'Facturación', icon: IconFacturacion },
  { key: 'correo',      label: 'Correo SMTP', icon: IconCorreo },
  { key: 'roles',       label: 'Roles',       icon: IconRoles },
  { key: 'auditoria',   label: 'Auditoría',   icon: IconAuditoria },
]

const tabsConGuardado = ['hotel', 'facturacion', 'correo']

const mostrarToast = (tipo, mensaje) => {
  toast.value = { visible: true, tipo, mensaje }
  setTimeout(() => { toast.value.visible = false }, 3000)
}

const cambiarTab = (key) => {
  activeTab.value = key
  if (!tabsConGuardado.includes(key)) hayCambios.value = false
}

const marcarCambio = () => { hayCambios.value = true }

const descartar = () => {
  const tab = activeTab.value
  activeTab.value = ''
  setTimeout(() => { activeTab.value = tab }, 50)
  hayCambios.value = false
}

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
  padding-bottom: 80px;
  position: relative;
}

/* ── Panel único ── */
.config-panel {
  background: #fff;
  border: 1px solid rgba(99,32,238,0.08);
  border-radius: 20px;
  box-shadow: 0 2px 16px rgba(33,26,29,0.06);
  overflow: hidden;
}

/* ── Header ── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
}
.panel-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.panel-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(99,32,238,0.08);
  border-radius: 12px;
  flex-shrink: 0;
}
.panel-title {
  font-size: 20px;
  font-weight: 700;
  color: #211A1D;
  margin: 0 0 2px;
  line-height: 1.2;
}
.panel-subtitle {
  font-size: 12.5px;
  color: #9ca3af;
  margin: 0;
}

/* ── Divisor ── */
.panel-divider {
  height: 1px;
  background: rgba(99,32,238,0.07);
}

/* ── Tabs ── */
.config-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: #faf8ff;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  background: transparent;
  color: #6b7280;
  transition: all .2s;
  white-space: nowrap;
}
.tab-btn:hover  { background: rgba(99,32,238,0.07); color: #6320EE; }
.tab-btn.active { background: #6320EE; color: #fff; box-shadow: 0 3px 10px rgba(99,32,238,0.3); }
.tab-icon { flex-shrink: 0; }

/* ── Contenido ── */
.config-content {
  padding: 1.5rem;
}

/* ── Footer fijo ── */
.config-footer {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 240px;
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