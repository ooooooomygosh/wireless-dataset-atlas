"""Oracle vs best fixed beam and position nearest-neighbor baseline.
Artificial fixture: validates computation, does not estimate real accuracy.
Run: python3 06_baselines.py
"""
import numpy as np
from core import dft_codebook, beam_power, evaluate, group_split

if __name__ == '__main__':
    rng = np.random.default_rng(7)
    n = 160
    position = rng.uniform(-1, 1, (n, 2))
    h = np.exp(1j*np.pi*position[:, :1]*np.arange(16)[None, :])
    power = beam_power(h, dft_codebook(16))
    train, val, test = group_split(np.repeat(np.arange(10), 16))
    fixed = int(power[train].mean(axis=0).argmax())
    distance = ((position[test, None]-position[None, train])**2).sum(-1)
    nn = power[train[distance.argmin(axis=1)]].argmax(axis=1)
    for name, pred in [('oracle', power[test].argmax(1)),
                       ('train_best_fixed', np.full(len(test), fixed)), ('position_1NN', nn)]:
        print('ARTIFICIAL', name, evaluate(power[test], pred))
    # Add a learned model only after decision headroom is established.
    # This synthetic signal has no measured hardware, noise or probing cost.
