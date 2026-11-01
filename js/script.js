/* Serving With Honor — shared behavior */
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ================= EDIT THIS BLOCK ================= */
const CONFIG = {
  business: "HMR Luxury Cleaning LLC",
  phone: "(501) 777-1134",
  phoneRaw: "+15017771134",
  email: "helpmerhondaaustintx@gmail.com", // receives every cleaning request
  location: "Austin, TX",
  paymentNote:
    "Payment is due on the day of service. Accepted methods: [add your methods here].",
  taxRate: 0, // e.g. 0.0825 for 8.25%
  // EmailJS sends BOTH emails (invoice to client, request to HMR). See README.md for the 5-minute setup.
  emailjs: {
    serviceId: "",
    publicKey: "",
    clientTemplateId: "",
    businessTemplateId: "",
  },
};
const PRICE = {
  // ALL numbers below are placeholders. Replace them with HMR's real pricing.
  base: { standard: 140, deep: 210, move: 240, reset: 320 },
  extraBed: { standard: 20, deep: 30, move: 35, reset: 40 },
  extraBath: {
    standard: 25,
    deep: 35,
    move: 40,
    reset: 45,
  },
  sqft: [
    ["Under 1,200 sq ft", 1],
    ["1,200 to 1,800 sq ft", 1.12],
    ["1,800 to 2,500 sq ft", 1.28],
    ["2,500 to 3,500 sq ft", 1.5],
    ["3,500+ sq ft", 1.75],
  ],
  prop: {
    home: ["Private home", 1],
    apartment: ["Apartment", 0.95],
  },
  freq: {
    once: ["One-time", 0],
    weekly: ["Weekly", 0.15],
    biweekly: ["Bi-weekly", 0.1],
    monthly: ["Monthly", 0.05],
  },
  addons: {
    fridge: ["Inside fridge", 35],
    oven: ["Inside oven", 35],
    windows: ["Interior windows", 50],
    cabinets: ["Inside cabinets", 40],
    baseboards: ["Baseboard detail", 35],
    walls: ["Wall spot cleaning", 40],
    organize: ["Organizing and decluttering", 55],
    laundry: ["Laundry (wash and fold)", 25],
    pets: ["Heavy pet hair", 30],
  },
  svcName: {
    standard: "Standard Cleaning",
    deep: "Deep Cleaning",
    move: "Move-In / Move-Out Cleaning",
    reset: "Clean & Reset Service",
    construct: "Remodeling / Construction Cleaning",
  },
};
/* =================================================== */
const $$$ = (n) =>
  "$" + Number(n).toFixed(2).replace(/\.00$/, "");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

/* price engine shared by every calculator. Construction cleanups are quoted after a walk-through. */
function estimate(o) {
  if (o.svc === "construct")
    return {
      custom: true,
      lines: [],
      sub: 0,
      disc: 0,
      tax: 0,
      total: 0,
    };
  const t = o.svc,
    pm = PRICE.prop[o.prop][1],
    m = PRICE.sqft[o.sq][1],
    L = [];
  let sub = 0;
  const base = Math.round(PRICE.base[t] * pm * m);
  L.push([
    `${PRICE.svcName[t]}, ${PRICE.prop[o.prop][0]}, ${PRICE.sqft[o.sq][0]}`,
    base,
  ]);
  sub += base;
  const bd = Math.max(0, o.bed - 2),
    bt = Math.max(0, o.bath - 1);
  if (bd) {
    const a = Math.round(bd * PRICE.extraBed[t] * pm);
    L.push([`Extra bedrooms (${bd})`, a]);
    sub += a;
  }
  if (bt) {
    const a = Math.round(bt * PRICE.extraBath[t] * pm);
    L.push([`Extra bathrooms (${bt})`, a]);
    sub += a;
  }
  (o.addons || []).forEach((k) => {
    L.push([PRICE.addons[k][0], PRICE.addons[k][1]]);
    sub += PRICE.addons[k][1];
  });
  const dp =
      t === "standard"
        ? PRICE.freq[o.freq || "once"][1]
        : 0,
    disc = Math.round(sub * dp),
    tax =
      Math.round((sub - disc) * CONFIG.taxRate * 100) / 100;
  return {
    lines: L,
    sub,
    disc,
    discPct: dp,
    tax,
    total: sub - disc + tax,
  };
}

