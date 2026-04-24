<template>
    <div class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-overlay"
        @click.self="$emit('cerrar')">
        <div class="bg-white rounded-4 p-4 position-relative modal-box">
            <div class="modal-top-bar" :style="peligroso ? 'background:#dc2626' : ''"></div>

            <button
                class="position-absolute border-0 rounded-2 d-flex align-items-center justify-content-center modal-close"
                @click="$emit('cerrar')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>

            <h3 class="fw-bold mb-1" style="font-size:18px">{{ titulo }}</h3>
            <p class="text-muted mb-4" style="font-size:12.5px">{{ subtitulo }}</p>

            <slot>
                <!-- Campos dinámicos -->
                <div class="row g-3">
                    <div v-for="campo in campos" :key="campo.key" :class="campo.colClass || 'col-12'">
                        <label class="form-label-custom">{{ campo.label }}</label>

                        <select v-if="campo.type === 'select'" class="input-custom w-100"
                            v-model="formInterno[campo.key]">
                            <option value="" disabled>{{ campo.placeholder || 'Selecciona...' }}</option>
                            <option v-for="op in campo.opciones" :key="op.value" :value="op.value">{{ op.label }}
                            </option>
                        </select>

                        <textarea v-else-if="campo.type === 'textarea'" class="input-custom w-100"
                            v-model="formInterno[campo.key]" :placeholder="campo.placeholder || ''" rows="3"
                            style="resize:none" />

                        <input v-else class="input-custom w-100" v-model="formInterno[campo.key]"
                            :type="campo.type || 'text'" :placeholder="campo.placeholder || ''" />
                    </div>
                </div>
            </slot>

            <div v-if="error" class="mt-3 rounded-3 px-3 py-2"
                style="background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.2);font-size:13px;color:#dc2626">
                {{ error }}
            </div>

            <div class="d-flex gap-2 mt-4">
                <button class="modal-btn-secondary flex-grow-1 rounded-3" @click="$emit('cerrar')">
                    Cancelar
                </button>
                <button v-if="!peligroso" class="modal-btn-primary flex-grow-1 rounded-3 border-0"
                    @click="handleGuardar" :disabled="cargando">
                    {{ cargando ? 'Guardando...' : textoConfirmar }}
                </button>
                <button v-else class="modal-btn-danger flex-grow-1 rounded-3 border-0" @click="$emit('confirmar')"
                    :disabled="cargando">
                    {{ cargando ? 'Procesando...' : textoConfirmar }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    titulo: { type: String, required: true },
    subtitulo: { type: String, default: '' },
    campos: { type: Array, default: () => [] },
    valorInicial: { type: Object, default: () => ({}) },
    error: { type: String, default: '' },
    cargando: { type: Boolean, default: false },
    textoConfirmar: { type: String, default: 'Guardar' },
    peligroso: { type: Boolean, default: false }, 
})

const emit = defineEmits(['cerrar', 'guardar', 'confirmar'])

const formInterno = ref({ ...props.valorInicial })

watch(() => props.valorInicial, (val) => {
    formInterno.value = { ...val }
}, { immediate: true })

const handleGuardar = () => {
    emit('guardar', { ...formInterno.value })
}
</script>

<style scoped>
.modal-overlay {
    background: rgba(33, 26, 29, 0.55);
    backdrop-filter: blur(4px);
    z-index: 200;
}

.modal-box {
    width: 100%;
    max-width: 480px;
    box-shadow: 0 24px 60px rgba(33, 26, 29, 0.3);
    animation: modalIn .3s cubic-bezier(.22, 1, .36, 1);
}

@keyframes modalIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

.modal-top-bar {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 5px;
    width: 95%;
    background: linear-gradient(90deg, #6320EE, #8075FF);
    border-radius: 6px;
}

.modal-close {
    top: 16px;
    right: 16px;
    background: #f4eeff;
    width: 30px;
    height: 30px;
    color: #9ca3af;
    cursor: pointer;
    border: none;
}

.form-label-custom {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 5px;
    letter-spacing: .3px;
}

.input-custom {
    border: 1.5px solid rgba(99, 32, 238, 0.15);
    border-radius: 10px;
    padding: 9px 13px;
    font-size: 13.5px;
    font-family: 'Outfit', sans-serif;
    color: #211A1D;
    outline: none;
    transition: border-color .2s;
    background: #faf8ff;
}

.input-custom:focus {
    border-color: #6320EE;
}

.input-custom::placeholder {
    color: #c4b8d0;
}

.modal-btn-primary {
    padding: 11px;
    background: linear-gradient(135deg, #6320EE, #8075FF);
    color: #fff;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(99, 32, 238, 0.35);
    font-weight: 600;
}

.modal-btn-primary:disabled {
    opacity: .65;
    cursor: not-allowed;
}

.modal-btn-secondary {
    padding: 11px;
    background: #f4eeff;
    color: #6320EE;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    border: 1.5px solid rgba(99, 32, 238, 0.18);
    cursor: pointer;
    font-weight: 600;
}

.modal-btn-secondary:hover {
    background: rgba(99, 32, 238, 0.08);
}

.modal-btn-danger {
    padding: 11px;
    background: #dc2626;
    color: #fff;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
}

.modal-btn-danger:disabled {
    opacity: .65;
    cursor: not-allowed;
}
</style>