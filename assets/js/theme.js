(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const demoMode = document.body.dataset.demo === 'true';

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const themeBtn = $('[data-theme-toggle]');
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) themeBtn.setAttribute('aria-label', theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题');
    try {
      localStorage.setItem('aster-theme', theme);
    } catch {}
    document.cookie = `aster_theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }
  try {
    const saved = localStorage.getItem('aster-theme');
    if (saved && saved !== root.getAttribute('data-theme')) applyTheme(saved);
  } catch {}

  /* ---------- header scroll ---------- */
  const header = $('#siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  const navToggle = $('[data-nav-toggle]');
  const mobileNav = $('[data-mobile-nav]');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', mobileNav).forEach((a) =>
      a.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------- user menu ---------- */
  const menu = $('[data-menu]');
  if (menu) {
    const chip = $('.user-chip', menu);
    const close = () => {
      menu.classList.remove('is-open');
      chip.setAttribute('aria-expanded', 'false');
    };
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.classList.toggle('is-open');
      chip.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------- flash ---------- */
  $$('.flash-close').forEach((btn) =>
    btn.addEventListener('click', () => {
      const flash = btn.closest('.flash');
      if (flash) flash.remove();
    })
  );

  /* ---------- confirm forms ---------- */
  $$('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!window.confirm(form.getAttribute('data-confirm') || '确定执行此操作吗？')) e.preventDefault();
    });
  });
  $$('[data-confirm]:not(form)').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (!window.confirm(el.getAttribute('data-confirm') || '确定执行此操作吗？')) e.preventDefault();
    });
  });

  /* ---------- password visibility ---------- */
  $$('[data-pw-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.classList.toggle('is-visible', input.type === 'text');
    });
  });

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(text, isError = false) {
    let el = $('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.toggle('is-error', isError);
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), 2600);
  }

  /* ---------- editor ---------- */
  const editor = $('#editorContent');
  if (editor) {
    const csrf = document.querySelector('input[name="_csrf"]');
    const insert = (before, after, placeholder = '') => {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selected = editor.value.slice(start, end) || placeholder;
      const text = `${before}${selected}${after}`;
      editor.setRangeText(text, start, end, 'end');
      if (!editor.value.slice(start, end)) {
        editor.selectionStart = start + before.length;
        editor.selectionEnd = start + before.length + selected.length;
      }
      editor.focus();
    };
    $$('[data-md]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pattern = btn.getAttribute('data-md');
        const idx = pattern.indexOf('|');
        if (idx === -1) return insert(pattern, '');
        insert(pattern.slice(0, idx), pattern.slice(idx + 1), '');
      });
    });
    const uploadBtn = $('[data-upload-image]');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        const picker = document.createElement('input');
        picker.type = 'file';
        picker.accept = 'image/*';
        picker.addEventListener('change', async () => {
          const file = picker.files && picker.files[0];
          if (!file) return;
          const fd = new FormData();
          fd.append('_csrf', csrf ? csrf.value : '');
          fd.append('file', file);
          uploadBtn.disabled = true;
          try {
            const res = await fetch('/upload', { method: 'POST', body: fd, credentials: 'same-origin' });
            const data = await res.json();
            if (data.ok && data.files && data.files[0]) {
              const item = data.files[0];
              insert(`![${item.name}](${item.url})\n`, '');
              toast('图片已插入正文');
            } else {
              toast(data.error || '上传失败', true);
            }
          } catch {
            toast('上传失败，请稍后再试', true);
          } finally {
            uploadBtn.disabled = false;
          }
        });
        picker.click();
      });
    }
  }

  /* ---------- comment file count ---------- */
  $$('.file-pick input[type="file"]').forEach((input) => {
    const label = input.parentElement.querySelector('span');
    const original = label ? label.textContent : '';
    input.addEventListener('change', () => {
      if (!label) return;
      const n = input.files ? input.files.length : 0;
      label.textContent = n ? `已选择 ${n} 个文件` : original;
    });
  });

  /* ---------- lightbox ---------- */
  const images = $$('.attach-thumb, .prose img');
  if (images.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = '<button class="lightbox-close" type="button" aria-label="关闭">×</button><img alt="">';
    document.body.appendChild(box);
    const img = $('img', box);
    const close = () => box.classList.remove('is-open');
    images.forEach((a) => {
      a.addEventListener('click', (e) => {
        const src = a.tagName === 'IMG' ? a.src : a.getAttribute('href');
        if (!src) return;
        e.preventDefault();
        img.src = src;
        box.classList.add('is-open');
      });
    });
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target.classList.contains('lightbox-close')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------- code copy ---------- */
  $$('.prose pre').forEach((pre) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.textContent = '复制';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent);
        btn.textContent = '已复制';
        setTimeout(() => (btn.textContent = '复制'), 1500);
      } catch {
        toast('复制失败', true);
      }
    });
    pre.appendChild(btn);
  });

  /* ---------- application duplicate hints ---------- */
  const applyForm = document.querySelector('[data-apply-form]');
  if (applyForm && !demoMode) {
    const usernameInput = applyForm.querySelector('[data-check-username]');
    const emailInput = applyForm.querySelector('[data-check-email]');
    const hints = {
      username: applyForm.querySelector('[data-hint-username]'),
      email: applyForm.querySelector('[data-hint-email]'),
    };
    const timers = {};
    const check = async (which) => {
      const username = usernameInput ? usernameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      if (!hints[which]) return;
      if (which === 'username' && username.length < 3) {
        hints.username.textContent = '';
        hints.username.classList.remove('is-bad');
        return;
      }
      if (which === 'email' && !email.includes('@')) {
        hints.email.textContent = '';
        hints.email.classList.remove('is-bad');
        return;
      }
      try {
        const qs = new URLSearchParams({ username, email });
        const res = await fetch('/api/apply/check?' + qs.toString(), { credentials: 'same-origin' });
        const data = await res.json();
        if (which === 'username') {
          const msg = data.errors && data.errors.username;
          hints.username.textContent = msg || (username.length >= 3 ? '这个用户名可以使用' : '');
          hints.username.classList.toggle('is-bad', Boolean(msg));
        } else {
          const msg = data.errors && data.errors.email;
          hints.email.textContent = msg || (email.includes('@') ? '邮箱格式看起来没问题' : '');
          hints.email.classList.toggle('is-bad', Boolean(msg));
        }
      } catch {}
    };
    const debounce = (which) => {
      clearTimeout(timers[which]);
      timers[which] = setTimeout(() => check(which), 420);
    };
    if (usernameInput) usernameInput.addEventListener('input', () => debounce('username'));
    if (emailInput) emailInput.addEventListener('input', () => debounce('email'));
  }

  /* ---------- copy reply ---------- */
  $$('[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = document.getElementById(btn.getAttribute('data-copy-target'));
      if (!target) return;
      const text = target.innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      const old = btn.innerHTML;
      btn.textContent = '已复制';
      toast('回复方案已复制，可直接粘贴到邮件');
      setTimeout(() => (btn.innerHTML = old), 1600);
    });
  });

  /* ---------- hero counter ---------- */
  const counters = $$('.hero-stats b');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    const run = (el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const raw = el.textContent.trim();
      const num = Number(el.dataset.count || parseFloat(raw.replace(/[^\d.]/g, '')) || 0);
      if (!num) return;
      const start = performance.now();
      const suffix = raw.replace(/[\d.,]+/g, '');
      const step = (now) => {
        const p = Math.min(1, (now - start) / 900);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(num * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- portrait parallax ---------- */
  const parallax = $('[data-parallax]');
  if (parallax && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const img = parallax.querySelector('.portrait-img') || parallax;
    parallax.addEventListener('mousemove', (e) => {
      const r = parallax.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      img.style.transform = `translate(${x * 8}px, ${y * 8}px) scale(1.015)`;
    });
    parallax.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  }

  /* ---------- scroll progress / back to top ---------- */
  const progressBar = $('[data-scroll-progress]');
  const toTop = $('[data-to-top]');
  const onScrollUI = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${p})`;
    if (toTop) toTop.classList.toggle('is-show', window.scrollY > 520);
  };
  onScrollUI();
  window.addEventListener('scroll', onScrollUI, { passive: true });
  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (!el.dataset.revealed) {
            el.dataset.revealed = '1';
            el.animate(
              [
                { opacity: 0, transform: 'translateY(18px)' },
                { opacity: 1, transform: 'none' },
              ],
              { duration: 640, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' }
            );
          }
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- card tilt ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    $$('.post-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', `${(x * 5).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${(-y * 4).toFixed(2)}deg`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- static demo guards ---------- */
  if (demoMode) {
    document.addEventListener('submit', (e) => {
      if (!e.target || e.target.tagName !== 'FORM') return;
      e.preventDefault();
      toast('This is a static demo — forms are not connected to a backend.');
    });
    $$('a[data-demo-link], a[href="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        toast('This link only works in a real deployment.');
      });
    });
  }

  /* ---------- smooth anchor offset ---------- */
  if (location.hash && !reduceMotion) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  }
})();
