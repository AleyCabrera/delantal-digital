// API Configuration
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Busca recetas por nombre
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} - Lista de recetas
 */
async function searchRecipesByName(searchTerm) {
    try {
        const response = await fetch(`${API_BASE_URL}/search.php?s=${searchTerm}`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Error en búsqueda:', error);
        return [];
    }
}

/**
 * Obtiene detalle de una receta por ID
 * @param {string} recipeId - ID de la receta
 * @returns {Promise<Object|null>} - Receta completa
 */
async function getRecipeById(recipeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${recipeId}`);
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Error al obtener receta:', error);
        return null;
    }
}

/**
 * Filtra recetas por categoría
 * @param {string} category - Categoría (Beef, Chicken, Pasta, etc.)
 * @returns {Promise<Array>} - Lista de recetas
 */
async function filterRecipesByCategory(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/filter.php?c=${category}`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Error en filtro:', error);
        return [];
    }
}

/**
 * Obtiene recetas aleatorias (para destacados)
 * @returns {Promise<Array>} - Lista de recetas aleatorias
 */
async function getRandomRecipes(count = 8) {
    const randomRecipes = [];
    const promises = [];
    
    for (let i = 0; i < count; i++) {
        promises.push(
            fetch(`${API_BASE_URL}/random.php`)
                .then(res => res.json())
                .then(data => data.meals ? data.meals[0] : null)
                .catch(() => null)
        );
    }
    
    const results = await Promise.all(promises);
    return results.filter(recipe => recipe !== null);
}

/**
 * Obtiene recetas destacadas (búsqueda por letra 'a' como fallback)
 * @returns {Promise<Array>} - Lista de recetas destacadas
 */
async function getFeaturedRecipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/search.php?f=a`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Error al obtener destacadas:', error);
        return [];
    }
}