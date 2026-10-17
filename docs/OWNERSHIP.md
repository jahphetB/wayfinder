# Ownership and protection guide

This guide records Step 34. It explains the repository's ownership notice and
practical protection measures. It is general information; a qualified lawyer
can advise on your ownership, contracts, jurisdiction, and enforcement.

## Current ownership notice

The owner requested protection against unauthorized copying. The root
[`LICENSE`](../LICENSE) therefore reserves rights in the original project
materials using `jahphetB`, the current Git author identity and repository
account. It does not adopt an open-source license or grant general reuse
permission. Change this attribution if a different legal owner should be named.
Ordinary use of the hosted application remains permitted.

Copyright generally protects original expression automatically. The notice
makes the intended permissions explicit; it does not itself prove ownership or
prevent copying. Copyright does not give ownership of general ideas, methods,
or geographic facts. Keep dated source history and source/provenance records,
and confirm ownership agreements before bringing in contributors or accepting
institutional work. See the
[U.S. Copyright Office explanation](https://www.copyright.gov/what-is-copyright/)
and [computer program guidance](https://www.copyright.gov/register/tx-programs.html).

Because this project uses AI assistance, keep records of your own creative
contributions and modifications. In the U.S., purely AI-generated material
does not receive copyright protection simply because a notice is attached;
human-authored contributions are assessed separately. Have a professional
review the scope of any registration. See the Copyright Office's
[AI copyrightability report](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf).

## Why MIT, Apache, and GPL were not selected

| Choice                                                        | What it permits                                                                                          | Fit for the stated goal                                   |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [MIT](https://choosealicense.com/licenses/mit/)               | Reuse, modification, redistribution, and commercial use with required notices.                           | Appropriate if broad reuse is wanted.                     |
| [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/) | Broad reuse with notice requirements and an express patent grant.                                        | Appropriate if broad reuse is wanted.                     |
| [GPLv3](https://choosealicense.com/licenses/gpl-3.0/)         | Reuse and sale, with source and same-license duties for covered distribution.                            | Appropriate if sharing modifications under GPL is wanted. |
| Current reserved-rights notice                                | No general reuse permission for original project materials; existing rights and legal exceptions remain. | Matches the owner's current request.                      |

Open-source licenses protect ownership while granting others defined rights.
They are not mechanisms to prohibit competing copies. The
[GitHub license guidance](https://choosealicense.com/no-permission/) also
explains that public GitHub hosting permits viewing and forking under its
service terms. Previously granted licenses cannot simply be erased by adding
a new notice.

## Rights belonging to others

- React, React DOM, Three.js, MapLibre, and their dependencies keep their own
  licenses. The production build uses Vite's built-in license report to create
  `dist/THIRD_PARTY_LICENSES.md`. Keep this file with the deployed build and
  preserve upstream notices. Review the report when dependencies change.
- `campusOsmNetwork.json` and other OSM-derived geographic materials remain
  subject to applicable [OpenStreetMap attribution and ODbL requirements](https://www.openstreetmap.org/copyright).
  The owner's observations added to OSM do not make the imported database
  exclusively proprietary. Keep provenance and review share-alike obligations
  for any distributed derived database.
- Campus names, third-party marks, photographs, and contributed materials are
  not claimed by the application's notice. Obtain rights before adding them.

## Changes implemented in Step 34

1. `LICENSE` records reserved rights and third-party exclusions.
2. `package.json` and its lockfile record `UNLICENSED`, npm's marker that no
   general package license is granted. Existing `private: true` prevents npm
   publication; it does **not** make a GitHub repository private.
3. `vite.config.ts` disables production source maps, adds an ownership banner
   to the application bundles, and generates the dependency license report.
   A source map links compiled code back to original source files. Disabling
   it reduces exposure of original files but cannot hide JavaScript delivered
   to a browser. Development debugging remains available with `npm run dev`.
4. `.gitignore` excludes environment files, while allowing a future
   `.env.example`. Ignore rules do not remove previously tracked files, revoke
   exposed credentials, or hide values intentionally bundled by Vite.

No code obfuscation or disabled browser controls were added. Obfuscation only
makes code harder to read and can complicate debugging; disabling right-click
does not prevent copying. Any future logic that must remain secret needs a
server boundary and a separately approved architecture step.

## Owner actions to consider next

1. **Make the source repository private** if you do not want general access
   to the source/history. Use GitHub repository **Settings → General → Danger
   Zone → Change repository visibility**. Review GitHub's
   [visibility consequences](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
   and confirm Vercel still has access. Existing public copies cannot be
   recalled; a public deployed browser app still delivers code and map data.
2. **Protect account access.** Enable
   [GitHub two-factor authentication](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication),
   secure Vercel login, retain recovery codes, and limit collaborator access.
   GitHub branch protection can help prevent accidental or unauthorized changes
   where supported by the account plan. These are account settings; they were
   not changed in this repository step.
3. **Keep evidence and consider registration.** Preserve Git history, original
   assets, and agreements. If U.S. protection is relevant, consider
   [copyright registration](https://www.copyright.gov/register/tx-programs.html)
   with professional advice on eligibility and filing timing. No registration
   or legal claim was filed here.
4. **Consider brand protection.** A trademark concerns the identifying name or
   logo rather than the code. Check existing campus/third-party rights and
   name availability before seeking registration. See the
   [USPTO explanation](https://www.uspto.gov/trademarks/basics/what-trademark).
5. **Handle confirmed copying with evidence.** Keep original and copied URLs,
   dates, and matching material. Seek advice before issuing a legal notice;
   GitHub explains its [DMCA process](https://docs.github.com/en/site-policy/content-removal-policies/dmca-takedown-policy).

## Verification and deployment

Build with `npm run build`. Confirm no `*.map` files exist anywhere under
`dist`, the generated dependency license file is present and nonempty, and
the application JavaScript contains the ownership banner. Run the ordinary
repository quality checks before committing. Confirm only license metadata
changed in the lockfile.

Commit and push approval remain separate. After an approved push, Vercel must
deploy the new commit before the live site gets these changes. Prior public
deployments, forks, caches, or downloaded files may still contain earlier
source maps; inspect and retire old deployments where appropriate. This step
does not remove historical copies or change repository visibility.

Technical sources: [Vite build options](https://vite.dev/config/build-options)
and [npm license metadata](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#license).
