// Puertos compartidos (interfaces). JavaScript no tiene `interface`, así que se
// declaran como clases abstractas: cualquier adaptador debe implementar sus métodos.

/** Puerto: hora actual. Permite probar vencimientos sin esperar. */
export class Reloj {
  /** @returns {Date} */
  ahora() {
    throw new Error('Reloj.ahora() no implementado');
  }
}

/**
 * Puerto: unidad de trabajo (transacción).
 * Todo lo que ocurre dentro de `ejecutar` se confirma junto o no se confirma.
 */
export class UnidadDeTrabajo {
  /**
   * @template T
   * @param {(tx: object) => Promise<T>} trabajo
   * @returns {Promise<T>}
   */
  async ejecutar(trabajo) {
    throw new Error('UnidadDeTrabajo.ejecutar() no implementado');
  }
}
