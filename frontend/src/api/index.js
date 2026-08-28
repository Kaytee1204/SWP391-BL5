import axiosClient from './axiosClient';

export const accountApi = {
  getAll: () => axiosClient.get('/accounts'),
  getById: (id) => axiosClient.get(`/accounts/${id}`),
  create: (data) => axiosClient.post('/accounts', data),
  update: (id, data) => axiosClient.put(`/accounts/${id}`, data),
  delete: (id) => axiosClient.delete(`/accounts/${id}`),
};

export const vocabApi = {
  // Các hàm chỉ mô tả endpoint. axiosClient tự gắn JWT và trả thẳng phần data của ApiResponse.
  // jlptLevel null được Axios bỏ qua, tương ứng yêu cầu backend trả toàn bộ category.
  getCategories: (jlptLevel) => axiosClient.get('/vocabulary-categories', { params: { jlptLevel } }),
  getCategoryById: (id) => axiosClient.get(`/vocabulary-categories/${id}`),
  createCategory: (data) => axiosClient.post('/vocabulary-categories', data),
  updateCategory: (id, data) => axiosClient.put(`/vocabulary-categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/vocabulary-categories/${id}`),

  // Màn 32-35: params chứa categoryId/JLPT/search; payload update phải mang version đã đọc.
  getItems: (params) => axiosClient.get('/vocab-items', { params }),
  getItemById: (id) => axiosClient.get(`/vocab-items/${id}`),
  createItem: (data) => axiosClient.post('/vocab-items', data),
  updateItem: (id, data) => axiosClient.put(`/vocab-items/${id}`, data),
  deleteItem: (id) => axiosClient.delete(`/vocab-items/${id}`),
};

export const kanjiApi = {
  // Màn 36-39: GET dùng cho màn xem/lọc; các hàm ghi bị backend kiểm tra role Lecturer/Manager.
  getModules: (jlptLevel) => axiosClient.get('/kanji-modules', { params: { jlptLevel } }),
  getModuleById: (id) => axiosClient.get(`/kanji-modules/${id}`),
  createModule: (data) => axiosClient.post('/kanji-modules', data),
  updateModule: (id, data) => axiosClient.put(`/kanji-modules/${id}`, data),
  deleteModule: (id) => axiosClient.delete(`/kanji-modules/${id}`),

  // Màn 40-43: params có thể chứa moduleId, jlptLevel và search; backend quyết định nhánh truy vấn.
  getKanjiDetails: (params) => axiosClient.get('/kanji-details', { params }),
  getKanjiById: (id) => axiosClient.get(`/kanji-details/${id}`),
  createKanji: (data) => axiosClient.post('/kanji-details', data),
  updateKanji: (id, data) => axiosClient.put(`/kanji-details/${id}`, data),
  deleteKanji: (id) => axiosClient.delete(`/kanji-details/${id}`),
};

export const deckApi = {
  // Màn 4-7: không truyền studentId; backend lấy owner từ JWT để chống thao tác thay user khác.
  getMyVocabDecks: () => axiosClient.get('/personal/vocab-decks'),
  getVocabDeckById: (id) => axiosClient.get(`/personal/vocab-decks/${id}`),
  createVocabDeck: (data) => axiosClient.post('/personal/vocab-decks', data),
  updateVocabDeck: (id, data) => axiosClient.put(`/personal/vocab-decks/${id}`, data),
  deleteVocabDeck: (id) => axiosClient.delete(`/personal/vocab-decks/${id}`),
  addVocabItemToDeck: (deckId, vocabularyItemId) => axiosClient.post(`/personal/vocab-decks/${deckId}/items`, { vocabularyItemId }),
  removeVocabItemFromDeck: (deckId, itemId) => axiosClient.delete(`/personal/vocab-decks/${deckId}/items/${itemId}`),

  // Màn 8-11: updateNote sửa quan hệ deck-Kanji, hoàn toàn không sửa bản ghi Kanji gốc.
  getMyKanjiDecks: () => axiosClient.get('/personal/kanji-decks'),
  getKanjiDeckById: (id) => axiosClient.get(`/personal/kanji-decks/${id}`),
  createKanjiDeck: (data) => axiosClient.post('/personal/kanji-decks', data),
  updateKanjiDeck: (id, data) => axiosClient.put(`/personal/kanji-decks/${id}`, data),
  deleteKanjiDeck: (id) => axiosClient.delete(`/personal/kanji-decks/${id}`),
  addKanjiToDeck: (deckId, data) => axiosClient.post(`/personal/kanji-decks/${deckId}/items`, data),
  updateKanjiNote: (deckId, kanjiId, data) => axiosClient.put(`/personal/kanji-decks/${deckId}/items/${kanjiId}`, data),
  removeKanjiFromDeck: (deckId, kanjiId) => axiosClient.delete(`/personal/kanji-decks/${deckId}/items/${kanjiId}`),
};

export const errorReportApi = {
  createReport: (data) => axiosClient.post('/error-reports', data),
  getMyReports: (params) => axiosClient.get('/error-reports/my-reports', { params }),
  updateReport: (id, data) => axiosClient.put(`/error-reports/${id}`, data),
  cancelReport: (id) => axiosClient.patch(`/error-reports/${id}/cancel`),
};

