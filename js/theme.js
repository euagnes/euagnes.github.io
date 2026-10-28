// Tema claro/escuro: aplica antes de desenhar a página e lembra a escolha.
(function () {
  const root = document.documentElement;
  let salvo = null;
  try { salvo = localStorage.getItem('tema'); } catch (e) {}
  if (salvo === 'light') root.dataset.theme = 'light';

  function rotulo(btn) {
    const claro = root.dataset.theme === 'light';
    btn.textContent = claro ? '☾' : '☀';
    btn.setAttribute('aria-label', claro ? 'Usar tema escuro' : 'Usar tema claro');
    btn.title = btn.getAttribute('aria-label');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      rotulo(btn);
      btn.addEventListener('click', () => {
        const claro = root.dataset.theme !== 'light';
        if (claro) root.dataset.theme = 'light'; else delete root.dataset.theme;
        try { localStorage.setItem('tema', claro ? 'light' : 'dark'); } catch (e) {}
        document.querySelectorAll('[data-theme-toggle]').forEach(rotulo);
      });
    });
  });
})();
