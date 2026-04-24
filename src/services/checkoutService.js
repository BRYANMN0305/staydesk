import { reactive } from 'vue'

export const checkoutStore = reactive({
    idsCheckout: new Set(),
    marcar(id) {
        this.idsCheckout.add(Number(id))
    }
})