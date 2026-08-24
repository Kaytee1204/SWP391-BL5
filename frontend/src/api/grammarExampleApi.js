// src/api/grammarExampleApi.js
import { apiRequest } from './apiRequest';

export const getExamplesByPatternId = async (patternId) => {
  return await apiRequest(`/grammar-patterns/${patternId}/examples`, 'GET');
};

export const createExample = async (patternId, data) => {
  return await apiRequest(`/grammar-patterns/${patternId}/examples`, 'POST', data);
};

export const updateExample = async (exampleId, data) => {
  return await apiRequest(`/grammar-patterns/examples/${exampleId}`, 'PUT', data);
};

export const deleteExample = async (exampleId) => {
  return await apiRequest(`/grammar-patterns/examples/${exampleId}`, 'DELETE');
};