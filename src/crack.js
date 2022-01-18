/*
 * crack
 */

const Jimp = require("jimp");

const decodeBase64DataUri = (dataString) => {
  const matches = dataString.match(/^data:([^;]+);([^,]+),(.+)$/);
  const type = matches[1];
  const encoding = matches[2];
  const bufferStr = matches[3];
  if (!type || !encoding || !bufferStr) {
    throw new Error("Invalid input string");
  }
  return {
    type,
    encoding,
    buffer: Buffer.from(bufferStr, encoding),
  };
};

const toRGB = (color) => {
  // return Jimp.intToRGBA(color);
  return {
    r: (color >> 24) & 255,
    g: (color >> 16) & 255,
    b: (color >> 8) & 255,
  };
};

const round = (number, decimals) => {
  const scale = Math.pow(10, decimals);
  return Math.round(number * scale) / scale;
};

const crack = async ({ groundDataString, brickDataString }) => {
  let groundBuf;
  try {
    groundBuf = decodeBase64DataUri(groundDataString).buffer;
  } catch (ex) {
    groundBuf = Buffer.from(groundDataString, "base64");
  }

  let brickBuf;
  try {
    brickBuf = decodeBase64DataUri(brickDataString).buffer;
  } catch (ex) {
    brickBuf = Buffer.from(brickDataString, "base64");
  }

  // border pixels of brick
  const brick = await Jimp.read(brickBuf);
  const brickWidth = brick.getWidth();
  const brickHeight = brick.getHeight();
  const borderPixels = [];
  for (let brickX = 0; brickX < brickWidth; brickX++) {
    const yPixels = [];
    for (let brickY = 0; brickY < brickHeight; brickY++) {
      const color = brick.getPixelColor(brickX, brickY);
      if (color) {
        yPixels.push({
          brickY,
          color: toRGB(color),
        });
      }
    }
    if (yPixels.length > 0) {
      const pixel = yPixels[0];
      borderPixels.push({
        x: brickX,
        y: pixel.brickY,
        color: pixel.color,
      });
    }
    if (yPixels.length > 1) {
      const pixel = yPixels[yPixels.length - 1];
      borderPixels.push({
        x: brickX,
        y: pixel.brickY,
        color: pixel.color,
      });
    }
  }
  const minBrickX = borderPixels.reduce((prev, curr) => {
    return prev.x < curr.x ? prev : curr;
  }).x;
  const minBrickY = borderPixels.reduce((prev, curr) => {
    return prev.y < curr.y ? prev : curr;
  }).y;

  // all pixels of ground
  const ground = await Jimp.read(groundBuf);
  const groundWidth = ground.getWidth();
  const groundHeight = ground.getHeight();
  const groundPixels = {};
  for (let groundX = 0; groundX < groundWidth; groundX++) {
    groundPixels[groundX] = {};
    for (let groundY = 0; groundY < groundHeight; groundY++) {
      const color = ground.getPixelColor(groundX, groundY);
      groundPixels[groundX][groundY] = toRGB(color);
    }
  }

  // do comparison
  const compares = [];
  for (let groundX = 0; groundX < groundWidth - brickWidth; groundX++) {
    const diffs = [];
    borderPixels.forEach(({ x, y, color }) => {
      const groundColor = groundPixels[groundX + x][y];
      const redDiff = color.r - groundColor.r;
      const greenDiff = color.g - groundColor.g;
      const blueDiff = color.b - groundColor.b;
      diffs.push((redDiff + greenDiff + blueDiff) / 3);
    });
    const total = diffs.reduce((prev, curr) => prev + curr, 0);
    const average = total / diffs.length;
    const confidence = 1 - average / 255;
    compares.push({
      groundX,
      confidence,
    });
  }

  // the best confidence
  const best = compares.reduce((prev, curr) => {
    return prev.confidence > curr.confidence ? prev : curr;
  });

  // done
  return {
    confidence: round(best.confidence, 4),
    x: best.groundX + minBrickX,
    y: minBrickY,
  };
};

module.exports = crack;
