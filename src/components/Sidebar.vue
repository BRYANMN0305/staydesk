<template>
    <aside class="sidebar d-flex flex-column h-100" :class="{ 'sidebar-open': modelValue }">

        <!-- HEADER -->
        <div class="sidebar-header d-flex align-items-center justify-content-between px-3 py-4">
            <AppLogo />
            <button class="d-md-none btn-close-sidebar border-0 bg-transparent p-1"
                @click="$emit('update:modelValue', false)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- NAV -->
        <nav class="flex-grow-1 px-3 py-2 overflow-auto">

            <!-- MENU DINÁMICO -->
            <div class="mb-4">
                <span class="nav-label d-block mb-2">Principal</span>

                <a v-for="item in menu" :key="item.key" href="#"
                    class="nav-item d-flex align-items-center gap-2 rounded-3 px-3 py-2 mb-1 text-decoration-none"
                    :class="{ active: activeTab === item.key }" @click.prevent="$emit('update:activeTab', item.key)">

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
                        <!-- Campana -->
                        <!-- Estrella / calidad de servicio -->
                        <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>

                    <svg v-else-if="item.key === 'reservas'" width="17" height="17" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>

                    <svg v-else-if="item.key === 'facturacion' || item.key === 'facturas'" width="17" height="17"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <!-- Documento con líneas de contenido -->
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

                    <!-- DEFAULT -->
                    <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <circle cx="12" cy="12" r="3" />
                    </svg>

                    {{ item.label }}
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
import AppLogo from '@/components/AppLogo.vue'

defineProps({
    modelValue: Boolean,
    activeTab: String
})

defineEmits(['update:modelValue', 'update:activeTab', 'logout'])

const rol = localStorage.getItem('rol')
const nombre = localStorage.getItem('nombre') || localStorage.getItem('name') || ''
const iniciales = nombre
    ? nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : (rol === 'admin' ? 'AD' : 'EM')

const menuAdmin = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'pisos', label: 'Pisos' },
    { key: 'habitaciones', label: 'Habitaciones' },
    { key: 'huespedes', label: 'Huéspedes' },
    { key: 'servicios', label: 'Servicios' },
    { key: 'reservas', label: 'Reservas' },
    { key: 'facturas', label: 'Facturas' },
    { key: 'reportes', label: 'Reportes' }
]

const menuEmpleado = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'habitaciones', label: 'Habitaciones' },
    { key: 'huespedes', label: 'Huéspedes' },
    { key: 'reservas', label: 'Reservas' },
    { key: 'facturas', label: 'Facturas' }
]

const menu = rol === 'admin' ? menuAdmin : menuEmpleado
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
    font-size: 14px;
    font-weight: 500;
    color: rgba(248, 240, 251, 0.55);
    transition: all .2s;
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