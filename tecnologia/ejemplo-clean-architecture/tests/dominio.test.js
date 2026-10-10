// Pruebas del DOMINIO: sin Express, sin base de datos, sin WhatsApp.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Oferta, EstadoOferta } from '../src/modulos/ofertas/dominio/oferta.js';
import { CodigoCanje, EstadoCodigo } from '../src/modulos/pedidos/dominio/codigo-canje.js';
import { ReglaNegocioError, OfertaAgotadaError } from '../src/compartido/dominio/errores.js';

const ahora = new Date('2026-10-10T18:00:00-05:00');
const base = {
  id: 'o1', negocioId: 'n1', titulo: 'Pan', precioCarta: 10, precioOferta: 5, stock: 1,
  horaLimite: new Date(ahora.getTime() + 3_600_000), fechaVencimiento: '2026-10-10',
};

test('RN-01: el precio de oferta debe ser menor al de carta', () => {
  assert.throws(() => Oferta.publicar({ ...base, precioOferta: 10 }, ahora), ReglaNegocioError);
});

test('RN-02: no se publica un producto vencido', () => {
  assert.throws(() => Oferta.publicar({ ...base, fechaVencimiento: '2026-10-09' }, ahora), /RN-02/);
});

test('RN-02: a las 23:30 de Lima (04:30 UTC del día siguiente) el producto de hoy sigue vigente', () => {
  const nocheLima = new Date('2026-10-10T23:30:00-05:00');
  const oferta = Oferta.publicar({ ...base, horaLimite: new Date('2026-10-10T23:59:00-05:00') }, nocheLima);
  assert.equal(oferta.fechaVencimiento, '2026-10-10');
});

test('RN-05: al reservar la última unidad la oferta queda AGOTADA y no admite otra reserva', () => {
  const oferta = Oferta.publicar(base, ahora);
  oferta.reservarUnidad(ahora);
  assert.equal(oferta.stock, 0);
  assert.equal(oferta.estado, EstadoOferta.AGOTADA);
  assert.throws(() => oferta.reservarUnidad(ahora), OfertaAgotadaError);
});

test('RN-08: liberar una unidad reactiva una oferta agotada', () => {
  const oferta = Oferta.publicar(base, ahora);
  oferta.reservarUnidad(ahora);
  oferta.liberarUnidad();
  assert.equal(oferta.stock, 1);
  assert.equal(oferta.estado, EstadoOferta.ACTIVA);
});

test('RN-06: el código vence a los 30 minutos', () => {
  const c = CodigoCanje.reservar({ id: '1', codigo: 'K7P2', ofertaId: 'o1', negocioId: 'n1' }, ahora);
  assert.equal(c.estaVencido(new Date(ahora.getTime() + 29 * 60_000)), false);
  assert.equal(c.estaVencido(new Date(ahora.getTime() + 30 * 60_000)), true);
});

test('RN-07: un código VENDIDO no puede cambiar de estado otra vez', () => {
  const c = CodigoCanje.reservar({ id: '1', codigo: 'K7P2', ofertaId: 'o1', negocioId: 'n1' }, ahora);
  c.marcarVendido(ahora);
  assert.equal(c.estado, EstadoCodigo.VENDIDO);
  assert.throws(() => c.marcarNoConcretado(ahora), /RN-07/);
  assert.equal(c.historial.length, 2); // RESERVADO → VENDIDO, con fecha y actor
});
