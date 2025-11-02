"""
Train Model 1 — a simple TF-IDF + MLP multi-label classifier mapping job text to suggested courses.

Usage:
  python -m venv .venv
  .\.venv\Scripts\pip install -r requirements.txt
  python train_model1.py --data ../mock_data.csv --outdir ./artifacts

This script is intentionally simple and easy to extend. It saves:
 - torch model: artifacts/model.pt
 - sklearn vectorizer: artifacts/vectorizer.joblib
 - label mapping: artifacts/labels.joblib
"""
import argparse
import os
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
import torch
import torch.nn as nn
import torch.optim as optim

try:
    # when running as a module from project root
    from ml.utils import load_mock_data, text_from_row, parse_labels
except Exception:
    # when running the script directly (python ml\train_model1.py), the ml/ folder
    # is the current working package directory and a direct import will succeed
    from utils import load_mock_data, text_from_row, parse_labels


class MLP(nn.Module):
    def __init__(self, input_dim:int, hidden:int, output_dim:int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden, output_dim),
        )
    def forward(self, x):
        # return logits (no sigmoid) so we can use BCEWithLogitsLoss
        return self.net(x)


def train_epoch(model, optimizer, criterion, X, y, device):
    model.train()
    X = torch.from_numpy(X).float().to(device)
    y = torch.from_numpy(y).float().to(device)
    optimizer.zero_grad()
    out = model(X)
    loss = criterion(out, y)
    loss.backward()
    optimizer.step()
    return loss.item()


def eval_model(model, X, y, device):
    model.eval()
    X = torch.from_numpy(X).float().to(device)
    with torch.no_grad():
        out = model(X).cpu().numpy()
    # compute simple macro F1-like proxy: threshold 0.5
    preds = (out >= 0.5).astype(int)
    true = y.astype(int)
    # avoid sklearn dependency for metrics; simple accuracy per-label
    label_acc = (preds == true).mean()
    return label_acc


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, required=True)
    parser.add_argument('--outdir', type=str, default='./artifacts')
    parser.add_argument('--epochs', type=int, default=120)
    parser.add_argument('--hidden', type=int, default=128)
    parser.add_argument('--lr', type=float, default=1e-4)
    parser.add_argument('--weight_decay', type=float, default=1e-5)
    parser.add_argument('--patience', type=int, default=10)
    args = parser.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    df = load_mock_data(args.data)
    texts = [text_from_row(r) for _, r in df.iterrows()]
    labels_list = parse_labels(df['suggested_courses'])

    # prepare vectorizer and label binarizer
    vectorizer = TfidfVectorizer(max_features=2000, ngram_range=(1,2))
    X = vectorizer.fit_transform(texts).toarray()
    mlb = MultiLabelBinarizer()
    Y = mlb.fit_transform(labels_list)

    # train / val split
    X_train, X_val, y_train, y_val = train_test_split(X, Y, test_size=0.2, random_state=42)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = MLP(input_dim=X_train.shape[1], hidden=args.hidden, output_dim=Y.shape[1]).to(device)
    optimizer = optim.Adam(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)

    # compute pos_weight for BCEWithLogitsLoss to handle class imbalance
    pos = y_train.sum(axis=0)
    neg = y_train.shape[0] - pos
    # avoid division by zero
    pos_weight = torch.tensor([(n / p) if p > 0 else 1.0 for p, n in zip(pos, neg)], dtype=torch.float32).to(device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

    from sklearn.metrics import precision_recall_fscore_support
    best_val = -1.0
    no_improve = 0
    for epoch in range(1, args.epochs+1):
        loss = train_epoch(model, optimizer, criterion, X_train, y_train, device)
        # evaluate on validation
        model.eval()
        with torch.no_grad():
            Xv = torch.from_numpy(X_val).float().to(device)
            logits = model(Xv).cpu().numpy()
            probs = 1/(1+np.exp(-logits))
        preds = (probs >= 0.5).astype(int)
        p, r, f, _ = precision_recall_fscore_support(y_val, preds, zero_division=0)
        macro_f1 = f.mean()
        if epoch % 10 == 0 or epoch==1:
            print(f"Epoch {epoch}/{args.epochs} loss={loss:.4f} val_macro_f1={macro_f1:.4f}")
        if macro_f1 > best_val:
            best_val = macro_f1
            no_improve = 0
            torch.save(model.state_dict(), outdir / 'model.pt')
            joblib.dump(vectorizer, outdir / 'vectorizer.joblib')
            joblib.dump(mlb, outdir / 'labels.joblib')
        else:
            no_improve += 1
            if no_improve >= args.patience:
                print('Early stopping: no improvement for', args.patience, 'epochs')
                break

    print(f"Training finished. Best val macro F1: {best_val:.4f}")


if __name__ == '__main__':
    main()
