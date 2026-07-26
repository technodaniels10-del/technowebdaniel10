(function () {
    var root = document.documentElement;
    var toggleBtn = document.getElementById('themeToggle');
    var iceParticles = document.getElementById('particlesIce');
    var fireParticles = document.getElementById('particlesFire');

    function spawnParticles(container, markup, count, animName, minDur, maxDur) {
      if (!container) return;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < count; i++) {
        var el = document.createElement('div');
        el.className = 'particle';
        el.innerHTML = markup;
        var dur = (Math.random() * (maxDur - minDur) + minDur).toFixed(2) + 's';
        var delay = (-Math.random() * maxDur).toFixed(2) + 's';
        var drift = Math.round(Math.random() * 60 - 30) + 'px';
        var left = (Math.random() * 100).toFixed(1) + '%';
        el.style.left = left;
        el.style.animationName = animName;
        el.style.animationDuration = dur;
        el.style.animationDelay = delay;
        el.style.setProperty('--drift', drift);
        frag.appendChild(el);
      }
      container.appendChild(frag);
    }

    var snowflakeSVG = '<svg viewBox="0 0 24 24" width="14" height="14"><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="4" y1="7" x2="20" y2="17"/><line x1="20" y1="7" x2="4" y2="17"/></g></svg>';
    var emberSVG = '<svg viewBox="0 0 24 24" width="10" height="10"><path d="M12 2C8 8 6 12 6 15a6 6 0 0 0 12 0c0-3-2-7-6-13z" fill="currentColor"/></svg>';

    spawnParticles(iceParticles, snowflakeSVG, 24, 'snowfall', 9, 20);
    spawnParticles(fireParticles, emberSVG, 18, 'emberrise', 6, 13);

    toggleBtn.addEventListener('click', function () {
      var isIce = root.getAttribute('data-theme') !== 'fire';
      var next = isIce ? 'fire' : 'ice';
      root.setAttribute('data-theme', next);
      toggleBtn.textContent = next === 'ice' ? '❄ Ice' : '🔥 Fire';
      iceParticles.hidden = next !== 'ice';
      fireParticles.hidden = next !== 'fire';
    });
  })();