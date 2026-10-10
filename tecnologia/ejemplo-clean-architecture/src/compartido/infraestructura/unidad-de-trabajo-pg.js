// REFERENCIA PARA PRODUCCIÓN (no se usa en el ejemplo ni en las pruebas).
// Requiere `npm install pg` y una base de datos PostgreSQL.
//
// Implementa el mismo puerto que UnidadDeTrabajoMemoria. Para usarla solo se cambia
// una línea en la raíz de composición (pedidos.module.js): los casos de uso no cambian.

import { UnidadDeTrabajo } from '../dominio/puertos.js';

export class UnidadDeTrabajoPg extends UnidadDeTrabajo {
  /** @param {import('pg').Pool} pool */
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async ejecutar(trabajo) {
    const cliente = await this.pool.connect();
    try {
      await cliente.query('BEGIN');
      const resultado = await trabajo({ cliente });
      await cliente.query('COMMIT');
      return resultado;
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }
}
