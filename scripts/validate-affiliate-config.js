const fs = require("fs");
const path = require("path");

const configPath = path.join(
  process.cwd(),
  "data",
  "affiliates",
  "affiliate-config.v1.json"
);

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

let raw;
try {
  raw = fs.readFileSync(configPath, "utf8");
} catch (error) {
  console.error(`Failed to read affiliate config at ${configPath}.`);
  process.exit(1);
}

let config;
try {
  config = JSON.parse(raw);
} catch (error) {
  console.error(`Invalid JSON in affiliate config at ${configPath}.`);
  process.exit(1);
}

const errors = [];

if (!config || typeof config !== "object" || Array.isArray(config)) {
  errors.push("affiliateConfigV1 must be a JSON object.");
} else {
  for (const [key, program] of Object.entries(config)) {
    if (typeof key !== "string" || key.trim().length === 0) {
      errors.push("affiliateConfigV1 entry key must be a non-empty string.");
    }

    if (!program || typeof program !== "object" || Array.isArray(program)) {
      errors.push(`affiliateConfigV1["${key}"] must be an object.`);
      continue;
    }

    if (program.storeKey !== key) {
      errors.push(
        `affiliateConfigV1["${key}"].storeKey must match the map key.`
      );
    }

    if (program.enabled === false) {
      errors.push(
        `affiliateConfigV1["${key}"] has enabled: false. Remove the entry to disable.`
      );
      continue;
    }

    if (program.enabled !== true) {
      errors.push(`affiliateConfigV1["${key}"].enabled must be true.`);
      continue;
    }

    if (typeof program.network !== "string") {
      errors.push(`affiliateConfigV1["${key}"].network must be a string.`);
    } else if (program.network === "none") {
      errors.push(
        `affiliateConfigV1["${key}"].network cannot be "none" when enabled.`
      );
    }

    const params = program.params;
    const template =
      params && typeof params === "object" && !Array.isArray(params)
        ? params.template
        : undefined;

    if (typeof template !== "string" || template.trim().length === 0) {
      errors.push(
        `affiliateConfigV1["${key}"].params.template must be a non-empty string.`
      );
    }
  }
}

if (errors.length > 0) {
  errors.forEach((message) => fail(message));
}
