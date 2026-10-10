import { NoEncontradoError } from '../../../compartido/dominio/errores.js';

/**
 * Caso de uso ConfirmarVenta / RechazarPedido (HU09 · RF11).
 * El negocio marca el código como VENDIDO o NO_CONCRETADO.
 * Si no se concretó, la unidad vuelve al stock en la misma transacción.
 */
export class ResolverPedido {
  constructor({ unidadDeTrabajo, reloj, codigos, reservaDeStock }) {
    this.unidadDeTrabajo = unidadDeTrabajo;
    this.reloj = reloj;
    this.codigos = codigos;
    this.reservaDeStock = reservaDeStock;
  }

  /** @param {{ codigo: string, negocioId: string, concretado: boolean }} cmd */
  async ejecutar({ codigo, negocioId, concretado }) {
    return this.unidadDeTrabajo.ejecutar(async (tx) => {
      const ahora = this.reloj.ahora();
      const codigoCanje = await this.codigos.buscarPorCodigo(codigo, tx);

      // RN-10: si el código es de otro negocio, se responde igual que si no existiera
      // (no se revela que el código existe).
      if (!codigoCanje || !codigoCanje.perteneceA(negocioId)) {
        throw new NoEncontradoError('Código');
      }

      if (concretado) {
        codigoCanje.marcarVendido(ahora);
      } else {
        codigoCanje.marcarNoConcretado(ahora);
        await this.reservaDeStock.liberar(codigoCanje.ofertaId, tx);
      }
      await this.codigos.guardar(codigoCanje, tx);
      return { codigo: codigoCanje.codigo, estado: codigoCanje.estado };
    });
  }
}
