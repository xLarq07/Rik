import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

export type ObservabilityConfig = {
  serviceName: string;
  environment: 'development' | 'staging' | 'production';
  traceExporterEndpoint: string;
  metricsPort: number;
};

export const setupObservability = (config: ObservabilityConfig) => {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

  const resource = new Resource({
    'service.name': config.serviceName,
    'deployment.environment': config.environment
  });

  const traceProvider = new NodeTracerProvider({ resource });
  const traceExporter = new OTLPTraceExporter({ url: config.traceExporterEndpoint });
  traceProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
  traceProvider.register();

  const prometheusExporter = new PrometheusExporter({ port: config.metricsPort });
  prometheusExporter
    .startServer()
    .then(() => diag.info(`Prometheus metrics server listening on :${config.metricsPort}`))
    .catch((error) => diag.error('Prometheus metrics server başlatılamadı', error));

  const metricReader = new PeriodicExportingMetricReader({ exporter: prometheusExporter });
  const meterProvider = new MeterProvider({ resource });
  meterProvider.addMetricReader(metricReader);

  return {
    tracer: traceProvider.getTracer(config.serviceName),
    meter: meterProvider.getMeter(config.serviceName),
    shutdown: async () => {
      await Promise.all([traceProvider.shutdown(), meterProvider.shutdown(), prometheusExporter.shutdown()]);
    }
  };
};
