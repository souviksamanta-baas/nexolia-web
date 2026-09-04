/** Onboarding — selectable cards and billing toggle */
(function () {
  document.querySelectorAll('.service-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var input = card.querySelector('input[type="checkbox"]');
      if (!input) return;
      input.checked = !input.checked;
      card.classList.toggle('is-selected', input.checked);
    });
  });

  document.querySelectorAll('.onboard-plan').forEach(function (plan) {
    plan.addEventListener('click', function () {
      document.querySelectorAll('.onboard-plan').forEach(function (p) {
        p.classList.remove('is-selected');
      });
      plan.classList.add('is-selected');
      var radio = plan.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  var toggle = document.getElementById('billingToggle');
  if (toggle) {
    toggle.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggle.querySelectorAll('button').forEach(function (b) {
          b.classList.remove('is-active');
        });
        btn.classList.add('is-active');
        var isAnnual = btn.dataset.period === 'annual';
        document.querySelectorAll('[data-price-month]').forEach(function (el) {
          var month = el.dataset.priceMonth;
          var annual = el.dataset.priceAnnual;
          el.textContent = isAnnual ? annual : month;
        });
        document.querySelectorAll('[data-period-label]').forEach(function (el) {
          el.textContent = isAnnual ? '/ año' : '/ mes';
        });
      });
    });
  }
})();
