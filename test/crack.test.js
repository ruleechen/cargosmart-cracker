/*
 * test
 */

const fs = require("fs");
const path = require("path");
const crack = require("../src/crack");

const materials = [
  {
    brick: "./materials/brick.txt",
    ground: "./materials/ground.txt",
  },
  {
    brick: "./materials/brick2.txt",
    ground: "./materials/ground2.txt",
  },
];

materials.forEach(({ brick, ground }) => {
  const groundDataString = fs.readFileSync(
    path.resolve(__dirname, ground),
    "utf8"
  );

  const brickDataString = fs.readFileSync(
    path.resolve(__dirname, brick),
    "utf8"
  );

  crack({
    groundDataString,
    brickDataString,
    brickTop: 31,
  }).then((left) => {
    console.log(left);
  });
});
