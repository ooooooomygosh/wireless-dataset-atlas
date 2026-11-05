"""Small, tested physical helpers. Arrays use h[... , tx_antenna]."""
import numpy as np


def dft_codebook(n_ant, n_beams=None):
    """ULA half-wavelength, unit-norm columns; spatial frequency in [-1,1)."""
    if n_ant < 1:
        raise ValueError('positive antenna count required')
    n_beams = n_beams or n_ant
    u = np.linspace(-1, 1, n_beams, endpoint=False)
    return np.exp(1j * np.pi * np.arange(n_ant)[:, None] * u) / np.sqrt(n_ant)


def beam_power(h, codebook):
    """h^H w convention; returns linear relative power, not measured dBm."""
    h = np.asarray(h)
    if h.shape[-1] != codebook.shape[0]:
        raise ValueError('antenna dimension mismatch')
    if not np.allclose(np.sum(abs(codebook)**2, axis=0), 1):
        raise ValueError('codebook must have unit-norm columns')
    return abs(h.conj() @ codebook)**2


def group_split(groups, seed=7):
    """Whole trajectory/site groups, not random frames."""
    groups = np.asarray(groups)
    unique = np.unique(groups)
    if len(unique) < 3:
        raise ValueError('at least three independent groups required')
    np.random.default_rng(seed).shuffle(unique)
    cut1, cut2 = max(1, int(.6*len(unique))), max(2, int(.8*len(unique)))
    return [np.flatnonzero(np.isin(groups, x)) for x in np.split(unique, [cut1, cut2])]


def paired_indices(low_keys, high_keys):
    """Exact manifest keys only; caller must verify true synchronization."""
    if len(set(low_keys)) != len(low_keys) or len(set(high_keys)) != len(high_keys):
        raise ValueError('duplicate pairing keys')
    high = {k: i for i, k in enumerate(high_keys)}
    pairs = [(i, high[k]) for i, k in enumerate(low_keys) if k in high]
    return np.asarray(pairs, dtype=int).reshape(-1, 2)


def evaluate(power, chosen, noise_power=None, snr_scale=None):
    """Normalize against exhaustive beam oracle; physical SE only with units."""
    power = np.asarray(power)
    if power.ndim != 2 or np.any(~np.isfinite(power)) or np.any(power < 0):
        raise ValueError('finite nonnegative N x B linear power required')
    chosen = np.asarray(chosen, dtype=int)
    if chosen.shape != (len(power),) or np.any(chosen < 0) or np.any(chosen >= power.shape[1]):
        raise ValueError('invalid beam indices')
    picked = power[np.arange(len(power)), chosen]
    oracle = power.max(axis=1)
    valid = oracle > 0
    result = {'normalized_gain': float(np.mean(picked[valid]/oracle[valid])) if valid.any() else None,
              'zero_channel_samples': int((~valid).sum()),
              'top1_accuracy': float(np.mean(chosen == power.argmax(axis=1)))}
    if noise_power is not None:
        if noise_power <= 0 or snr_scale is None or snr_scale <= 0:
            raise ValueError('positive, unit-consistent noise and signal scale required')
        result['mean_SE_bit_s_Hz'] = float(np.log2(1 + picked*snr_scale/noise_power).mean())
    return result
