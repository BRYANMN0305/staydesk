<template>
  <div class="config-panel">
    <h2>Panel de Configuración</h2>
    <p>Personaliza el sistema según las necesidades de tu hotel</p>

    <!-- TABS -->
    <div class="config-tabs">
      <button v-for="tab in tabs" :key="tab.key"
        :class="['tab-btn', { active: activeConfig === tab.key }]"
        @click="activeConfig = tab.key">
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- CONTENIDO -->
    <div v-if="activeConfig === 'hotel'" class="config-content">
      <div class="config-grid">
        <!-- Identidad visual -->
        <div class="config-card">
          <h4>🖼️ Identidad visual</h4>
          <!-- logo upload, nombre, dirección, teléfono, NIT, correo -->
        </div>
        <!-- Redes sociales -->
        <div class="config-card">
          <h4>🌐 Redes sociales</h4>
          <!-- campos de instagram, facebook, twitter, whatsapp -->
        </div>
      </div>
    </div>

    <div v-else-if="activeConfig === 'facturacion'">...</div>
    <!-- etc. -->

    <!-- FOOTER -->
    <div class="config-footer">
      <button class="btn-discard">Descartar</button>
      <button class="btn-save">💾 Guardar cambios</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeConfig = ref('hotel')
const tabs = [
  { key: 'hotel',       label: 'Hotel',        icon: '🏨' },
  { key: 'facturacion', label: 'Facturación',   icon: '💰' },
  { key: 'correo',      label: 'Correo SMTP',   icon: '📧' },
  { key: 'roles',       label: 'Roles',         icon: '🔒' },
  { key: 'auditoria',   label: 'Auditoría',     icon: '📋' },
]
</script>