# Contributing

## How to contribute

1. **Fork** the repo
2. **Create a branch** (`git checkout -b feat/my-feature`)
3. **Make your changes**
4. **Test** by compiling a `.wfl` file: `node dist/index.js compile my-test.wfl`
5. **Commit** (`git commit -m "feat: description"`)
6. **Push** (`git push origin feat/my-feature`)
7. **Open a PR**

## Development setup

```bash
git clone https://github.com/ATLAS-DEV78423/AIC.git
cd AIC
npm install
npm run build
```

## Code style

- TypeScript, strict mode
- No external runtime dependencies
- Keep it simple — this is a compiler, not a framework

## What needs help

- **New component mappings** — add more HTML+Tailwind patterns to the default registry (`src/registry.ts`)
- **Documentation** — tutorial, cookbook, video
- **Language integrations** — webpack loader, Vite plugin, LSP
- **Syntax highlighting** — VS Code extension / TextMate grammar

## Questions?

Open an issue or start a discussion.
