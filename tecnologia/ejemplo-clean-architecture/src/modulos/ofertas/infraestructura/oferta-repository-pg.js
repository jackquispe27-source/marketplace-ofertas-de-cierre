// REFERENCIA PARA PRODUCCIÓN (no se usa en el ejemplo ni en las pruebas).
// Muestra cómo el mismo puerto se implementa con PostgreSQL y bloqueo de fila (ADR-003).

import { OfertaRepository } from '../dominio/oferta-repository.js';
import { Oferta } from '../dominio/oferta.js';

export class OfertaRepositoryPg extends OfertaRepository {
  /** @param {import('pg').Pool} pool */
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async obtenerParaActualizar(id, tx) {
    // FOR UPDATE: si otra transacción ya bloqueó esta fila, esta espera su turno.
    const { rows } = await tx.cliente.query(
      `SELECT id, negocio_id, titulo, precio_carta, precio_oferta, stock,
              hora_limite, fecha_vencimiento, estado
         FROM ofertas
        WHERE id = $1
          FOR UPDATE`,
      [id],
    );
    return rows[0] ? aEntidad(rows[0]) : null;
  }

  async guardar(oferta, tx) {
    // La tabla tiene CHECK (stock >= 0) como segunda defensa contra la sobreventa.
    await tx.cliente.query(
      'UPDATE ofertas SET stock = $2, estado = $3 WHERE id = $1',
      [oferta.id, oferta.stock, oferta.estado],
    );
  }

  async listarVigentes(ahora) {
    const { rows } = await this.pool.query(
      `SELECT * FROM ofertas
        WHERE estado = 'ACTIVA' AND stock > 0 AND hora_limite > $1
        ORDER BY hora_limite
        LIMIT 20`,
      [ahora],
    );
    return rows.map(aEntidad);
  }
}

function aEntidad(fila) {
  return new Oferta({
    id: fila.id,
    negocioId: fila.negocio_id,
    titulo: fila.titulo,
    precioCarta: Number(fila.precio_carta),
    precioOferta: Number(fila.precio_oferta),
    stock: fila.stock,
    horaLimite: fila.hora_limite,
    fechaVencimiento: fila.fecha_vencimiento,
    estado: fila.estado,
  });
}
