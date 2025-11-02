"""
Merge scraped job CSVs and produce a labeled dataset by matching job skills
to course skill lists from `mock_courses.csv`.

The output `ml/merged_data.csv` will contain rows with columns similar to
`mock_data.csv`: id,type,title,description,skills,suggested_courses

If a job matches multiple courses, we include top matches (by overlap).
This is a heuristic auto-labeling step to expand the training data.
"""
from pathlib import Path
import pandas as pd
from collections import Counter
import re
from difflib import SequenceMatcher


def parse_skills_field(s):
    if pd.isna(s):
        return []
    if isinstance(s, str):
        # split on common delimiters
        parts = re.split(r"[;,|\\/]+", s)
        return [p.strip() for p in parts if p.strip()]
    return []


def build_course_skill_map(courses_df: pd.DataFrame):
    cmap = {}
    for _, row in courses_df.iterrows():
        title = row.get('title') or row.get('name')
        skills = row.get('skills_taught') or row.get('skills') or ''
        parsed = [s.lower() for s in parse_skills_field(skills)]
        # keep unique
        cmap[title] = set(parsed)
    return cmap


def score_job_against_courses(job_skills, course_skill_map):
    scores = []
    # normalize job skills
    jset = set([s.lower().strip() for s in job_skills if isinstance(s, str)])
    for course, cskills in course_skill_map.items():
        if not cskills:
            continue
        overlap = len(jset & set([c for c in cskills]))
        # also consider partial token matches
        token_overlap = sum(1 for j in jset for c in cskills if j in c or c in j)
        # fuzzy match between skill strings (helps when phrasing differs)
        fuzzy = 0.0
        for j in jset:
            for c in cskills:
                # use sequence matcher ratio as a lightweight fuzzy score
                r = SequenceMatcher(None, j, c).ratio()
                if r > 0.75:
                    fuzzy += r
        score = overlap + 0.3 * token_overlap + 0.5 * fuzzy
        if score > 0:
            scores.append((course, score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores


def score_text_against_courses(text, course_skill_map):
    """Score free text (title/description) against course skills using substring and fuzzy matching."""
    txt = str(text).lower()
    scores = []
    for course, cskills in course_skill_map.items():
        score = 0.0
        for c in cskills:
            if c in txt:
                score += 1.0
            else:
                # fuzzy check of course-skill token in text
                r = SequenceMatcher(None, c, txt).ratio()
                if r > 0.6:
                    score += 0.5 * r
        if score > 0:
            scores.append((course, score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores


def main():
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--min_score', type=float, default=0.5, help='Minimum combined score to keep an auto-labeled scraped job')
    parser.add_argument('--out', type=str, default='merged_data.csv')
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    # load course catalog
    courses_path = root.parent.joinpath('mock_courses.csv')
    if not courses_path.exists():
        print('mock_courses.csv not found at', courses_path)
        return
    courses = pd.read_csv(courses_path)
    course_map = build_course_skill_map(courses)

    # load mock_data as seed labeled data
    mock_path = root.parent.joinpath('mock_data.csv')
    mock_df = pd.read_csv(mock_path)

    # read scraped job files (if present)
    scraped_files = [root.parent.joinpath('scraped_linkedin_jobs.csv'), root.parent.joinpath('scraped_jobs_aggregated.csv')]
    scraped = []
    for f in scraped_files:
        if f.exists():
            print('Loading', f.name)
            try:
                df = pd.read_csv(f)
                scraped.append(df)
            except Exception as e:
                print('Failed to load', f, e)
    if scraped:
        scraped_df = pd.concat(scraped, ignore_index=True, sort=False)
    else:
        scraped_df = pd.DataFrame()

    # build labeled rows from scraped by mapping skills
    labeled_rows = []
    next_id = int(mock_df['id'].max()) + 1 if 'id' in mock_df.columns else 1000
    for _, row in scraped_df.iterrows():
        title = row.get('title','')
        desc = row.get('description','')
        skills_field = row.get('skills','')
        skills = parse_skills_field(skills_field)
        # score by explicit skills and by free text (title+description)
        scores_skills = score_job_against_courses(skills, course_map)
        scores_text = score_text_against_courses(f"{title} {desc}", course_map)
        # combine scores: give more weight to explicit skills but include text matches
        combined = {}
        for c, s in scores_skills:
            combined[c] = combined.get(c, 0.0) + 1.0 * s
        for c, s in scores_text:
            combined[c] = combined.get(c, 0.0) + 0.6 * s
        if not combined:
            continue
        sorted_combined = sorted(combined.items(), key=lambda x: x[1], reverse=True)
        # top course name(s) and their scores
        top_items = sorted_combined[:3]
        top_courses = [c for c,_ in top_items]
        top_score = top_items[0][1]
        suggested = ';'.join(top_courses)
        labeled_rows.append({
            'id': next_id,
            'type':'Job',
            'title': title,
            'description': desc,
            'skills': skills_field,
            'suggested_courses': suggested,
            'auto_label_confidence': float(top_score),
            'label_source': 'scraped'
        })
        next_id += 1

    scraped_labeled = pd.DataFrame(labeled_rows)
    print('Auto-labeled scraped jobs:', len(scraped_labeled))

    # mark seed/mock rows
    mock_df = mock_df.copy()
    if 'label_source' not in mock_df.columns:
        mock_df['label_source'] = 'seed'
    if 'auto_label_confidence' not in mock_df.columns:
        mock_df['auto_label_confidence'] = ''

    merged = pd.concat([mock_df, scraped_labeled], ignore_index=True, sort=False)

    out_path = root.joinpath(args.out)
    merged.to_csv(out_path, index=False)
    print('Saved merged dataset to', out_path)

    # produce a filtered high-confidence CSV for training
    highconf_path = root.joinpath('merged_data_highconf.csv')
    # include all seed rows + scraped rows with auto_label_confidence >= min_score
    try:
        merged['auto_label_confidence'] = pd.to_numeric(merged['auto_label_confidence'], errors='coerce')
    except Exception:
        pass
    condition = (merged['label_source'] == 'seed') | (merged['auto_label_confidence'] >= args.min_score)
    highconf = merged[condition].copy()
    highconf.to_csv(highconf_path, index=False)
    print(f'Saved high-confidence merged dataset to {highconf_path} (min_score={args.min_score})')


if __name__ == '__main__':
    main()
