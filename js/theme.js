// Clave para localStorage del tema
const THEME_KEY = 'delantal_theme';

/**
 * Inicializa el tema (claro/oscuro)
 */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
    }
    
    // Configurar el toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        updateThemeIcon();
    }
}

/**
 * Alterna entre tema claro y oscuro
 */
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    updateThemeIcon();
}

/**
 * Actualiza el ícono del botón de tema
 */
function updateThemeIcon() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    const isDark = document.body.classList.contains('dark-mode');
    const sunIcon = themeToggle.querySelector('.fa-sun');
    const moonIcon = themeToggle.querySelector('.fa-moon');
    
    if (sunIcon && moonIcon) {
        if (isDark) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline-block';
        } else {
            sunIcon.style.display = 'inline-block';
            moonIcon.style.display = 'none';
        }
    }
}