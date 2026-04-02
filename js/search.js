// Elementos del DOM
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const categoriesFilter = document.getElementById('categoriesFilter');
const sectionTitleSpan = document.getElementById('sectionTitle');
const resultsCountSpan = document.getElementById('resultsCount');

// Variable para controlar la búsqueda actual
let currentSearchTerm = '';

/**
 * Inicializa los event listeners del buscador
 */
function initSearch() {
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
    
    if (categoriesFilter) {
        categoriesFilter.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => handleCategoryClick(btn.dataset.category));
        });
    }
}

/**
 * Maneja el envío del formulario de búsqueda
 * @param {Event} e - Evento del formulario
 */
async function handleSearchSubmit(e) {
    e.preventDefault();
    
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;
    
    currentSearchTerm = searchTerm;
    
    // Actualizar UI
    if (sectionTitleSpan) sectionTitleSpan.textContent = `Resultados para "${searchTerm}"`;
    showSkeletonLoader();
    
    // Buscar recetas
    const recipes = await searchRecipesByName(searchTerm);
    
    // Actualizar contador
    if (resultsCountSpan) {
        resultsCountSpan.textContent = `${recipes.length} receta${recipes.length !== 1 ? 's' : ''} encontrada${recipes.length !== 1 ? 's' : ''}`;
    }
    
    // Mostrar resultados
    displayRecipes(recipes);
}

/**
 * Maneja el clic en una categoría
 * @param {string} category - Categoría seleccionada
 */
async function handleCategoryClick(category) {
    if (!category) return;
    
    currentSearchTerm = '';
    if (searchInput) searchInput.value = '';
    
    // Actualizar UI
    if (sectionTitleSpan) sectionTitleSpan.textContent = `Recetas de ${getCategoryName(category)}`;
    showSkeletonLoader();
    
    // Filtrar por categoría
    const recipes = await filterRecipesByCategory(category);
    
    // Actualizar contador
    if (resultsCountSpan) {
        resultsCountSpan.textContent = `${recipes.length} receta${recipes.length !== 1 ? 's' : ''}`;
    }
    
    // Mostrar resultados
    displayRecipes(recipes);
}

/**
 * Obtiene el nombre legible de una categoría
 * @param {string} categoryKey - Clave de la categoría
 * @returns {string} - Nombre legible
 */
function getCategoryName(categoryKey) {
    const categories = {
        'Beef': 'Carne',
        'Chicken': 'Pollo',
        'Pasta': 'Pastas',
        'Vegetarian': 'Vegetariano',
        'Dessert': 'Postres'
    };
    return categories[categoryKey] || categoryKey;
}

/**
 * Carga recetas destacadas al iniciar la página
 */
async function loadFeaturedRecipes() {
    showSkeletonLoader();
    
    if (sectionTitleSpan) sectionTitleSpan.textContent = 'Recetas destacadas';
    
    const recipes = await getFeaturedRecipes();
    
    if (resultsCountSpan) {
        resultsCountSpan.textContent = `${recipes.length} recetas destacadas`;
    }
    
    displayRecipes(recipes.slice(0, 12));
}