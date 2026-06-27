# AlphaDelta 🧩

A word puzzle game where you find all the words using limited letters.

**Live site:** [https://heather-bell-hughes.github.io/AlphaDelta/](https://heather-bell-hughes.github.io/AlphaDelta/)

## How to Play

1. **Look at the main word** — a 6-letter word is displayed at the top
2. **Find the remaining words** — using only letters not in the 6-letter word, create:
   - 1 five-letter word
   - 1 four-letter word
   - 1 three-letter word
   - 1 two-letter word
   - 1 one-letter word
3. **Use each letter only once** — letters cannot be reused across rows
4. **Type your words** — use the on-screen keyboard or physical keyboard
5. **Auto-validation** — valid words turn green; invalid words turn red
6. **Progress through puzzles** — move to the next puzzle when you solve one

## URLs

| URL | What it loads |
|-----|----------------|
| `/` | Today's daily puzzle |
| `/1` … `/128` | A specific puzzle by number |
| `/menu` | Hidden puzzle picker (no link from the game) |

## Local Development

```bash
git clone https://github.com/Heather-Bell-Hughes/AlphaDelta.git
cd AlphaDelta
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Testing

```bash
npm test                 # local Playwright suite
npm run test:production  # smoke tests against the live GitHub Pages site
npm run test:devices     # mobile layout checks + screenshots
```

## Deploy to GitHub Pages

This repo deploys automatically via GitHub Actions on push to `main`. The build output goes to the `docs/` folder and is published to GitHub Pages.

After renaming the repository, the site URL follows the repo name:

`https://<username>.github.io/<repo-name>/`

For this project: `https://heather-bell-hughes.github.io/AlphaDelta/`

The Vite `base` path in `vite.config.js` must match the repository name for assets to load correctly.

## Features

- Mobile responsive layout with on-screen keyboard
- 128 puzzles with progress tracking (localStorage)
- URL routing for puzzles and daily rotation at `/`
- Playwright test suite with production smoke tests

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
