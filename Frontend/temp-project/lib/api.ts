import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const ingestDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await apiClient.post("/ingest/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const querySystem = async (query: string, top_k = 4) => {
  try {
    const response = await apiClient.post("/query/", { query, top_k });
    return response;
  } catch (error) {
    throw error;
  }
};
