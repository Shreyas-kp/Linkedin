import re
from typing import List, Tuple
import pandas as pd

def load_mock_data(path: str) -> pd.DataFrame:
    """Load mock_data.csv into a DataFrame and filter for Job rows with suggested_courses."""
    df = pd.read_csv(path)
    # keep only Job rows that have suggested_courses
    if 'type' in df.columns:
        df = df[df['type'].str.lower() == 'job']
    if 'suggested_courses' in df.columns:
        df = df[df['suggested_courses'].notnull()]
    df = df.reset_index(drop=True)
    return df

def text_from_row(row: pd.Series) -> str:
    parts = []
    for c in ['title','description','skills']:
        if c in row and pd.notnull(row[c]):
            parts.append(str(row[c]))
    return '\n'.join(parts)

def parse_labels(series: pd.Series) -> List[List[str]]:
    # suggested_courses column contains semicolon-separated course codes
    out = []
    for v in series.fillna(''):
        items = [x.strip() for x in str(v).split(';') if x.strip()]
        out.append(items)
    return out
