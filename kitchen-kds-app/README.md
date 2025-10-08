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
   - `VITE_PRINTER_SERVICE_URL` – URL the UI calls to create print jobs (defaults to `/print`).
   - `PRINTER_SERVICE_PORT` – TCP port exposed by the Express server (defaults to `4000`).
   - `ALLOWED_ORIGINS` – comma-separated list of HTTPS origins allowed to call the API.
   - `NODE_ENV` – set to `production` when building or serving production bundles.

3. Never commit secrets. Use `.env.local` in development and a secrets manager (Vault, AWS Parameter Store, etc.) in production.

Add `.env*` to `.gitignore` (already handled below) so sensitive data stays out of version control.

> **Note:** When you run `node server.js` or `npm run start`, the server reads variables from a local `.env` file if present. In production, prefer your platform's secret injection instead of shipping `.env` files inside containers or images.

## 4. Building the front end

The React UI is a static bundle that can be served by any CDN or edge-capable platform.

```bash
npm run build
npm run start
```

The `build` command compiles the React UI into the `dist/` directory. The hardened Express server automatically serves this directory as static assets, so running `npm run start` after building exposes both the API and UI on the same port. Place this command under a process manager (PM2, systemd) or run it inside Docker for production uptime.

### Optional: bundle analysis and performance budgets

- Add [`rollup-plugin-visualizer`](https://github.com/btd/rollup-plugin-visualizer) or Vite's built-in `--mode` flags to inspect bundle size.
- Configure [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) to enforce performance, accessibility, and SEO budgets.

## 5. Hardening the Express print service

The sample `server.js` listens on port 4000 and accepts print payloads. To productionize it:

The hardened server already provides request validation, CORS enforcement, secure headers, JSON body parsing, access logging, and graceful shutdown hooks. Extend it further with:

1. **Authentication**: Enforce API keys, OAuth client credentials, or mutual TLS to restrict access.
2. **Rate limiting**: Add `express-rate-limit` or rely on your ingress controller to throttle abusive clients.
3. **Printer integration**: Implement the actual print command (ESC/POS, network printers, etc.) and handle retries.
4. **Configuration management**: Wire secrets from your platform (AWS Parameter Store, Doppler, Vault) into the environment.

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

Use a shared domain or subdomain with proper TLS certificates. Configure CORS via the `ALLOWED_ORIGINS` environment variable to allow the front end to call the print service and terminate TLS at your ingress layer.

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

## 9. Container image build

The repository ships with a multi-stage Dockerfile that compiles the Vite front end and runs the hardened Express server. Build a production image with:

```bash
docker build -t kitchen-kds-app:latest .
```

Run it with your environment configuration mounted:

```bash
docker run -d \
  -p 4000:4000 \
  --env-file .env \
  --name kitchen-kds kitchen-kds-app:latest
```

Push the resulting image to your registry and deploy it to an orchestrator such as AWS ECS/Fargate, Google Cloud Run, Azure Container Apps, or Kubernetes. Leverage the platform for log shipping, autoscaling, and secret injection.

## 10. Quality & resilience checklist

- [ ] Automated tests cover business-critical flows.
- [ ] TypeScript `strict` mode passes without errors.
- [ ] Security scanning (e.g., `npm audit`, Snyk) integrated into CI.
- [ ] Load test the print endpoint to size infrastructure.
- [ ] Graceful shutdown handles in-flight print jobs.
- [ ] Backups for any persistent state (if you add databases).

## 11. Next steps

- Extend the front end with authentication-aware routes and per-kitchen views.
- Configure feature flags for gradual rollouts.
- Document on-call runbooks for printer failures.

Following these steps will help you evolve the starter kit into a production-grade Kitchen KDS platform.
