/** Shared admin shell — mobile drawer */
(function () {
  var toggle = document.getElementById('menuToggle');
  var overlay = document.getElementById('sidebarOverlay');
  if (!toggle || !overlay) return;

  function close() {
    document.body.classList.remove('drawer-open');
    overlay.hidden = true;
  }

  function open() {
    document.body.classList.add('drawer-open');
    overlay.hidden = false;
  }

  toggle.addEventListener('click', function () {
    document.body.classList.contains('drawer-open') ? close() : open();
  });
  overlay.addEventListener('click', close);

  document.querySelectorAll('.sidebar .nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.matchMedia('(max-width: 800px)').matches) close();
    });
  });
})();
