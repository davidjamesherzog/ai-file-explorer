# Testing with Vitest

This project uses [Vitest](https://vitest.dev/) as the testing framework, along with [@vue/test-utils](https://test-utils.vuejs.org/) for component testing.

## Running Tests

```bash
# Run tests in watch mode (default)
npm test

# Run tests once
npm test -- --run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are located in the `test/` directory and follow the naming convention `*.test.ts` or `*.spec.ts`.

### Example: Basic Test

```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(1 + 1).toBe(2);
  });
});
```

### Example: Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MyComponent from 'src/components/MyComponent.vue';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent);
    expect(wrapper.text()).toContain('Expected text');
  });
});
```

## Configuration

The Vitest configuration is in `vitest.config.ts`. Key features:

- **Environment**: `happy-dom` for DOM simulation
- **Globals**: Vitest globals are enabled (no need to import `describe`, `it`, `expect`)
- **Setup**: `test/setup.ts` configures Vue Test Utils with Quasar
- **Coverage**: V8 provider with HTML, JSON, and text reports
- **Path Aliases**: Configured to match your project structure

## Testing Quasar Components

Quasar components are automatically available in tests thanks to the setup file:

```typescript
import { mount } from '@vue/test-utils';
import { QBtn } from 'quasar';

const wrapper = mount({
  template: '<QBtn label="Click me" />',
  components: { QBtn },
});
```

## Best Practices

1. **Organize tests** by feature or component
2. **Use descriptive test names** that explain what is being tested
3. **Keep tests isolated** - each test should be independent
4. **Mock external dependencies** when needed
5. **Test user interactions** not implementation details
6. **Aim for good coverage** but focus on critical paths

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
