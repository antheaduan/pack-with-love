# Campaign data

`campaign.json` is the **single source of truth** for the fundraising progress bar
shown on the Our Project page.

```json
{
  "goal": 5300,          // the shared goal, in whole dollars
  "raised": 0,           // total raised so far, in whole dollars
  "backpacks_funded": 0, // optional override; if 0 the page computes floor(raised / 4.50)
  "as_of": "2026-08-25"  // the date this file was last updated (YYYY-MM-DD)
}
```

## How to update (manual, for now)

1. Edit `raised` and `as_of` in `campaign.json`.
2. Commit and push to `main` — the site redeploys and the bar updates.
   No other file needs to change.

## Later: connect to a live source

If ACO's donation system exposes an API endpoint that returns this same JSON
shape, change the fetch URL in `js/main.js` (see the `campaign progress`
section) and delete this manual step. Keep the field names identical.

## Behavior notes

- If the file can't be fetched, the progress module hides itself entirely —
  the page never shows `$0 of $0` or `NaN`.
- Backpacks funded is capped at 1,000 (the founding-year commitment).
