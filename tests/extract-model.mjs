/**
 * Вырезает блок модели из index.html в модуль для тестов.
 *
 * Модель живёт внутри страницы, чтобы инструмент оставался одним файлом
 * без сборки. Тесты гоняются по извлечённой копии.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'index.html'), 'utf8');

const script = html.split('<script>\n')[1].split('</script>')[0];
const marked = script.split('// ---- MODEL START')[1];
if (!marked) {
  console.error('Не найден блок MODEL START в index.html');
  process.exit(1);
}

// Первая строка — хвост разделителя из дефисов.
const model = marked.split('// ---- MODEL END')[0].split('\n').slice(1).join('\n');

const exports = [
  'fineFuelMoisture', 'moistureCoefficient', 'curingCoefficient',
  'grassRateOfSpread', 'lengthToBreadth', 'directionalRos',
  'seedРerimeterFactory', 'advancePerimeter', 'areaHectares',
  'maxReachKm', 'compassLabel', 'simulate', 'reparameterize', 'perimeterLength'
].join(', ');

writeFileSync(join(here, 'model.mjs'), `${model}\nexport { ${exports} };\n`);
console.log('Модель извлечена в tests/model.mjs');
