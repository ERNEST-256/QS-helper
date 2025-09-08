export async function optimizePortfolio(budget: number, stocks: string[]) {
  const response = await fetch("http://localhost:3000/optimize-portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ budget, stocks }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch optimization result");
  }

  return response.json(); // { scores, allocation, explanation }
}
