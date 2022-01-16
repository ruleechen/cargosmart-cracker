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
  {
    brick: "./materials/brick3.txt",
    ground: "./materials/ground3.txt",
  },
  {
    brick: "./materials/brick4.txt",
    ground: "./materials/ground4.txt",
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
  }).then((left) => {
    console.log(left);
  });
});
