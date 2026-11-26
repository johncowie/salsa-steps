(function () {
  "use strict";

  // "Dile que no" -> "dile-que-no", "Enchúfala" -> "enchufala"
  function slugify(text) {
    return text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // "1m30s" -> 90, "42" -> 42
  function parseStartTime(value) {
    if (!value) return 0;
    if (/^\d+$/.test(value)) return Number(value);
    var match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    if (!match) return 0;
    return (Number(match[1] || 0) * 3600) + (Number(match[2] || 0) * 60) + Number(match[3] || 0);
  }

  // Accepts a bare video ID or any common YouTube URL form.
  function parseVideo(input) {
    var value = String(input).trim();
    if (/^[\w-]{11}$/.test(value)) return { id: value, start: 0 };

    var url;
    try {
      url = new URL(value);
    } catch (e) {
      return null;
    }

    var host = url.hostname.replace(/^(www|m)\./, "");
    var id = null;
    if (host === "youtu.be") {
      id = url.pathname.slice(1);
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = url.searchParams.get("v") ||
        (url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/) || [])[1];
    }
    if (!id || !/^[\w-]{11}$/.test(id)) return null;

    return { id: id, start: parseStartTime(url.searchParams.get("t") || url.searchParams.get("start")) };
  }

  // A video is a link or ID, or { url, lang } where lang is a language code like "es".
  function normaliseVideo(entry) {
    var input = typeof entry === "string" ? entry : entry && entry.url;
    var video = input ? parseVideo(input) : null;
    if (video && entry.lang) video.lang = String(entry.lang).toLowerCase();
    return video;
  }

  // "es" -> "Español", "en" -> "English": each language's name in that language.
  function languageName(code) {
    try {
      var name = new Intl.DisplayNames([code], { type: "language" }).of(code);
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch (e) {
      return code.toUpperCase();
    }
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      node.append(child);
    });
    return node;
  }

  function renderVideo(video, stepName, index, total) {
    // Use youtube.com rather than youtube-nocookie.com so the player can see the
    // viewer's YouTube login; without it YouTube may demand a "not a bot" sign-in.
    var src = "https://www.youtube.com/embed/" + video.id +
      (video.start ? "?start=" + video.start : "");
    var title = stepName + (total > 1 ? " – video " + (index + 1) : " – video") +
      (video.lang ? " (" + languageName(video.lang) + ")" : "");
    var children = [
      el("div", { class: "video" }, [
        el("iframe", {
          src: src,
          title: title,
          loading: "lazy",
          allow: "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          referrerpolicy: "strict-origin-when-cross-origin",
          allowfullscreen: "",
        }),
      ]),
    ];
    if (video.lang) {
      children.push(el("figcaption", {}, [
        el("span", { class: "lang-tag", lang: video.lang }, [languageName(video.lang)]),
      ]));
    }
    return el("figure", { class: "video-card" }, children);
  }

  function renderStep(step, id) {
    var videos = (step.videos || []).map(normaliseVideo).filter(Boolean);
    if (videos.length !== (step.videos || []).length) {
      console.warn("Some videos for \"" + step.name + "\" couldn't be read:", step.videos);
    }

    var heading = el("h2", {}, [
      el("a", { class: "anchor", href: "#" + id, "aria-label": "Link to " + step.name }, ["#"]),
      step.name,
    ]);

    var body = videos.length
      ? el("div", { class: "videos" + (videos.length > 1 ? " videos--many" : "") },
          videos.map(function (v, i) { return renderVideo(v, step.name, i, videos.length); }))
      : el("p", { class: "empty" }, ["No videos yet."]);

    return el("section", { class: "step", id: id }, [heading, body]);
  }

  function render() {
    var steps = window.SALSA_STEPS || [];
    var used = {};
    var withIds = steps.map(function (step) {
      var base = slugify(step.name) || "paso";
      var id = base;
      for (var n = 2; used[id]; n++) id = base + "-" + n;
      used[id] = true;
      return { step: step, id: id };
    });

    var toc = document.getElementById("toc-list");
    var list = document.getElementById("steps");

    withIds.forEach(function (item) {
      toc.append(el("li", {}, [el("a", { href: "#" + item.id }, [item.step.name])]));
      list.append(renderStep(item.step, item.id));
    });

    document.getElementById("step-count").textContent =
      steps.length + (steps.length === 1 ? " paso" : " pasos");

    // The sections didn't exist when the browser first looked for the anchor.
    if (location.hash) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }
  }

  if (typeof module !== "undefined") {
    module.exports = {
      slugify: slugify,
      parseVideo: parseVideo,
      parseStartTime: parseStartTime,
      normaliseVideo: normaliseVideo,
      languageName: languageName,
    };
  } else {
    render();
  }
})();
