"""
Content-Based Filtering using TF-IDF + Cosine Similarity.

Each product has a `combined_text` field:
    name_ru + category + description_ru + tags

We vectorize all products with TF-IDF, then use cosine similarity
to find products most similar to what the user has purchased.
"""
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Tuple


class ContentBasedRecommender:
    def __init__(self):
        self.tfidf = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=10_000,
            sublinear_tf=True,
        )
        self.tfidf_matrix = None
        self.product_ids: List[int] = []
        self.cosine_sim: np.ndarray = None
        self.is_fitted = False

    # ── Training ──────────────────────────────────────────────────────────────

    def fit(self, products_df: pd.DataFrame) -> "ContentBasedRecommender":
        """
        Fit TF-IDF and compute cosine similarity matrix.

        Args:
            products_df: DataFrame with columns [id, combined_text]
        """
        df = products_df.copy()
        df["combined_text"] = df["combined_text"].fillna("").astype(str)

        self.product_ids = df["id"].tolist()
        self.tfidf_matrix = self.tfidf.fit_transform(df["combined_text"])
        # Dense cosine sim matrix  —  acceptable for ≤10k products
        self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
        self.is_fitted = True
        return self

    # ── Inference ─────────────────────────────────────────────────────────────

    def get_similar(
        self,
        product_id: int,
        top_n: int = 20,
        exclude_ids: List[int] = None,
    ) -> List[Tuple[int, float]]:
        """
        Return top-N most similar products to a given product.

        Returns: list of (product_id, similarity_score) sorted descending.
        """
        if product_id not in self.product_ids:
            return []

        idx = self.product_ids.index(product_id)
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores.sort(key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:]  # drop itself

        exclude = set(exclude_ids or [])
        results = []
        for i, score in sim_scores:
            pid = self.product_ids[i]
            if pid not in exclude:
                results.append((pid, float(score)))
            if len(results) >= top_n:
                break
        return results

    def recommend_for_user(
        self,
        purchased_ids: List[int],
        top_n: int = 20,
    ) -> List[Tuple[int, float]]:
        """
        Aggregate similarity scores across all products the user has purchased.
        Uses max-pooling: each candidate gets the max similarity to any owned product.

        Returns: list of (product_id, score) sorted descending.
        """
        if not purchased_ids or not self.is_fitted:
            return []

        scores: dict[int, float] = {}
        for pid in purchased_ids:
            similar = self.get_similar(pid, top_n=100, exclude_ids=purchased_ids)
            for similar_pid, score in similar:
                scores[similar_pid] = max(scores.get(similar_pid, 0.0), score)

        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_scores[:top_n]
