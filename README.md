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
    { url: "https://www.youtube.com/watch?v=VIDEO_ID", lang: "es" },
    { url: "https://youtu.be/OTHER_ID?t=42", lang: "en" },
  ],
},
```

Each step gets an anchor built from its name, so this one is at `#dile-que-no`.
`lang` is the language spoken in the video and is shown as a label under it
(e.g. "Español"); leave it out if you're not sure.

## Previewing locally

YouTube won't play embeds on a page opened straight from disk, so serve the folder:

```sh
python3 -m http.server --directory site
```

Then open http://localhost:8000.

## Deploying

Every push to `main` deploys `site/` to GitHub Pages via `.github/workflows/deploy.yml`.
