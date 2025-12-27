#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const Module = require("module");

const serverOnlyShimPath = path.resolve(__dirname, "server-only-shim.js");
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  if (request === "server-only") {
    return serverOnlyShimPath;
  }
  return originalResolveFilename.call(Module, request, parent, isMain, options);
};

require.extensions[".ts"] = function registerTs(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: filename,
  });
  return module._compile(outputText, filename);
};

const scriptPath = path.resolve(__dirname, "catalog/refresh-all.ts");
require(scriptPath);
