import { UnidadDeTrabajo } from '../dominio/puertos.js';

/**
 * Unidad de trabajo en memoria (para el ejemplo y las pruebas).
 *
 * Imita lo que PostgreSQL hace con `BEGIN … SELECT … FOR UPDATE … COMMIT`:
 *  - Serializa las transacciones (una espera a la otra), como el bloqueo de fila.
 *  - Las escrituras se aplican solo al confirmar; si algo falla, se descartan (rollback).
 *
 * En producción se reemplaza por `UnidadDeTrabajoPg` sin tocar los casos de uso.
 */
export class UnidadDeTrabajoMemoria extends UnidadDeTrabajo {
  #cola = Promise.resolve();

  async ejecutar(trabajo) {
    const turno = this.#cola.then(async () => {
      const escriturasPendientes = [];
      const tx = { alConfirmar: (escritura) => escriturasPendientes.push(escritura) };
      const resultado = await trabajo(tx); // si lanza error, no se aplica ninguna escritura
      escriturasPendientes.forEach((escribir) => escribir());
      return resultado;
    });
    this.#cola = turno.catch(() => {});
    return turno;
  }
}
