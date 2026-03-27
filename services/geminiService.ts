import { DeepDiveResponse } from "../types";

export const getDeepDive = async (topicQuery: string): Promise<DeepDiveResponse> => {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topicQuery }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};
