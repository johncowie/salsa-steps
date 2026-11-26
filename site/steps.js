// The list of salsa steps shown on the page, in display order.
//
// Each step has:
//   name   – the step's name in Spanish. It's also used to build the anchor,
//            e.g. "Dile que no" becomes #dile-que-no.
//   videos – one or more YouTube videos. Each can be a video ID ("jNQXAC9IVRw")
//            or a full link (youtube.com/watch?v=…, youtu.be/…, /shorts/…).
//            A start time in the link (?t=42 or &t=1m30s) is kept.
window.SALSA_STEPS = [
  {
    name: "Test",
    videos: ["https://www.youtube.com/watch?v=jNQXAC9IVRw"],
  },
  {
    name: "Guapear",
    videos: [
      "https://www.youtube.com/watch?v=YwxB1MSytYA",
    ],
  },
];
