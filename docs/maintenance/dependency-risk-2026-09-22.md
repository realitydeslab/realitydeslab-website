# Dependency risk review — 22 September 2026

The current lockfile has **22 moderate, zero high, and zero critical** npm audit findings. These are dependency-chain findings, not 22 distinct vulnerabilities.

## Fixed

`@opentelemetry/propagator-jaeger` is overridden to 2.11.0. Its public `TextMapPropagator` interface remains compatible with the installed tracing SDK. Regression tests resolve the propagator from that SDK, check malformed percent-encoded headers, and verify valid trace context and baggage round trips.

The [upstream Jaeger advisory](https://github.com/advisories/GHSA-45rx-2jwx-cxfr) describes an uncaught decoding exception when Jaeger is the active propagator. The patched package removes both high-severity audit findings in this dependency chain. This is a preventative dependency fix; no exposed Jaeger request handler was found in the application.

## Remaining finding

The installed Contentlayer/Effect tracing stack still requires OpenTelemetry core 1.30.1. The [core advisory](https://github.com/advisories/GHSA-8988-4f7v-96qf) concerns missing inbound W3C baggage limits and is fixed in core 2.8.0 and later. npm reports this through 22 affected packages.

A blanket core override is incompatible: core 2.x removes `getEnv`, `getEnvWithoutDefaults`, and other exports still called by the installed trace SDK and resource detectors. Do not force this upgrade or downgrade Pliny merely to clear the audit. Recheck when Contentlayer's tracing dependencies migrate.

Application source does not register Jaeger or W3C baggage propagation. Contentlayer enables its optional tracing through `CL_OTEL`; do not enable it on an untrusted request path. The current Next server output traces do not include the affected core/SDK/Jaeger packages. This limits observed runtime exposure, but does not erase the installed-package advisory. The upstream advisory also notes Node's default total HTTP header limit as a mitigating bound.

## Latest-version compatibility

Registry versions checked today: TypeScript 7.0.2 and ESLint 10.11.0 are newer than the installed TypeScript 6.0.3 and ESLint 9.39.5. The installed latest `typescript-eslint` 8.70.1 supports TypeScript >=4.8.4 and <6.1.0; `eslint-plugin-react` 7.37.5 declares ESLint support only through 9.7-compatible releases. These two tools remain pinned pending upstream compatibility. Other direct dependencies were already upgraded to the checked latest versions.

Sources: [typescript-eslint supported versions](https://typescript-eslint.io/users/dependency-versions/), package-registry peer dependency metadata, and the [ESLint 10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0).

## Reproduction

Run `npm ci`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --json`. Audit exits nonzero while the documented moderate findings remain. Local evidence is saved under ignored `output/audit/`, including the before/after audit, installation log, and build/check logs.
