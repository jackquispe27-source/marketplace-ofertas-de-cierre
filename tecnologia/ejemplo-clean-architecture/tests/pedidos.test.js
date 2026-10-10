// Pruebas de los CASOS DE USO con adaptadores en memoria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearEscenario } from './helpers.js';
import { OfertaAgotadaError, NoEncontradoError } from '../src/compartido/dominio/errores.js';
import { EstadoCodigo } from '../src/modulos/pedidos/dominio/codigo-canje.js';

test('PedirOferta devuelve un código y un enlace wa.me con el mensaje prellenado', async () => {
  const { pedirOferta, stockActual } = crearEscenario();
  const r = await pedirOferta.ejecutar({ ofertaId: 'of-1' });

  assert.match(r.codigo, /^[A-HJ-NP-Z2-9]{4}$/);
  assert.ok(r.enlace.startsWith('https://wa.me/51999888777?text='));
  assert.ok(decodeURIComponent(r.enlace).includes(r.codigo));
  assert.equal(await stockActual(), 2);
});

test('EQ-02: 50 pedidos simultáneos sobre 3 unidades → exactamente 3 reservas, 0 sobreventas', async () => {
  const { pedirOferta, pedidos, stockActual } = crearEscenario({ stock: 3 });

  const resultados = await Promise.allSettled(
    Array.from({ length: 50 }, () => pedirOferta.ejecutar({ ofertaId: 'of-1' })),
  );

  const exitos = resultados.filter((r) => r.status === 'fulfilled');
  const agotados = resultados.filter((r) => r.status === 'rejected' && r.reason instanceof OfertaAgotadaError);
  assert.equal(exitos.length, 3);
  assert.equal(agotados.length, 47);
  assert.equal(await stockActual(), 0);
  assert.equal(pedidos.codigos.todos().length, 3);
});

test('Si algo falla a mitad del pedido, no queda stock descontado (rollback)', async () => {
  const negociosRotos = { obtenerContacto: async () => { throw new Error('Negocios no responde'); } };
  const { pedirOferta, pedidos, stockActual } = crearEscenario({ apiNegocios: negociosRotos });

  await assert.rejects(() => pedirOferta.ejecutar({ ofertaId: 'of-1' }), /Negocios no responde/);
  assert.equal(await stockActual(), 3);
  assert.equal(pedidos.codigos.todos().length, 0);
});

test('ResolverPedido: rechazar devuelve la unidad al stock (RN-08)', async () => {
  const { pedirOferta, resolverPedido, stockActual } = crearEscenario();
  const { codigo } = await pedirOferta.ejecutar({ ofertaId: 'of-1' });

  const r = await resolverPedido.ejecutar({ codigo, negocioId: 'neg-1', concretado: false });
  assert.equal(r.estado, EstadoCodigo.NO_CONCRETADO);
  assert.equal(await stockActual(), 3);
});

test('EQ-04 / RN-10: un negocio no puede confirmar el código de otro negocio', async () => {
  const { pedirOferta, resolverPedido } = crearEscenario();
  const { codigo } = await pedirOferta.ejecutar({ ofertaId: 'of-1' });

  await assert.rejects(
    () => resolverPedido.ejecutar({ codigo, negocioId: 'neg-intruso', concretado: true }),
    NoEncontradoError,
  );
});

test('EQ-06: a los 30 min la reserva expira y la unidad vuelve al stock', async () => {
  const { pedirOferta, expirarReservas, reloj, stockActual } = crearEscenario();
  await pedirOferta.ejecutar({ ofertaId: 'of-1' });
  assert.equal(await stockActual(), 2);

  reloj.avanzarMinutos(29);
  assert.deepEqual(await expirarReservas.ejecutar(), { expirados: 0 });

  reloj.avanzarMinutos(1);
  assert.deepEqual(await expirarReservas.ejecutar(), { expirados: 1 });
  assert.equal(await stockActual(), 3);
});
