import { useMemo } from "react";

const resolvePrinterEndpoint = () => {
  const fallback = "/print";
  const envValue = import.meta.env.VITE_PRINTER_SERVICE_URL || fallback;

  try {
    const url = new URL(envValue, window.location.origin);
    return url.toString();
  } catch (error) {
    console.warn("Unable to resolve printer endpoint URL from", envValue, error);
    return envValue;
  }
};

const KitchenKDSApp = () => {
  const printerEndpoint = useMemo(resolvePrinterEndpoint, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-8 text-slate-100">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Kitchen KDS production shell</h1>
        <p className="mt-4 text-lg text-slate-300">
          Your build pipeline now produces a static Vite bundle that can be served directly by the hardened Express backend.
          Replace this placeholder with live order tiles, prep timers, and printer controls tailored to your kitchen workflow.
        </p>
        <div className="mt-8 rounded-lg border border-slate-700 bg-slate-800/60 p-6 text-left shadow-xl">
          <h2 className="text-xl font-semibold text-slate-200">Next integration steps</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">
            <li>Wire order feeds from your POS, Kafka topic, or REST API into React state.</li>
            <li>Display order status cards with timers so chefs can track preparation progress at a glance.</li>
            <li>Trigger print jobs against the Express `/print` endpoint for backup kitchen tickets.</li>
            <li>Use the CI/CD and Docker workflow in the repository to promote tested builds to production.</li>
          </ul>
        </div>
        <dl className="mt-8 space-y-3 text-left text-sm">
          <div className="flex flex-col rounded border border-slate-700 bg-slate-800/60 p-4">
            <dt className="text-slate-400">Printer service endpoint</dt>
            <dd className="font-mono text-slate-200">{printerEndpoint}</dd>
          </div>
          <div className="flex flex-col rounded border border-slate-700 bg-slate-800/60 p-4">
            <dt className="text-slate-400">Build mode</dt>
            <dd className="font-mono text-slate-200">{import.meta.env.MODE}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
};

export default KitchenKDSApp;
