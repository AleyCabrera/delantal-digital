/**
 * Aplicación principal Delantal Digital
 * Inicializa todos los módulos
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🍳 Delantal Digital iniciado');
    
    // Inicializar tema (claro/oscuro)
    initTheme();
    
    // Inicializar buscador y filtros
    initSearch();
    
    // Cargar recetas destacadas
    loadFeaturedRecipes();
    
    // Inicializar menú móvil
    initMobileMenu();
    
    // Inicializar modal (cerrar al hacer clic fuera)
    initModal();
});

/**
 * Inicializa el menú hamburguesa para móvil
 */
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navbar = document.querySelector('.navbar');
    
    if (mobileMenuBtn && navbar) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            navbar.classList.toggle('active');
        });
    }
}

/**
 * Inicializa el modal (cierre al hacer clic fuera o en botón cerrar)
 */
function initModal() {
    const modal = document.getElementById('recipeModal');
    const closeBtn = document.querySelector('.modal__close');
    const overlay = document.querySelector('.modal__overlay');
    
    if (!modal) return;
    
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}