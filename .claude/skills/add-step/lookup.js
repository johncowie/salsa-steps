#!/usr/bin/env node
// Looks up YouTube videos with YouTube's oEmbed endpoint.
//
//   node lookup.js <id-or-url>...   check each video exists and allows embedding
//   node lookup.js --channels       list the channels already used in site/steps.js
"use strict";

const path = require("path");
const { parseVideo } = require(path.join(__dirname, "../../../site/app.js"));

async function oembed(id) {
  const url = "https://www.youtube.com/oembed?format=json&url=" +
    encodeURIComponent("https://www.youtube.com/watch?v=" + id);
  const res = await fetch(url);
  if (res.status === 200) return { id, status: "OK", ...(await res.json()) };
  if (res.status === 401 || res.status === 403) return { id, status: "NO-EMBED" };
  return { id, status: "MISSING" };
}

async function checkVideos(inputs) {
  const results = await Promise.all(inputs.map(async (input) => {
    const video = parseVideo(input);
    return video ? oembed(video.id) : { id: input, status: "INVALID" };
  }));
  for (const r of results) {
    console.log(r.status === "OK"
      ? `OK        ${r.id} | ${r.title} | ${r.author_name} | ${r.author_url}`
      : `${r.status.padEnd(9)} ${r.id}`);
  }
}

async function listChannels() {
  global.window = {};
  require(path.join(__dirname, "../../../site/steps.js"));
  const uses = [];
  for (const step of window.SALSA_STEPS) {
    if (step.name === "Test") continue; // placeholder
    for (const input of step.videos) {
      const video = parseVideo(input);
      if (video) uses.push({ step: step.name, id: video.id });
    }
  }

  const results = await Promise.all(uses.map((u) => oembed(u.id).then((r) => ({ ...u, ...r }))));
  const channels = new Map();
  for (const r of results) {
    if (r.status !== "OK") continue;
    const c = channels.get(r.author_url) || { name: r.author_name, url: r.author_url, steps: new Set() };
    c.steps.add(r.step);
    channels.set(r.author_url, c);
  }

  if (!channels.size) return console.log("No channels yet.");
  for (const c of channels.values()) {
    console.log(`${c.name} | ${c.url} | used for: ${[...c.steps].join(", ")}`);
  }
}

const args = process.argv.slice(2);
(args[0] === "--channels" ? listChannels() : checkVideos(args)).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
