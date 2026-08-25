# Campaign data

`campaign.json` drives the fundraising progress bar on the Our Project page.

```json
{
  "goal": 5300,          // the shared goal, in whole dollars
  "raised": 0,           // total raised so far, in whole dollars
  "backpacks_funded": 0, // optional override; if 0 the page computes floor(raised / 4.50)
  "as_of": "2026-08-25", // the date these numbers were last updated (YYYY-MM-DD)
  "source": null         // optional: a URL to pull the same fields from live (see below)
}
```

## Option A — manual updates (current setup)

1. Edit `raised` and `as_of`.
2. Commit and push to `main`. The site redeploys and the bar updates.
   Nothing else needs to change.

## Option B — pull live numbers from ACO (one source of truth)

Both packwithlove.org and africacriesout.org show the same campaign. To keep
the two bars from ever disagreeing, publish the numbers once on ACO and point
this file at them:

1. On africacriesout.org, serve a JSON file with these same field names, e.g.
   `https://africacriesout.org/data/pack-with-love.json`:
   ```json
   { "goal": 5300, "raised": 1250, "backpacks_funded": 277, "as_of": "2026-11-15" }
   ```
2. Send it with a CORS header so this site is allowed to read it:
   `Access-Control-Allow-Origin: https://packwithlove.org`
   (or `*` — the file is public information either way).
3. Set `"source"` in this file to that URL. Done: this page now shows ACO's
   numbers, and the local values below are only used as a fallback.

If the remote call fails, the page quietly falls back to the `raised`/`goal`
values in this file, so the bar never breaks.

## Behavior notes

- If `campaign.json` itself can't be loaded, the progress module hides entirely —
  the page never shows `$0 of $0` or `NaN`.
- Backpacks funded is capped at 1,000 (the founding-year commitment).
