<template>
    <div class="room-card position-relative overflow-hidden rounded-3 p-3 cursor-pointer" :class="cardClass"
        @click="$emit('click')">
        <div class="room-status-bar"></div>
        <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="room-number fw-bold">{{ number }}</span>
            <span class="badge room-badge">{{ statusLabel }}</span>
        </div>
        <div class="room-type text-secondary small mb-3">{{ type }}</div>
        <div class="d-flex align-items-center justify-content-between">
            <span class="text-muted" style="font-size:11.5px">Piso {{ floor }}</span>
            <span class="room-price fw-semibold small">${{ price.toLocaleString() }}/noche</span>
        </div>
        <div class="d-flex align-items-center gap-1 mt-2 pt-2 border-top room-guest" v-if="guest">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span class="text-secondary text-truncate" style="font-size:11.5px">{{ guest }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    number: String,
    type: String,
    floor: Number,
    status: String,
    price: Number,
    guest: String
})

defineEmits(['click'])

const statusLabel = computed(() => ({
    available: 'Disponible',
    occupied: 'Ocupada',
    reserved: 'Reservada',
    cleaning: 'Limpieza',
    maintenance: 'Mantenimiento',
}[props.status] ?? props.status ?? '—'))

const cardClass = computed(() => ({
    'room-available': props.status === 'available',
    'room-reserved': props.status === 'reserved',
    'room-occupied': props.status === 'occupied',
    'room-cleaning': props.status === 'cleaning',
    'room-maintenance': props.status === 'maintenance',
}))
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.room-card {
    border: 1.5px solid transparent;
    transition: transform .2s, box-shadow .2s;
}

.room-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(33, 26, 29, 0.12) !important;
}

/* Backgrounds */
.room-available {
    background: rgba(22, 163, 74, 0.10);
    border-color: rgba(22, 163, 74, 0.30);
}

.room-reserved {
    background: rgba(217, 119, 6, 0.10);
    border-color: rgba(217, 119, 6, 0.30);
}

.room-occupied {
    background: rgba(220, 38, 38, 0.10);
    border-color: rgba(220, 38, 38, 0.30);
}

.room-cleaning {
    background: rgba(59, 130, 246, 0.10);
    border-color: rgba(59, 130, 246, 0.30);
}

.room-maintenance {
    background: rgba(107, 114, 128, 0.10);
    border-color: rgba(107, 114, 128, 0.30);
}

/* Top bar */
.room-status-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 3px 3px 0 0;
}

.room-available .room-status-bar {
    background: #16a34a;
}

.room-reserved .room-status-bar {
    background: #d97706;
}

.room-occupied .room-status-bar {
    background: #dc2626;
}

.room-cleaning .room-status-bar {
    background: #3b82f6;
}

.room-maintenance .room-status-bar {
    background: #6b7280;
}

/* Number */
.room-number {
    font-size: 20px;
    color: #211A1D;
}

/* Badge */
.room-badge {
    font-size: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    max-width: 100px;
    padding: 2px 6px;
    border-radius: 999px;
    margin-left: 3px;

}

.room-available .room-badge {
    background: rgba(22, 163, 74, 0.15);
    color: #15803d;
}

.room-reserved .room-badge {
    background: rgba(217, 119, 6, 0.15);
    color: #b45309;
}

.room-occupied .room-badge {
    background: rgba(220, 38, 38, 0.15);
    color: #b91c1c;
}

.room-cleaning .room-badge {
    background: rgba(59, 130, 246, 0.15);
    color: #1d4ed8;
}

.room-maintenance .room-badge {
    background: rgba(107, 114, 128, 0.15);
    color: #374151;
}

/* Price */
.room-price {
    color: #6320EE;
}
</style>