export type TabKey =
  | "transactions"
  | "suppliers"
  | "categories"
  | "medicines"
  | "operators";

export async function fetchTabData(tab: TabKey): Promise<any[]> {
  try {
    const response = await fetch(`/api/prisma?type=${tab}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching tab data:", error);
    return [];
  }
}
