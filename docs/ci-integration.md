# GitHub Actions integration
     ShinyStack can audit a repository during continuous integration and fail when its readiness score is below a chosen percentage.
     Add this workflow to the repository being audited as `.github/workflows/shinystack.yml`:
     ```yaml
     name: ShinyStack audit
     on:
       push:
       pull_request:
     permissions:
       contents: read
     jobs:
       audit:
         runs-on: ubuntu-latest
         steps:
           - name: Check out the repository being audited
             uses: actions/checkout@v4
           - name: Check out ShinyStack
             uses: actions/checkout@v4
             with:
               repository: joelryan18/shinystack
               path: .shinystack
           - name: Set up Node.js
             uses: actions/setup-node@v4
             with:
               node-version: 20
           - name: Run ShinyStack
             run: node .shinystack/src/cli.js --path . --format md --fail-under 80
     The command exits with status 1 when the repository score is below 80%.
     Run the audit locally with:
     node src/cli.js --path /path/to/repository --fail-under 80
