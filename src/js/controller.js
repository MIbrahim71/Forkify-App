import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import addRecipeView from './views/addRecipeView.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';

import searchView from './views/searchView.js';
//

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import paginationView from './views/paginationView.js';

if (module.hot) {
  module.hot.accept();
}

//
// SHOW RECIPE //
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    // 0 Update results view, mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1 Loading Recipe
    await model.loadRecipe(id);

    // 2 Rendering recipe - data passed into render method, stored into #data
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async () => {
  try {
    resultsView.renderSpinner();

    //1 Get Search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2 Load search results
    await model.loadSearchResults(query);

    //3 Render results
    resultsView.render(model.getSearchResultsPage());

    // 4 Render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = goToPage => {
  //1 Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2 Render new pagination buttons
  paginationView.render(model.state.search);
  console.log(goToPage);
};

const controlServings = newServings => {
  // Update recipe servings (in state)
  model.updateServings(newServings);

  //U Update Recipe View
  recipeView.update(model.state.recipe);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddBookmark = () => {
  // Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2 Update recipe View
  recipeView.update(model.state.recipe);

  //3 Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async newRecipe => {
  try {
    // Loading
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render new recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Add to bookmarks
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `${model.state.recipe.id}`);
    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.log(error);
    addRecipeView.renderError(error.message);
  }
};

// PS Pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
