export function noiseGen(x, z, seed) {
  const xSmth = Math.imul(x, 373761393);

  const ySmth = Math.imul(z, 668265263);

  const seedSmth = Math.imul(seed, 97463411);

  const totalSmth =
    (((Math.imul((xSmth + ySmth + seedSmth) >> 13, 1274126177) >> 16) ^
      Math.imul((xSmth + ySmth + seedSmth) >> 13, 1274126177)) >>>
      0) /
    4294967295;

  return totalSmth;
}

export function pointMap(x, z, seed) {
  const xFloor = Math.floor(x);
  const zFloor = Math.floor(z);

  const xBit = x - xFloor;
  const zBit = z - zFloor;

  const xSq = Math.pow(xBit, 2) * 3;
  const xCubed = Math.pow(xBit, 3) * 2;

  const smoothX = xSq - xCubed;

  const zSq = Math.pow(zBit, 2) * 3;
  const zCubed = Math.pow(zBit, 3) * 2;

  const smoothZ = zSq - zCubed;

  const hBl = noiseGen(xFloor, zFloor, seed);
  const hBr = noiseGen(xFloor + 1, zFloor, seed);

  const hTl = noiseGen(xFloor, zFloor + 1, seed);
  const hTr = noiseGen(xFloor + 1, zFloor + 1, seed);

  const bottomG = (hBr - hBl) * smoothX;
  const topG = (hTr - hTl) * smoothX;

  const bottom = hBl + bottomG;
  const top = hTl + topG;

  const finalG = (top - bottom) * smoothZ + bottom;

  return finalG;
}

export function hillHeight(x, z, seed) {
  let total = 0;
  const strength = 1;
  const zoom = 0.05;
  let sample;
  let runZoom;
  let runStrength;

  for (let i = 0; i < 4; i++) {
    runZoom = zoom * Math.pow(2, i);
    runStrength = strength * (1 / Math.pow(2, i));
    sample = pointMap(x * runZoom, z * runZoom, seed) * runStrength;
    total += sample;
  }

  return total;
}

export default noiseGen;
