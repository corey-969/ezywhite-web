/* ============================================================
   EzyWhite — immersive 3D layer (shared by all pages)
   Mouse/gyro parallax depth · gentle scroll drift ·
   3D scroll reveals · gallery lightbox. All guarded so it
   safely runs on any page.
   ============================================================ */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- parallax depth (mouse + gyro + scroll drift) ---------- */
  var layers = [].slice.call(document.querySelectorAll('[data-depth]'));
  if (layers.length && !reduce) {
    var mx = 0, my = 0, cx = 0, cy = 0, scy = window.scrollY || 0, raf = null;

    function loop() {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      for (var i = 0; i < layers.length; i++) {
        var el = layers[i];
        var d = parseFloat(el.getAttribute('data-depth')) || 0;
        var drift = parseFloat(el.getAttribute('data-drift')) || 0;
        el.style.transform = 'translate3d(' + (cx * d).toFixed(2) + 'px,' +
          (cy * d + scy * drift).toFixed(2) + 'px,0)';
      }
      raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }

    window.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 42;
      my = (e.clientY / window.innerHeight - 0.5) * 42;
      kick();
    }, { passive: true });

    window.addEventListener('scroll', function () { scy = window.scrollY || 0; kick(); }, { passive: true });

    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null) return;
      mx = Math.max(-1, Math.min(1, e.gamma / 45)) * 30;
      my = Math.max(-1, Math.min(1, (e.beta - 45) / 45)) * 30;
      kick();
    }, { passive: true });
  }

  /* ---------- 3D scroll reveal (.reveal-3d) ---------- */
  var r3 = document.querySelectorAll('.reveal-3d');
  if (r3.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.15 });
      r3.forEach(function (el) { io.observe(el); });
    } else {
      r3.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---------- gallery lightbox ---------- */
  var gal = document.getElementById('gallery');
  var lb = document.getElementById('lb');
  if (gal && lb) {
    var lbImg = lb.querySelector('img');
    var list = [], idx = 0;
    function refresh() {
      list = [].slice.call(gal.querySelectorAll('.ba-card')).map(function (c) {
        var im = c.querySelector('img'); return im ? im.src : null;
      }).filter(Boolean);
    }
    function show(i) { refresh(); if (!list.length) return; idx = (i + list.length) % list.length; lbImg.src = list[idx]; lb.classList.add('show'); }
    gal.addEventListener('click', function (e) {
      var card = e.target.closest('.ba-card');
      if (!card) return;
      var cards = [].slice.call(gal.querySelectorAll('.ba-card'));
      show(cards.indexOf(card));
    });
    lb.querySelector('.x').addEventListener('click', function () { lb.classList.remove('show'); });
    lb.querySelector('.prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    lb.querySelector('.next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('show'); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('show')) return;
      if (e.key === 'Escape') lb.classList.remove('show');
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }
})();
