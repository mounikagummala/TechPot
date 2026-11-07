/* TechPot calculators. Pure functions first (tested in node), DOM wiring below.
   All results are illustrations based on numbers the user types. Nothing is sent anywhere. */
(function (root) {
  "use strict";

  function fmtINR(n) {
    n = Math.round(n);
    var neg = n < 0; n = Math.abs(n);
    var s = String(n);
    if (s.length > 3) {
      var last3 = s.slice(-3), rest = s.slice(0, -3);
      rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
      s = rest + "," + last3;
    }
    return (neg ? "-" : "") + "₹" + s;
  }

  // Monthly SIP, payment at the start of each month, monthly compounding.
  function annuityFactor(annualPct, months) {
    var i = annualPct / 100 / 12;
    return i === 0 ? months : ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  }
  function sipValue(P, annualPct, years) {
    var n = Math.round(years * 12);
    var fv = P * annuityFactor(annualPct, n);
    return { invested: P * n, value: fv, gain: fv - P * n };
  }
  function sipSeries(P, annualPct, years) {
    var out = [];
    for (var y = 0; y <= years; y++) { var r = sipValue(P, annualPct, y); out.push({ year: y, invested: r.invested, value: r.value }); }
    return out;
  }

  // Step-up SIP: the monthly amount rises by stepPct once every 12 months.
  function stepupSeries(P, annualPct, years, stepPct) {
    var i = annualPct / 100 / 12, bal = 0, inv = 0, pay = P, out = [{ year: 0, invested: 0, value: 0 }];
    for (var m = 1; m <= Math.round(years * 12); m++) {
      bal = (bal + pay) * (1 + i); inv += pay;
      if (m % 12 === 0) { out.push({ year: m / 12, invested: inv, value: bal }); pay = pay * (1 + stepPct / 100); }
    }
    return out;
  }
  function stepupValue(P, annualPct, years, stepPct) {
    var s = stepupSeries(P, annualPct, years, stepPct), l = s[s.length - 1];
    return { invested: l.invested, value: l.value, gain: l.value - l.invested };
  }

  // One-time amount, yearly compounding.
  function lumpsum(P, annualPct, years) {
    var v = P * Math.pow(1 + annualPct / 100, years);
    return { invested: P, value: v, gain: v - P };
  }

  // Monthly SIP needed to reach a target.
  function goalSip(target, annualPct, years) {
    var n = Math.round(years * 12), f = annuityFactor(annualPct, n);
    var p = f > 0 ? target / f : 0;
    return { monthly: p, invested: p * n, gain: target - p * n };
  }

  // Fixed deposit, interest compounded quarterly.
  function fd(P, ratePct, years) {
    var v = P * Math.pow(1 + ratePct / 400, 4 * years);
    return { invested: P, value: v, gain: v - P };
  }

  // Standard reducing-balance EMI.
  function emi(P, annualPct, months) {
    var r = annualPct / 100 / 12;
    var e = r === 0 ? P / months : P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    return { emi: e, total: e * months, interest: e * months - P };
  }

  function emergency(monthly, months) { return { target: monthly * months }; }

  // FIRE: corpus needed at retirement vs what current savings and SIP may grow to.
  function fire(o) {
    var n = Math.max(0, o.retireAge - o.age);
    var annualExp = o.monthlyExp * 12 * Math.pow(1 + o.inflation / 100, n);
    var number = annualExp / (o.wr / 100);
    var grown = o.savings * Math.pow(1 + o.ret / 100, n);
    var fromSip = o.sip * annuityFactor(o.ret, n * 12);
    var projected = grown + fromSip;
    var gap = number - projected;
    var extra = gap > 0 && n > 0 ? gap / annuityFactor(o.ret, n * 12) : 0;
    return { years: n, annualExp: annualExp, number: number, projected: projected, gap: gap, extraSip: extra };
  }

  // Term cover: need-based estimate (no discounting, so it is deliberately simple).
  function term(o) {
    var need = o.expenses * o.years + o.loans + o.goals;
    var cover = Math.max(0, need - o.assets - o.existing);
    return { need: need, cover: cover, low: o.income * 10, high: o.income * 15 };
  }

  var api = { fmtINR: fmtINR, sipValue: sipValue, sipSeries: sipSeries, stepupSeries: stepupSeries, stepupValue: stepupValue, lumpsum: lumpsum, goalSip: goalSip, fd: fd, emi: emi, emergency: emergency, fire: fire, term: term };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.TechPotCalc = api;

  /* ---------- DOM ---------- */
  if (typeof document === "undefined") return;

  function clamp(el) {
    var v = parseFloat(el.value); if (!isFinite(v)) v = 0;
    var mn = parseFloat(el.min), mx = parseFloat(el.max);
    if (isFinite(mn) && v < mn) v = mn;
    if (isFinite(mx) && v > mx) v = mx;
    return v;
  }
  function out(scope, name, text) { var el = scope.querySelector('[data-o="' + name + '"]'); if (el) el.textContent = text; }
  var R = fmtINR;

  function chart(svg, series) {
    var W = 560, H = 240, pl = 46, pr = 12, pt = 14, pb = 28, max = 0;
    series.forEach(function (p) { max = Math.max(max, p.value, p.invested); });
    if (max <= 0) { svg.innerHTML = ""; return; }
    var yrs = series.length - 1;
    function x(i) { return pl + (W - pl - pr) * (yrs === 0 ? 0 : i / yrs); }
    function y(v) { return pt + (H - pt - pb) * (1 - v / max); }
    function path(key) { return series.map(function (p, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p[key]).toFixed(1); }).join(" "); }
    var grid = "";
    for (var g = 0; g <= 4; g++) {
      var gv = max * g / 4, gy = y(gv);
      var lbl = gv >= 1e7 ? (gv / 1e7).toFixed(1) + " Cr" : gv >= 1e5 ? (gv / 1e5).toFixed(1) + " L" : Math.round(gv / 1000) + "k";
      grid += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + gy + '" y2="' + gy + '" stroke="rgba(11,31,58,.12)"/><text x="' + (pl - 6) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="11" fill="#4B5B76">' + lbl + '</text>';
    }
    var xl = "", step = yrs > 20 ? 5 : yrs > 10 ? 2 : 1;
    for (var k = 0; k <= yrs; k += step) xl += '<text x="' + x(k) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="#4B5B76">' + k + '</text>';
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML = grid + xl + '<path d="' + path("invested") + '" fill="none" stroke="#F5A524" stroke-width="2.5" stroke-linejoin="round"/><path d="' + path("value") + '" fill="none" stroke="#0B7A6F" stroke-width="2.5" stroke-linejoin="round"/>';
  }

  var RENDER = {
    sip: function (b, v) {
      var r = sipValue(v.amt, v.rate, v.years);
      out(b, "invested", R(r.invested)); out(b, "gain", R(r.gain)); out(b, "value", R(r.value));
      var s = b.querySelector(".calc__chart svg"); if (s) chart(s, sipSeries(v.amt, v.rate, v.years));
    },
    stepup: function (b, v) {
      var r = stepupValue(v.amt, v.rate, v.years, v.step);
      out(b, "invested", R(r.invested)); out(b, "gain", R(r.gain)); out(b, "value", R(r.value));
      var plain = sipValue(v.amt, v.rate, v.years);
      out(b, "plain", R(plain.value)); out(b, "extra", R(r.value - plain.value));
      var s = b.querySelector(".calc__chart svg"); if (s) chart(s, stepupSeries(v.amt, v.rate, v.years, v.step));
    },
    lumpsum: function (b, v) { var r = lumpsum(v.amt, v.rate, v.years); out(b, "invested", R(r.invested)); out(b, "gain", R(r.gain)); out(b, "value", R(r.value)); },
    goal: function (b, v) { var r = goalSip(v.target, v.rate, v.years); out(b, "target", R(v.target)); out(b, "invested", R(r.invested)); out(b, "gain", R(r.gain)); out(b, "monthly", R(r.monthly)); },
    fd: function (b, v) { var r = fd(v.amt, v.rate, v.years); out(b, "invested", R(r.invested)); out(b, "gain", R(r.gain)); out(b, "value", R(r.value)); },
    emi: function (b, v) {
      var e = emi(v.loan, v.rate, Math.round(v.years * 12));
      out(b, "emi", R(e.emi)); out(b, "interest", R(e.interest)); out(b, "total", R(e.total)); out(b, "principal", R(v.loan));
    },
    emergency: function (b, v) { var t = emergency(v.monthly, v.months); out(b, "target", R(t.target)); out(b, "monthly", R(v.monthly)); },
    fire: function (b, v) {
      var f = fire({ age: v.age, retireAge: v.retire, monthlyExp: v.exp, inflation: v.infl, savings: v.savings, sip: v.sip, ret: v.rate, wr: v.wr });
      out(b, "years", f.years + " yrs"); out(b, "annual", R(f.annualExp)); out(b, "number", R(f.number)); out(b, "projected", R(f.projected));
      out(b, "gap", f.gap > 0 ? R(f.gap) : "None"); out(b, "extra", f.extraSip > 0 ? R(f.extraSip) + " / month" : "Not needed");
      var msg = b.querySelector('[data-o="msg"]');
      if (msg) msg.textContent = f.years <= 0 ? "Retirement age must be higher than your age." :
        f.gap > 0 ? "On these assumptions you may fall short by " + R(f.gap) + ". Adding about " + R(f.extraSip) + " a month would close the gap." :
        "On these assumptions your savings may reach the number.";
    },
    term: function (b, v) {
      var t = term({ income: v.income, expenses: v.expenses, years: v.years, loans: v.loans, goals: v.goals, assets: v.assets, existing: v.existing });
      out(b, "need", R(t.need)); out(b, "cover", R(t.cover)); out(b, "low", R(t.low)); out(b, "high", R(t.high));
    }
  };

  function wire(box) {
    var kind = box.getAttribute("data-calc"), inputs = box.querySelectorAll('input[type="number"][data-k]');
    function render() {
      var v = {}; inputs.forEach(function (i) { v[i.getAttribute("data-k")] = clamp(i); });
      if (RENDER[kind]) RENDER[kind](box, v);
    }
    box.querySelectorAll(".field").forEach(function (f) {
      var n = f.querySelector('input[type="number"]'), r = f.querySelector('input[type="range"]');
      if (!n || !r) return;
      r.addEventListener("input", function () { n.value = r.value; render(); });
      n.addEventListener("input", function () { r.value = clamp(n); render(); });
      n.addEventListener("blur", function () { n.value = clamp(n); render(); });
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-calc]").forEach(wire);

    // tools page: show one calculator at a time, chosen from the tiles (works with #links)
    var tiles = document.querySelectorAll("[data-tool-tile]"), cards = document.querySelectorAll("[data-tool-card]");
    if (!tiles.length || !cards.length) return;
    function show(id, scroll) {
      var found = false;
      cards.forEach(function (c) { var on = c.id === id; c.hidden = !on; if (on) found = true; });
      if (!found) { id = cards[0].id; cards[0].hidden = false; }
      tiles.forEach(function (t) { t.setAttribute("aria-current", t.getAttribute("data-tool-tile") === id ? "true" : "false"); });
      if (scroll) { try { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (err) {} }
    }
    tiles.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        var id = t.getAttribute("data-tool-tile");
        show(id, true);
        try { history.replaceState(null, "", "#" + id); } catch (err) { /* sandboxed previews block this; the calculator is already open */ }
      });
    });
    show((location.hash || "").replace("#", ""), false);
    window.addEventListener("hashchange", function () { show((location.hash || "").replace("#", ""), true); });
  });
})(typeof window !== "undefined" ? window : globalThis);
