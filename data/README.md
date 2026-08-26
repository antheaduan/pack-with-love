# Campaign data

`campaign.json` drives the fundraising progress bar on the Our Project page.

```json
{
  "goal": 5300,          // the shared goal, in whole dollars
  "raised": 0,           // total raised so far, in whole dollars
  "backpacks_funded": 0, // sets funded; see the note below — it is NOT raised / 4.50
  "set_cost": 4.5,       // cost of one complete set (fallback if no live source)
  "as_of": "2026-08-25", // the date these numbers were last updated (YYYY-MM-DD)
  "source": null         // optional: a URL to pull the same fields from live (see below)
}
```

## Option A — manual updates (current setup)

1. Edit `raised`, `backpacks_funded`, and `as_of`.
2. Commit and push to `main`. The site redeploys and the bar updates.
   Nothing else needs to change.

## Option B — pull live numbers from ACO (one source of truth)

Both packwithlove.org and africacriesout.org show the same campaign. To keep
the two bars from ever disagreeing, publish the numbers once on ACO and point
this file at them.

ACO is building this endpoint. The agreed shape:

```
GET https://africacriesout.org/api/campaigns/pack-with-love/progress
```
```json
{
  "goal": 5300,
  "goal_cents": 530000,
  "raised": 1250,
  "raised_cents": 125075,
  "backpacks_funded": 100,
  "set_cost": 4.5,
  "as_of": "2026-11-15"
}
```
```
Access-Control-Allow-Origin: https://packwithlove.org
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

Then set `"source"` in this file to that URL. This page will show ACO's
numbers, and the local values here become the fallback.

**Status: ACO has built this endpoint; it is waiting on their production
deploy.** `source` stays `null` until they confirm the deploy, so the page
does not fire a request at a URL that isn't live yet. Flipping it on is a
one-line change here — no code change.

### Where an undesignated gift goes

A gift that names no line item lands on the Pack with Love parent fund. It
counts in `raised`, but not in either line item, so `backpacks_funded` does
not move. An ACO admin then assigns it to whichever line the project most
needs — deliberately a human decision rather than a fixed split, because the
shipping shortfall and the backpack shortfall do not appear at the same time.
In practice this rarely applies to visitors from this site: ACO's campaign page
requires picking a tab before checkout.

Only two origins are allowlisted — `packwithlove.org` and `www.packwithlove.org`.
Netlify deploy previews are deliberately not, so a preview shows the local
numbers from this file instead of live ones. That is the intended behavior.

### Why the code prefers `*_cents`

`raised` in whole dollars and `raised_cents` disagree by up to a dollar once
rounding is involved, and two public bars rounding from different places is
exactly the problem this integration exists to prevent. The page divides
`raised_cents` by 100 whenever it is present.

### Why `backpacks_funded` is not `raised / 4.50`

The $5,300 goal is two line items:

```
$4,500   1,000 sets x $4.50
+ $800   ocean shipping, duties, customs
= $5,300
```

`raised` is the total, so it includes money given toward shipping. Dividing the
total by $4.50 counts shipping dollars as backpacks — at `raised = $1,250` the
naive formula says 277 sets when the true figure may be 100. ACO counts it from
the backpack line item alone and reports the result, so the page uses the
reported number whenever there is one and only estimates when there is not.

## Behavior notes

- If `campaign.json` itself can't be loaded, the progress module hides entirely —
  the page never shows `$0 of $0` or `NaN`.
- If the remote `source` call fails, the local values here are used, so the bar
  never breaks.
- Backpacks funded is capped at 1,000 (the founding-year commitment).


---

# `course.json`

Drives the seat counter and the enrollment button on the Data to Impact page.

```json
{
  "seats_total": 15,
  "enroll_url": "https://africacriesout.org/aco-data-to-impact.html",
  "source": null
}
```

Same two-step pattern as `campaign.json`. ACO's endpoint:

```
GET https://africacriesout.org/api/courses/data-to-impact/seats
```
```json
{ "seats_total": 15, "seats_taken": 4, "open": true, "as_of": "2026-09-01" }
```

Set `source` to that URL once ACO confirms their deploy.

## What the page does with it

| State | Seat line | Enroll button |
|---|---|---|
| No `source`, or the endpoint fails | hidden | unchanged |
| Seats free and `open` | "11 of 15 seats still open." | unchanged |
| `seats_taken == seats_total` | "All 15 seats are taken for this year." | becomes "Join the Waitlist" → /contact |
| `open: false` with seats free | "Enrollment is closed for this year." | becomes "Join the Waitlist" → /contact |

The last two rows are separate on purpose: an admin closing enrollment early
is not the same as the course selling out, and saying "all 15 seats are taken"
when two are would simply be false.

Retargeting the button matters — ACO's page refuses payment once `open` is
false or the course is full, so a live button would send a parent to a
checkout that declines them.

## Note on overselling

`seats_taken` counts only completed payments; ACO deliberately excludes
pending checkouts so an abandoned cart can't close the course. That leaves a
narrow window where two families could check out on the last seat at once. With
15 seats and a small program that is an acceptable trade, and the `open` switch
gives an admin a manual override.
