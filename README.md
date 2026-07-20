# Pack with Love — Website

A 5-page website for the Pack with Love Youth Service Club.
Built with plain HTML and CSS so it's fast, free to host, and easy to edit.

## What's inside

```
pack-with-love-web/
├── index.html        ← Home page
├── about.html        ← About Us
├── project.html      ← Our Project (Love & Hope Backpack Project)
├── support.html      ← Support / Donate / Join / Partner
├── contact.html      ← Contact page with a form
├── css/
│   └── styles.css    ← ONE file that controls the whole look (colors, fonts, layout)
├── js/
│   └── main.js       ← Small script for the mobile menu button
└── images/           ← Logo, favicon, coloring pages, backpack photo
```

## How to view it on your computer

Double-click **index.html** — it opens in your web browser. Click around; every
page and link works. No internet or setup required.

## How to edit it (no experience needed)

- **Text:** open any `.html` file in a plain text editor (or VS Code) and edit the
  words between the tags. Save, then refresh the browser.
- **Colors:** open `css/styles.css` and change the color values at the very top
  (the `:root` section). Every page updates at once.
- **Photos:** drop new images into the `images/` folder and update the file name
  in the `<img src="images/...">` tag.

## Things to fill in (search for "TODO" in the files)

1. **Donation link** — in `support.html`, replace `href="#"` on the "Donate Now"
   button with your official ACO donation link.
2. **Contact email** — in `contact.html`, replace `hello@packwithlove.org` with
   your real club email.
3. **Working contact form** — a plain website can't send email by itself. The
   easiest free fix is [Formspree](https://formspree.io): sign up, create a form,
   and paste its address into the form `action` in `contact.html`.

## How to put it online for free (with a real web address)

Two beginner-friendly options:

**Option A — Netlify Drop (easiest, ~2 minutes)**
1. Go to https://app.netlify.com/drop
2. Drag this whole `pack-with-love-web` folder onto the page.
3. It's live instantly with a free web address you can share.

**Option B — GitHub Pages (free, good long-term)**
1. Create a free account at https://github.com
2. Make a new repository and upload these files.
3. In the repo Settings → Pages, choose the main branch. Your site publishes at
   `https://yourname.github.io/reponame`.

Later, you can buy a custom domain (like `packwithlove.org`) and connect it.

---
Love First. Create with Joy. Serve with Purpose.
