import { CodigoCanjeRepository } from '../dominio/puertos.js';
import { CodigoCanje, EstadoCodigo } from '../dominio/codigo-canje.js';

/** Adaptador en memoria del puerto CodigoCanjeRepository. */
export class CodigoCanjeRepositoryMemoria extends CodigoCanjeRepository {
  #datos = new Map(); // clave: texto del código

  async guardar(codigoCanje, tx) {
    tx.alConfirmar(() => this.#datos.set(codigoCanje.codigo, copiar(codigoCanje)));
  }

  async buscarPorCodigo(codigo) {
    const fila = this.#datos.get(codigo);
    return fila ? copiar(fila) : null;
  }

  async existeCodigoActivo(codigo) {
    return this.#datos.get(codigo)?.estado === EstadoCodigo.RESERVADO;
  }

  async listarReservadosVencidos(ahora) {
    return [...this.#datos.values()].map(copiar).filter((c) => c.estaVencido(ahora));
  }

  /** Solo para pruebas y reportes del ejemplo. */
  todos() {
    return [...this.#datos.values()].map(copiar);
  }
}

function copiar(c) {
  return new CodigoCanje({ ...c });
}
