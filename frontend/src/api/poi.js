import client from "./client";


export async function fetchPois(category) {
  const response = await client.get("/pois/", {
    params: category ? { category } : undefined
  });
  return response.data;
}

export async function fetchCategories() {
  const response = await client.get("/pois/categories/");
  return response.data;
}

export async function searchPois(keyword) {
  const trimmedKeyword = keyword.trim();
  if (!trimmedKeyword) {
    return [];
  }
  const response = await client.get("/pois/search/", {
    params: { q: trimmedKeyword }
  });
  return response.data;
}
