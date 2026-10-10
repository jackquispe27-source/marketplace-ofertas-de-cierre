import { randomInt } from 'node:crypto';
import { GeneradorCodigo } from '../dominio/puertos.js';

// Sin caracteres que se confunden al dictarlos por WhatsApp: 0/O, 1/I/L.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const LONGITUD = 4;

export class GeneradorCodigoAleatorio extends GeneradorCodigo {
  nuevo() {
    let codigo = '';
    for (let i = 0; i < LONGITUD; i++) codigo += ALFABETO[randomInt(ALFABETO.length)];
    return codigo;
  }
}
