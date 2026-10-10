/**
 * Controlador HTTP del módulo Pedidos.
 * Solo traduce HTTP ⇄ caso de uso. No contiene reglas de negocio ni SQL.
 */
export class PedidosController {
  constructor({ pedirOferta, resolverPedido }) {
    this.pedirOferta = pedirOferta;
    this.resolverPedido = resolverPedido;
  }

  /** POST /api/v1/ofertas/:ofertaId/pedidos (cliente anónimo) */
  pedir = async (req, res, next) => {
    try {
      const resultado = await this.pedirOferta.ejecutar({ ofertaId: req.params.ofertaId });
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /api/v1/pedidos/:codigo  body: { "accion": "confirmar" | "rechazar" } (negocio) */
  resolver = async (req, res, next) => {
    try {
      const { accion } = req.body ?? {};
      if (accion !== 'confirmar' && accion !== 'rechazar') {
        return res.status(400).json({ error: 'accion debe ser "confirmar" o "rechazar"' });
      }
      const resultado = await this.resolverPedido.ejecutar({
        codigo: String(req.params.codigo).toUpperCase(),
        negocioId: req.usuario.negocioId, // viene del token, NUNCA del body (ADR-006)
        concretado: accion === 'confirmar',
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };
}
