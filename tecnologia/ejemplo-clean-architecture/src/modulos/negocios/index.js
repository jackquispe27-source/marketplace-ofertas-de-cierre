// API PÚBLICA del módulo Negocios (versión mínima para el ejemplo).
// En el sistema real tendría su propio dominio, aplicación e infraestructura.

import { NoEncontradoError } from '../../compartido/dominio/errores.js';

export function crearApiNegocios(negocios = new Map()) {
  return {
    sembrar(negocio) {
      negocios.set(negocio.id, { ...negocio });
    },

    /** Datos de contacto que Pedidos necesita para armar el mensaje de WhatsApp. */
    async obtenerContacto(negocioId) {
      const n = negocios.get(negocioId);
      if (!n) throw new NoEncontradoError('Negocio');
      return { nombre: n.nombre, whatsapp: n.whatsapp };
    },
  };
}
