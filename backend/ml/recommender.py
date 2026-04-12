"""
Hybrid Recommender — combines Content-Based and Collaborative Filtering.

Formula:
    final_score = 0.6 × collaborative_score + 0.4 × content_score

Cold-start rule:
    If the user has < 3 purchases → use Content-Based only (popular categories fallback).
    If the user has ≥ 3 purchases → full Hybrid.
"""
import pandas as pd
from typing import List, Dict, Any

from ml.content_based import ContentBasedRecommender
from ml.collaborative import CollaborativeRecommender

# Bilingual reason tags shown on recommendation cards
REASON_TAGS = {
    "content_based": "Сіздің сатып алуларыңызға ұқсас / Похоже на ваши покупки",
    "collaborative": "Сізге ұқсас клиенттер алды / Клиенты как вы тоже брали",
    "hybrid":        "Сіздің сатып алуларыңызға ұқсас / Похоже на ваши покупки",
    "popular":       "Осы санатты жиі алады / Часто покупают в этой категории",
}

COLD_START_THRESHOLD = 3  # purchases needed for collaborative signal


def _normalize(scores: dict) -> dict:
    """Min-max normalize a {id: score} dict to [0, 1]."""
    if not scores:
        return scores
    mn = min(scores.values())
    mx = max(scores.values())
    rng = mx - mn or 1.0
    return {k: (v - mn) / rng for k, v in scores.items()}


class HybridRecommender:
    def __init__(self, collab_weight: float = 0.6, content_weight: float = 0.4):
        assert abs(collab_weight + content_weight - 1.0) < 1e-6, "Weights must sum to 1"
        self.collab_weight = collab_weight
        self.content_weight = content_weight

        self.content_model = ContentBasedRecommender()
        self.collab_model = CollaborativeRecommender(n_factors=50)
        self.is_trained = False

    # ── Training ──────────────────────────────────────────────────────────────

    def fit(
        self,
        products_df: pd.DataFrame,
        ratings_df: pd.DataFrame,
    ) -> "HybridRecommender":
        """
        Train both sub-models.

        Args:
            products_df: DataFrame [id, combined_text, category, ...]
            ratings_df:  DataFrame [user_id (str), product_id (str), rating (float)]
        """
        all_ids = products_df["id"].tolist()

        # 1. Content-Based (TF-IDF)
        self.content_model.fit(products_df)

        # 2. Collaborative (SVD) — only if enough rating data
        if len(ratings_df) >= 10:
            self.collab_model.fit(ratings_df, all_ids)

        self.is_trained = True
        return self

    # ── Inference ─────────────────────────────────────────────────────────────

    def recommend(
        self,
        user_id: int,
        purchased_ids: List[int],
        top_n: int = 8,
    ) -> List[Dict[str, Any]]:
        """
        Generate top-N hybrid recommendations for a user.

        Returns a list of dicts:
            { product_id, score, method, reason_tag }
        """
        if not self.is_trained:
            return []

        if len(purchased_ids) < COLD_START_THRESHOLD:
            # ── Cold start: content-based only ──────────────────────────────
            if not purchased_ids:
                return []
            recs = self.content_model.recommend_for_user(purchased_ids, top_n=top_n)
            return [
                {
                    "product_id": pid,
                    "score": score,
                    "method": "content_based",
                    "reason_tag": REASON_TAGS["content_based"],
                }
                for pid, score in recs
            ]

        # ── Full hybrid ──────────────────────────────────────────────────────

        # Content scores (normalized)
        content_pairs = self.content_model.recommend_for_user(purchased_ids, top_n=100)
        content_dict = _normalize(dict(content_pairs))

        # Collaborative scores (normalized)
        collab_pairs = self.collab_model.predict_for_user(
            user_id, exclude_ids=purchased_ids, top_n=100
        )
        collab_dict = _normalize(dict(collab_pairs))

        # Fuse
        all_pids = set(content_dict) | set(collab_dict)
        hybrid_scores = {}
        for pid in all_pids:
            c = content_dict.get(pid, 0.0)
            cf = collab_dict.get(pid, 0.0)
            hybrid_scores[pid] = self.collab_weight * cf + self.content_weight * c

        # Sort and return top-N
        sorted_recs = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

        result = []
        for pid, score in sorted_recs:
            cf = collab_dict.get(pid, 0.0)
            c = content_dict.get(pid, 0.0)
            if cf >= c:
                method, reason = "collaborative", REASON_TAGS["collaborative"]
            else:
                method, reason = "content_based", REASON_TAGS["content_based"]

            result.append({
                "product_id": pid,
                "score": round(score, 4),
                "method": method,
                "reason_tag": reason,
            })

        return result
