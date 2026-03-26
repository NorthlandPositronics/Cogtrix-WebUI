# Security Policy

## Supported Versions

Only the latest release receives security fixes. We do not backport patches to older versions.

| Version | Supported |
|---------|-----------|
| Latest (0.x) | ✅ |
| Older releases | ❌ |

## Reporting a Vulnerability

**Please do not report security vulnerabilities via public GitHub issues.**

Report vulnerabilities privately through [GitHub Security Advisories](../../security/advisories/new).

Include as much of the following as possible:

- Type of vulnerability (e.g. XSS, CSRF, authentication bypass, sensitive data exposure)
- Affected page or component (chat, settings, admin, authentication, etc.)
- Steps to reproduce
- Proof-of-concept payload or screenshot (if available)
- Potential impact and attack scenario

## Response Timeline

| Step | Target |
|------|--------|
| Initial acknowledgement | 3 business days |
| Triage and severity assessment | 7 business days |
| Patch and advisory published | 30 days (critical: 7 days) |

We follow responsible disclosure — please give us reasonable time to fix and release a patch before any public disclosure.

## Scope

The following are considered in scope:

- Cross-site scripting (XSS) in rendered markdown, message content, or user-controlled fields
- Authentication or session management bypass (token handling, JWT validation)
- Sensitive data (tokens, API keys) leaked in DOM, network responses, or error messages
- CSRF vulnerabilities in state-mutating API calls
- Open redirects via query parameters or navigation
- Admin-only pages or actions accessible without the admin role

The following are **out of scope**:

- Denial of service via resource exhaustion
- Vulnerabilities in the Cogtrix backend server — please report those at the [Cogtrix repository](https://github.com/NorthlandPositronics/Cogtrix/security/advisories/new)
- Issues that require physical access to the user's device
- Self-XSS (requires the attacker to already control the victim's browser console)
- Vulnerabilities in third-party dependencies — please report those upstream
