# Kitchen KDS App – Production Setup Guide

This document describes how to take the Kitchen KDS template from local development to a production-ready deployment. It covers hardening both the Vite/React client and the Express-based print service so that you can confidently ship to real kitchens.

## 1. Prerequisites

- **Node.js 20 LTS** or newer. Install via [nodejs.org](https://nodejs.org/) or a version manager such as `nvm`.
- **Package manager**: npm (bundled with Node), pnpm, or yarn. All examples below use npm.
- **Git** for source control.
- **Process manager** for the server (e.g., PM2, systemd, or Docker runtime) if you deploy the Express service.

## 2. Repository bootstrap

```bash
# Clone the repo
git clone <your-fork-url>
cd kitchen-kds-app

# Install dependencies
npm install
```

Commit your own `.nvmrc` or toolchain pin if your team standardizes on a specific Node release.

## 3. Environment configuration

1. Copy the sample environment file and customize it:
   ```bash
   cp .env.example .env
   ```

2. Define the following variables based on your infrastructure:
   - `VITE_API_BASE_URL` – URL the front end uses for API calls (e.g., `https://api.example.com`).
   - `PRINTER_SERVICE_URL` – URL of the Express print service (e.g., `http://printer-service.internal:4000`).
   - `NODE_ENV` – set to `production` when building or serving production bundles.

3. Never commit secrets. Use `.env.local` in development and a secrets manager (Vault, AWS Parameter Store, etc.) in production.

Add `.env*` to `.gitignore` (already handled below) so sensitive data stays out of version control.

## 4. Building the front end

The React UI is a static bundle that can be served by any CDN or edge-capable platform.

```bash
npm run build
```

The artifacts land in `dist/`. Upload this directory to your hosting provider (Netlify, Vercel, CloudFront + S3, etc.) or serve it from the Express server using a static middleware.

### Optional: bundle analysis and performance budgets

- Add [`rollup-plugin-visualizer`](https://github.com/btd/rollup-plugin-visualizer) or Vite's built-in `--mode` flags to inspect bundle size.
- Configure [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) to enforce performance, accessibility, and SEO budgets.

## 5. Hardening the Express print service

The sample `server.js` listens on port 4000 and accepts print payloads. To productionize it:

1. **Validation**: Validate request bodies (e.g., with `zod` or `Joi`) and return helpful error responses.
2. **Security**: Add CORS rules, authentication (API keys, mTLS, or OAuth), and rate limiting (`express-rate-limit`).
3. **Logging**: Replace `console.log` with a structured logger such as `pino` and stream logs to your observability stack.
4. **Error handling**: Use an Express error middleware and respond with appropriate HTTP codes.
5. **Printer integration**: Implement the actual print command (ESC/POS, network printers, etc.) and handle retries.
6. **Configuration**: Read ports, credentials, and printer addresses from environment variables.

### Deployment options

- **Managed Node host**: Deploy with Docker to AWS ECS/Fargate, Google Cloud Run, or Azure Container Apps.
- **Self-managed VM**: Use PM2 or systemd to keep the process alive, reverse-proxy with NGINX/Traefik, and terminate TLS at the edge.
- **Serverless function**: Wrap the `/print` handler in a serverless adapter (e.g., AWS Lambda + API Gateway) if print latency tolerates cold starts.

## 6. Static hosting + API gateway topology

A common production layout looks like this:

```
[Browser] --HTTPS--> [CDN + Static Hosting (dist/)]
                    |
                    +--HTTPS--> [API Gateway / Load Balancer]
                                  |
                                  +--> [Express Print Service / Microservice]
```

Use a shared domain or subdomain with proper TLS certificates. Configure CORS to allow the front end to call the print service.

## 7. Continuous integration and delivery (CI/CD)

1. **Linting & tests**: Add GitHub Actions or another CI tool to run unit tests (`npm test`), type checks (`npm run typecheck`), and linting (`npm run lint`).
2. **Build pipeline**: Cache `node_modules`, run `npm run build`, and publish the `dist/` artifacts as build outputs.
3. **Deploy**: Use deployment jobs to push the static bundle to your hosting provider and roll out the Express service (container registry + orchestrator deploy).
4. **Secrets**: Inject runtime secrets via CI/CD environment variables or secret stores.

## 8. Observability & operations

- **Monitoring**: Export application metrics (Prometheus, Datadog) and set alerts on latency and error rates.
- **Logging**: Centralize logs; include order identifiers to trace print jobs end-to-end.
- **Tracing**: Add OpenTelemetry instrumentation if you integrate with multiple services.
- **Health checks**: Implement `/healthz` on the Express service for orchestrator liveness probes.

## 9. Quality & resilience checklist

- [ ] Automated tests cover business-critical flows.
- [ ] TypeScript `strict` mode passes without errors.
- [ ] Security scanning (e.g., `npm audit`, Snyk) integrated into CI.
- [ ] Load test the print endpoint to size infrastructure.
- [ ] Graceful shutdown handles in-flight print jobs.
- [ ] Backups for any persistent state (if you add databases).

## 10. Next steps

- Extend the front end with authentication-aware routes and per-kitchen views.
- Configure feature flags for gradual rollouts.
- Document on-call runbooks for printer failures.

Following these steps will help you evolve the starter kit into a production-grade Kitchen KDS platform.
