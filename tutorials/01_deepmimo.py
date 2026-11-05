"""DeepMIMO 4.0.5: read one local static link, generate OFDM CSI, score beams.

Install in your own environment: python -m pip install 'deepmimo==4.0.5'
Example (the scenario must already be downloaded and extracted):
  python atlas-deepmimo-tutorial.py /data/deepmimo_scenarios asu_campus_3p5

Verified against the official v4.0.5 source on 2026-11-05:
https://github.com/DeepMIMO/DeepMIMO/blob/v4.0.5/README.md
https://github.com/DeepMIMO/DeepMIMO/blob/v4.0.5/deepmimo/datasets/load.py
https://github.com/DeepMIMO/DeepMIMO/blob/v4.0.5/deepmimo/datasets/dataset.py
https://github.com/DeepMIMO/DeepMIMO/blob/v4.0.5/deepmimo/generator/channel.py
https://github.com/DeepMIMO/DeepMIMO/blob/v4.0.5/deepmimo/generator/geometry.py

This example reads raw data and keeps derived channels in memory. It does not
download data, train a model, or overwrite the scenario. Its DFT codebook is a
far-field ULA example; it is not a near-field focusing codebook.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np


def dft_codebook(n_tx: int) -> np.ndarray:
    """Return [TX antenna, beam] weights; each column has unit L2 norm."""
    n = np.arange(n_tx)[:, None]
    b = np.arange(n_tx)[None, :]
    return np.exp(-2j * np.pi * n * b / n_tx) / np.sqrt(n_tx)


def beam_power(h: np.ndarray, f: np.ndarray) -> np.ndarray:
    """Average selected-subcarrier gain for a single receive antenna.

    h: [UE, RX antenna=1, TX antenna, selected subcarrier]
    f: [TX antenna, beam]
    y = H f s + noise, so multiply H by f directly (do not conjugate H).
    A notation y = h_col^H f s is equivalent when h_col = H_row.conj().
    Return [UE, beam]. This is power gain, not a calibrated SNR or data rate.
    """
    if h.ndim != 4 or h.shape[1] != 1 or f.shape[0] != h.shape[2]:
        raise ValueError("Expected H [UE, 1, TX, K] and F [TX, beam].")
    if not np.isfinite(h).all():
        raise ValueError("Non-finite channel entries: audit the input paths first.")
    np.testing.assert_allclose(np.sum(np.abs(f) ** 2, axis=0), 1.0, atol=1e-7)
    response = np.einsum("utk,tb->ubk", h[:, 0, :, :], f, optimize=True)
    return np.mean(np.abs(response) ** 2, axis=-1)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("scenario_root", type=Path, help="Parent of extracted scenario folders")
    parser.add_argument("scenario", help="Local scenario folder name, e.g. asu_campus_3p5")
    parser.add_argument("--link", type=int, default=0, help="TX/RX pair index for a MacroDataset")
    parser.add_argument("--max-users", type=int, default=128)
    args = parser.parse_args()
    if args.max_users < 1 or args.link < 0:
        parser.error("--max-users must be positive and --link must be nonnegative")

    import deepmimo as dm

    if dm.__version__ != "4.0.5":
        raise RuntimeError(f"This example targets 4.0.5; installed version is {dm.__version__}.")
    root = args.scenario_root.expanduser().resolve()
    # dm.load lowercases scenario names in v4.0.5. Use the matching local folder.
    name = args.scenario.lower()
    if Path(name).name != name or not (root / name).is_dir():
        raise FileNotFoundError(f"Extracted local scenario not found: {root / name}")
    if not (root / name / "params.json").is_file():
        raise FileNotFoundError(f"Missing v4 params.json in {root / name}")
    dm.config.set("scenarios_folder", str(root))
    loaded = dm.load(name, max_paths=10)  # Load cap and generation cap are separate.
    if isinstance(loaded, dm.DynamicDataset):
        raise ValueError("Choose a static scenario for this example; dynamic snapshots need explicit time handling.")
    if isinstance(loaded, dm.MacroDataset):
        dataset = loaded[args.link]  # Select a TX/RX pair, not a UE.
    else:
        if args.link != 0:
            raise ValueError("This scenario returned a single Dataset; use --link 0.")
        dataset = loaded
    print("Selected TX/RX pair:", dataset.txrx)
    n_users = min(args.max_users, int(dataset.n_ue))
    if n_users == 0:
        raise ValueError("Selected link contains no receiver positions.")
    dataset = dataset.trim(idxs=np.arange(n_users))  # New in-memory subset.

    parameters = dm.ChannelParameters(
        bs_antenna={"shape": [32, 1], "spacing": 0.5, "rotation": [0, 0, 0]},
        ue_antenna={"shape": [1, 1], "spacing": 0.5, "rotation": [0, 0, 0]},
        num_paths=10,
        freq_domain=True,
        doppler=False,
        ofdm={
            "subcarriers": 64,
            "selected_subcarriers": np.arange(64),  # Zero-based indices, not Hz.
            "bandwidth": 20e6,  # Hz; antenna spacing above is in wavelengths.
            "rx_filter": False,
        },
    )
    # shape=[My,Mz] lies in the local y-z plane; [32,1] is a y-axis ULA.
    # No times argument: one t=0 sample, and no extra time axis in the output.
    h = dataset.compute_channels(parameters)
    if h.shape != (n_users, 1, 32, 64):
        raise ValueError(f"Unexpected channel axes: {h.shape}")
    print("H axes [UE, RX antenna, TX antenna, selected subcarrier]:", h.shape)
    print("RX positions [UE, xyz]:", np.asarray(dataset.rx_pos).shape)
    print("RT parameters (carrier frequency and source engine):", dataset.rt_params)
    # The source normalizes frequency-domain path amplitudes by sqrt(N_subcarriers).
    # Preserve that convention when deriving transmit-power/noise calibration.
    # Changing OFDM settings does not rerun RT or create a new carrier-frequency dataset.
    gain = beam_power(h, dft_codebook(h.shape[2]))
    valid = np.max(gain, axis=1) > 0
    label = np.full(n_users, -1, dtype=int)  # -1 marks zero-gain / unavailable links.
    label[valid] = np.argmax(gain[valid], axis=1)
    print("Valid links:", int(valid.sum()), "/", n_users)
    print("First oracle beam labels (zero-based):", label[:10].tolist())
    # This oracle maximizes mean beam power. For rate utility, maximize the mean
    # of log2(1+SINR_k) under an explicit power/noise/overhead model instead.
    # Split by scene/area before fitting predictors; adjacent-grid random splits leak.


if __name__ == "__main__":
    main()
