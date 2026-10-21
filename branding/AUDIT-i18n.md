# i18n branding audit

Brand authority: [branding/README.md](README.md). Area: `i18n`.

## Result

- Updated 888 user-visible values across 21 translation JSON files: all 14 shared language dictionaries and seven plugin dictionaries.
- Audited all 39 translation dictionaries found by an exhaustive repository scan outside `node_modules` and `.git`; cross-checked against tracked JSON files. The adjacent `packages/ui-core/i18n/ng-package.json` is build metadata and was left unchanged.
- No old product names, company names, domains, or branded environment-variable identifiers remain in translation values. Also checked Arabic/Russian transliterations and translated brand names by comparing corresponding keys across languages.
- The required raw search has 161 remaining matches, all in immutable translation keys. Every match is listed below with its current line number; keys are lookup identifiers rather than displayed text.

## Changes

- Replaced product/company names with Base360, Base360 Time Tracker, and Base360 Timer; updated light/dark themes, setup and permissions screens, downloads, cloud migration, help/about, AI, OAuth, sign-in, plugin upload, and invitation labels.
- Kept surrounding text localized, including Hebrew and Acholi strings that previously used English text and localized strings that had translated the old product name literally.
- Replaced the old web-app domain with `https://time.base360.ai`. Public profile references without a specified Base360 URL now display the unchanged `{{ handle }}` as an account label instead of inventing a profile route.
- Used generic workspace/chat-connector descriptions for external integrations without a replacement product name in the brief, preserving the distinction between the two sides of synchronization.
- Removed the operated-by and powered-by credit values while retaining their keys. Reworded visible configuration hints to remove branded environment-variable identifiers; actual configuration names and behavior were not changed.
- Updated displayed company notices only. License files and source copyright/license headers were not edited.

## Validation

- `JSON.parse` via Node succeeded for all 40 scoped JSON files.
- Compared all 83,723 translation string values against the pre-edit snapshot: identical keys, key order, nesting, arrays, value types, non-string values, exact `{{ ... }}` tokens, and HTML tags/attributes.
- Checked every parsed value for old brands/domains and known transliterations: zero matches.
- Ran `grep -nEi "gauzy|ever co|ever\.co|ever-co|evertech|ever team"` over the complete translation-file inventory. Confirmed every remaining match is on the key side of the JSON member.
- `git diff --check` passed. No dependencies installed and no builds run, as required by the brand sheet.

Reproduce JSON parsing for the tracked inventory:

```sh
node <<'NODE'
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const files = execFileSync('git', ['ls-files', '-z', '*.json'], { encoding: 'utf8' })
  .split('\0').filter(f => f.split('/').includes('i18n'));
for (const f of files) JSON.parse(fs.readFileSync(f, 'utf8'));
console.log(`Parsed ${files.length} JSON files`);
NODE
```

## Changed files

| File | Changed values |
| --- | ---: |
| `packages/plugins/ai-chat-react-ui/src/i18n/en.json` | 3 |
| `packages/plugins/auth-zitadel-ui/src/i18n/en.json` | 21 |
| `packages/plugins/docs-ui/src/i18n/en.json` | 1 |
| `packages/plugins/ever-connect-ui/src/i18n/en.json` | 35 |
| `packages/plugins/ever-stats-ui/src/i18n/en.json` | 6 |
| `packages/plugins/inbox-ui/src/i18n/en.json` | 8 |
| `packages/plugins/integration-ever-works-ui/src/i18n/en.json` | 75 |
| `packages/ui-core/i18n/assets/i18n/ach.json` | 18 |
| `packages/ui-core/i18n/assets/i18n/ar.json` | 53 |
| `packages/ui-core/i18n/assets/i18n/bg.json` | 54 |
| `packages/ui-core/i18n/assets/i18n/de.json` | 53 |
| `packages/ui-core/i18n/assets/i18n/en.json` | 84 |
| `packages/ui-core/i18n/assets/i18n/es.json` | 53 |
| `packages/ui-core/i18n/assets/i18n/fr.json` | 53 |
| `packages/ui-core/i18n/assets/i18n/he.json` | 52 |
| `packages/ui-core/i18n/assets/i18n/it.json` | 53 |
| `packages/ui-core/i18n/assets/i18n/nl.json` | 53 |
| `packages/ui-core/i18n/assets/i18n/pl.json` | 53 |
| `packages/ui-core/i18n/assets/i18n/pt.json` | 53 |
| `packages/ui-core/i18n/assets/i18n/ru.json` | 54 |
| `packages/ui-core/i18n/assets/i18n/zh.json` | 53 |

## Remaining raw search matches

Each entry below is a preserved, non-displayed i18n key. Renaming these keys would break callers and is forbidden by the brief. Values contain no legacy branding. Paths containing legacy names are also unchanged because file names/import paths are protected.

### `packages/plugins/inbox-ui/src/i18n/en.json`

```text
43: GAUZY — translation lookup key; not displayed
```

### `packages/plugins/integration-ever-works-ui/src/i18n/en.json`

