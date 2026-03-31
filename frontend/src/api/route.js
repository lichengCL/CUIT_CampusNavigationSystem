import client from "./client";


export async function fetchWalkingRoute(params) {
  const response = await client.get("/routing/walk/", { params });
  return response.data;
}

export async function fetchMultiRoute(stops) {
  const response = await client.post("/routing/multi/", { stops });
  return response.data;
}
