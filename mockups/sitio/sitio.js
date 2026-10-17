(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* Mobile header menu */
  (function () {
    var header = qs(".sitio-header");
    var toggle = qs("[data-sitio-menu-toggle]", header);
    var nav = qs(".sitio-nav", header);
    if (!header || !toggle || !nav) return;

    function setOpen(open) {
      header.classList.toggle("is-menu-open", open);
      document.body.classList.toggle("is-menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        open ? "Cerrar menú" : "Abrir menú"
      );
    }

    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-menu-open"));
    });

    qsa("a", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 961px)").matches) setOpen(false);
    });
  })();

  /* Product slider */
  var rail = qs("[data-feature-rail]");
  if (rail) {
    var stageImg = qs("[data-stage-img]");
    var stageCap = qs("[data-stage-caption]");
    qsa("button", rail).forEach(function (btn) {
      btn.addEventListener("click", function () {
        qsa("button", rail).forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        if (stageImg) {
          stageImg.src = btn.getAttribute("data-src");
          stageImg.alt = btn.getAttribute("data-alt") || "";
        }
        if (stageCap) {
          stageCap.textContent = btn.getAttribute("data-caption") || "";
        }
      });
    });
  }

  /* Accordions */
  qsa("[data-accordion]").forEach(function (root) {
    qsa(".accordion-item > button, .faq-item > button", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.parentElement;
        var open = item.classList.contains("is-open");
        if (root.getAttribute("data-accordion") === "single") {
          qsa(".accordion-item, .faq-item", root).forEach(function (el) {
            el.classList.remove("is-open");
            var ic = qs(".icon, .toggle", el);
            if (ic) ic.textContent = "+";
          });
        }
        if (!open) {
          item.classList.add("is-open");
          var ic2 = qs(".icon, .toggle", item);
          if (ic2) ic2.textContent = "−";
        } else if (root.getAttribute("data-accordion") !== "single") {
          item.classList.remove("is-open");
          var ic3 = qs(".icon, .toggle", item);
          if (ic3) ic3.textContent = "+";
        }
      });
    });
  });

  /* Billing toggle */
  function applyBillingPeriod(period) {
    qsa("[data-price]").forEach(function (el) {
      el.textContent =
        period === "annual"
          ? el.getAttribute("data-annual")
          : el.getAttribute("data-monthly");
    });
    qsa("[data-period-label]").forEach(function (el) {
      el.textContent = period === "annual" ? "/ año" : "/ mes";
    });
  }

  var toggle = qs("[data-billing-toggle]");
  if (toggle) {
    qsa("button", toggle).forEach(function (btn) {
      btn.addEventListener("click", function () {
        qsa("button", toggle).forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        applyBillingPeriod(btn.getAttribute("data-period"));
      });
    });
  }

  /* Suscripciones: load catalog from Admin → Planes (GET /public/plans) */
  (function initPublicPlans() {
    var row = qs("[data-plans-row]");
    if (!row) return;

    var PLAN_ORDER = ["basico", "pro", "enterprise"];
    var PROMO_FEATURES = [
      "15 días de prueba",
      "50% off los primeros 6 meses",
    ];

    function formatArs(amount) {
      var n = Math.round(Number(amount) || 0);
      return (
        "$ " +
        n.toLocaleString("es-AR", {
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        })
      );
    }

    function activePeriod() {
      var active = qs("[data-billing-toggle] button.is-active");
      return active ? active.getAttribute("data-period") : "monthly";
    }

    function featureLines(plan) {
      var lines = [];
      var servicios = Array.isArray(plan.servicios) ? plan.servicios : [];
      var copi = Array.isArray(plan.copi) ? plan.copi : [];
      if (servicios.length) lines.push(servicios.join(", "));
      if (copi.length) lines = lines.concat(copi);
      if (!lines.length && Array.isArray(plan.features)) {
        lines = plan.features.slice();
      }
      var slug = String(plan.slug || "").toLowerCase();
      if (slug === "basico" || slug === "pro") {
        PROMO_FEATURES.forEach(function (f) {
          if (lines.indexOf(f) === -1) lines.push(f);
        });
      }
      return lines;
    }

    function applyPlan(card, plan) {
      var slug = String(plan.slug || "").toLowerCase();
      var nameEl = qs("[data-plan-name]", card);
      var taglineEl = qs("[data-plan-tagline]", card);
      var featuresEl = qs("[data-plan-features]", card);
      var cta = qs("[data-plan-cta]", card);
      var priceEl = qs("[data-price]", card);
      var customPriceEl = qs("[data-plan-price-custom]", card);
      var periodLabel = qs("[data-period-label]", card);

      if (nameEl && plan.name) nameEl.textContent = plan.name;
      if (taglineEl && typeof plan.tagline === "string") {
        taglineEl.textContent = plan.tagline;
      }

      card.classList.toggle("is-featured", Boolean(plan.featured));

      var customLabel =
        typeof plan.customPriceLabel === "string" && plan.customPriceLabel.trim()
          ? plan.customPriceLabel.trim()
          : "";

      if (customLabel) {
        if (customPriceEl) {
          customPriceEl.textContent = customLabel;
          customPriceEl.hidden = false;
        }
        if (priceEl) {
          priceEl.hidden = true;
          priceEl.removeAttribute("data-monthly");
          priceEl.removeAttribute("data-annual");
        }
        if (periodLabel) periodLabel.hidden = true;
      } else {
        if (customPriceEl) customPriceEl.hidden = true;
        if (periodLabel) periodLabel.hidden = false;
        if (!priceEl) {
          var priceWrap = qs(".plan-price", card);
          if (priceWrap) {
            priceWrap.innerHTML =
              '<span data-price></span> <small data-period-label>/ mes</small>';
            priceEl = qs("[data-price]", card);
            periodLabel = qs("[data-period-label]", card);
          }
        }
        if (priceEl) {
          priceEl.hidden = false;
          var monthly =
            plan.priceMonthly != null && plan.priceMonthly > 0
              ? formatArs(plan.priceMonthly)
              : "—";
          var annual =
            plan.priceAnnual != null && plan.priceAnnual > 0
              ? formatArs(plan.priceAnnual)
              : plan.priceMonthly != null && plan.priceMonthly > 0
                ? formatArs(plan.priceMonthly * 11)
                : "—";
          priceEl.setAttribute("data-monthly", monthly);
          priceEl.setAttribute("data-annual", annual);
          priceEl.textContent =
            activePeriod() === "annual" ? annual : monthly;
        }
        if (periodLabel) {
          periodLabel.textContent =
            activePeriod() === "annual" ? "/ año" : "/ mes";
        }
      }

      if (featuresEl) {
        var lines = featureLines(plan);
        if (lines.length) {
          featuresEl.innerHTML = lines
            .map(function (line) {
              return "<li>" + String(line).replace(/</g, "&lt;") + "</li>";
            })
            .join("");
        }
      }

      if (cta) {
        if (slug === "enterprise") {
          cta.href = "contacto.html";
          cta.textContent = "Consultá Enterprise →";
        } else {
          cta.href = "../comenzar/paso-1.html";
          cta.textContent = "Elegir plan →";
        }
      }
    }

    fetch("/api/public/plans", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(function (res) {
        if (!res.ok) throw new Error("plans " + res.status);
        return res.json();
      })
      .then(function (rows) {
        if (!Array.isArray(rows) || !rows.length) return;
        var bySlug = {};
        rows.forEach(function (plan) {
          var slug = String(plan.slug || "").toLowerCase();
          if (PLAN_ORDER.indexOf(slug) !== -1) bySlug[slug] = plan;
        });
        PLAN_ORDER.forEach(function (slug) {
          var plan = bySlug[slug];
          var card = qs('[data-plan-slug="' + slug + '"]', row);
          if (plan && card) applyPlan(card, plan);
        });
        applyBillingPeriod(activePeriod());
      })
      .catch(function () {
        /* keep HTML fallback catalog */
      });
  })();

  /* Contact form thanks */
  var form = qs("[data-demo-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var card = form.closest(".form-card");
      if (card) card.classList.add("is-sent");
    });
  }

  /* FAQ tabs + search */
  var tabs = qs("[data-faq-tabs]");
  if (tabs) {
    var list = qs("[data-faq-list]");
    qsa("button", tabs).forEach(function (btn) {
      btn.addEventListener("click", function () {
        qsa("button", tabs).forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        var cat = btn.getAttribute("data-cat");
        qsa(".faq-item", list).forEach(function (item) {
          var match = cat === "all" || item.getAttribute("data-cat") === cat;
          item.hidden = !match;
        });
      });
    });
  }

  var search = qs("[data-faq-search]");
  if (search) {
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      var activeTab = qs("[data-faq-tabs] button.is-active");
      var cat = activeTab ? activeTab.getAttribute("data-cat") : "all";
      qsa("[data-faq-list] .faq-item").forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var catOk = cat === "all" || item.getAttribute("data-cat") === cat;
        item.hidden = !(catOk && (!q || text.indexOf(q) !== -1));
      });
    });
  }

  /* Producto: entire title+slides row scrolls left, then video zooms in below */
  (function initProductoScroll() {
    var section = qs("[data-producto]");
    var pin = qs("[data-producto-pin]");
    var row = qs("[data-producto-row]");
    var stage = qs(".home-producto-stage");
    var slidesRoot = qs("[data-producto-slides]");
    var video = qs("[data-producto-video]");
    var videoInner = qs("[data-producto-video-inner]");
    if (!section || !pin || !row || !stage || !slidesRoot) return;

    var slides = qsa("[data-slide]", slidesRoot);
    if (!slides.length) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var raf = 0;

    function sizePanels() {
      var stageW = stage.clientWidth || 520;
      slidesRoot.style.setProperty("--producto-slide-w", Math.max(260, stageW) + "px");
    }

    function setPinHeight() {
      var vh = window.innerHeight || 800;
      /* ~1 viewport per slide — no extra exit pad (video is the next section) */
      var pinH = Math.max(vh * slides.length, vh * 2);
      pin.style.setProperty("--producto-pin-h", pinH + "px");
    }

    /* Translate the whole row so slide[i] lands where slide[0] started */
    function offsetForSlide(index) {
      var i = Math.max(0, Math.min(slides.length - 1, index));
      return Math.max(0, slides[i].offsetLeft);
    }

    function maxRowTranslate() {
      var last = slides[slides.length - 1];
      if (!last) return 0;
      /* Keep going until the title is gone and the last slide nears the left */
      return stage.offsetLeft + last.offsetLeft + last.offsetWidth * 0.35;
    }

    /* Last index pushes past the title so motion doesn't die before the pin ends */
    function targetForIndex(index) {
      var last = slides.length - 1;
      if (index >= last) return maxRowTranslate();
      return offsetForSlide(index);
    }

    function updateVideoZoom() {
      if (!video || !videoInner) return;
      if (reduceMotion.matches) {
        videoInner.style.setProperty("--producto-video-scale", "1");
        videoInner.style.setProperty("--producto-video-opacity", "1");
        return;
      }
      var rect = video.getBoundingClientRect();
      var viewH = window.innerHeight || 1;
      /* 0 when section is below fold; 1 when its top nears the upper third */
      var start = viewH * 0.92;
      var end = viewH * 0.28;
      var t = (start - rect.top) / Math.max(1, start - end);
      t = Math.min(1, Math.max(0, t));
      var eased = t * t * (3 - 2 * t);
      var scale = 0.9 + eased * 0.1;
      var opacity = 0.45 + eased * 0.55;
      videoInner.style.setProperty("--producto-video-scale", scale.toFixed(4));
      videoInner.style.setProperty("--producto-video-opacity", opacity.toFixed(4));
    }

    function update() {
      raf = 0;
      var rect = pin.getBoundingClientRect();
      var pinH = pin.offsetHeight;
      var viewH = window.innerHeight || 1;
      var scrollable = Math.max(1, pinH - viewH);
      var raw = Math.min(1, Math.max(0, -rect.top / scrollable));
      /* Drive slides through nearly the whole pin; fade only as it unpins into video */
      var slideProgress = Math.min(1, raw / 0.985);
      var leaving = raw > 0.97;
      var x = 0;

      if (!reduceMotion.matches) {
        var steps = Math.max(1, slides.length - 1);
        var exact = slideProgress * steps;
        var i0 = Math.floor(exact);
        var i1 = Math.min(steps, i0 + 1);
        var t = exact - i0;
        var eased = t * t * (3 - 2 * t);
        var a = targetForIndex(i0);
        var b = targetForIndex(i1);
        x = a + (b - a) * eased;
      }

      row.style.transform = "translate3d(" + -x + "px, 0, 0)";
      section.classList.toggle("is-leaving-slides", leaving);
      updateVideoZoom();
    }

    function onScroll() {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    }

    function onResize() {
      sizePanels();
      setPinHeight();
      update();
    }

    sizePanels();
    setPinHeight();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
  })();

  /* Producto: play → presentation overlay with autoplay */
  (function initProductoPresent() {
    var playBtn = qs("[data-slides-play]");
    var present = qs("[data-present]");
    var frame = qs("[data-present-frame]");
    var countEl = qs("[data-present-count]");
    var slidesRoot = qs("[data-producto-slides]");
    if (!playBtn || !present || !frame || !slidesRoot) return;

    var slides = qsa("[data-slide]", slidesRoot);
    if (!slides.length) return;

    var index = 0;
    var timer = 0;
    var AUTOPLAY_MS = 4200;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function total() {
      return slides.length;
    }

    function render() {
      var src = slides[index];
      if (!src) return;
      frame.innerHTML = "";
      var clone = src.cloneNode(true);
      clone.removeAttribute("data-slide");
      qsa("a, button", clone).forEach(function (el) {
        el.setAttribute("tabindex", "-1");
      });
      frame.appendChild(clone);
      if (countEl) countEl.textContent = index + 1 + "/" + total();
    }

    function clearTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    }

    function startAutoplay() {
      clearTimer();
      if (reduceMotion.matches) return;
      timer = window.setInterval(function () {
        go(index + 1);
      }, AUTOPLAY_MS);
    }

    function go(next) {
      var n = total();
      index = ((next % n) + n) % n;
      render();
    }

    function open() {
      index = 0;
      present.hidden = false;
      document.body.classList.add("is-presenting");
      render();
      startAutoplay();
      var stopBtn = qs("[data-present-stop]", present);
      if (stopBtn) stopBtn.focus();
    }

    function close() {
      clearTimer();
      present.hidden = true;
      document.body.classList.remove("is-presenting");
      frame.innerHTML = "";
      playBtn.focus();
    }

    playBtn.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });

    var prevBtn = qs("[data-present-prev]", present);
    var nextBtn = qs("[data-present-next]", present);
    var stopBtn = qs("[data-present-stop]", present);
    var backdrop = qs("[data-present-close]", present);

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        go(index - 1);
        startAutoplay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        go(index + 1);
        startAutoplay();
      });
    }
    if (stopBtn) stopBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);

    document.addEventListener("keydown", function (e) {
      if (present.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index - 1);
        startAutoplay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(index + 1);
        startAutoplay();
      }
    });
  })();

  /* Category ribbon: build two identical halves for a seamless -50% loop */
  (function initRibbon() {
    var track = qs(".home-ribbon-track");
    var source = qs("[data-ribbon-source]");
    if (!track || !source) return;
    var baseHtml = source.innerHTML;

    function fill() {
      var viewport = track.parentElement;
      if (!viewport) return;
      source.innerHTML = baseHtml;
      while (track.children.length > 1) {
        track.removeChild(track.lastChild);
      }
      var guard = 0;
      while (source.scrollWidth < viewport.clientWidth + 80 && guard < 8) {
        source.insertAdjacentHTML("beforeend", baseHtml);
        guard += 1;
      }
      var clone = source.cloneNode(true);
      clone.removeAttribute("data-ribbon-source");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }

    fill();
    window.addEventListener("resize", fill);
  })();

  /* Hero: scroll-spread bubbles + sketch connectors + drag spring-back */
  (function initHeroArt() {
    var art = qs("[data-hero-art]");
    if (!art) return;

    var center = qs("[data-hero-center]", art);
    var svg = qs("[data-hero-connectors]", art);
    var floats = qsa("[data-hero-float]", art);
    if (!center || !floats.length) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var pullFactor = 0.58;
    var spreadDistance = Math.min(window.innerHeight * 0.5, 380);
    var raf = 0;
    var spread = reduceMotion ? 1 : 0;

    var state = floats.map(function (el) {
      return {
        el: el,
        key: el.getAttribute("data-hero-key") || "",
        scrollX: 0,
        scrollY: 0,
        dragX: 0,
        dragY: 0,
        dragging: false,
        pointerId: null,
        startX: 0,
        startY: 0,
        baseX: 0,
        baseY: 0
      };
    });

    function clamp(n, a, b) {
      return Math.max(a, Math.min(b, n));
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function applyTransform(item) {
      var x = item.scrollX + item.dragX;
      var y = item.scrollY + item.dragY;
      item.el.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
    }

    function localRect(el, artRect) {
      var r = el.getBoundingClientRect();
      return {
        left: r.left - artRect.left,
        top: r.top - artRect.top,
        right: r.right - artRect.left,
        bottom: r.bottom - artRect.top,
        width: r.width,
        height: r.height,
        cx: r.left - artRect.left + r.width / 2,
        cy: r.top - artRect.top + r.height / 2
      };
    }

    /* Dot sits fully outside the card edge so it never clips into Resumen. */
    var DOT_PAD = 6;

    function anchorPair(key, floatBox, centerBox) {
      if (key === "chat") {
        return {
          x1: centerBox.left - DOT_PAD,
          y1: centerBox.top + centerBox.height * 0.4,
          x2: floatBox.right,
          y2: floatBox.cy,
          curve: "chat"
        };
      }
      if (key === "sale") {
        return {
          x1: centerBox.right + DOT_PAD,
          y1: centerBox.top + centerBox.height * 0.22,
          x2: floatBox.left,
          y2: floatBox.cy,
          curve: "sale"
        };
      }
      if (key === "caja") {
        return {
          x1: centerBox.right + DOT_PAD,
          y1: centerBox.top + centerBox.height * 0.58,
          x2: floatBox.left + floatBox.width * 0.18,
          y2: floatBox.top,
          curve: "caja"
        };
      }
      /* copi: arrow lands mid-right border, approaching from the right */
      return {
        x1: centerBox.cx,
        y1: centerBox.bottom + DOT_PAD,
        x2: floatBox.right,
        y2: floatBox.cy,
        curve: "copi"
      };
    }

    function sketchPath(a) {
      var x1 = a.x1;
      var y1 = a.y1;
      var x2 = a.x2;
      var y2 = a.y2;
      var dx = x2 - x1;
      var dy = y2 - y1;

      if (a.curve === "chat") {
        return (
          "M " + x1 + " " + y1 +
          " C " + (x1 + dx * 0.5) + " " + y1 + ", " +
          (x1 + dx * 0.5) + " " + y2 + ", " +
          x2 + " " + y2
        );
      }
      if (a.curve === "sale") {
        var out = Math.max(72, Math.abs(dx) * 0.5);
        return (
          "M " + x1 + " " + y1 +
          " C " + (x1 + out) + " " + y1 + ", " +
          (x2 - Math.max(56, Math.abs(dx) * 0.35)) + " " + y2 + ", " +
          x2 + " " + y2
        );
      }
      if (a.curve === "caja") {
        var outR = Math.max(64, Math.abs(dx) * 0.48);
        return (
          "M " + x1 + " " + y1 +
          " C " + (x1 + outR) + " " + (y1 + dy * 0.35) + ", " +
          (x2 + 2) + " " + (y2 - Math.max(44, Math.abs(dy) * 0.55)) + ", " +
          x2 + " " + y2
        );
      }
      /* Soft hook into Copi's right edge from the right */
      return (
        "M " + x1 + " " + y1 +
        " C " + x1 + " " + (y1 + Math.max(56, dy * 0.7)) + ", " +
        (x2 + 52) + " " + y2 + ", " +
        x2 + " " + y2
      );
    }

    function arrowHead(x2, y2, x1, y1) {
      /* Orient open arrow at end, pointing along the final tangent */
      var dx = x2 - x1;
      var dy = y2 - y1;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len;
      var uy = dy / len;
      var size = 9;
      var wing = 5.2;
      var bx = x2 - ux * size;
      var by = y2 - uy * size;
      var px = -uy;
      var py = ux;
      var l1x = bx + px * wing;
      var l1y = by + py * wing;
      var l2x = bx - px * wing;
      var l2y = by - py * wing;
      return "M " + l1x + " " + l1y + " L " + x2 + " " + y2 + " L " + l2x + " " + l2y;
    }

    function updateConnectors() {
      if (!svg) return;
      var artRect = art.getBoundingClientRect();
      svg.setAttribute("width", Math.round(artRect.width));
      svg.setAttribute("height", Math.round(artRect.height));
      svg.setAttribute("viewBox", "0 0 " + artRect.width + " " + artRect.height);

      var cBox = localRect(center, artRect);
      state.forEach(function (item) {
        var path = qs('[data-connector="' + item.key + '"]', svg);
        var dot = qs('[data-connector-dot="' + item.key + '"]', svg);
        var arrow = qs('[data-connector-arrow="' + item.key + '"]', svg);
        if (!path) return;
        var fBox = localRect(item.el, artRect);
        var a = anchorPair(item.key, fBox, cBox);
        path.setAttribute("d", sketchPath(a));
        if (dot) {
          dot.setAttribute("cx", a.x1);
          dot.setAttribute("cy", a.y1);
        }
        if (arrow) {
          /* Use last control point for tangent so the tip faces the bubble */
          var tipX = a.x2;
          var tipY = a.y2;
          var fromX = a.x1;
          var fromY = a.y1;
          if (a.curve === "sale") {
            fromX = a.x2 - Math.max(48, Math.abs(a.x2 - a.x1) * 0.32);
            fromY = a.y2;
          } else if (a.curve === "copi") {
            fromX = a.x2 + 52;
            fromY = a.y2;
          } else if (a.curve === "chat") {
            fromX = a.x1 + (a.x2 - a.x1) * 0.55;
            fromY = a.y2;
          } else if (a.curve === "caja") {
            fromX = a.x2 + 4;
            fromY = a.y2 - Math.max(40, Math.abs(a.y2 - a.y1) * 0.5);
          }
          arrow.setAttribute("d", arrowHead(tipX, tipY, fromX, fromY));
        }
      });
    }

    function updateSpread() {
      if (reduceMotion) {
        spread = 1;
      } else {
        spread = easeOutCubic(clamp(window.scrollY / spreadDistance, 0, 1));
      }

      var artRect = art.getBoundingClientRect();
      var cBox = localRect(center, artRect);
      var cluster = 1 - spread;

      state.forEach(function (item) {
        if (item.dragging) return;
        var fBox = localRect(item.el, artRect);
        /* Recover default (unpulled) center from current visual + known offsets */
        var defaultCx = fBox.cx - item.scrollX - item.dragX;
        var defaultCy = fBox.cy - item.scrollY - item.dragY;
        item.scrollX = (cBox.cx - defaultCx) * pullFactor * cluster;
        item.scrollY = (cBox.cy - defaultCy) * pullFactor * cluster;
        if (!item.el.classList.contains("is-returning")) {
          applyTransform(item);
        }
      });

      updateConnectors();
    }

    function scheduleUpdate() {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        updateSpread();
      });
    }

    state.forEach(function (item) {
      var el = item.el;

      el.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        item.dragging = true;
        item.pointerId = e.pointerId;
        el.classList.remove("is-returning");
        el.classList.add("is-dragging");
        item.baseX = item.scrollX + item.dragX;
        item.baseY = item.scrollY + item.dragY;
        item.startX = e.clientX;
        item.startY = e.clientY;
        try {
          el.setPointerCapture(item.pointerId);
        } catch (err) {}
        e.preventDefault();
      });

      el.addEventListener("pointermove", function (e) {
        if (!item.dragging || e.pointerId !== item.pointerId) return;
        var totalX = item.baseX + (e.clientX - item.startX);
        var totalY = item.baseY + (e.clientY - item.startY);
        item.dragX = totalX - item.scrollX;
        item.dragY = totalY - item.scrollY;
        applyTransform(item);
        updateConnectors();
      });

      function endDrag(e) {
        if (!item.dragging || (e && e.pointerId !== item.pointerId)) return;
        item.dragging = false;
        item.pointerId = null;
        el.classList.remove("is-dragging");
        el.classList.add("is-returning");
        item.dragX = 0;
        item.dragY = 0;
        applyTransform(item);
        updateConnectors();

        function clearReturn(ev) {
          if (ev && ev.propertyName && ev.propertyName !== "transform") return;
          el.classList.remove("is-returning");
          el.removeEventListener("transitionend", clearReturn);
          applyTransform(item);
          updateConnectors();
        }
        el.addEventListener("transitionend", clearReturn);
        window.setTimeout(function () {
          if (el.classList.contains("is-returning")) clearReturn();
        }, 800);
      }

      el.addEventListener("pointerup", endDrag);
      el.addEventListener("pointercancel", endDrag);
    });

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateSpread();
  })();
})();
