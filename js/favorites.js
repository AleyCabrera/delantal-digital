// Clave para localStorage
const FAVORITES_KEY = 'delantal_favorites';

/**
 * Obtiene la lista de recetas favoritas
 * @returns {Array} - Lista de favoritos
 */
function getFavorites() {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
}

/**
 * Guarda una receta en favoritos
 * @param {string} recipeId - ID de la receta
 * @param {string} recipeName - Nombre de la receta
 * @param {string} recipeImage - URL de la imagen
 */
function saveFavorite(recipeId, recipeName, recipeImage) {
    const favorites = getFavorites();
    
    // Verificar si ya existe
    if (favorites.some(fav => fav.id === recipeId)) {
        return false;
    }
    
    favorites.push({
        id: recipeId,
        name: recipeName,
        image: recipeImage,
        dateAdded: new Date().toISOString()
    });
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
}

/**
 * Elimina una receta de favoritos
 * @param {string} recipeId - ID de la receta
 */
function removeFavorite(recipeId) {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== recipeId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
}

/**
 * Alterna el estado de favorito (añade o elimina)
 * @param {string} recipeId - ID de la receta
 * @param {string} recipeName - Nombre de la receta
 * @param {string} recipeImage - URL de la imagen
 */
function toggleFavorite(recipeId, recipeName, recipeImage) {
    const favorites = getFavorites();
    const isFavorite = favorites.some(fav => fav.id === recipeId);
    
    if (isFavorite) {
        removeFavorite(recipeId);
        showToast('❌ Eliminado de favoritos');
    } else {
        saveFavorite(recipeId, recipeName, recipeImage);
        showToast('❤️ Añadido a favoritos');
    }
    
    // Actualizar página de favoritos si está abierta
    if (window.location.pathname.includes('favorites.html')) {
        loadFavoritesPage();
    }
}

/**
 * Carga las recetas favoritas en la página de favoritos
 */
async function loadFavoritesPage() {
    const container = document.getElementById('favoritesGrid');
    if (!container) return;
    
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) emptyState.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.style.display = 'none';
    
    // Obtener detalles completos de cada favorito
    const favoriteRecipes = [];
    for (const fav of favorites) {
        const recipe = await getRecipeById(fav.id);
        if (recipe) favoriteRecipes.push(recipe);
    }
    
    displayRecipes(favoriteRecipes, 'favoritesGrid');
}

/**
 * Muestra un toast de notificación
 * @param {string} message - Mensaje a mostrar
 */
function showToast(message) {
    // Verificar si ya existe un toast
    let toast = document.querySelector('.toast-notification');
    if (toast) toast.remove();
    
    // Crear nuevo toast
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Eliminar después de 2 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function updateFavoritesBadge() {
    const favorites = getFavorites();
    const badge = document.querySelector('.favorites-badge');
    
    if (badge) {
        if (favorites.length > 0) {
            badge.textContent = favorites.length;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * Exporta favoritos a JSON (función extra)
 */
function exportFavorites() {
    const favorites = getFavorites();
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `delantal-favorites-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('📥 Favoritos exportados');
}