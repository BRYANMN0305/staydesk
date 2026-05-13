<template>
    <aside class="sidebar d-flex flex-column h-100" :class="{ 'sidebar-open': modelValue }">

        <!-- HEADER -->
        <div class="sidebar-header d-flex align-items-center justify-content-between px-3 py-3">
            <AppLogo />
            <button class="d-md-none btn-close-sidebar border-0 bg-transparent p-1"
                @click="$emit('update:modelValue', false)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- NAV -->
        <nav class="flex-grow-1 px-3 py-1 overflow-auto">

            <!-- MENU DINÁMICO POR SECCIONES -->
            <div v-for="section in menuSections" :key="section.label" class="mb-2">
                <span class="nav-label d-block mb-1">{{ section.label }}</span>

                <a v-for="item in section.items" :key="item.key" href="#"
                    class="nav-item d-flex align-items-center gap-2 rounded-3 px-3 py-2 mb-1 text-decoration-none"
                    :class="{ active: activeTab === item.key }"
                    @click.prevent="$emit('update:activeTab', item.key)">

                    <!-- ICONOS -->
                    <svg v-if="item.key === 'dashboard'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>

                    <svg v-else-if="item.key === 'usuarios'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        <circle cx="19" cy="19" r="3" />
                        <path d="M19 17v1l1 1" />
                    </svg>

                    <svg v-else-if="item.key === 'habitaciones'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <path d="M2 20v-6h20v6" />
                        <path d="M2 14v-4a2 2 0 012-2h16a2 2 0 012 2v4" />
                        <path d="M7 8V6a1 1 0 011-1h3a1 1 0 011 1v2M13 8V6a1 1 0 011-1h3a1 1 0 011 1v2" />
                    </svg>

                    <svg v-else-if="item.key === 'huespedes'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <circle cx="10" cy="7" r="4" />
                        <path d="M2 20c0-4 3.6-7 8-7" />
                        <rect x="14" y="13" width="8" height="7" rx="1" />
                        <path d="M17 13v-2a1 1 0 012 0v2" />
                    </svg>

                    <svg v-else-if="item.key === 'pisos'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M3 15h18" />
                    </svg>

                    <svg v-else-if="item.key === 'servicios'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>

                    <svg v-else-if="item.key === 'reservas'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>

                    <svg v-else-if="item.key === 'facturacion' || item.key === 'facturas'" width="17" height="17"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M8 13h8M8 17h5" />
                    </svg>

                    <svg v-else-if="item.key === 'reportes'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <path d="M18 20V10" />
                        <path d="M12 20V4" />
                        <path d="M6 20v-6" />
                    </svg>

                    <svg v-else-if="item.key === 'housekeeping'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <path d="M6 7h12l-1.5 11a2 2 0 01-2 1.8H9.5a2 2 0 01-2-1.8L6 7z" stroke-linejoin="round" />
                        <path d="M4 7h16" stroke-linecap="round" />
                        <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" stroke-linejoin="round" />
                        <path d="M10 12h4M9 15.5h6" stroke-linecap="round" opacity="0.7" />
                    </svg>

                    <svg v-else-if="item.key === 'mantenimiento'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a6 6 0 01-7.4 7.4l-6.3 6.3a2.12 2.12 0 01-3-3l6.3-6.3a6 6 0 017.4-7.4l-3 3z"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                    <svg v-else-if="item.key === 'configuracion'" width="17" height="17" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>

                    <svg v-else-if="item.key === 'roles'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>

                    <!-- DEFAULT -->
                    <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <circle cx="12" cy="12" r="3" />
                    </svg>

                    {{ item.label }}

                    <!-- Badge alerta mantenimientos retrasados -->
                    <span
                        v-if="item.key === 'mantenimiento' && mantenimientosRetrasados > 0"
                        class="mt-alerta-badge"
                    >
                        {{ mantenimientosRetrasados }}
                    </span>
                </a>
            </div>
        </nav>

        <!-- USUARIO -->
        <div class="sidebar-user d-flex align-items-center gap-2 px-3 py-3">
            <div class="user-avatar d-flex align-items-center justify-content-center rounded-circle fw-bold text-white">
                {{ iniciales }}
            </div>
            <div class="flex-grow-1 min-width-0">
                <span class="d-block fw-semibold text-truncate" style="font-size:13px; color:#F8F0FB">
                    {{ nombre || (rol === 'admin' ? 'Administrador' : 'Empleado') }}
                </span>
                <span class="d-block" style="font-size:11px; color:rgba(248,240,251,0.4)">
                    {{ rol }}
                </span>
            </div>
            <button class="border-0 bg-transparent p-1 logout-btn" @click="$emit('logout')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
            </button>
        </div>

    </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLogo from '@/components/AppLogo.vue'
