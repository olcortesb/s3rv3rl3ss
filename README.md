# s3rv3rl3ss

Runtimes, limits, quotas, pricing and news for serverless services across AWS, GCP, Azure and STACKIT — updated daily.

![alt text](image.png)

Live at [s3rv3rl3ss.olcortesb.com](https://s3rv3rl3ss.olcortesb.com/)

## Tech Stack

- Vue 3 + Vite
- Tailwind CSS
- Vue Router
- Fuse.js (fuzzy search)
- AWS Amplify (hosting)

## Features

- **4 cloud providers**: AWS (32 services), GCP (18 services), Azure (17 services), STACKIT (23 services)
- **Service detail**: limits, quotas, runtimes, pricing, news and changelog per service
- **Compare**: side-by-side comparison across providers by category
- **Tools**: AWS local dev emulators comparison (MiniStack, Floci, RobotoCore)
- **Metrics**: pipeline health, Lambda invocations, errors and costs
- **Badges**: New (48h), Updated (15 days), Recent (30 days) — based on changelog
- **Share**: LinkedIn sharing buttons per news item

## Data

JSON files in `src/data/` are generated and committed automatically by the [s3rv3rl3ss-backend](https://github.com/olcortesb/s3rv3rl3ss-backend) pipeline, which runs daily:

| File | Source |
|------|--------|
| `services-aws.json` | AWS Service Quotas API + What's New RSS + Lambda docs |
| `services-gcp.json` | GCP Release Notes RSS + static data |
| `services-azure.json` | Azure Retail Prices API + Azure Blog/Weekly RSS |
| `services-stackit.json` | STACKIT PIM API + Release Notes RSS |
| `comparisons.json` | Generated from all 4 providers |
| `changelog-{provider}.json` | DynamoDB CHANGE items (90-day window) |
| `statistics-{provider}.json` | Aggregated stats per provider |
| `metrics.json` | CloudWatch + DynamoDB pipeline metrics |

To add or enable a service, edit the corresponding `services.py` in the backend repo. See the [backend README](https://github.com/olcortesb/s3rv3rl3ss-backend) for details.

## Development

```bash
nvm use 20
npm install
npm run dev
```

## Deploy

Connected to AWS Amplify — auto-deploys on push.
