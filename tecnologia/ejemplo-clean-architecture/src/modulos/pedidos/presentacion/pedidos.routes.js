import { Router } from 'express';

/** Registra las rutas del módulo Pedidos. */
export function crearRutasPedidos(controller, { requiereNegocio }) {
  const router = Router();
  router.post('/ofertas/:ofertaId/pedidos', controller.pedir);
  router.patch('/pedidos/:codigo', requiereNegocio, controller.resolver);
  return router;
}
