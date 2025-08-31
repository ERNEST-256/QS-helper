from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
import os
import requests
import yfinance as yf
import numpy as np
from transformers import pipeline
from cachetools import TTLCache, cached

# -----------------------------
# CONFIG
# -----------------------------
NEWSAPI_KEY = os.environ.get("NEWSAPI_KEY", "").strip()
MAX_HEADLINES = 10  # fetch more for robustness

MODEL_A = "yiyanghkust/finbert-tone"
MODEL_B = "ProsusAI/finbert"

# -----------------------------
# Load models
# -----------------------------
sentiment_a = pipeline("sentiment-analysis", model=MODEL_A, device=-1)
sentiment_b = pipeline("sentiment-analysis", model=MODEL_B, device=-1)

LABEL_MAP = {
    "positive": "positive", "neutral": "neutral", "negative": "negative",
    "Positive": "positive", "Neutral": "neutral", "Negative": "negative",
    "LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"
}

# -----------------------------
# Caching
# -----------------------------
stock_cache = TTLCache(maxsize=100, ttl=600)

# -----------------------------
# News fetchers
# -----------------------------
def fetch_news_newsapi(query: str, limit: int = MAX_HEADLINES) -> List[str]:
    if not NEWSAPI_KEY:
        return []
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "language": "en",
        "pageSize": limit,
        "sortBy": "publishedAt",
        "apiKey": NEWSAPI_KEY,
    }
    try:
        r = requests.get(url, params=params, timeout=6)
        r.raise_for_status()
        articles = r.json().get("articles", [])[:limit]
        return [a.get("title", "") for a in articles if a.get("title")]
    except Exception as e:
        print(f"[NewsAPI error] {e}")
        return []

def fetch_news_yfinance(ticker: str, limit: int = MAX_HEADLINES) -> List[str]:
    try:
        t = yf.Ticker(ticker)
        news_items = getattr(t, "news", None) or []
        return [n.get("title") for n in news_items if n.get("title")][:limit]
    except Exception as e:
        print(f"[Yahoo Finance error] {e}")
        return []

def fetch_headlines(stock: str, limit: int = MAX_HEADLINES) -> List[str]:
    headlines = fetch_news_newsapi(stock, limit)
    if not headlines:
        headlines = fetch_news_yfinance(stock, limit)
    return headlines

# -----------------------------
# Ensemble utilities
# -----------------------------
def model_to_vector(pred: Dict) -> np.ndarray:
    label = pred.get("label", "")
    score = float(pred.get("score", 0.0))
    mapped = LABEL_MAP.get(label, label.lower())
    vec = np.zeros(3)
    if mapped == "negative":
        vec[0] = score
    elif mapped == "neutral":
        vec[1] = score
    elif mapped == "positive":
        vec[2] = score
    else:
        vec[1] = score
    return vec

def headline_score_ensemble(headline: str) -> np.ndarray:
    a = sentiment_a(headline)[0]
    b = sentiment_b(headline)[0]
    return (model_to_vector(a) + model_to_vector(b)) / 2.0

def aggregate_headlines_vectors(vectors: List[np.ndarray]) -> np.ndarray:
    if not vectors:
        return np.array([0.0,1.0,0.0])
    mean_vec = np.mean(vectors, axis=0)
    total = mean_vec.sum()
    return mean_vec / total if total > 0 else np.array([0.0,1.0,0.0])

def vector_to_score(vec: np.ndarray) -> float:
    neg, neu, pos = vec.tolist()
    return max(0.0, min(1.0, pos + 0.5 * neu))

# -----------------------------
# Decay utilities
# -----------------------------
def get_decay_factor(num_headlines: int, max_headlines: int = MAX_HEADLINES,
                     min_decay: float = 0.6, max_decay: float = 0.95) -> float:
    """
    Dynamic decay: more headlines → higher decay → score can approach extremes.
    """
    ratio = min(num_headlines / max_headlines, 1.0)
    return min_decay + ratio * (max_decay - min_decay)

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="Financial Sentiment API")

class StocksRequest(BaseModel):
    stocks: List[str]

@cached(stock_cache)
def analyze_single_stock(stock: str) -> float | str:
    headlines = fetch_headlines(stock)
    headlines = [h for h in headlines if h and len(h.strip()) > 10]

    if not headlines or len(headlines) < 2:
        return "NO_DATA"

    vectors = [headline_score_ensemble(h) for h in headlines]
    agg = aggregate_headlines_vectors(vectors)
    raw_score = vector_to_score(agg)

    # Apply dynamic decay
    decay = get_decay_factor(len(headlines))
    adjusted_score = 0.5 + decay * (raw_score - 0.5)
    return round(adjusted_score, 2)

@app.get("/")
def root():
    return {"message": "Fin-senti API is running! Use POST /analyze"}

@app.post("/analyze")
def analyze(req: StocksRequest):
    results = {}
    for stock in req.stocks:
        results[stock] = analyze_single_stock(stock)
    return results

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)