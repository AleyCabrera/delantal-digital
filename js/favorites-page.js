/**
 * Página de favoritos - Funcionalidades específicas
 */

let currentFavoritesList = [];
let currentSearchTerm = '';

/**
 * Inicializa la página de favoritos
 */
async function initFavoritesPage() {
    console.log('📖 Inicializando página de favoritos');
    
    // Cargar y mostrar favoritos
    await loadAndDisplayFavorites();
    
    // Inicializar event listeners
    initFavoritesEvents();
}

/**
 * Carga y muestra los favoritos con filtros y ordenamiento
 */
async function loadAndDisplayFavorites() {
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
        showEmptyState();
        updateStats(0, null);
        return;
    }
    
    // Obtener detalles completos de cada favorito
    const favoriteRecipes = [];
    for (const fav of favorites) {
        const recipe = await getRecipeById(fav.id);
        if (recipe) {
            recipe.dateAdded = fav.dateAdded;
            favoriteRecipes.push(recipe);
        }
    }
    
    currentFavoritesList = favoriteRecipes;
    
    // Aplicar filtro de búsqueda
    let filteredRecipes = filterFavoritesBySearch(currentFavoritesList);
    
    // Aplicar ordenamiento
    filteredRecipes = sortFavorites(filteredRecipes);
    
    // Actualizar estadísticas
    updateStats(favorites.length, favorites[0]?.dateAdded);
    
    // Mostrar recetas
    displayFavoritesRecipes(filteredRecipes);
}

/**
 * Filtra favoritos por término de búsqueda
 */
function filterFavoritesBySearch(recipes) {
    if (!currentSearchTerm) return recipes;
    
    const term = currentSearchTerm.toLowerCase();
    return recipes.filter(recipe => 
        recipe.strMeal.toLowerCase().includes(term) ||
        (recipe.strCategory && recipe.strCategory.toLowerCase().includes(term)) ||
        (recipe.strArea && recipe.strArea.toLowerCase().includes(term))
    );
}

/**
 * Ordena los favoritos según la opción seleccionada
 */
function sortFavorites(recipes) {
    const sortBy = document.getElementById('sortBy')?.value || 'date-desc';
    
    return [...recipes].sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.dateAdded) - new Date(a.dateAdded);
            case 'date-asc':
                return new Date(a.dateAdded) - new Date(b.dateAdded);
            case 'name-asc':
                return a.strMeal.localeCompare(b.strMeal);
            case 'name-desc':
                return b.strMeal.localeCompare(a.strMeal);
            default:
                return 0;
        }
    });
}

/**
 * Muestra las recetas favoritas en el grid
 */
function displayFavoritesRecipes(recipes) {
    const container = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('emptyFavorites');
    
    if (!container) return;
    
    if (recipes.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = recipes.map(recipe => createFavoriteCard(recipe)).join('');
    
    // Agregar eventos a los botones
    document.querySelectorAll('.view-recipe-btn').forEach(btn => {
        btn.addEventListener('click', () => showRecipeModal(btn.dataset.id));
    });
    
    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavoriteFromPage(btn.dataset.id);
        });
    });
}

/**
 * Crea una tarjeta de favorito con botón de eliminar
 */
function createFavoriteCard(recipe) {
    const recipeId = recipe.idMeal;
    const recipeName = recipe.strMeal;
    const recipeImage = recipe.strMealThumb;
    const category = recipe.strCategory || 'Sin categoría';
    const area = recipe.strArea || '';
    const dateAdded = recipe.dateAdded ? new Date(recipe.dateAdded).toLocaleDateString('es-ES') : 'Reciente';
    
    return `
        <article class="recipe-card favorite-card">
            <div class="recipe-card__image">
                <img src="${recipeImage}" alt="${recipeName}" loading="lazy">
                <button class="remove-favorite-btn" data-id="${recipeId}" aria-label="Eliminar de favoritos">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="recipe-card__content">
                <h3 class="recipe-card__title">${recipeName}</h3>
                <div class="recipe-card__meta">
                    <span class="recipe-card__category">
                        <i class="fas fa-tag"></i> ${category}
                    </span>
                    ${area ? `<span class="recipe-card__area"><i class="fas fa-globe"></i> ${area}</span>` : ''}
                </div>
                <div class="favorite-date">
                    <i class="fas fa-calendar-plus"></i>
                    <small>Añadida: ${dateAdded}</small>
                </div>
                <div class="recipe-card__buttons">
                    <button class="btn btn-outline view-recipe-btn" data-id="${recipeId}">
                        Ver receta <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}

/**
 * Actualiza las estadísticas de favoritos
 */
function updateStats(count, lastDate) {
    const countElement = document.getElementById('favoritesCount');
    const lastAddedElement = document.getElementById('lastAdded');
    
    if (countElement) {
        countElement.textContent = count;
    }
    
    if (lastAddedElement && lastDate) {
        const date = new Date(lastDate);
        lastAddedElement.textContent = date.toLocaleDateString('es-ES');
    } else if (lastAddedElement) {
        lastAddedElement.textContent = '-';
    }
}

/**
 * Muestra el estado vacío
 */
function showEmptyState() {
    const container = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('emptyFavorites');
    
    if (container) container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
}

/**
 * Elimina una receta de favoritos desde la página
 */
async function removeFavoriteFromPage(recipeId) {
    removeFavorite(recipeId);
    showToast('🗑️ Receta eliminada de favoritos');
    await loadAndDisplayFavorites();
    
    // Actualizar botones de favoritos en otras páginas si es necesario
    updateAllFavoriteButtons();
}

/**
 * Limpia todas las recetas favoritas
 */
function clearAllFavorites() {
    localStorage.removeItem(FAVORITES_KEY);
    showToast('🗑️ Todas las recetas fueron eliminadas');
    loadAndDisplayFavorites();
    updateAllFavoriteButtons();
}

/**
 * Actualiza todos los botones de favorito en la página
 */
function updateAllFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        updateFavoriteButton(btn, btn.dataset.id);
    });
}

/**
 * Inicializa todos los event listeners de la página de favoritos
 */
function initFavoritesEvents() {
    // Buscador de favoritos
    const searchInput = document.getElementById('searchFavorites');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value;
            loadAndDisplayFavorites();
        });
    }
    
    // Selector de ordenamiento
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            loadAndDisplayFavorites();
        });
    }
    
    // Botón de limpiar todo
    const clearBtn = document.getElementById('clearAllFavorites');
    const modal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('cancelClear');
    const confirmBtn = document.getElementById('confirmClear');
    
    if (clearBtn && modal) {
        clearBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }
    
    if (cancelBtn && modal) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    if (confirmBtn && modal) {
        confirmBtn.addEventListener('click', () => {
            clearAllFavorites();
            modal.classList.remove('active');
        });
    }
    
    // Cerrar modal con overlay
    const modalOverlay = document.querySelector('.modal-confirm__overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    }
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFavoritesPage);
} else {
    initFavoritesPage();
}