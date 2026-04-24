<template>
    <div class="mb-3">
        <label class="form-label fw-semibold small">{{ label }}</label>
        <div class="input-wrap" :class="{ 'input-error': error }">

            <slot name="icon" />

            <input :type="inputType" class="field-input" :placeholder="placeholder" :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur')" />

            <button v-if="type === 'password'" type="button"
                class="eye-btn border-0 bg-transparent p-0 d-flex align-items-center" @click="togglePass" tabindex="-1">
                <svg v-if="!showPass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                    width="17" height="17">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="17"
                    height="17">
                    <path
                        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
            </button>

        </div>
        <span class="text-danger small mt-1 d-block" v-if="error">{{ error }}</span>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    label: String,
    modelValue: String,
    placeholder: String,
    type: { type: String, default: 'text' },
    error: String
})

defineEmits(['update:modelValue', 'blur'])

const showPass = ref(false)
const inputType = computed(() => {
    if (props.type === 'password') return showPass.value ? 'text' : 'password'
    return props.type
})
const togglePass = () => { showPass.value = !showPass.value }
</script>

<style scoped>
.input-wrap {
    display: flex;
    align-items: center;
    border: 1.5px solid #ddd5e8;
    border-radius: 10px;
    padding: 0 13px;
    background: rgba(255, 255, 255, 0.75);
    transition: border-color .2s, box-shadow .2s;
}

.input-wrap:focus-within {
    border-color: #6320EE;
    background: #fff;
    box-shadow: 0 0 0 3.5px rgba(99, 32, 238, 0.12);
}

.input-error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14.5px;
    color: #211A1D;
    padding: 12px 0;
}

.field-input::placeholder {
    color: #c4b8d0;
}

.eye-btn svg {
    color: #9ca3af;
}

.eye-btn:hover svg {
    color: #6320EE;
}
</style>