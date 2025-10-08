document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  const darkBtn = document.getElementById('darkModeToggle');
  if (darkBtn) {
    if (localStorage.getItem('theme') === 'dark') htmlEl.classList.add('dark');
    darkBtn.addEventListener('click', () => {
      htmlEl.classList.toggle('dark');
      localStorage.setItem('theme', htmlEl.classList.contains('dark') ? 'dark' : 'light');
    });
  }


})