/* header, menus, promo */
const hd = $("header.top");
addEventListener(
  "scroll",
  () => hd.classList.toggle("scrolled", scrollY > 8),
  { passive: true },
);
$(".burger")?.addEventListener("click", (e) => {
  const o = $("#nav").classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", o);
});
$(".dd>button")?.addEventListener("click", (e) => {
  const d = e.currentTarget.parentElement;
  d.classList.toggle("open");
  e.currentTarget.setAttribute(
    "aria-expanded",
    d.classList.contains("open"),
  );
});
$(".promo button")?.addEventListener("click", () =>
  $(".promo").remove(),
);
$$("[data-year]").forEach(
  (e) => (e.textContent = new Date().getFullYear()),
);

/* headline reveal */
$$("[data-split]").forEach((el) => {
  let i = 0;
  const walk = (n) => {
    [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((t) => {
          if (!t.trim()) {
            f.append(t);
            return;
          }
          const o = document.createElement("span");
          o.className = "w";
          o.innerHTML = `<span class="${c.parentElement.classList.contains("gl") ? "gl-w" : ""}" style="--i:${i++}">${t}</span>`;
          f.append(o);
        });
        c.replaceWith(f);
      } else if (!c.classList?.contains("script")) walk(c);
    });
  };
  walk(el);
});
function count(el) {
  const to = parseFloat(el.dataset.to),
    t0 = performance.now();
  (function f(t) {
    const k = Math.min(1, (t - t0) / 1500),
      e = 1 - Math.pow(1 - k, 3);
    el.textContent =
      Math.round(to * e) + (el.dataset.suf || "");
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}
const io = new IntersectionObserver(
  (es) =>
    es.forEach((x) => {
      if (x.isIntersecting) {
        x.target.classList.add("show");
        if (x.target.dataset.to) count(x.target);
        io.unobserve(x.target);
      }
    }),
  { threshold: 0.15 },
);
$$(".rv,[data-to]").forEach((e) => io.observe(e));
if (!reduce && matchMedia("(hover:hover)").matches)
  $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px,${(e.clientY - r.top - r.height / 2) * 0.26}px)`;
    });
    b.addEventListener(
      "pointerleave",
      () => (b.style.transform = ""),
    );
  });

/* hero: floating gold dust lit by a "chandelier" that follows the cursor, a gilded sparkle trail, and a 3D-tilting portrait */
const cv = $("#fx");
if (cv && !reduce) {
  const c = cv.getContext("2d"),
    host = cv.parentElement,
    dpr = Math.min(devicePixelRatio || 1, 2);
  let W,
    H,
    dust = [],
    gems = [],
    trail = [],
    burst = [],
    on = true,
    last = 0,
    mx = -999,
    my = -999;
  const mkD = (i) => ({
    x: Math.random() * W,
    y: i ? Math.random() * H : H + 10,
    r: 0.8 + Math.random() * 2.8,
    vy: 0.12 + Math.random() * 0.45,
    p: Math.random() * 6.28,
    a: 0.25 + Math.random() * 0.55,
    h: 38 + Math.random() * 10,
  });
  function size() {
    const r = cv.getBoundingClientRect();
    W = r.width;
    H = r.height;
    cv.width = W * dpr;
    cv.height = H * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    dust = Array.from({ length: Math.round(W / 10) }, () =>
      mkD(true),
    );
    gems = Array.from(
      { length: Math.round(W / 85) },
      () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 6 + Math.random() * 10,
        p: Math.random() * 6.28,
        sp: 0.7 + Math.random() * 1.3,
      }),
    );
  }
  size();
  addEventListener("resize", size);
  const stage = $(".stage", host),
    tilt = $(".tilt", host);
  host.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
    host.style.setProperty("--mx", mx + "px");
    host.style.setProperty("--my", my + "px");
    if (Math.random() < 0.6)
      trail.push({
        x: mx,
        y: my,
        vx: (Math.random() - 0.5) * 1.4,
        vy: Math.random() * 1.1 + 0.1,
        l: 1,
        s: 4 + Math.random() * 7,
      });
    if (stage) {
      const nx = mx / W - 0.5,
        ny = my / H - 0.5;
      tilt.style.setProperty("--rx", -ny * 10 + "deg");
      tilt.style.setProperty("--ry", nx * 14 + "deg");
      $$(".arch-in img", stage).forEach((i) => {
        i.style.setProperty("--px", -nx * 16 + "px");
        i.style.setProperty("--py", -ny * 12 + "px");
      });
      $$(".chip", stage).forEach((ch, k) => {
        ch.style.setProperty(
          "--cx",
          nx * (20 + k * 10) + "px",
        );
        ch.style.setProperty(
          "--cy",
          ny * (14 + k * 8) + "px",
        );
      });
    }
  });
  host.addEventListener("pointerleave", () => {
    mx = my = -999;
    tilt?.style.setProperty("--rx", "0deg");
    tilt?.style.setProperty("--ry", "0deg");
  });
  host.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a,button,input,select,.card"))
      return;
    const r = host.getBoundingClientRect(),
      x = e.clientX - r.left,
      y = e.clientY - r.top;
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * 6.28,
        s = 1 + Math.random() * 3.6;
      burst.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        l: 1,
        s: 4 + Math.random() * 8,
      });
    }
  });
  new IntersectionObserver(
    (e) => (on = e[0].isIntersecting),
  ).observe(cv);
  const star = (x, y, s, a, h, l) => {
    c.save();
    c.translate(x, y);
    c.fillStyle = `hsla(${h},85%,${l || 58}%,${a})`;
    c.shadowColor = `hsla(${h},95%,62%,${a})`;
    c.shadowBlur = 14;
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 ? s * 0.16 : s;
      c.lineTo(
        Math.cos((i * Math.PI) / 4) * r,
        Math.sin((i * Math.PI) / 4) * r,
      );
    }
    c.closePath();
    c.fill();
    c.restore();
  };
  (function frame(t) {
    requestAnimationFrame(frame);
    if (!on || t - last < 16) return;
    last = t;
    c.clearRect(0, 0, W, H);
    const T = t / 1000;
    for (const d of dust) {
      d.y -= d.vy;
      d.x += Math.sin(T * 0.8 + d.p) * 0.35;
      if (d.y < -8) Object.assign(d, mkD(false));
      const dist = Math.hypot(d.x - mx, d.y - my),
        glow = dist < 180 ? 1 + (180 - dist) / 60 : 1;
      c.fillStyle = `hsla(${d.h},80%,${glow > 1.4 ? 68 : 52}%,${Math.min(1, d.a * glow * (0.65 + 0.35 * Math.sin(T * 2 + d.p)))})`;
      c.beginPath();
      c.arc(
        d.x,
        d.y,
        d.r * (glow > 1 ? 1 + (glow - 1) * 0.5 : 1),
        0,
        6.3,
      );
      c.fill();
    }
    for (const g of gems)
      star(
        g.x,
        g.y,
        g.s,
        Math.max(0, Math.sin(T * g.sp + g.p)) * 0.9,
        42,
        56,
      );
    trail = trail.filter((p) => p.l > 0);
    for (const p of trail) {
      p.x += p.vx;
      p.y += p.vy;
      p.l -= 0.028;
      star(p.x, p.y, p.s * p.l + 1, p.l, 44, 60);
    }
    burst = burst.filter((p) => p.l > 0);
    for (const p of burst) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.07;
      p.l -= 0.02;
      star(
        p.x,
        p.y,
        p.s * p.l + 1,
        p.l,
        p.s > 8 ? 48 : 40,
        62,
      );
    }
  })(0);
}

/* mini calculator (home + pricing) */
const mc = $("#mc");
if (mc) {
  let svc = "standard",
    freq = "once";
  const f = (id) => $("#mc-" + id);
  f("sq").innerHTML = PRICE.sqft
    .map((s, i) => `<option value="${i}">${s[0]}</option>`)
    .join("");
  f("prop").innerHTML = Object.entries(PRICE.prop)
    .map(
      ([k, v]) => `<option value="${k}">${v[0]}</option>`,
    )
    .join("");
  function run() {
    const o = {
      svc,
      prop: f("prop").value,
      bed: +f("bed").value,
      bath: +f("bath").value,
      sq: +f("sq").value,
      freq,
    };
    f("bv").textContent = o.bed;
    f("bav").textContent = o.bath;
    $("#mc-freqwrap").style.display =
      svc === "standard" ? "block" : "none";
    const e = estimate(o);
    f("price").textContent = e.custom
      ? "Custom quote"
      : $$$(e.total);
    f("go").href =
      `book.html?svc=${svc}&prop=${o.prop}&bed=${o.bed}&bath=${o.bath}&sq=${o.sq}&freq=${freq}#form`;
  }
  $$("#mc-svc button").forEach(
    (b) =>
      (b.onclick = () => {
        svc = b.dataset.v;
        $$("#mc-svc button").forEach((x) =>
          x.classList.toggle("on", x === b),
        );
        run();
      }),
  );
  $$("#mc-freq button").forEach(
    (b) =>
      (b.onclick = () => {
        freq = b.dataset.v;
        $$("#mc-freq button").forEach((x) =>
          x.classList.toggle("on", x === b),
        );
        run();
      }),
  );
  ["prop", "bed", "bath", "sq"].forEach((k) =>
    f(k).addEventListener("input", run),
  );
  run();
}

