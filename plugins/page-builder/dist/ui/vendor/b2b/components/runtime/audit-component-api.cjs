#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const runtimeRoot = __dirname;
const componentRoot = path.resolve(runtimeRoot, "..");
const sandbox = { window: {}, console };
vm.createContext(sandbox);

["contracts.js", "api-schema.js", "presets.js"].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(runtimeRoot, file), "utf8"), sandbox, { filename: file });
});

const registry = sandbox.window.B2B.components;
const contracts = registry.contracts;
const schemas = registry.apiSchemas;
const presets = registry.rendererPresets;
const requested = process.argv.slice(2).flatMap((value) => value.split(",")).filter(Boolean);
const ids = requested.length ? requested : Object.keys(schemas);

function sameValues(left, right) {
  const a = (left || []).map(String).sort();
  const b = (right || []).map(String).sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function typeMatches(value, type) {
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "enum") return true;
  return typeof value === type;
}

function exists(relativePath) {
  return Boolean(relativePath) && fs.existsSync(path.join(componentRoot, relativePath));
}

const results = ids.map((id) => {
  const errors = [];
  const contract = contracts[id];
  const api = schemas[id];
  const preset = presets[id];

  if (!contract) errors.push("missing contract");
  if (!api) errors.push("missing api schema");
  if (!preset) errors.push("missing renderer presets");
  if (!api) return { id, errors };

  if (api.id !== id) errors.push("api.id mismatch");
  if (!api.name) errors.push("missing api.name");
  if (api.additionalProperties !== false) errors.push("additionalProperties must be false");
  if (!api.props || !Object.keys(api.props).length) errors.push("missing public props whitelist");

  Object.entries(api.props || {}).forEach(([name, rule]) => {
    if (!rule.type) errors.push(`${name}: missing type`);
    if (Object.prototype.hasOwnProperty.call(rule, "default")) {
      const types = String(rule.type || "").split("|");
      if (!types.some((type) => typeMatches(rule.default, type))) errors.push(`${name}: default/type mismatch`);
      if (rule.values && !rule.values.includes(rule.default)) errors.push(`${name}: default outside values`);
    }
  });

  (api.events || []).forEach((eventName) => {
    if (!String(eventName).startsWith("b2b:")) errors.push(`invalid event namespace: ${eventName}`);
  });
  if (!Array.isArray(api.keyboard)) errors.push("keyboard must be an array");
  if (!exists(api.domSource)) errors.push(`missing domSource: ${api.domSource || "<empty>"}`);
  (api.styleSource || []).forEach((source) => {
    if (!exists(source)) errors.push(`missing styleSource: ${source}`);
  });
  if (!exists(api.interactionSource)) errors.push(`missing interactionSource: ${api.interactionSource || "<empty>"}`);
  if (contract && !exists(contract.source)) errors.push(`missing contract source: ${contract.source || "<empty>"}`);

  const variants = api.props && api.props.variant && api.props.variant.values;
  if (variants && contract && !sameValues(variants, contract.variants)) errors.push("variant values != contract variants");
  if (variants && preset && !sameValues(variants, Object.keys(preset.variants || {}))) errors.push("variant values != preset keys");
  if (variants && preset && api.props.variant.default !== preset.defaultVariant) errors.push("variant default != preset defaultVariant");

  return { id, errors };
});

const failed = results.filter((result) => result.errors.length);
results.forEach((result) => {
  const marker = result.errors.length ? "FAIL" : "PASS";
  console.log(`${marker} ${result.id}${result.errors.length ? ` — ${result.errors.join("; ")}` : ""}`);
});
console.log(`\nComponent API Protocol audit: ${results.length - failed.length}/${results.length} passed`);

if (failed.length) process.exitCode = 1;

