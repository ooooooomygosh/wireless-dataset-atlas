"""Exact manifest pairing, not proof of physical synchronization.
Run on artificial manifests: python3 04_cross_frequency.py
Real use: key=(campaign,site,trajectory,synchronized_sample_id), separately
validate clocks, frequency, array frame, bandwidth and calibration.
"""
from core import paired_indices

if __name__ == '__main__':
    low = [('synthetic', 'site_a', 'traj_1', i) for i in range(5)]
    high = [('synthetic', 'site_a', 'traj_1', i) for i in [1, 3, 4]]
    print('ARTIFICIAL fixture; no measured CSI:', paired_indices(low, high).tolist())
    # Repeated trajectories and colocated separate campaigns must keep their
    # own pairing_type; never relabel either as simultaneous measured data.