/* before / after sliders + gallery filter */
$$(".ba img").forEach((i) =>
  i.addEventListener("error", () => i.remove()),
);
$$(".ba").forEach((b) => {
  const i = $("input", b);
  i.oninput = () =>
    b.style.setProperty("--p", i.value + "%");
});
$$(".filters button").forEach(
  (b) =>
    (b.onclick = () => {
      $$(".filters button").forEach((x) =>
        x.classList.toggle("on", x === b),
      );
      $$(".gal figure").forEach((f) =>
        f.classList.toggle(
          "hide",
          b.dataset.f !== "all" &&
            f.dataset.c !== b.dataset.f,
        ),
      );
    }),
);

/* ================= BOOKING WIZARD + INVOICE ================= */
const bf = $("#form");
function invoiceHTML(d, biz) {
  const e = d.est,
    row = (a, b, s = "") =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;${s}">${a}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;${s}">${b}</td></tr>`;
  const lines =
    (e.custom
      ? row(
          "Custom service: a quick walk-through confirms your price",
          "To be quoted",
        )
      : e.lines
          .map((l) => row(esc(l[0]), $$$(l[1])))
          .join("")) +
    (e.disc
      ? row(
          `Recurring discount (${Math.round(e.discPct * 100)}%)`,
          "−" + $$$(e.disc),
          "color:#2e7d32",
        )
      : "") +
    (e.tax ? row("Tax", $$$(e.tax)) : "");
  const extra = biz
    ? `<h3 style="margin:22px 0 6px;font-size:15px">Client details</h3><p style="margin:0;font-size:14px;line-height:1.6">Phone: ${esc(d.phone)}<br>Email: ${esc(d.email)}<br>Pets: ${esc(d.pets)}<br>Access: ${esc(d.access || "Not provided")}<br>Notes: ${esc(d.notes || "None")}</p>`
    : "";
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111;background:#fff;border:1px solid #eadfc3;border-radius:10px;overflow:hidden">
<div style="background:#1c1913;padding:22px 26px;color:#f1dc9b"><div style="font-size:22px;letter-spacing:3px;font-weight:bold">HMR LUXURY CLEANING LLC</div><div style="font-size:12px;letter-spacing:2px;color:#d9b24c">WE CLEAN THE STRESS AWAY · ${biz ? "NEW CLEANING REQUEST" : "INVOICE"}</div></div>
<div style="padding:24px 26px"><table style="width:100%;font-size:14px"><tr><td><b>${biz ? "Request" : "Invoice"} #${esc(d.no)}</b><br>Issued: ${esc(d.issued)}</td><td style="text-align:right"><b>Service date</b><br>${esc(d.dateLabel)}<br>${esc(d.time)}</td></tr></table>
<p style="font-size:14px;margin:18px 0 4px"><b>${biz ? "Client" : "Billed to"}</b><br>${esc(d.name)}<br>${esc(d.addr)}, ${esc(d.city)} ${esc(d.zip)}</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:14px"><tr><th style="text-align:left;padding:8px 0;border-bottom:2px solid #d9b24c">Description</th><th style="text-align:right;padding:8px 0;border-bottom:2px solid #d9b24c">Amount</th></tr>${lines}
<tr><td style="padding:12px 0;font-size:16px"><b>Estimated total</b></td><td style="padding:12px 0;text-align:right;font-size:20px"><b>${e.custom ? "To be quoted" : $$$(e.total)}</b></td></tr></table>
<p style="font-size:12px;color:#555;line-height:1.5">${esc(CONFIG.paymentNote)} This is an estimate based on the details provided. Any change in scope will be confirmed with you before work begins.</p>${extra}
<p style="font-size:13px;margin-top:22px;border-top:1px solid #eee;padding-top:14px">Questions? Call <b>${esc(CONFIG.phone)}</b> or email ${esc(CONFIG.email)}<br>HMR Luxury Cleaning LLC · ${esc(CONFIG.location)} · We clean the stress away.</p></div></div>`;
}

