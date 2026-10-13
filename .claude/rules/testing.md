# Testing Rules

## Stack
- **Unit**: Vitest
- **Component**: React Testing Library
- **E2E**: Playwright
- **API**: supertest + Vitest

## Coverage Targets
- Fusion calculator: 100% (critical logic).
- Data validators: 100%.
- UI components: ≥ 80%.
- Overall: ≥ 85%.

## Test Naming
```ts
describe('FusionCalculator', () => {
  it('returns valid recipes for Thanatos', () => { ... });
  it('rejects invalid arcana pair', () => { ... });
});
```

## Rules
- Every bug fix must include a regression test.
- Every new feature must include tests before merge.
- Mock external APIs; never hit real game servers.
- Snapshot tests for UI only when stable.