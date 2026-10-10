// EQ-09: verifica AUTOMÁTICAMENTE la regla de dependencia de Clean Architecture.
// Si alguien importa Express, pg o infraestructura desde el dominio o la aplicación, esta prueba falla.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

function archivos(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    return statSync(ruta).isDirectory() ? archivos(ruta) : ruta.endsWith('.js') ? [ruta] : [];
  });
}

function imports(ruta) {
  return [...readFileSync(ruta, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

const capa = (ruta) => relative(SRC, ruta).split(/[\\/]/).find((p) => ['dominio', 'aplicacion', 'infraestructura', 'presentacion'].includes(p));

test('El dominio no importa frameworks, ni aplicación, ni infraestructura, ni presentación', () => {
  const violaciones = archivos(SRC)
    .filter((r) => capa(r) === 'dominio')
    .flatMap((r) => imports(r)
      .filter((i) => !i.startsWith('.') || /aplicacion|infraestructura|presentacion/.test(i))
      .map((i) => `${relative(SRC, r)} → ${i}`));
  assert.deepEqual(violaciones, []);
});

test('La aplicación solo depende del dominio (no de Express, pg ni adaptadores)', () => {
  const violaciones = archivos(SRC)
    .filter((r) => capa(r) === 'aplicacion')
    .flatMap((r) => imports(r)
      .filter((i) => (!i.startsWith('.') && !i.startsWith('node:')) || /infraestructura|presentacion/.test(i))
      .map((i) => `${relative(SRC, r)} → ${i}`));
  assert.deepEqual(violaciones, []);
});
