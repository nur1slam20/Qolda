"""
Collaborative Filtering using truncated SVD (Singular Value Decomposition).

We build a user × product rating matrix from:
  - Explicit ratings: user reviews (1–5 stars)
  - Implicit signals: purchases treated as rating 4.0

Then apply scipy's truncated SVD to decompose the matrix:
    R ≈ U · Σ · Vᵀ

Where:
  U  (users  × k)  — user latent factors
  Σ  (k × k)       — singular values (importance of each factor)
  Vᵀ (k × items)   — item latent factors

Predicted rating: R̂ = U · Σ · Vᵀ
For a new user, predict their ratings for all unseen items.
"""
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import svds
from typing import List, Tuple


class CollaborativeRecommender:
    def __init__(self, n_factors: int = 50):
        self.n_factors = n_factors
        # Decomposition matrices
        self.U: np.ndarray = None      # users  × k
        self.sigma: np.ndarray = None  # k
        self.Vt: np.ndarray = None     # k × items
        self.R_hat: np.ndarray = None  # full predicted rating matrix
        self.user_ids: List[int] = []
        self.item_ids: List[int] = []
        self.user_mean: dict = {}
        self.is_fitted = False

    # ── Training ──────────────────────────────────────────────────────────────

    def fit(
        self,
        ratings_df: pd.DataFrame,
        all_product_ids: List[int],
    ) -> "CollaborativeRecommender":
        """
        Build user-item matrix and decompose with truncated SVD.

        Args:
            ratings_df:       DataFrame [user_id (str), product_id (str), rating (float)]
            all_product_ids:  All catalogue product IDs.
        """
        if len(ratings_df) < 5:
            return self

        # Convert IDs to int
        ratings_df = ratings_df.copy()
        ratings_df["user_id"] = ratings_df["user_id"].astype(int)
        ratings_df["product_id"] = ratings_df["product_id"].astype(int)

        # Build index maps
        self.user_ids = sorted(ratings_df["user_id"].unique().tolist())
        self.item_ids = sorted(set(all_product_ids))
        user_idx = {uid: i for i, uid in enumerate(self.user_ids)}
        item_idx = {iid: j for j, iid in enumerate(self.item_ids)}

        n_users = len(self.user_ids)
        n_items = len(self.item_ids)

        # Compute per-user mean rating (for mean-centering)
        self.user_mean = ratings_df.groupby("user_id")["rating"].mean().to_dict()

        # Build sparse rating matrix (mean-centered)
        rows, cols, vals = [], [], []
        for _, row in ratings_df.iterrows():
            u = user_idx.get(int(row["user_id"]))
            i = item_idx.get(int(row["product_id"]))
            if u is not None and i is not None:
                rows.append(u)
                cols.append(i)
                vals.append(row["rating"] - self.user_mean[int(row["user_id"])])

        R = csr_matrix((vals, (rows, cols)), shape=(n_users, n_items), dtype=np.float32)

        # Choose k (can't exceed matrix rank)
        k = min(self.n_factors, n_users - 1, n_items - 1)
        if k < 1:
            return self

        # Truncated SVD: R ≈ U · diag(sigma) · Vt
        self.U, self.sigma, self.Vt = svds(R, k=k)

        # Sort by singular value (descending — svds returns ascending)
        order = np.argsort(self.sigma)[::-1]
        self.U = self.U[:, order]
        self.sigma = self.sigma[order]
        self.Vt = self.Vt[order, :]

        # Reconstruct full prediction matrix and add back user means
        mean_vec = np.array([self.user_mean.get(uid, 0.0) for uid in self.user_ids])
        self.R_hat = np.dot(np.dot(self.U, np.diag(self.sigma)), self.Vt)
        self.R_hat += mean_vec[:, np.newaxis]

        # Clip predictions to valid rating range [1, 5]
        self.R_hat = np.clip(self.R_hat, 1.0, 5.0)

        self.is_fitted = True
        return self

    # ── Inference ─────────────────────────────────────────────────────────────

    def predict_for_user(
        self,
        user_id: int,
        exclude_ids: List[int] = None,
        top_n: int = 20,
    ) -> List[Tuple[int, float]]:
        """
        Return top-N predicted items for a user.

        Returns: list of (product_id, predicted_rating) sorted descending.
        """
        if not self.is_fitted:
            return []

        exclude = set(exclude_ids or [])

        if user_id in self.user_ids:
            # Known user — use precomputed prediction row
            u_idx = self.user_ids.index(user_id)
            pred_row = self.R_hat[u_idx]
        else:
            # Cold-start user — use global item means from Vt
            global_mean = np.mean(list(self.user_mean.values())) if self.user_mean else 3.0
            sigma_diag = np.diag(self.sigma)
            # Project a neutral user through the item space
            neutral = np.dot(sigma_diag, self.Vt).mean(axis=1)
            pred_row = np.dot(neutral, self.Vt) + global_mean
            pred_row = np.clip(pred_row, 1.0, 5.0)

        predictions = []
        for j, iid in enumerate(self.item_ids):
            if iid not in exclude:
                predictions.append((iid, float(pred_row[j])))

        predictions.sort(key=lambda x: x[1], reverse=True)
        return predictions[:top_n]
