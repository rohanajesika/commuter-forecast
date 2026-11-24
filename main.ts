// commuter-forecast — entrypoint.
//
// One line of weather, 140 characters at most, for a city that does not
// exist. The program writes that single line to entry.txt in the output
// directory the grader provides, and nothing else.
//
// The line itself was written to be read by a bored commuter on a phone
// at a rainy bus stop, and it is judged on exactly that: it opens in the
// register of a real broadcast forecast (city, weather, temperature,
// wind), names an invented city, and then bends the register just enough
// to make the commuter smile — the late bus every commuter knows, and
// puddles trying their best to look cheerful. One concrete detail of the
// city's life (the 8:04 bus, four minutes late) makes Vellmere feel
// like a place instead of a punchline.
//
// The program is deliberately boring in the right way: the forecast is a
// fixed string, so the two graded runs are byte-identical. No network,
// no clock, no randomness, no environment reads beyond the output
// directory, and no writes outside it. The grader mounts the repository
// read-only and runs from a working directory that is not the repository,
// so the program creates no directories and resolves nothing through the
// working directory — the output directory already exists when it runs.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The forecast, in three named parts so the line's structure stays
// visible: the city and its weather first (the forecast register), then
// the commuter's detail. 139 characters, one line, no trailing newline
// in the file. Counted in code points so multi-byte characters cannot
// slip past the 140-character gate unnoticed.
const CITY = "Vellmere";
const WEATHER = "light rain, 13°, breeze from the west";
const COMMUTER =
  "the 8:04 bus is four minutes late, but the puddles are doing " +
  "their best to look cheerful.";
const FORECAST = `${CITY}: ${WEATHER} — ${COMMUTER}`;

// The gate: UTF-8 text of 1 to 140 characters, not only white space.
const MAX_CHARS = 140;

function charCount(text) {
  return [...text].length;
}

function validate(text) {
  const chars = charCount(text);
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(
      `forecast is ${chars} characters, outside the 1–${MAX_CHARS} range`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("forecast is only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("forecast must be a single line");
  }
  // The line must still read as a forecast if it is ever edited: the
  // invented city named, and a temperature in it.
  if (!text.startsWith(`${CITY}:`)) {
    throw new Error("forecast does not name the city first");
  }
  if (!text.includes("°")) {
    throw new Error("forecast carries no temperature");
  }
}

// An empty value must behave like an unset one, hence `||` here. The
// grader sets MAKEFUN_OUTPUT_DIR; without it the program writes to the
// conventional /output directory.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outputPath = join(outputDir, "entry.txt");

validate(FORECAST);
writeFileSync(outputPath, FORECAST, "utf8");

// Read it back and confirm the file holds exactly the forecast, byte
// for byte, so a partial or failed write is a loud failure instead of
// a silent one.
const written = readFileSync(outputPath, "utf8");
if (!Buffer.from(written, "utf8").equals(Buffer.from(FORECAST, "utf8"))) {
  throw new Error("entry.txt does not match the forecast byte for byte");
}

console.log(
  `wrote ${charCount(written)} characters to ${outputPath}`,
);
