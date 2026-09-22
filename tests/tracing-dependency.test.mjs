import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

// Exercise the transitive propagator that Contentlayer's tracing SDK resolves.
const require = createRequire(import.meta.url)
const sdkRequire = createRequire(require.resolve('@opentelemetry/sdk-trace-node'))
const { JaegerPropagator } = sdkRequire('@opentelemetry/propagator-jaeger')
const { ROOT_CONTEXT, trace, propagation, defaultTextMapGetter, defaultTextMapSetter } = sdkRequire('@opentelemetry/api')

test('Jaeger ignores malformed percent encoding without throwing', () => {
  const propagator = new JaegerPropagator()
  for (const headers of [
    { 'uber-trace-id': '%' },
    { 'uberctx-user': '%' },
    { 'uber-trace-id': '%E0%A4%A', 'uberctx-user': '%E0%A4%A' },
  ]) {
    assert.doesNotThrow(() => propagator.extract(ROOT_CONTEXT, headers, defaultTextMapGetter))
  }
})

test('patched Jaeger preserves valid trace context and baggage', () => {
  const propagator = new JaegerPropagator()
  const span = {
    traceId: '1234567890abcdef1234567890abcdef',
    spanId: '1234567890abcdef',
    traceFlags: 1,
  }
  const context = propagation.setBaggage(
    trace.setSpanContext(ROOT_CONTEXT, span),
    propagation.createBaggage({ project: { value: 'Reality Design Lab' } }),
  )
  const headers = {}
  propagator.inject(context, headers, defaultTextMapSetter)
  const extracted = propagator.extract(ROOT_CONTEXT, headers, defaultTextMapGetter)
  assert.deepEqual(trace.getSpanContext(extracted), { ...span, isRemote: true })
  assert.equal(propagation.getBaggage(extracted).getEntry('project').value, 'Reality Design Lab')
})
