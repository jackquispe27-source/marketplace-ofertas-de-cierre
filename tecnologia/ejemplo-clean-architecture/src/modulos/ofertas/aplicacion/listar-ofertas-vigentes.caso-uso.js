/** Caso de uso: listar las ofertas que el cliente puede pedir ahora (RF01). */
export class ListarOfertasVigentes {
  /**
   * @param {import('../dominio/oferta-repository.js').OfertaRepository} ofertas
   * @param {import('../../../compartido/dominio/puertos.js').Reloj} reloj
   */
  constructor(ofertas, reloj) {
    this.ofertas = ofertas;
    this.reloj = reloj;
  }

  async ejecutar() {
    const lista = await this.ofertas.listarVigentes(this.reloj.ahora());
    return lista.map((o) => ({
      id: o.id,
      titulo: o.titulo,
      precioCarta: o.precioCarta,
      precioOferta: o.precioOferta,
      descuento: o.descuentoPorcentaje(),
      disponibles: o.stock,
      horaLimite: o.horaLimite.toISOString(),
      fechaVencimiento: o.fechaVencimiento, // RF03: fecha siempre visible
    }));
  }
}
