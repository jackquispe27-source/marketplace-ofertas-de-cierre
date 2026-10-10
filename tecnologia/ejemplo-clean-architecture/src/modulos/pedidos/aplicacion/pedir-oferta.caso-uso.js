import { randomUUID } from 'node:crypto';
import { CodigoCanje } from '../dominio/codigo-canje.js';

const INTENTOS_CODIGO = 5;

/**
 * Caso de uso PedirOferta (HU04 · RF04, RF05, RF06).
 * Reserva una unidad, crea el código de canje y arma el enlace de WhatsApp,
 * todo dentro de UNA transacción (ADR-003). No conoce Express, PostgreSQL ni WhatsApp.
 */
export class PedirOferta {
  constructor({ unidadDeTrabajo, reloj, reservaDeStock, codigos, generadorCodigo, contactoNegocio, mensajeria }) {
    this.unidadDeTrabajo = unidadDeTrabajo;
    this.reloj = reloj;
    this.reservaDeStock = reservaDeStock;
    this.codigos = codigos;
    this.generadorCodigo = generadorCodigo;
    this.contactoNegocio = contactoNegocio;
    this.mensajeria = mensajeria;
  }

  async ejecutar({ ofertaId }) {
    return this.unidadDeTrabajo.ejecutar(async (tx) => {
      const ahora = this.reloj.ahora();

      // 1. Reserva la unidad (bloquea la fila de la oferta; lanza error si no hay stock).
      const reserva = await this.reservaDeStock.reservar(ofertaId, tx, ahora);

      // 2. Crea el código de canje en estado RESERVADO.
      const codigo = await this.#codigoUnico(tx);
      const codigoCanje = CodigoCanje.reservar(
        { id: randomUUID(), codigo, ofertaId, negocioId: reserva.negocioId },
        ahora,
      );
      await this.codigos.guardar(codigoCanje, tx);

      // 3. Arma el enlace a WhatsApp con el mensaje ya escrito.
      const contacto = await this.contactoNegocio.obtenerContacto(reserva.negocioId);
      const mensaje = `Hola ${contacto.nombre}, vi tu oferta "${reserva.titulo}" en Ofertas de Cierre. Mi código es ${codigo}.`;
      const enlace = this.mensajeria.generarEnlace(contacto.whatsapp, mensaje);

      return { codigo, enlace, expiraEn: codigoCanje.expiraEn.toISOString() };
    });
  }

  async #codigoUnico(tx) {
    for (let i = 0; i < INTENTOS_CODIGO; i++) {
      const candidato = this.generadorCodigo.nuevo();
      if (!(await this.codigos.existeCodigoActivo(candidato, tx))) return candidato;
    }
    throw new Error('No se pudo generar un código único');
  }
}
