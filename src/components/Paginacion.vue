<template>
    <div v-if="totalPaginas > 1" class="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
        <span class="text-muted" style="font-size:12px">
            Mostrando {{ inicio + 1 }}–{{ Math.min(inicio + porPagina, total) }} de {{ total }} {{ etiqueta }}
        </span>
        <div class="d-flex gap-2">
            <button class="pag-btn" :disabled="modelValue === 1" @click="$emit('update:modelValue', modelValue - 1)">←
                Anterior</button>
            <span class="pag-info">{{ modelValue }} / {{ totalPaginas }}</span>
            <button class="pag-btn" :disabled="modelValue === totalPaginas"
                @click="$emit('update:modelValue', modelValue + 1)">Siguiente →</button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: { type: Number, required: true },
    total: { type: Number, required: true },
    porPagina: { type: Number, default: 15 },
    etiqueta: { type: String, default: 'registros' }
})

defineEmits(['update:modelValue'])

const totalPaginas = computed(() => Math.ceil(props.total / props.porPagina))
const inicio = computed(() => (props.modelValue - 1) * props.porPagina)
</script>

<style scoped>
.pag-btn {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1.5px solid rgba(99, 32, 238, 0.2);
    background: none;
    color: #6320EE;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    transition: all 0.2s;
}

.pag-btn:hover:not(:disabled) {
    background: rgba(99, 32, 238, 0.07);
}

.pag-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.pag-info {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #6b7280;
    padding: 0 4px;
}
</style>