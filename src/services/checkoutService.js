import { reactive } from "vue";

const CHECKOUT_KEY = "staydesk_ids_checkout";

function cargarIdsCheckout() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.map(Number) : [];
  } catch {
    return [];
  }
}

function guardarIdsCheckout(ids) {
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(ids));
}

export const checkoutStore = reactive({
  idsCheckout: cargarIdsCheckout(),

  marcar(id) {
    const idNum = Number(id);

    if (!this.idsCheckout.includes(idNum)) {
      this.idsCheckout.push(idNum);
      guardarIdsCheckout(this.idsCheckout);
    }
  },

  limpiar() {
    this.idsCheckout = [];
    sessionStorage.removeItem(CHECKOUT_KEY);
  },
});
