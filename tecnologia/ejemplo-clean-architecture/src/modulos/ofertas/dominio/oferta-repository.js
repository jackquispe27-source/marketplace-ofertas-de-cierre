// Puerto (interfaz) de persistencia del módulo Ofertas.
// Declara QUÉ necesita el módulo; la infraestructura decide CÓMO (memoria, PostgreSQL…).

export class OfertaRepository {
  /** Obtiene la oferta bloqueándola para actualizar (FOR UPDATE en PostgreSQL). */
  async obtenerParaActualizar(id, tx) {
    throw new Error('no implementado');
  }

  async guardar(oferta, tx) {
    throw new Error('no implementado');
  }

  /** Lista las ofertas vigentes (activas, con stock y antes de su hora límite). */
  async listarVigentes(ahora) {
    throw new Error('no implementado');
  }
}
