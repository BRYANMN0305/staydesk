<template>
    <div class="stat-card position-relative overflow-hidden bg-white rounded-3 p-3 d-flex align-items-center gap-3 border"
        :style="{ '--accent': color }">
        <div class="stat-icon rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            :style="{ background: bg }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                v-html="icon"></svg>
        </div>
        <div class="flex-grow-1 min-width-0">
            <span class="d-block fw-bold stat-value">{{ value }}</span>
            <span class="d-block text-muted" style="font-size:12px">{{ label }}</span>
        </div>
    </div>
</template>

<script setup>
defineProps({
    label: String,
    value: String,
    trend: Number,
    color: String,
    bg: String,
    icon: String
})
</script>

<style scoped>
.stat-card {
    border-color: rgba(99, 32, 238, 0.07) !important;
    box-shadow: 0 2px 12px rgba(33, 26, 29, 0.05);
}

.stat-card::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent);
    border-radius: 3px 0 0 3px;
}

.stat-icon {
    width: 44px;
    height: 44px;
}

.stat-value {
    font-size: 22px;
    color: #211A1D;
    line-height: 1;
}
</style>