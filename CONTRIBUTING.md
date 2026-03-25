# Contributing to Playwright CLI Demo

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

1. **Check existing issues** - Search for similar bug reports first
2. **Use the bug template** - Click "New Issue" → "Bug Report"
3. **Provide clear steps** - Include steps to reproduce and expected vs actual behavior
4. **Include environment info** - OS, Node version, Playwright version, browser
5. **Attach logs** - Include test output or error messages

### Requesting Features

1. **Check existing requests** - Avoid duplicate feature requests
2. **Use the feature template** - Click "New Issue" → "Feature Request"
3. **Describe the problem** - What problem does this solve?
4. **Propose a solution** - How should this work?
5. **Provide context** - Why is this important?

### Submitting Changes

#### Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/playwright-cli-demo.git
cd playwright-cli-demo
```

#### Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/your-bug-name
```

#### Make Changes

1. **Write tests first** - Follow TDD approach when possible
2. **Follow patterns** - Use existing page objects and fixtures
3. **Keep commits focused** - One logical change per commit
4. **Update documentation** - Update README if needed

#### Test Your Changes

```bash
# Run all tests
npm test

# Run specific tests
npx playwright test e2e/auth.spec.ts

# Run in UI mode for debugging
npx playwright test --ui

# Run in debug mode
npx playwright test --debug
```

#### Commit and Push

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add new authentication test"

# Push to your fork
git push origin feature/your-feature-name
```

#### Submit a Pull Request

1. **Go to GitHub** - Navigate to your fork
2. **Click "Compare & Pull Request"**
3. **Use the PR template** - Fill out all sections
4. **Link related issues** - Use "Closes #123"
5. **Submit** - Describe your changes clearly

## Development Setup

### Prerequisites
- Node.js 18+
- Git
- A code editor (VS Code recommended)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Project Structure

```
playwright-cli-demo/
├── e2e/              # UI/E2E tests
├── api/              # API tests
├── pages/            # Page Object Models
├── fixtures/         # Test fixtures
├── .github/          # GitHub Actions & templates
└── playwright.config.ts
```

### Adding New Tests

#### Follow the Page Object Model

```typescript
// pages/NewPage.ts
export class NewPage {
  constructor(page: Page) {
    this.page = page;
    // Define locators
  }
  
  async someAction() {
    // Implement action
  }
}
```

#### Create Test File

```typescript
// e2e/feature.spec.ts
import { test, expect } from '../fixtures/saucedemoFixtures';

test.describe('Feature Name', () => {
  test('descriptive test name', async ({ page, newPage }) => {
    // Test implementation
  });
});
```

#### Test Naming Convention

```typescript
// Format: {Feature} - {Scenario}
test('Authentication - successful login with valid credentials');
test('Products - filter by price range');
test('Checkout - validate required fields');
```

### Code Style Guidelines

1. **Use TypeScript** - Always include proper types
2. **Descriptive names** - Use clear, meaningful names
3. **Comments** - Add comments for complex logic
4. **DRY principle** - Don't repeat yourself, use fixtures
5. **Consistent formatting** - Follow existing code style

### Running CI/CD Locally

Test against the same configuration as CI:

```bash
# Run on multiple Node versions
nvm use 18 && npm test
nvm use 20 && npm test

# Test all browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Documentation

When adding features, update:
- **README.md** - Add feature overview
- **Inline comments** - Document complex logic
- **Test descriptions** - Clear, specific test names
- **Type definitions** - Proper TypeScript types

## Review Process

### What We Look For

✅ **Good PR**
- Clear description and purpose
- Tests included and passing
- Follows code conventions
- Documentation updated
- Focused on single concern

❌ **Issues**
- Large unrelated changes
- No tests
- Poor commit messages
- Breaking changes not documented
- Incomplete PR description

### CI/CD Checks

All PRs must pass:
- [x] Playwright Tests (Chromium, Firefox, WebKit)
- [x] Code Quality (TypeScript, config validation)
- [x] Artifact Generation (reports uploaded)

View results in the checks section of your PR.

## Tips for Success

### Before Starting
- Check GitHub Issues for discussions
- Comment on the issue you're working on
- Wait for approval before major changes

### While Working
- Use descriptive commit messages
- Keep commits small and focused
- Test locally before pushing
- Use branches effectively

### When Submitting
- Close the PR template properly
- Link related issues
- Respond to review comments promptly
- Keep the PR updated with main branch

## Common Issues

### Tests Failing Locally

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npx playwright install --with-deps
npm test
```

### Playwright Browsers Issue

```bash
# Reinstall browsers
npx playwright install --with-deps chromium firefox webkit
```

### TypeScript Errors

```bash
# Check compilation
npx tsc --noEmit

# Fix errors shown in output
```

## Getting Help

- **GitHub Issues** - Search existing or create new
- **Discussions** - Use Discussions tab for questions
- **Pull Request Comments** - Ask for clarification directly

## Recognition

- All contributors are recognized in commits
- Regular contributors are invited as maintainers
- Special thanks in README for major contributions

---

**Thank you for contributing!** Your efforts help make this project better for everyone. 🙌
