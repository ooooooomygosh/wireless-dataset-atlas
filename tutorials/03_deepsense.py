"""DeepSense Scenario 9 CSV + 64-beam power parser.
Document/source checked; no original dataset downloaded or run locally.
Run: python3 03_deepsense.py /path/scenario.csv /path/data --column unit1_pwr_60ghz
Check the actual CSV header; pass the official column name explicitly.
"""
import argparse
import csv
from pathlib import Path
import numpy as np


def load_power(csv_path, root, column):
    root = Path(root).resolve()
    with open(csv_path, newline='', encoding='utf-8-sig') as f:
        rows = list(csv.DictReader(f))
    if not rows or column not in rows[0]:
        raise ValueError(f'column missing; available: {list(rows[0]) if rows else []}')
    power, valid_rows = [], []
    for i, row in enumerate(rows):
        relative = Path(row[column])
        if relative.is_absolute() or '..' in relative.parts:
            raise ValueError('relative path inside data root required')
        p = (root / relative).resolve()
        if not p.is_relative_to(root):
            raise ValueError('path outside data root')
        x = np.loadtxt(p).reshape(-1)
        if x.size != 64:
            raise ValueError(f'row {i}: expected official 64-beam vector; got {x.size}')
        if np.all(np.isfinite(x)):
            power.append(x); valid_rows.append(i)
    return rows, np.asarray(power), np.asarray(valid_rows)


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('csv'); p.add_argument('root'); p.add_argument('--column', required=True)
    a = p.parse_args()
    rows, power, valid = load_power(a.csv, a.root, a.column)
    print({'rows': len(rows), 'valid': len(valid), 'beam_labels_zero_based': power.argmax(axis=1).tolist()[:10]})
    # Argmax is valid under any monotonic unit conversion. Rate is not:
    # establish linear power vs dBm and calibration before SE computations.
    # For a prediction task, create strictly past-input/future-label windows
    # within official sequence IDs; without sequence IDs, do not claim tracking.
