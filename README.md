# Salsa Steps

A static page listing salsa steps, each with YouTube videos showing how to dance it.

## Adding a step

In Claude Code, run `/add-step <name>` (e.g. `/add-step Dile que no`). It finds
YouTube videos for the step, asks which to include, then adds and commits it.

Or edit `site/steps.js` by hand and add an entry:

```js
{
  name: "Dile que no",
  videos: [
    "https://www.youtube.com/watch?v=VIDEO_ID",
    "https://youtu.be/OTHER_ID?t=42",
  ],
},
```

Each step gets an anchor built from its name, so this one is at `#dile-que-no`.

## Previewing locally

YouTube won't play embeds on a page opened straight from disk, so serve the folder:

```sh
python3 -m http.server --directory site
```

Then open http://localhost:8000.

## Deploying

Every push to `main` deploys `site/` to GitHub Pages via `.github/workflows/deploy.yml`.
