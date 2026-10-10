// Puertos (interfaces) del módulo Pedidos.
// Cada puerto es pequeño y tiene una sola razón de cambio (principio I de SOLID).

/** Persistencia de los códigos de canje. */
export class CodigoCanjeRepository {
  async guardar(codigoCanje, tx) { throw new Error('no implementado'); }
  async buscarPorCodigo(codigo, tx) { throw new Error('no implementado'); }
  async existeCodigoActivo(codigo, tx) { throw new Error('no implementado'); }
  async listarReservadosVencidos(ahora, tx) { throw new Error('no implementado'); }
}

/** Construye el enlace para abrir el chat con el negocio (hoy: wa.me). */
export class EnlaceMensajeria {
  generarEnlace(telefono, mensaje) { throw new Error('no implementado'); }
}

/** Genera el texto corto del código (p. ej. K7P2). */
export class GeneradorCodigo {
  nuevo() { throw new Error('no implementado'); }
}

/** Lo que Pedidos necesita del módulo Ofertas, sin conocer sus clases internas. */
export class ReservaDeStock {
  async reservar(ofertaId, tx, ahora) { throw new Error('no implementado'); }
  async liberar(ofertaId, tx) { throw new Error('no implementado'); }
}

/** Lo que Pedidos necesita del módulo Negocios. */
export class ContactoNegocio {
  async obtenerContacto(negocioId) { throw new Error('no implementado'); }
}
