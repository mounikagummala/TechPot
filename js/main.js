(function () {
  "use strict";
  var cfg = window.TECHPOT_CONFIG || {};

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // mobile menu (hamburger) with an explicit close button
  var btn = document.querySelector(".menu-btn"), panel = document.getElementById("mobile-menu");
  function setMenu(open) {
    if (!btn || !panel) return;
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("menu-open", open);
  }
  if (btn && panel) {
    btn.addEventListener("click", function () { setMenu(panel.hidden); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a") || e.target.closest("[data-close-menu]")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.matchMedia("(min-width: 1000px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }

  // FAQ: only one answer open at a time
  document.querySelectorAll(".faq").forEach(function (box) {
    var all = box.querySelectorAll("details");
    all.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        all.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  // certificate lightbox
  var dlg = document.getElementById("cert-dialog");
  document.querySelectorAll("[data-open-cert]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      if (dlg && dlg.showModal) dlg.showModal(); else window.open("assets/img/certificate.jpg", "_blank");
    });
  });
  if (dlg) {
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    var c = dlg.querySelector(".lightbox__close");
    if (c) c.addEventListener("click", function () { dlg.close(); });
  }

  // services: highlight the section being read in the side list
  var links = document.querySelectorAll(".sx__nav a");
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.removeAttribute("aria-current"); });
          map[en.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  // optional contact details from site-config.js
  document.querySelectorAll("[data-contact]").forEach(function (a) {
    var kind = a.getAttribute("data-contact"), href = "", label = "";
    if (kind === "whatsapp" && cfg.whatsapp) { href = "https://wa.me/" + String(cfg.whatsapp).replace(/\D/g, ""); label = "WhatsApp"; }
    else if (kind === "email" && cfg.email) { href = "mailto:" + cfg.email; label = cfg.email; }
    else if (kind === "youtube" && cfg.youtube) { href = cfg.youtube; label = "YouTube"; }
    if (href) {
      a.setAttribute("href", href); a.hidden = false;
      var t = a.querySelector("[data-label]");
      if (t) t.textContent = label; else if (!a.textContent.trim()) a.textContent = label;
    }
  });
  var anyContact = !!(cfg.whatsapp || cfg.email);
  document.querySelectorAll("[data-no-contact]").forEach(function (el) { el.hidden = anyContact; });
  document.querySelectorAll("[data-contact-text]").forEach(function (el) { var k = el.getAttribute("data-contact-text"); if (cfg[k]) el.textContent = cfg[k]; });

  // registrations (shown only if filled in)
  var regs = cfg.registrations || [];
  document.querySelectorAll("[data-registrations]").forEach(function (el) {
    if (!regs.length) return;
    el.innerHTML = "";
    regs.forEach(function (r) { var li = document.createElement("li"); li.textContent = r; el.appendChild(li); });
    el.hidden = false;
  });
  document.querySelectorAll("[data-no-regs]").forEach(function (el) { el.hidden = regs.length > 0; });

  // latest videos: Instagram Reels are embedded; anything else becomes a link card
  var vids = (cfg.videos || []).filter(function (v) { return v && v.url; });
  function code(u) { var m = /instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/.exec(u); return m ? m[1] : null; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  if (vids.length) {
    document.querySelectorAll("[data-videos]").forEach(function (box) {
      var limit = parseInt(box.getAttribute("data-limit"), 10) || vids.length;
      box.innerHTML = "";
      vids.slice(0, limit).forEach(function (v) {
        var cd = code(v.url), card = el("div", "card embed");
        if (cd) {
          var frame = el("div", "embed__frame"), f = document.createElement("iframe");
          f.src = "https://www.instagram.com/reel/" + cd + "/embed/";
          f.title = v.title || "TechPot video on Instagram";
          f.loading = "lazy"; f.setAttribute("scrolling", "no"); f.setAttribute("allowtransparency", "true"); f.setAttribute("allowfullscreen", "true");
          frame.appendChild(f); card.appendChild(frame);
        }
        var body = el("div", "embed__body");
        if (v.title) body.appendChild(el("h3", "", v.title));
        if (v.note) body.appendChild(el("p", "", v.note));
        var a = el("a", "more", "Watch on Instagram"); a.href = v.url; a.target = "_blank"; a.rel = "noopener";
        body.appendChild(a); card.appendChild(body); box.appendChild(card);
      });
    });
    document.querySelectorAll("[data-no-videos]").forEach(function (n) { n.hidden = true; });
  }
})();
