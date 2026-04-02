/**
 * Renderiza las tarjetas de recetas en el grid
 * @param {Array} recipes - Lista de recetas
 * @param {string} containerId - ID del contenedor (por defecto 'recipesGrid')
 */
function displayRecipes(recipes, containerId = 'recipesGrid') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!recipes || recipes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No se encontraron recetas</h3>
                <p>Intenta con otro término de búsqueda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
    
    // Agregar eventos a los botones "Ver receta"
    document.querySelectorAll('.view-recipe-btn').forEach(btn => {
        btn.addEventListener('click', () => showRecipeModal(btn.dataset.id));
    });
    
    // Agregar eventos a los botones de favoritos
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.id, btn.dataset.name, btn.dataset.image);
            updateFavoriteButton(btn, btn.dataset.id);
        });
        // Actualizar estado del botón favorito
        updateFavoriteButton(btn, btn.dataset.id);
    });
}

/**
 * Crea el HTML de una tarjeta de receta
 * @param {Object} recipe - Objeto de receta
 * @returns {string} - HTML de la tarjeta
 */
function createRecipeCard(recipe) {
    const recipeId = recipe.idMeal;
    const recipeName = recipe.strMeal;
    const recipeImage = recipe.strMealThumb;
    const category = recipe.strCategory || 'Sin categoría';
    const area = recipe.strArea || '';
    
    return `
        <article class="recipe-card">
            <div class="recipe-card__image">
                <img src="${recipeImage}" alt="${recipeName}" loading="lazy">
                <button class="favorite-btn" data-id="${recipeId}" data-name="${recipeName}" data-image="${recipeImage}">
                    <i class="far fa-heart"></i>
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
                <button class="btn btn-outline view-recipe-btn" data-id="${recipeId}">
                    Ver receta <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </article>
    `;
}

/**
 * Muestra el modal con el detalle de la receta
 * @param {string} recipeId - ID de la receta
 */
async function showRecipeModal(recipeId) {
    const modal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) return;
    
    // Mostrar loader
    modalContent.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Cargando receta...</div>';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        const recipe = await getRecipeById(recipeId);
        
        if (!recipe) {
            modalContent.innerHTML = '<p class="error">Error al cargar la receta</p>';
            return;
        }
        
        // Extraer ingredientes y medidas
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    name: ingredient,
                    measure: measure || 'Al gusto'
                });
            }
        }
        
        modalContent.innerHTML = `
            <div class="modal-recipe">
                <div class="modal-recipe__header">
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                    <h2>${recipe.strMeal}</h2>
                    <div class="modal-recipe__badges">
                        <span class="badge"><i class="fas fa-tag"></i> ${recipe.strCategory || 'General'}</span>
                        ${recipe.strArea ? `<span class="badge"><i class="fas fa-globe"></i> ${recipe.strArea}</span>` : ''}
                    </div>
                </div>
                
                <div class="modal-recipe__body">
                    <div class="ingredients-section">
                        <h3><i class="fas fa-shopping-basket"></i> Ingredientes</h3>
                        <ul class="ingredients-list">
                            ${ingredients.map(ing => `
                                <li><span class="ingredient-name">${ing.name}</span> <span class="ingredient-measure">${ing.measure}</span></li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="instructions-section">
                        <h3><i class="fas fa-list-ol"></i> Instrucciones</h3>
                        <div class="instructions-content">
                            ${recipe.strInstructions ? recipe.strInstructions.split('. ').map(step => 
                                step.trim() ? `<p>${step.trim()}.</p>` : ''
                            ).join('') : '<p>No hay instrucciones disponibles</p>'}
                        </div>
                        ${recipe.strYoutube ? `
                            <div class="video-link">
                                <a href="${recipe.strYoutube}" target="_blank" rel="noopener noreferrer">
                                    <i class="fab fa-youtube"></i> Ver video tutorial
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error:', error);
        modalContent.innerHTML = '<p class="error">Error al cargar la receta. Intenta nuevamente.</p>';
    }
}

/**
 * Actualiza el estado visual del botón de favorito
 * @param {HTMLElement} button - Botón de favorito
 * @param {string} recipeId - ID de la receta
 */
function updateFavoriteButton(button, recipeId) {
    if (!button) return;
    const favorites = getFavorites();
    const isFavorite = favorites.some(fav => fav.id === recipeId);
    
    if (isFavorite) {
        button.innerHTML = '<i class="fas fa-heart"></i>';
        button.classList.add('favorited');
    } else {
        button.innerHTML = '<i class="far fa-heart"></i>';
        button.classList.remove('favorited');
    }
}

/**
 * Muestra skeleton loader mientras cargan las recetas
 * @param {string} containerId - ID del contenedor
 */
function showSkeletonLoader(containerId = 'recipesGrid') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="skeleton-loader">
            ${Array(8).fill(0).map(() => `
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                </div>
            `).join('')}
        </div>
    `;
}