// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

/**
 * Hugging Face Model Call
 */
async function getSentimentScores(stocks) {
  const res = await fetch(process.env.HF_MODEL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stocks }),
  });

  if (!res.ok) throw new Error("HF model error");
  return await res.json();
}

/**
 * Simulated Annealing Allocator
 */
function simulatedAnnealingAllocator(scores, budget) {
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const allocation = {};

  for (const stock in scores) {
    allocation[stock] = parseFloat(
      ((scores[stock] / totalScore) * budget).toFixed(2)
    );
  }

  return allocation;
}

/**
 * Azure Quantum Allocator (optional)
 */
async function azureQuantumAllocator(scores, budget) {
  if (process.env.USE_AZURE_QUANTUM !== "true") {
    return simulatedAnnealingAllocator(scores, budget);
  }

  // Placeholder if Azure Quantum SDK is hooked in
  return {
    NOTE: "Azure Quantum call placeholder",
    fallback: simulatedAnnealingAllocator(scores, budget),
  };
}

/**
 * Better Azure AI Explanation
 */
async function azureAIExplain(allocation, scores) {
  // If you have Azure OpenAI deployed, call it here:
  if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY) {
    const res = await fetch(
      `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-05-01-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a financial assistant that explains portfolio allocations which is going to be invested in clear, natural language and remember you are doing this on behalf of the software so dont mention the user directly " +
                "Do not use markdown, bullets, or stars in your response. " +
                "Convert stock tickers into normal company names, and clearly mention both the investment amount and sentiment score in plain sentences. " +
                "Give a detailed yet simple explanation for each company, and end with extra financial advice before investing. " +
                "Avoid repeating the raw JSON or technical details in the output.",
            },
            {
              role: "user",
              content: `Explain this stock allocation ${JSON.stringify(
                allocation
              )} based on sentiment scores ${JSON.stringify(scores)}.`,
            },
          ],
          max_tokens: 300,
        }),
      }
    );

    const data = await res.json();
    let explanation =
      data.choices?.[0]?.message?.content || "No explanation generated.";

    // Cleanup formatting just in case
    explanation = explanation
      .replace(/\*\*/g, "") // remove bold markers
      .replace(/^\s*\d+\.\s*/gm, "") // remove numbered list markers
      .replace(/[*•-]\s*/g, "") // remove bullet markers
      .replace(/\\n/g, " ") // replace escaped \n with space
      .replace(/\s+/g, " ") // collapse extra spaces
      .trim();

    return explanation;
  }

  // If Azure OpenAI is not set up, fallback explanation
  let explanation =
    "We distributed your budget across stocks based on confidence scores. ";
  for (const stock in allocation) {
    explanation += `${stock} received $${allocation[stock]} (score: ${scores[stock]}). `;
  }
  explanation +=
    "This strategy balances allocations proportional to sentiment strength while diversifying risk. " +
    "As always, remember to review company fundamentals and diversify across sectors before making major investments.";
  return explanation;
}

/**
 * Main Route
 */
app.post("/optimize-portfolio", async (req, res) => {
  try {
    const { budget, stocks } = req.body;

    // 1. Get sentiment scores
    const scores = await getSentimentScores(stocks);

    // 2. Allocate budget
    const allocation = await azureQuantumAllocator(scores, budget);

    // 3. Explain via Azure AI
    const explanation = await azureAIExplain(allocation, scores);

    res.json({
      input: { budget, stocks },
      scores,
      allocation,
      explanation,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const port = 3000;
app.listen(port, () => console.log(`🚀 Backend running on ${port}`));
