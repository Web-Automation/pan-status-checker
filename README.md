# PAN Status Checker

A lightweight, single-page web application that validates Indian PAN (Permanent Account Number) formats client-side and queries the Income Tax portal API to determine PAN status.

## Features

- **Format Validation:** Uses regular expressions (`/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`) to instantly verify standard PAN syntax before sending network requests.
- **Live Status Verification:** Queries the e-Portal API to check whether a PAN is active, minor, inactive, or invalid.
- **Dynamic UI:** Features clean CSS styling and color-coded status badges for instant clarity.
- **Zero Dependencies:** Built entirely with plain HTML5, CSS3, and modern Vanilla JavaScript (`fetch` API).

## Status Codes Handled

| Status Category | Description | API Message Codes |
| :--- | :--- | :--- |
| **Valid & Active** | PAN is valid and active | `EF01227`, `EF00048` |
| **Valid (Minor)** | Valid PAN belonging to a minor | `EF00050` |
| **Inactive** | PAN is valid but currently inactive | `EF30041`, `EF500102`, `EF00254` |
| **Invalid** | PAN does not exist or is incorrect | `EF30047`, `EF00047`, `EF00082` |

## Deployment on GitHub Pages

1. Push `index.html` to the `main` branch of your repository.
2. In your repository on GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Branch**, select `main` (and `/root` folder) and click **Save**.
4. Your application will be live at `https://<your-username>.github.io/<repo-name>/`.

## Technical Note: CORS Handling

When hosting static sites on GitHub Pages, direct cross-origin API calls to government endpoints like `eportal.incometax.gov.in` may be blocked by the browser due to **CORS (Cross-Origin Resource Sharing)** rules. 

If requests fail due to browser CORS policies in production:
- Use a lightweight serverless worker (such as Cloudflare Workers or Vercel Edge Functions) as a CORS proxy to forward the request headers.

