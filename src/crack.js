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

  const ground = await Jimp.read(groundBuf);
  const brick = await Jimp.read(brickBuf);

  const groundWidth = ground.getWidth();
  const groundHeight = ground.getHeight();
  const brickWidth = brick.getWidth();
  const brickHeight = brick.getHeight();

  const border = [];
  let brickMinY = Number.MAX_VALUE;

  for (let brickX = 0; brickX < brickWidth; brickX++) {
    const yPoints = [];
    for (let brickY = 0; brickY < brickHeight; brickY++) {
      const color = brick.getPixelColor(brickX, brickY);
      if (color) {
        yPoints.push({
          brickY,
          color,
        });
      }
    }
    if (yPoints.length) {
      const pair = {
        brickX,
        topY: yPoints[0].brickY,
        topYColor: yPoints[0].color,
        bottomY: yPoints[yPoints.length - 1].brickY,
        bottomYColor: yPoints[yPoints.length - 1].color,
      };
      if (pair.topY < brickMinY) {
        brickMinY = pair.topY;
      }
      border.push(pair);
    }
  }

  console.log({
    brickMinY,
    groundWidth,
    groundHeight,
    brickWidth,
    brickHeight,
  });

  const clonedBorder = JSON.parse(JSON.stringify(border));
  let pairIndex = 0;
  for (let groundX = 0; groundX < groundWidth; groundX++) {
    const pair = clonedBorder[pairIndex];
    if (pair) {
      const topColor = ground.getPixelColor(groundX, pair.topY);
      const bottomColor = ground.getPixelColor(groundX, pair.bottomY);
      if (topColor === bottomColor) {
        pair.groundX = groundX;
        pair.groundColor = topColor;
        pairIndex++;
      } else if (pairIndex !== 0) {
        pairIndex = 0;
      }
    }
  }

  const firstMatchedPair = clonedBorder.find((x) => x.groundColor);

  return {
    x: firstMatchedPair
      ? firstMatchedPair.groundX - firstMatchedPair.brickX
      : -1,
    y: firstMatchedPair ? brickMinY : -1,
  };
};

module.exports = crack;
