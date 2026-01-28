# Local Development Guide

This guide explains how to clone the `cucumber-to-docx` repository, make changes, and test them in another project before publishing.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm
- Git

## Setup for Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/orieken/cucumber-to-docx.git
cd cucumber-to-docx
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm:
```bash
pnpm install
```

### 3. Build the Project

```bash
npm run build
```

This will compile the TypeScript code and generate the distribution files in the `dist/` directory.

### 4. Create a Global Link

This creates a symlink in your global `node_modules` that points to your local development version:

```bash
npm link
```

Or with pnpm:
```bash
pnpm link --global
```

## Using the Local Version in Another Project

### 1. Navigate to Your Test Project

```bash
cd /path/to/your/test-project
```

### 2. Link to Your Local Development Version

```bash
npm link @orieken/cucumber-to-docx
```

Or with pnpm:
```bash
pnpm link --global @orieken/cucumber-to-docx
```

This replaces the published npm package with your local development version.

### 3. Test Your Changes

Now when you use `@orieken/cucumber-to-docx` in your test project, it will use your local development version.

```bash
# If using the CLI
npx cuke-docx features/

# Or if importing in code
node your-test-script.js
```

## Development Workflow

### Making Changes

1. **Edit the source code** in the `cucumber-to-docx` directory
2. **Rebuild the project** after making changes:
   ```bash
   npm run build
   ```
3. **Test in your linked project** - the changes will be immediately available
4. **Run tests** to ensure nothing broke:
   ```bash
   npm test
   ```

### Watch Mode (Optional)

For faster development, you can use watch mode to automatically rebuild on file changes:

```bash
npm run build -- --watch
```

Or set up a separate terminal with:
```bash
npm run dev
```
(if a dev script exists)

## Unlinking When Done

### In Your Test Project

Remove the link and reinstall the published version:

```bash
npm unlink @orieken/cucumber-to-docx
npm install @orieken/cucumber-to-docx
```

Or with pnpm:
```bash
pnpm unlink --global @orieken/cucumber-to-docx
pnpm install @orieken/cucumber-to-docx
```

### In the cucumber-to-docx Repository

Remove the global link:

```bash
npm unlink
```

Or with pnpm:
```bash
pnpm unlink --global
```

## Troubleshooting

### Changes Not Reflecting

If your changes aren't showing up in the test project:

1. Make sure you rebuilt the project: `npm run build`
2. Check that the link is active: `npm ls -g --link @orieken/cucumber-to-docx`
3. Try unlinking and relinking both sides

### TypeScript Errors

If you see TypeScript errors in your test project:

1. Ensure the build completed successfully
2. Check that `dist/` directory contains the compiled files
3. Verify `dist/index.d.ts` exists for type definitions

### Module Not Found

If you get "module not found" errors:

1. Verify the link exists: `ls -la node_modules/@orieken/cucumber-to-docx`
2. It should show as a symlink pointing to your local repository
3. Try removing `node_modules` and reinstalling: `rm -rf node_modules && npm install`

## Publishing Your Changes

Once you've tested your changes and are ready to publish:

1. **Run all tests**: `npm test`
2. **Update version**: `npm version patch` (or `minor`/`major`)
3. **Commit changes**: `git add . && git commit -m "Your changes"`
4. **Push to GitHub**: `git push && git push --tags`
5. **Publish to npm**: `npm publish`

## Quick Reference

```bash
# In cucumber-to-docx repo
git clone https://github.com/orieken/cucumber-to-docx.git
cd cucumber-to-docx
npm install
npm run build
npm link

# In your test project
cd /path/to/test-project
npm link @orieken/cucumber-to-docx

# Make changes, rebuild, test
cd /path/to/cucumber-to-docx
# ... edit files ...
npm run build
npm test

# When done testing
cd /path/to/test-project
npm unlink @orieken/cucumber-to-docx
npm install @orieken/cucumber-to-docx
```