```text
87: GAUZY — translation lookup key; not displayed
105: UNMATCHED_GAUZY — translation lookup key; not displayed
106: CREATE_IN_GAUZY — translation lookup key; not displayed
119: TO_GAUZY — translation lookup key; not displayed
121: GAUZY_PENDING — translation lookup key; not displayed
122: GAUZY_PEOPLE — translation lookup key; not displayed
123: CONFIRM_GAUZY_TITLE — translation lookup key; not displayed
126: ORGANIZATION_GAUZY — translation lookup key; not displayed
131: CONFIRM_GAUZY_HINT — translation lookup key; not displayed
150: ew_to_gauzy — translation lookup key; not displayed
151: gauzy_to_ew — translation lookup key; not displayed
188: IN_GAUZY — translation lookup key; not displayed
189: CREATES_IN_GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/ach.json`

```text
711: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
752: GAUZY_AI — translation lookup key; not displayed
1135: GAUZY_LIGHT — translation lookup key; not displayed
1136: GAUZY_DARK — translation lookup key; not displayed
1156: GAUZY_FEATURES — translation lookup key; not displayed
5679: GAUZY_MAINTENANCE — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/ar.json`

```text
661: GAUZY_API_KEY — translation lookup key; not displayed
662: GAUZY_API_SECRET — translation lookup key; not displayed
812: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
855: GAUZY_AI — translation lookup key; not displayed
1235: GAUZY_LIGHT — translation lookup key; not displayed
1236: GAUZY_DARK — translation lookup key; not displayed
1266: GAUZY_FEATURES — translation lookup key; not displayed
1560: GAUZY_AI_PAGE — translation lookup key; not displayed
5912: invite-gauzy-teams — translation lookup key; not displayed
6266: GAUZY_MAINTENANCE — translation lookup key; not displayed
6597: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/bg.json`

```text
687: GAUZY_API_KEY — translation lookup key; not displayed
688: GAUZY_API_SECRET — translation lookup key; not displayed
840: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
883: GAUZY_AI — translation lookup key; not displayed
1263: GAUZY_LIGHT — translation lookup key; not displayed
1264: GAUZY_DARK — translation lookup key; not displayed
1294: GAUZY_FEATURES — translation lookup key; not displayed
1591: GAUZY_AI_PAGE — translation lookup key; not displayed
6314: GAUZY_MAINTENANCE — translation lookup key; not displayed
6644: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/de.json`

```text
662: GAUZY_API_KEY — translation lookup key; not displayed
663: GAUZY_API_SECRET — translation lookup key; not displayed
813: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
856: GAUZY_AI — translation lookup key; not displayed
1236: GAUZY_LIGHT — translation lookup key; not displayed
1237: GAUZY_DARK — translation lookup key; not displayed
1267: GAUZY_FEATURES — translation lookup key; not displayed
1561: GAUZY_AI_PAGE — translation lookup key; not displayed
5910: invite-gauzy-teams — translation lookup key; not displayed
6264: GAUZY_MAINTENANCE — translation lookup key; not displayed
6595: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/en.json`

```text
706: GAUZY_API_KEY — translation lookup key; not displayed
707: GAUZY_API_SECRET — translation lookup key; not displayed
869: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
914: GAUZY_AI — translation lookup key; not displayed
1231: GAUZY_LIGHT — translation lookup key; not displayed
1232: GAUZY_DARK — translation lookup key; not displayed
1298: GAUZY_FEATURES — translation lookup key; not displayed
1607: GAUZY_AI_PAGE — translation lookup key; not displayed
1889: GAUZY_API_URL — translation lookup key; not displayed
3723: MIGRATE_GAUZY_CLOUD — translation lookup key; not displayed
6511: invite-gauzy-teams — translation lookup key; not displayed
6936: GAUZY_MAINTENANCE — translation lookup key; not displayed
7343: GAUZY — translation lookup key; not displayed
7385: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/es.json`

```text
664: GAUZY_API_KEY — translation lookup key; not displayed
665: GAUZY_API_SECRET — translation lookup key; not displayed
815: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
858: GAUZY_AI — translation lookup key; not displayed
1238: GAUZY_LIGHT — translation lookup key; not displayed
1239: GAUZY_DARK — translation lookup key; not displayed
1269: GAUZY_FEATURES — translation lookup key; not displayed
1563: GAUZY_AI_PAGE — translation lookup key; not displayed
5916: invite-gauzy-teams — translation lookup key; not displayed
6270: GAUZY_MAINTENANCE — translation lookup key; not displayed
6601: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/fr.json`

```text
663: GAUZY_API_KEY — translation lookup key; not displayed
664: GAUZY_API_SECRET — translation lookup key; not displayed
814: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
857: GAUZY_AI — translation lookup key; not displayed
1237: GAUZY_LIGHT — translation lookup key; not displayed
1238: GAUZY_DARK — translation lookup key; not displayed
1268: GAUZY_FEATURES — translation lookup key; not displayed
1562: GAUZY_AI_PAGE — translation lookup key; not displayed
5911: invite-gauzy-teams — translation lookup key; not displayed
6265: GAUZY_MAINTENANCE — translation lookup key; not displayed
6596: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/he.json`