async function sendMail(templateId, params) {
  const c = CONFIG.emailjs;
  const r = await fetch(
    "https://api.emailjs.com/api/v1.0/email/send",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: c.serviceId,
        template_id: templateId,
        user_id: c.publicKey,
        template_params: params,
      }),
    },
  );
  if (!r.ok) throw new Error(await r.text());
}

if (bf) {
  const S = { svc: "standard", freq: "once" };
  let step = 1;
  const g = (id) => $("#" + id),
    boxes = $$(".stepbox");
  g("b-sq").innerHTML = PRICE.sqft
    .map((s, i) => `<option value="${i}">${s[0]}</option>`)
    .join("");
  g("b-prop").innerHTML = Object.entries(PRICE.prop)
    .map(
      ([k, v]) => `<option value="${k}">${v[0]}</option>`,
    )
    .join("");
  g("b-addons").innerHTML = Object.entries(PRICE.addons)
    .map(
      ([k, v]) =>
        `<label class="addon" style="text-transform:none;letter-spacing:0;color:inherit;font-weight:500;font-size:.92rem;margin:8px 0"><input type="checkbox" value="${k}">${v[0]}<span>+${$$$(v[1])}</span></label>`,
    )
    .join("");
  const d0 = new Date();
  d0.setDate(d0.getDate() + 1);
  g("b-date").min = d0.toISOString().slice(0, 10);
  const p = new URLSearchParams(location.search);
  if (p.get("svc") && PRICE.svcName[p.get("svc")])
    S.svc = p.get("svc");
  if (PRICE.freq[p.get("freq")]) S.freq = p.get("freq");
  if (PRICE.prop[p.get("prop")])
    g("b-prop").value = p.get("prop");
  ["bed", "bath", "sq"].forEach((k) => {
    if (p.get(k)) g("b-" + k).value = p.get(k);
  });
  $$("#b-svc button").forEach((b) =>
    b.classList.toggle("on", b.dataset.v === S.svc),
  );
  $$("#b-freq button").forEach((b) =>
    b.classList.toggle("on", b.dataset.v === S.freq),
  );
  const data = () => ({
    svc: S.svc,
    freq: S.freq,
    prop: g("b-prop").value,
    bed: +g("b-bed").value,
    bath: +g("b-bath").value,
    sq: +g("b-sq").value,
    addons: $$("#b-addons input:checked").map(
      (i) => i.value,
    ),
  });
  function sum() {
    const o = data(),
      e = estimate(o);
    g("s-lines").innerHTML = e.custom
      ? "<div><span>Construction and remodeling cleanups are quoted after a quick walk-through.</span></div>"
      : e.lines
          .map(
            (l) =>
              `<div><span>${esc(l[0])}</span><span>${$$$(l[1])}</span></div>`,
          )
          .join("") +
        (e.disc
          ? `<div style="color:var(--gold-d)"><span>Recurring discount</span><span>−${$$$(e.disc)}</span></div>`
          : "") +
        (e.tax
          ? `<div><span>Tax</span><span>${$$$(e.tax)}</span></div>`
          : "");
    g("s-total").textContent = e.custom
      ? "Custom quote"
      : $$$(e.total);
    g("b-freqwrap").style.display =
      S.svc === "standard" ? "block" : "none";
    return e;
  }
  $$("#b-svc button").forEach(
    (b) =>
      (b.onclick = () => {
        S.svc = b.dataset.v;
        $$("#b-svc button").forEach((x) =>
          x.classList.toggle("on", x === b),
        );
        sum();
      }),
  );
  $$("#b-freq button").forEach(
    (b) =>
      (b.onclick = () => {
        S.freq = b.dataset.v;
        $$("#b-freq button").forEach((x) =>
          x.classList.toggle("on", x === b),
        );
        sum();
      }),
  );
  bf.addEventListener("input", sum);
  function show(n) {
    step = n;
    boxes.forEach((b, i) =>
      b.classList.toggle("on", i === n - 1),
    );
    $$(".wiz i").forEach((i, k) =>
      i.classList.toggle("on", k < n),
    );
    if (n === 4) review();
    scrollTo({
      top: $("#form").offsetTop - 90,
      behavior: "smooth",
    });
  }
  function valid(n) {
    const need =
      n === 3
        ? [
            "b-date",
            "b-time",
            "b-n",
            "b-email",
            "b-phone",
            "b-addr",
            "b-city",
            "b-zip",
          ]
        : [];
    for (const id of need) {
      const el = g(id);
      if (
        !el.value.trim() ||
        (el.type === "email" && !el.checkValidity())
      ) {
        el.focus();
        el.reportValidity?.();
        return false;
      }
    }
    return true;
  }
  $$("[data-next]").forEach(
    (b) =>
      (b.onclick = () => {
        if (valid(step)) show(step + 1);
      }),
  );
  $$("[data-prev]").forEach(
    (b) => (b.onclick = () => show(step - 1)),
  );
  function collect() {
    const o = data(),
      e = estimate(o),
      dt = new Date(g("b-date").value + "T12:00");
    return {
      ...o,
      est: e,
      no:
        "SWH-" +
        new Date()
          .toISOString()
          .slice(2, 10)
          .replace(/-/g, "") +
        "-" +
        Math.floor(1000 + Math.random() * 9000),
      issued: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      dateLabel: dt.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: g("b-time").value,
      name: g("b-n").value.trim(),
      email: g("b-email").value.trim(),
      phone: g("b-phone").value.trim(),
      addr: g("b-addr").value.trim(),
      city: g("b-city").value.trim(),
      zip: g("b-zip").value.trim(),
      pets: g("b-pets").value,
      access: g("b-access").value.trim(),
      notes: g("b-notes").value.trim(),
    };
  }
  function review() {
    const d = collect();
    g("rev").innerHTML =
      `<div class="inv">${invoiceHTML(d, false)}</div>`;
  }
  bf.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (g("b-hp").value) return;
    if (!g("b-terms").checked) {
      g("b-terms").focus();
      return;
    }
    const d = collect(),
      btn = g("b-send"),
      st = g("b-status");
    btn.disabled = true;
    btn.textContent = "Sending…";
    const c = CONFIG.emailjs,
      ready =
        c.serviceId &&
        c.publicKey &&
        c.clientTemplateId &&
        c.businessTemplateId;
    let sent = false,
      msg = "";
    if (ready) {
      try {
        const subj = (n) =>
          `${n} #${d.no} · ${PRICE.svcName[d.svc]} on ${d.dateLabel}`;
        const rs = await Promise.allSettled([
          sendMail(c.clientTemplateId, {
            to_email: d.email,
            to_name: d.name,
            subject: subj(
              "Your HMR Luxury Cleaning invoice",
            ),
            html: invoiceHTML(d, false),
            reply_to: CONFIG.email,
            from_name: CONFIG.business,
          }),
          sendMail(c.businessTemplateId, {
            to_email: CONFIG.email,
            to_name: CONFIG.business,
            subject: subj("New cleaning request"),
            html: invoiceHTML(d, true),
            reply_to: d.email,
            from_name: d.name,
          }),
        ]);
        sent = rs.every((r) => r.status === "fulfilled");
        msg = sent
          ? `We emailed your invoice to ${esc(d.email)} and sent your request to our team.`
          : "Your request was received, but one email did not go through. Please call us to confirm.";
      } catch (x) {
        msg =
          "We could not send the emails. Please call us to confirm.";
      }
    } else
      msg =
        "Email sending is not connected yet (see README.md). Use the buttons below to send this request manually.";
    boxes.forEach((b) => b.classList.remove("on"));
    g("done").style.display = "block";
    $$(".wiz").forEach((w) => (w.style.display = "none"));
    g("done-msg").innerHTML = msg;
    g("done-inv").innerHTML =
      `<div class="inv">${invoiceHTML(d, false)}</div>`;
    const plain = encodeURIComponent(
      `New cleaning request ${d.no}\n\nName: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\nAddress: ${d.addr}, ${d.city} ${d.zip}\nService: ${PRICE.svcName[d.svc]} (${PRICE.prop[d.prop][0]}, ${d.bed} bed, ${d.bath} bath)\nDate: ${d.dateLabel}, ${d.time}\nAdd-ons: ${d.addons.map((a) => PRICE.addons[a][0]).join(", ") || "None"}\nEstimate: ${d.est.custom ? "Custom quote" : $$$(d.est.total)}\nPets: ${d.pets}\nAccess: ${d.access}\nNotes: ${d.notes}`,
    );
    g("done-mail").href =
      `mailto:${CONFIG.email}?subject=${encodeURIComponent("Cleaning request " + d.no)}&body=${plain}`;
    g("done-mail").style.display =
      ready && sent ? "none" : "inline-block";
    scrollTo({
      top: $("#done").offsetTop - 100,
      behavior: "smooth",
    });
  });
  sum();
}

