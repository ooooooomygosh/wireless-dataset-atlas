"""Group isolation and train-only normalization. Artificial smoke test."""
import numpy as np
from core import group_split

if __name__ == '__main__':
    rng = np.random.default_rng(7)
    groups = np.repeat(np.arange(10), 8)
    x = rng.normal(size=(80, 4))
    train, val, test = group_split(groups)
    assert not set(groups[train]) & set(groups[test])
    mean, std = x[train].mean(0), x[train].std(0)
    normalized = (x-mean) / np.maximum(std, 1e-8)
    print('ARTIFICIAL groups:', [len(z) for z in [train, val, test]])
    # Spatial split additionally needs a metric distance buffer. Estimate
    # that buffer from propagation/empirical spatial correlation, not by
    # silently treating neighboring grid points as independent sites.
    # Engine OOD requires independently generated source engines, not
    # converting two files derived from the same paths into different formats.
