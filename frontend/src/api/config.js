import client from "./client";


export async function fetchMapConfig() {
  const response = await client.get("/config/map/");
  return response.data;
}
