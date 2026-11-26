---
name: add-step
description: Add a salsa step to the page. Finds YouTube videos demonstrating the step in Cuban salsa (casino), asks the user which to include, adds the step to site/steps.js and commits. Use when the user wants to add a new salsa step, e.g. "/add-step Dile que no".
argument-hint: <step name in Spanish>
allowed-tools: WebSearch, WebFetch, Bash(curl:*), Bash(node:*), Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*)
---

# Add a salsa step

Step to add: **$ARGUMENTS**

If no step name was given, ask the user for one and stop until they answer.

## 1. Check the step isn't already there

Read `site/steps.js`. Steps match if their names are the same ignoring case and
accents, since that's how anchors are built (`site/app.js`, `slugify`).

- If the step already exists, tell the user and ask whether to add more videos to
  it instead. If yes, carry on, but skip any videos it already has.
- If the placeholder `Test` step is still in the list, note it — you'll ask about
  it in step 5.

## 2. Find candidate videos

This page is for a Cuban salsa (casino) class, so look for the step as it's
danced in Cuban salsa. Many names are shared with LA or New York style (On1/On2)
but mean different moves there, so treat linear-style videos as a different step.

Use WebSearch to find YouTube videos that teach or clearly demonstrate this step.
Run several searches in one turn, for example:

- `"<step>" salsa cubana tutorial youtube`
- `"<step>" casino salsa tutorial youtube`
- `"<step>" salsa cubana paso como bailar youtube` (Spanish-language results)
- `"<step>" rueda de casino youtube`, since many casino moves are also rueda calls

Prefer tutorials that break the step down slowly over social-dancing clips, and
pick from a few different channels. Cuban-style signs to look for: "salsa
cubana", "casino" or "timba" in the title or channel, or a circular rather than
slot-based (linear) dance. Only include an LA/NY-style video if you can't find
Cuban ones, and label it as such when you show it to the user. Collect video IDs
from `youtube.com/watch?v=`, `youtu.be/` and `youtube.com/shorts/` links. Never
make up or guess an ID.

## 3. Check each video

For each ID, look it up with YouTube's oEmbed endpoint:

```sh
curl -s -w "\n%{http_code}" "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json"
```

- **200**: the video exists and can be embedded. Keep its `title` and `author_name`.
- **401 or 403**: embedding is disabled. Drop it, since it won't play on the page.
- **400 or 404**: it doesn't exist. Drop it.

Drop videos whose title clearly isn't about this step, or is clearly about the
LA/NY-style move of the same name. Aim for 4–6 good
candidates. If fewer than 2 survive, search again with different wording before
going on, and if you still can't find any, tell the user and stop.

## 4. Ask the user about each video

First, list every candidate in a message so the user can watch them:

```
1. <title> — <channel>
   https://www.youtube.com/watch?v=<ID>
```

Mark any video that isn't Cuban style, e.g. `(LA style)` after the channel.

Then ask with AskUserQuestion, one question per video (up to 4 per call; use a
second call for the rest). Use the video's number and a shortened title as the
question, a short `header` like "Video 1", and two options: **Include** and
**Skip**. If the user answers "Other" with a note (e.g. "include from 1:20"),
follow it — a start time goes on the link as `?t=80`.

If they skip every video, offer to search again or stop without changes.

## 5. Add the step

Edit `site/steps.js` and append the new step at the end of the `SALSA_STEPS`
array, in the same format as the existing entries:

```js
  {
    name: "<step name as given, with its accents>",
    videos: [
      "https://www.youtube.com/watch?v=<ID>",
    ],
  },
```

Keep the videos in the order they were listed. If the placeholder `Test` step is
still there, ask whether to remove it too.

Check the file still loads:

```sh
node -e 'global.window={}; require("./site/steps.js"); console.log(window.SALSA_STEPS.map(s => s.name + " (" + s.videos.length + ")").join("\n"))'
```

## 6. Commit

Stage only `site/steps.js` (by name, never `git add -A` or `.`) and commit with a
message like `Add <step> step` and a short body listing the videos' titles. End
the message with the attribution line from the session's commit instructions.

Don't push. Pushing to `main` deploys the site, so end by telling the user what
was added and asking whether to push.
