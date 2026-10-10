import { OfertaRepository } from '../dominio/oferta-repository.js';
import { Oferta } from '../dominio/oferta.js';

/** Adaptador en memoria del puerto OfertaRepository. */
export class OfertaRepositoryMemoria extends OfertaRepository {
  #datos = new Map();

  /** Carga datos iniciales (solo para el ejemplo y las pruebas). */
  sembrar(oferta) {
    this.#datos.set(oferta.id, copiar(oferta));
  }

  async obtenerParaActualizar(id) {
    const fila = this.#datos.get(id);
    return fila ? copiar(fila) : null; // se devuelve una copia: los cambios se aplican al confirmar
  }

  async guardar(oferta, tx) {
    tx.alConfirmar(() => this.#datos.set(oferta.id, copiar(oferta)));
  }

  async listarVigentes(ahora) {
    return [...this.#datos.values()].map(copiar).filter((o) => o.estaVigente(ahora));
  }
}

function copiar(oferta) {
  return new Oferta({ ...oferta });
}
