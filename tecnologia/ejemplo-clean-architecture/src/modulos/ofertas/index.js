// API PÚBLICA del módulo Ofertas.
// Otros módulos (Pedidos, Moderación) solo pueden usar lo que se exporta aquí;
// nunca importan sus carpetas internas ni leen sus tablas.

import { NoEncontradoError } from '../../compartido/dominio/errores.js';

export function crearApiOfertas(ofertaRepository) {
  return {
    /** Reserva una unidad dentro de la transacción del llamador. */
    async reservarUnidad(ofertaId, tx, ahora) {
      const oferta = await ofertaRepository.obtenerParaActualizar(ofertaId, tx);
      if (!oferta) throw new NoEncontradoError('Oferta');
      oferta.reservarUnidad(ahora);
      await ofertaRepository.guardar(oferta, tx);
      return { ofertaId: oferta.id, negocioId: oferta.negocioId, titulo: oferta.titulo };
    },

    /** Devuelve una unidad al stock dentro de la transacción del llamador. */
    async liberarUnidad(ofertaId, tx) {
      const oferta = await ofertaRepository.obtenerParaActualizar(ofertaId, tx);
      if (!oferta) throw new NoEncontradoError('Oferta');
      oferta.liberarUnidad();
      await ofertaRepository.guardar(oferta, tx);
    },
  };
}
