/**
 * Caso de uso ExpirarReservas (RF05 · ADR-005).
 * Lo dispara la tarea programada cada minuto: los códigos RESERVADO con más de
 * 30 minutos pasan a EXPIRADO y su unidad vuelve al stock.
 */
export class ExpirarReservas {
  constructor({ unidadDeTrabajo, reloj, codigos, reservaDeStock }) {
    this.unidadDeTrabajo = unidadDeTrabajo;
    this.reloj = reloj;
    this.codigos = codigos;
    this.reservaDeStock = reservaDeStock;
  }

  async ejecutar() {
    return this.unidadDeTrabajo.ejecutar(async (tx) => {
      const ahora = this.reloj.ahora();
      const vencidos = await this.codigos.listarReservadosVencidos(ahora, tx);
      for (const codigoCanje of vencidos) {
        codigoCanje.marcarExpirado(ahora);
        await this.reservaDeStock.liberar(codigoCanje.ofertaId, tx);
        await this.codigos.guardar(codigoCanje, tx);
      }
      return { expirados: vencidos.length };
    });
  }
}
