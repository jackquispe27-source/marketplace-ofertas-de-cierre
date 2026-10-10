import { EnlaceMensajeria } from '../dominio/puertos.js';

/**
 * Adaptador del puerto EnlaceMensajeria con enlaces wa.me (ADR-007).
 * No hace llamadas de red: solo construye la URL que el navegador del cliente abrirá.
 * Para usar la API de WhatsApp Business se crearía otro adaptador; el caso de uso no cambia.
 */
export class WaMeEnlaceAdapter extends EnlaceMensajeria {
  generarEnlace(telefono, mensaje) {
    const soloDigitos = String(telefono).replace(/\D/g, ''); // wa.me exige el número sin "+" ni espacios
    return `https://wa.me/${soloDigitos}?text=${encodeURIComponent(mensaje)}`;
  }
}
