---
name: add-step
description: Add a salsa step to the page. Finds YouTube videos demonstrating the step in Cuban salsa (casino), preferring Spanish-language videos and channels already on the page, asks the user which to include, adds the step to site/steps.js and commits. Use when the user wants to add a new salsa step, e.g. "/add-step Dile que no".
argument-hint: <step name in Spanish>
allowed-tools: WebSearch, WebFetch, Bash(node:*), Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*)
---

# Add a salsa step

Step to add: **$ARGUMENTS**

If no step name was given, ask the user for one and stop until they answer.

## Who the page is for

The page is for a Cuban salsa (casino) class, and most of the class speak Spanish
as their first language. So, in order of importance, look for videos that:

1. show the step as it's danced in **Cuban salsa**. Many names are shared with LA
   or New York style (On1/On2) but mean different moves there, so treat
   linear-style videos as a different step.
2. teach **just this step**. Skip full classes or videos covering several moves
   (e.g. "Dile que no y guapea" when adding guapear).
3. are **in Spanish**. English is fine when there's no good Spanish option.
4. are **free to watch in full**. Skip course teasers that cut off and point to
   a paid course.
5. have decent **video quality**. Skip old, low-resolution or badly filmed clips.

## 1. Check the step isn't already there

Read `site/steps.js`. Steps match if their names are the same ignoring case and
accents, since that's how anchors are built (`site/app.js`, `slugify`).

- If the step already exists, tell the user and ask whether to add more videos to
  it instead. If yes, carry on, but skip any videos it already has.

## 2. Find candidate videos

### Start with channels already on the page

The user has already vetted these channels' style and quality, so look there first:

```sh
node .claude/skills/add-step/lookup.js --channels
```

For each channel, run a WebSearch for the step together with the channel's name,
e.g. `"<step>" <channel name> youtube`, or with the handle from its URL. Run
these in one turn.

### Then search more widely

Run several searches in one turn, Spanish first, for example:

- `"<step>" salsa cubana tutorial`
- `"<step>" casino cubano cómo bailar paso a paso`
- `"<step>" salsa cubana clase explicación en español`
- `"<step>" casino salsa tutorial` (English results)
- `"<step>" rueda de casino`, since many casino moves are also rueda calls

Spanish step names often have variants (guapear / guapea / guapeo, enchufla /
enchufla doble), so try the common forms. Cuban-style signs to look for: "salsa
cubana", "casino" or "timba" in the title or channel, or a circular rather than
slot-based (linear) dance.

Collect video IDs from `youtube.com/watch?v=`, `youtu.be/` and
`youtube.com/shorts/` links. Never make up or guess an ID. Don't try to fetch or
scrape YouTube pages directly; use WebSearch and the lookup helper.

## 3. Check each video

Pass all the IDs or links to the lookup helper in one go:

```sh
node .claude/skills/add-step/lookup.js <id-or-url> <id-or-url> ...
```

It prints one line per video:

- `OK`: it exists and can be embedded, with its title, channel and channel URL.
- `NO-EMBED`: embedding is disabled, so it won't play on the page. Drop it.
- `MISSING` or `INVALID`: it doesn't exist. Drop it.

Then drop videos that fail the criteria in "Who the page is for" based on their
title and channel. Aim for 4–6 good candidates, and include at least one from an
existing channel when one turned up. If fewer than 2 survive, search again with
different wording, and if you still can't find any, tell the user and stop.

## 4. Show the videos and wait

List every candidate in a message, with full links so the user can watch them:

```
1. **<title>** (<channel>), in <Spanish/English/…>
   https://www.youtube.com/watch?v=<ID>
   <note, only if useful>
```

Give each video's spoken language. Judge it from the title, the channel and any
description in the search results; a channel already on the page is probably in
the language `--channels` lists for it. If you can't tell, say "language
unclear". The user will correct you if you're wrong, and it's shown on the page,
so don't guess wildly.

Add a short note when it would help the user decide, e.g. "already used for
Guapear" (an existing channel), "title doesn't say Cuban, check the style", or
"this channel's lessons are sometimes paid-course teasers".

Then **end your turn** and ask the user to reply with the numbers they want,
e.g. "1 and 3". Don't use AskUserQuestion here: its dialog covers the list, so
the user can't see the links. If the user gives a start time (e.g. "2 from
1:20"), put it on that link as `?t=80`.

If they don't want any, offer to search again or stop without changes. If they
explain why they skipped some (style, language, paywall, quality), use that when
searching again.

## 5. Add the step

Edit `site/steps.js` and append the new step at the end of the `SALSA_STEPS`
array, in the same format as the existing entries:

```js
  {
    name: "<step name, capitalised, with its accents>",
    videos: [
      { url: "https://www.youtube.com/watch?v=<ID>", lang: "es" },
    ],
  },
```

`lang` is the video's spoken language as a two-letter code (`es`, `en`, …), as
shown to the user and with any corrections they made. The page shows it as a
label under the video. Leave `lang` out for a video whose language is unclear.

Keep the videos in the order the user picked them.

Check the file still loads:

```sh
node -e 'global.window={}; require("./site/steps.js"); console.log(window.SALSA_STEPS.map(s => s.name + " (" + s.videos.length + ")").join("\n"))'
```

## 6. Commit

Stage only `site/steps.js` (by name, never `git add -A` or `.`) and commit with a
message like `Add <step> step` and a short body listing the videos' titles and
channels. End the message with the attribution line from the session's commit
instructions.

Don't push. Pushing to `main` deploys the site, so end by telling the user what
was added and asking whether to push.
