import axiosClient from './axiosClient';

export const accountApi = {
  getAll: () => axiosClient.get('/accounts'),
  getById: (id) => axiosClient.get(`/accounts/${id}`),
  create: (data) => axiosClient.post('/accounts', data),
  update: (id, data) => axiosClient.put(`/accounts/${id}`, data),
  delete: (id) => axiosClient.delete(`/accounts/${id}`),
};

export const vocabApi = {
  // Danh mục từ vựng
  getCategories: (jlptLevel) => axiosClient.get('/vocab-categories', { params: { jlptLevel } }),
  getCategoryById: (id) => axiosClient.get(`/vocab-categories/${id}`),
  createCategory: (data) => axiosClient.post('/vocab-categories', data),
  updateCategory: (id, data) => axiosClient.put(`/vocab-categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/vocab-categories/${id}`),

  // Mục từ vựng
  getItems: (params) => axiosClient.get('/vocab-items', { params }),
  getItemById: (id) => axiosClient.get(`/vocab-items/${id}`),
  createItem: (data) => axiosClient.post('/vocab-items', data),
  updateItem: (id, data) => axiosClient.put(`/vocab-items/${id}`, data),
  deleteItem: (id) => axiosClient.delete(`/vocab-items/${id}`),
};

export const kanjiApi = {
  // Module Kanji
  getModules: (jlptLevel) => axiosClient.get('/kanji-modules', { params: { jlptLevel } }),
  getModuleById: (id) => axiosClient.get(`/kanji-modules/${id}`),
  createModule: (data) => axiosClient.post('/kanji-modules', data),
  updateModule: (id, data) => axiosClient.put(`/kanji-modules/${id}`, data),
  deleteModule: (id) => axiosClient.delete(`/kanji-modules/${id}`),

  // Chi tiết Kanji
  getKanjiDetails: (params) => axiosClient.get('/kanji-details', { params }),
  getKanjiById: (id) => axiosClient.get(`/kanji-details/${id}`),
  createKanji: (data) => axiosClient.post('/kanji-details', data),
  updateKanji: (id, data) => axiosClient.put(`/kanji-details/${id}`, data),
  deleteKanji: (id) => axiosClient.delete(`/kanji-details/${id}`),
};

export const deckApi = {
  // Deck từ vựng cá nhân
  getMyVocabDecks: () => axiosClient.get('/personal/vocab-decks'),
  getVocabDeckById: (id) => axiosClient.get(`/personal/vocab-decks/${id}`),
  createVocabDeck: (data) => axiosClient.post('/personal/vocab-decks', data),
  updateVocabDeck: (id, data) => axiosClient.put(`/personal/vocab-decks/${id}`, data),
  deleteVocabDeck: (id) => axiosClient.delete(`/personal/vocab-decks/${id}`),
  addVocabItemToDeck: (deckId, vocabularyItemId) => axiosClient.post(`/personal/vocab-decks/${deckId}/items`, { vocabularyItemId }),
  removeVocabItemFromDeck: (deckId, itemId) => axiosClient.delete(`/personal/vocab-decks/${deckId}/items/${itemId}`),

  // Deck Kanji cá nhân
  getMyKanjiDecks: () => axiosClient.get('/personal/kanji-decks'),
  getKanjiDeckById: (id) => axiosClient.get(`/personal/kanji-decks/${id}`),
  createKanjiDeck: (data) => axiosClient.post('/personal/kanji-decks', data),
  updateKanjiDeck: (id, data) => axiosClient.put(`/personal/kanji-decks/${id}`, data),
  deleteKanjiDeck: (id) => axiosClient.delete(`/personal/kanji-decks/${id}`),
  addKanjiToDeck: (deckId, data) => axiosClient.post(`/personal/kanji-decks/${deckId}/items`, data),
  updateKanjiNote: (deckId, kanjiId, data) => axiosClient.put(`/personal/kanji-decks/${deckId}/items/${kanjiId}`, data),
  removeKanjiFromDeck: (deckId, kanjiId) => axiosClient.delete(`/personal/kanji-decks/${deckId}/items/${kanjiId}`),
};
