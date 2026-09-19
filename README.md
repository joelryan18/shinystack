# ShinyStack

ShinyStack audits an open-source repository for the files and workflows that help people use, maintain, and contribute to it. It runs locally, has no runtime dependencies, and produces text, JSON, or Markdown output.

## Why ShinyStack?

People should be able to answer three questions before contributing to a project:

1. How do I install and run it?
2. How do I report a problem or propose a change?
3. How do I know my change is safe?

ShinyStack checks for the repository basics behind those answers and gives maintainers an actionable checklist.

## Quick start

Requires Node.js 18 or newer.

```bash
git clone https://github.com/joelryan18/shinystack.git
cd shinystack
npm test
node src/cli.js --path /path/to/repository
```

Audit the current directory:

```bash
node src/cli.js
```

Generate machine-readable output for CI:

```bash
node src/cli.js --format json
```

Generate a report that can be attached to an issue or pull request:

```bash
node src/cli.js --format md > shinystack-report.md
```

Make a failed check fail the command:

```bash
node src/cli.js --strict
```

Enforce a score threshold in CI while allowing a few checks to remain incomplete:

```bash
node src/cli.js --fail-under 80
```

For a copy-paste GitHub Actions workflow, see the [CI integration guide](docs/ci-integration.md).

## Checks

The first release checks for:

- README and setup instructions
- An open-source license
- Contributor guidelines
- A Code of Conduct
- A security policy
- Continuous integration
- Issue templates
- A pull request template
- Automated tests
- A changelog or release history
- Project package or build metadata

ShinyStack reports findings; it does not modify the repository being audited.

The command exits with code `1` when `--strict` finds an incomplete check or when the score is below `--fail-under`. This makes it suitable for a required CI check.

## Exit codes

ShinyStack returns these exit codes:

| Code | Meaning |
| --- | --- |
| 0 | The audit completed successfully. |
| 1 | --strict found an incomplete check, or the score is below --fail-under. |
| 2 | The command-line arguments are invalid. |

For example, this command returns code 1 when the repository score is below
80 percent:

```bash
node src/cli.js --fail-under 80

## Contributing

The project is intentionally small and dependency-free. See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, design notes, and good first contributions.

## License

ShinyStack is available under the [MIT License](LICENSE).