import { usePermissions } from '../composables/usePermissions'

defineProps({
    modelValue: Boolean,
    activeTab: String
})

defineEmits(['update:modelValue', 'update:activeTab', 'logout'])

const { filterSidebarItems } = usePermissions()

const nombre = localStorage.getItem('nombre') || ''
const rol = localStorage.getItem('rol') || ''
const iniciales = nombre
    ? nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??'

// ── Badge mantenimientos retrasados ──────────────────────────────────────
const mantenimientosRetrasados = ref(0)

onMounted(async () => {
    try {
        // TODO: cuando el backend tenga el endpoint, descomentar esto:
        // const token = localStorage.getItem('token')
        // const res = await fetch('https://staydesk-apis-dev.duckdns.org/mantenimientos', {
        //     headers: { Authorization: `Bearer ${token}` }
        // })
        // if (!res.ok) return
        // const data = await res.json()
        // const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
        // mantenimientosRetrasados.value = data.filter(m =>
        //     m.estado !== 'COMPLETADO' && m.estado !== 'CANCELADO' &&
        //     new Date(m.fecha_programada) < hoy
        // ).length
    } catch {}
})

// ── Menú ─────────────────────────────────────────────────────────────────
const todosLosItems = [
    { tab: 'dashboard',     label: 'Dashboard',     section: 'Principal' },
    { tab: 'reservas',      label: 'Reservas',       section: 'Principal' },
    { tab: 'habitaciones',  label: 'Habitaciones',   section: 'Principal' },
    { tab: 'pisos',         label: 'Pisos',          section: 'Principal' },
    { tab: 'huespedes',     label: 'Huéspedes',      section: 'Operaciones' },
    { tab: 'housekeeping',  label: 'Housekeeping',   section: 'Operaciones' },
    { tab: 'mantenimiento', label: 'Mantenimiento',  section: 'Operaciones' },
    { tab: 'servicios',     label: 'Servicios',      section: 'Operaciones' },
    { tab: 'facturas',      label: 'Facturas',       section: 'Operaciones' },
    { tab: 'usuarios',      label: 'Usuarios',       section: 'Sistema' },
    { tab: 'roles',         label: 'Roles',          section: 'Sistema' },
    { tab: 'reportes',      label: 'Reportes',       section: 'Sistema' },
    { tab: 'configuracion', label: 'Configuración',  section: 'Sistema' },
]

const filtered = filterSidebarItems(todosLosItems)
    .map(i => ({ key: i.tab, label: i.label, section: i.section }))

const sectionOrder = ['Principal', 'Operaciones', 'Sistema']
const menuSections = sectionOrder
    .map(label => ({ label, items: filtered.filter(i => i.section === label) }))
    .filter(s => s.items.length > 0)
</script>

<style scoped>
.sidebar {
    width: 240px;
    min-width: 240px;
    background: linear-gradient(170deg, #211A1D 0%, #2e0f5e 50%, #3b1180 100%);
    transition: transform .3s cubic-bezier(.22, 1, .36, 1);
}

.sidebar-header {
    border-bottom: 1px solid rgba(248, 240, 251, 0.08);
}

.btn-close-sidebar {
    color: rgba(248, 240, 251, 0.5);
    cursor: pointer;
}

.nav-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(248, 240, 251, 0.3);
    padding: 0 8px;
}

.nav-item {
    font-size: 13.5px;
    font-weight: 500;
    color: rgba(248, 240, 251, 0.55);
    transition: all .2s;
    line-height: 1.3;
}

.nav-item:hover {
    background: rgba(248, 240, 251, 0.07);
    color: rgba(248, 240, 251, 0.85);
}

.nav-item.active {
    background: rgba(99, 32, 238, 0.30);
    color: #F8F0FB;
    border: 1px solid rgba(128, 117, 255, 0.25);
}

.sidebar-user {
    border-top: 1px solid rgba(248, 240, 251, 0.08);
}

.user-avatar {
    width: 36px;
    height: 36px;
    font-size: 13px;
    background: linear-gradient(135deg, #6320EE, #8075FF);
}

.logout-btn {
    color: rgba(248, 240, 251, 0.35);
    cursor: pointer;
    transition: color .2s;
}

.logout-btn:hover {
    color: rgba(248, 240, 251, 0.7);
}

/* Badge alerta mantenimiento */
.mt-alerta-badge {
    margin-left: auto;
    background: #F59E0B;
    color: #1a1a1a;
    font-size: 10px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    animation: pulse-warn 2s infinite;
}

@keyframes pulse-warn {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

/* Mobile */
@media (max-width: 767px) {
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 100;
        transform: translateX(-100%);
    }

    .sidebar.sidebar-open {
        transform: translateX(0);
    }
}
</style>