/* quote popup: once per visit */
const md = $("#pop");
if (md && !sessionStorage.getItem("popSeen")) {
  const show = () => {
    if (sessionStorage.getItem("popSeen")) return;
    sessionStorage.setItem("popSeen", "1");
    md.classList.add("open");
    $(".x", md).focus();
  };
  setTimeout(show, 30000);
  document.addEventListener("mouseout", (e) => {
    if (e.clientY <= 0 && e.relatedTarget === null) show();
  });
  md.addEventListener("click", (e) => {
    if (
      e.target === md ||
      e.target.classList.contains("x") ||
      e.target.dataset.close !== undefined
    )
      md.classList.remove("open");
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") md.classList.remove("open");
  });
}
$$("[data-print]").forEach(
  (b) => (b.onclick = () => print()),
);

/* service-area text + contact form */
$("#area")?.addEventListener("submit", (e) => {
  e.preventDefault();
  location.href = `sms:${CONFIG.phoneRaw}?&body=${encodeURIComponent("Hi HMR Luxury Cleaning, do you serve " + $("#area-c").value + "?")}`;
});
$("#cform")?.addEventListener("submit", (e) => {
  e.preventDefault();
  location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Website message from " + $("#c-n").value)}&body=${encodeURIComponent($("#c-m").value + "\n\nFrom: " + $("#c-n").value + " (" + $("#c-e").value + ")")}`;
});
