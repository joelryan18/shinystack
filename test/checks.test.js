import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { auditRepository, formatMarkdown, formatText } from "../src/checks.js";

const cliPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/cli.js");

function temporaryRepository() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shinystack-"));
}

function writeFile(root, relativePath, contents = "content\n") {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, contents);
}

test("an empty repository reports every check as incomplete", () => {
  const root = temporaryRepository();
  const report = auditRepository(root);

  assert.equal(report.passed, 0);
  assert.equal(report.score, 0);
  assert.equal(report.checks.length, 11);
});

test("the audit recognizes common project and community files", () => {
  const root = temporaryRepository();
  writeFile(root, "README.md", "# Example\n");
  writeFile(root, "LICENSE", "MIT\n");
  writeFile(root, "CONTRIBUTING.md");
  writeFile(root, "CODE_OF_CONDUCT.md");
  writeFile(root, "SECURITY.md");
  writeFile(root, ".github/workflows/ci.yml");
  writeFile(root, ".github/ISSUE_TEMPLATE/bug.yml");
  writeFile(root, ".github/PULL_REQUEST_TEMPLATE.md");
  writeFile(root, "tests/example.test.js");
  writeFile(root, "CHANGELOG.md");
  writeFile(root, "package.json", "{}\n");

  const report = auditRepository(root);
  assert.equal(report.passed, 11);
  assert.equal(report.score, 100);
  assert.ok(report.checks.every((check) => check.found));
});

test("text and markdown output include the score and check labels", () => {
  const root = temporaryRepository();
  writeFile(root, "README.md");
  const report = auditRepository(root);

  assert.match(formatText(report), /Score: 1\/11 checks passed/);
  assert.match(formatText(report), /README with setup instructions/);
  assert.match(formatMarkdown(report), /\| Status \| Check \| Details \|/);
  assert.match(formatMarkdown(report), /README with setup instructions/);
});

test("fail-under enforces a minimum score without requiring every check", () => {
  const root = temporaryRepository();
  writeFile(root, "README.md");

  const passing = spawnSync(process.execPath, [cliPath, "--path", root, "--fail-under", "9"], { encoding: "utf8" });
  const failing = spawnSync(process.execPath, [cliPath, "--path", root, "--fail-under", "10"], { encoding: "utf8" });

  assert.equal(passing.status, 0);
  assert.equal(failing.status, 1);
  assert.match(failing.stdout, /Score: 1\/11 checks passed/);
});

test("fail-under rejects values outside the percentage range", () => {
  const result = spawnSync(process.execPath, [cliPath, "--fail-under", "101"], { encoding: "utf8" });

  assert.equal(result.status, 2);
  assert.match(result.stderr, /--fail-under must be an integer from 0 to 100/);
});

test("markdown is accepted as an alias for md", () => {
  const root = temporaryRepository();
  writeFile(root, "README.md");

  const result = spawnSync(
    process.execPath,
    [cliPath, "--path", root, "--format", "markdown"],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 0);
  assert.match(result.stdout, /\| Status \| Check \| Details \|/);
});


test("ignored directories are not scanned", () => {
  const root = temporaryRepository();

  writeFile(root, "node_modules/fake.test.js");
  writeFile(root, "dist/README.md");
  writeFile(root, "coverage/package.json");
  writeFile(root, ".cache/CONTRIBUTING.md");

  const report = auditRepository(root);

  assert.equal(report.passed, 0);
  assert.equal(report.score, 0);
  assert.equal(report.checks[0].found, false);
  assert.equal(report.checks[8].found, false);
  assert.equal(report.checks[10].found, false);
});
