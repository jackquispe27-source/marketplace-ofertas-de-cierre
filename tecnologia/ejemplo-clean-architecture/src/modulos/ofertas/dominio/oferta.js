import {
  ReglaNegocioError,
  OfertaAgotadaError,
  OfertaNoDisponibleError,
} from '../../../compartido/dominio/errores.js';
import { fechaCalendario } from '../../../compartido/dominio/fechas.js';

export const EstadoOferta = Object.freeze({
  ACTIVA: 'ACTIVA',
  PAUSADA: 'PAUSADA',
  AGOTADA: 'AGOTADA',
  FINALIZADA: 'FINALIZADA',
});

/**
 * Entidad Oferta: una oferta de cierre del día.
 * Contiene las reglas que serían ciertas con cualquier tecnología.
 */
export class Oferta {
  constructor({ id, negocioId, titulo, precioCarta, precioOferta, stock, horaLimite, fechaVencimiento, estado }) {
    this.id = id;
    this.negocioId = negocioId;
    this.titulo = titulo;
    this.precioCarta = precioCarta;
    this.precioOferta = precioOferta;
    this.stock = stock;
    this.horaLimite = new Date(horaLimite);
    this.fechaVencimiento = fechaVencimiento; // 'YYYY-MM-DD' (calendario de Lima)
    this.estado = estado;
  }

  /** Crea una oferta nueva validando las reglas de publicación. */
  static publicar(datos, ahora) {
    if (!(datos.precioOferta < datos.precioCarta)) {
      throw new ReglaNegocioError('RN-01: el precio de oferta debe ser menor que el precio de carta');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fechaVencimiento)) {
      throw new ReglaNegocioError('La fecha de vencimiento debe tener el formato YYYY-MM-DD');
    }
    if (datos.fechaVencimiento < fechaCalendario(ahora)) {
      throw new ReglaNegocioError('RN-02: no se puede publicar un producto vencido');
    }
    if (new Date(datos.horaLimite) <= ahora) {
      throw new ReglaNegocioError('RN-03: la hora límite debe ser posterior a la hora actual');
    }
    if (!(datos.stock > 0)) {
      throw new ReglaNegocioError('RN-03: la oferta debe tener al menos una unidad');
    }
    return new Oferta({ ...datos, estado: EstadoOferta.ACTIVA });
  }

  estaVigente(ahora) {
    return this.estado === EstadoOferta.ACTIVA && this.horaLimite > ahora && this.stock > 0;
  }

  descuentoPorcentaje() {
    return Math.round((1 - this.precioOferta / this.precioCarta) * 100);
  }

  /** RN-05: solo se reserva una unidad si la oferta está activa, vigente y con stock. */
  reservarUnidad(ahora) {
    if (this.estado === EstadoOferta.AGOTADA || this.stock === 0) throw new OfertaAgotadaError();
    if (this.estado !== EstadoOferta.ACTIVA || this.horaLimite <= ahora) throw new OfertaNoDisponibleError();
    this.stock -= 1;
    if (this.stock === 0) this.estado = EstadoOferta.AGOTADA;
  }

  /** RN-08: una reserva no concretada o expirada devuelve la unidad. */
  liberarUnidad() {
    this.stock += 1;
    if (this.estado === EstadoOferta.AGOTADA) this.estado = EstadoOferta.ACTIVA;
  }
}
