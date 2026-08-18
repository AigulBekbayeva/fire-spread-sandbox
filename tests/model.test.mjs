import * as m from './model.mjs';

let pass = 0, fail = 0;
function check(name, actual, expected, tol = 0.05) {
  const ok = Math.abs(actual - expected) <= tol;
  ok ? pass++ : fail++;
  console.log(`  ${ok ? '✓' : '✗'} ${name}: ${actual.toFixed(3)} (ожидалось ${expected})`);
}
function assert(name, cond) {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? '✓' : '✗'} ${name}`);
}

console.log("Сверка с питоновской моделью (те же опорные значения):");
check("ROS при ветре 10 км/ч", m.grassRateOfSpread(10, 32, 20, 90).rosKmh, 1.98);
check("ROS при ветре 20 км/ч", m.grassRateOfSpread(20, 32, 20, 90).rosKmh, 4.09);
check("ROS при ветре 30 км/ч", m.grassRateOfSpread(30, 32, 20, 90).rosKmh, 5.97);
check("влажность топлива T=30 RH=20", m.fineFuelMoisture(30, 20), 6.19, 0.01);
check("L/B при 25 км/ч", m.lengthToBreadth(25), 4.90, 0.01);

console.log("\nГраничные случаи:");
assert("зелёная трава не горит", m.grassRateOfSpread(25, 32, 20, 30).rosKmh < 0.1);
assert("штиль почти не двигает фронт", m.grassRateOfSpread(0, 32, 20, 90).rosKmh < 0.1);
assert("ROS неотрицателен", m.grassRateOfSpread(5, 10, 100, 20).rosKmh >= 0);
assert("L/B ограничен сверху", m.lengthToBreadth(500) <= 8.0);

console.log("\nНаправленная скорость (эллипс):");
const head = 5.0, lb = 4.0;
const front = m.directionalRos(head, lb, 0);
const back = m.directionalRos(head, lb, Math.PI);
const side = m.directionalRos(head, lb, Math.PI / 2);
check("вперёд = головная скорость", front, head, 0.01);
assert("назад медленнее, чем вбок", back < side);
assert("вбок медленнее, чем вперёд", side < front);
check("отношение голова/тыл при L/B=4", front / back, 61.98, 0.5);

console.log("\nГеометрия контура:");
const seed = m.seedРerimeterFactory(150, 96);
check("площадь стартового круга r=150м, га", m.areaHectares(seed), 7.07, 0.05);
assert("96 вершин", seed.length === 96);

console.log("\nРаспространение при постоянном ветре 25 км/ч на СВ (45°):");
let ring = seed;
const rate = m.grassRateOfSpread(25, 32, 20, 90);
for (let h = 0; h < 6; h++) {
  ring = m.advancePerimeter(ring, 45, rate.rosKmh, m.lengthToBreadth(25), 1.0);
}
const reach = m.maxReachKm(ring);
console.log(`  головная скорость ${rate.rosKmh.toFixed(2)} км/ч, за 6 ч дальность ${reach.toFixed(1)} км`);
check("дальность ≈ ROS × 6 ч", reach, rate.rosKmh * 6, 3.0);

// Куда ушёл центр масс
let cx = 0, cy = 0;
ring.forEach(p => { cx += p.x; cy += p.y; });
cx /= ring.length; cy /= ring.length;
const drift = (Math.atan2(cx, cy) * 180 / Math.PI + 360) % 360;
check("азимут смещения контура", drift, 45, 3);

console.log("\nПолный прогон с разворотом ветра:");
const series = Array.from({length: 13}, (_, i) => ({
  time: `2026-08-18T${String(9 + i).padStart(2, '0')}:00`,
  windKmh: 18 + i * 0.5,
  windFrom: 210 + i * 5,
  spreadBearing: (210 + i * 5 + 180) % 360,
  tempC: 30, humidityPct: 20
}));
const frames = m.simulate(series, { curingPct: 90, seedRadiusM: 150 });
assert("кадров столько же, сколько часов", frames.length === 13);
const areas = frames.map(f => f.areaHa);
assert("площадь не убывает", areas.every((a, i) => i === 0 || a >= areas[i-1] - 1e-9));
assert("азимут развернулся", Math.abs(frames[12].bearing - frames[1].bearing) > 40);
console.log(`  площадь: ${areas[0].toFixed(0)} → ${areas[12].toFixed(0)} га`);
console.log(`  снос: ${m.compassLabel(frames[1].bearing)} → ${m.compassLabel(frames[12].bearing)}`);
console.log(`  дальность: ${frames[12].reachKm.toFixed(1)} км`);

console.log(`\nИтог: ${pass} пройдено, ${fail} провалено`);
process.exit(fail ? 1 : 0);
