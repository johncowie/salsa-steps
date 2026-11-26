// The list of salsa steps shown on the page, in display order.
//
// Each step has:
//   name   – the step's name in Spanish. It's also used to build the anchor,
//            e.g. "Dile que no" becomes #dile-que-no.
//   videos – one or more YouTube videos, each as { url, lang }:
//              url  – a full link (youtube.com/watch?v=…, youtu.be/…, /shorts/…)
//                     or just the video ID. A start time (?t=42 or &t=1m30s) is kept.
//              lang – the language spoken in the video, e.g. "es" or "en". It's
//                     shown as a label under the video. Leave it out if unsure.
//            A plain link string also works, for a video with no language label.
window.SALSA_STEPS = [
  {
    name: "Guapea",
    videos: [
      { url: "https://www.youtube.com/watch?v=YwxB1MSytYA", lang: "en" },
      { url: "https://www.youtube.com/watch?v=4SnpIhCO54c", lang: "es" },
    ],
  },
];
