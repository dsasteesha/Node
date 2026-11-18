const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const useOtlp = process.env.OTEL_TRACES_EXPORTER === 'otlp';
const sdk = new NodeSDK({
  serviceName: 'todo-service',
  traceExporter: useOtlp
    ? new OTLPTraceExporter()
    : new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    sdk.shutdown().then(
      () => process.exit(0),
      (error) => {
        console.error('Failed to shut down tracing:', error);
        process.exit(1);
      },
    );
  });
}
