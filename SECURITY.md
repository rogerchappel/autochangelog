# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |
| < 0.1.0 | No |

## Reporting a Vulnerability

Please do not report suspected vulnerabilities in public issues, pull requests,
or discussions.

If GitHub private vulnerability reporting is enabled for this repository, use
the repository's **Security** tab to submit a private vulnerability report.

If private vulnerability reporting is not enabled, contact the maintainers
through the public project channels and ask for the appropriate private
reporting path. Do not include exploit details, secrets, personal data, or
sensitive technical details in public messages.

## Scope

In scope:

- Vulnerabilities in the `autochangelog` CLI.
- Unsafe default behavior in changelog generation, template rendering, or git
  history parsing.
- CI, dependency, or release guidance maintained by this repository.

Out of scope:

- General support requests.
- Vulnerabilities in unrelated downstream projects.
- Requests for guaranteed maintenance timelines.

## Notes

`autochangelog` reads local git history and writes generated changelog output to
stdout. It does not publish releases, push branches, create tags, or rewrite git
history.
