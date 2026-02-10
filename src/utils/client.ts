export async function fetchJson<T>(url: string | URL | Request, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status})${await response.text()}`);
  }

  return response.json<T>();
}