```text
817: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
860: GAUZY_AI — translation lookup key; not displayed
1240: GAUZY_LIGHT — translation lookup key; not displayed
1241: GAUZY_DARK — translation lookup key; not displayed
1271: GAUZY_FEATURES — translation lookup key; not displayed
1565: GAUZY_AI_PAGE — translation lookup key; not displayed
6279: GAUZY_MAINTENANCE — translation lookup key; not displayed
6609: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/it.json`

```text
662: GAUZY_API_KEY — translation lookup key; not displayed
663: GAUZY_API_SECRET — translation lookup key; not displayed
813: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
856: GAUZY_AI — translation lookup key; not displayed
1236: GAUZY_LIGHT — translation lookup key; not displayed
1237: GAUZY_DARK — translation lookup key; not displayed
1267: GAUZY_FEATURES — translation lookup key; not displayed
1561: GAUZY_AI_PAGE — translation lookup key; not displayed
5914: invite-gauzy-teams — translation lookup key; not displayed
6268: GAUZY_MAINTENANCE — translation lookup key; not displayed
6599: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/nl.json`

```text
662: GAUZY_API_KEY — translation lookup key; not displayed
663: GAUZY_API_SECRET — translation lookup key; not displayed
813: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
856: GAUZY_AI — translation lookup key; not displayed
1236: GAUZY_LIGHT — translation lookup key; not displayed
1237: GAUZY_DARK — translation lookup key; not displayed
1267: GAUZY_FEATURES — translation lookup key; not displayed
1561: GAUZY_AI_PAGE — translation lookup key; not displayed
5914: invite-gauzy-teams — translation lookup key; not displayed
6268: GAUZY_MAINTENANCE — translation lookup key; not displayed
6599: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/pl.json`

```text
661: GAUZY_API_KEY — translation lookup key; not displayed
662: GAUZY_API_SECRET — translation lookup key; not displayed
812: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
855: GAUZY_AI — translation lookup key; not displayed
1235: GAUZY_LIGHT — translation lookup key; not displayed
1236: GAUZY_DARK — translation lookup key; not displayed
1266: GAUZY_FEATURES — translation lookup key; not displayed
1560: GAUZY_AI_PAGE — translation lookup key; not displayed
5913: invite-gauzy-teams — translation lookup key; not displayed
6267: GAUZY_MAINTENANCE — translation lookup key; not displayed
6598: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/pt.json`

```text
662: GAUZY_API_KEY — translation lookup key; not displayed
663: GAUZY_API_SECRET — translation lookup key; not displayed
813: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
856: GAUZY_AI — translation lookup key; not displayed
1236: GAUZY_LIGHT — translation lookup key; not displayed
1237: GAUZY_DARK — translation lookup key; not displayed
1267: GAUZY_FEATURES — translation lookup key; not displayed
1561: GAUZY_AI_PAGE — translation lookup key; not displayed
5914: invite-gauzy-teams — translation lookup key; not displayed
6268: GAUZY_MAINTENANCE — translation lookup key; not displayed
6599: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/ru.json`

```text
668: GAUZY_API_KEY — translation lookup key; not displayed
669: GAUZY_API_SECRET — translation lookup key; not displayed
821: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
863: GAUZY_AI — translation lookup key; not displayed
1244: GAUZY_LIGHT — translation lookup key; not displayed
1245: GAUZY_DARK — translation lookup key; not displayed
1275: GAUZY_FEATURES — translation lookup key; not displayed
1569: GAUZY_AI_PAGE — translation lookup key; not displayed
6287: GAUZY_MAINTENANCE — translation lookup key; not displayed
6617: GAUZY — translation lookup key; not displayed
```

### `packages/ui-core/i18n/assets/i18n/zh.json`

```text
658: GAUZY_API_KEY — translation lookup key; not displayed
659: GAUZY_API_SECRET — translation lookup key; not displayed
813: TOTAL_HOURS_WORKED_OVER_GAUZY — translation lookup key; not displayed
855: GAUZY_AI — translation lookup key; not displayed
1236: GAUZY_LIGHT — translation lookup key; not displayed
1237: GAUZY_DARK — translation lookup key; not displayed
1267: GAUZY_FEATURES — translation lookup key; not displayed
1561: GAUZY_AI_PAGE — translation lookup key; not displayed
5914: invite-gauzy-teams — translation lookup key; not displayed
6268: GAUZY_MAINTENANCE — translation lookup key; not displayed
6599: GAUZY — translation lookup key; not displayed
```

## Limits

No application builds, UI smoke tests, live integration requests, or native-speaker review were performed. Protected interpolation tokens, including `{{ everId }}`, were preserved verbatim. Runtime-generated labels and backend integration endpoints are outside this area; the integrator must verify those after merging the other areas. Existing unrelated translations and Crowdin markers were not changed.
