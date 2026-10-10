import { ReglaNegocioError } from '../../../compartido/dominio/errores.js';

export const EstadoCodigo = Object.freeze({
  RESERVADO: 'RESERVADO',
  VENDIDO: 'VENDIDO',
  NO_CONCRETADO: 'NO_CONCRETADO',
  EXPIRADO: 'EXPIRADO',
});

export const MINUTOS_RESERVA = 30; // RN-06

/**
 * Entidad CodigoCanje: representa un pedido iniciado desde la web
 * y concretado (o no) por WhatsApp. Controla su propia máquina de estados (ADR-004).
 */
export class CodigoCanje {
  constructor({ id, codigo, ofertaId, negocioId, estado, creadoEn, expiraEn, historial }) {
    this.id = id;
    this.codigo = codigo;
    this.ofertaId = ofertaId;
    this.negocioId = negocioId;
    this.estado = estado;
    this.creadoEn = new Date(creadoEn);
    this.expiraEn = new Date(expiraEn);
    this.historial = historial.map((h) => ({ ...h }));
  }

  /** Crea un código en estado RESERVADO que vence a los 30 minutos (RN-06). */
  static reservar({ id, codigo, ofertaId, negocioId }, ahora) {
    const expiraEn = new Date(ahora.getTime() + MINUTOS_RESERVA * 60_000);
    return new CodigoCanje({
      id,
      codigo,
      ofertaId,
      negocioId,
      estado: EstadoCodigo.RESERVADO,
      creadoEn: ahora,
      expiraEn,
      historial: [{ estado: EstadoCodigo.RESERVADO, fecha: ahora.toISOString(), actor: 'CLIENTE' }],
    });
  }

  /** RN-10: un negocio solo opera sobre sus propios códigos. */
  perteneceA(negocioId) {
    return this.negocioId === negocioId;
  }

  estaVencido(ahora) {
    return this.estado === EstadoCodigo.RESERVADO && ahora >= this.expiraEn;
  }

  marcarVendido(ahora) {
    this.#transicion(EstadoCodigo.VENDIDO, ahora, 'NEGOCIO');
  }

  /** Devuelve true porque la unidad debe volver al stock (RN-08). */
  marcarNoConcretado(ahora) {
    this.#transicion(EstadoCodigo.NO_CONCRETADO, ahora, 'NEGOCIO');
    return true;
  }

  marcarExpirado(ahora) {
    if (!this.estaVencido(ahora)) {
      throw new ReglaNegocioError('RN-06: la reserva todavía no cumple 30 minutos');
    }
    this.#transicion(EstadoCodigo.EXPIRADO, ahora, 'SISTEMA');
    return true;
  }

  /** RN-07: solo se puede salir del estado RESERVADO, y una sola vez. */
  #transicion(nuevoEstado, ahora, actor) {
    if (this.estado !== EstadoCodigo.RESERVADO) {
      throw new ReglaNegocioError(`RN-07: el código ${this.codigo} ya está ${this.estado}`);
    }
    this.estado = nuevoEstado;
    this.historial.push({ estado: nuevoEstado, fecha: ahora.toISOString(), actor });
  }
}
