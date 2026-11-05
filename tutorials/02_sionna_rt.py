"""Sionna RT 2.2.0 documented API; built-in scene smoke-tested on this Mac.
Separate environment: Python 3.12; pip install sionna-rt==2.2.0 numpy==2.2.6
Use only the scene geometry shipped with the package. No original dataset.
Reference: https://nvlabs.github.io/sionna/rt/tutorials/Introduction.html
Runtime backend support (Mitsuba/Dr.Jit) must be verified before execution.
"""
import sionna.rt as rt
import numpy as np
import mitsuba as mi
print("Mitsuba backend:", mi.variant())

scene = rt.load_scene(rt.scene.simple_street_canyon, merge_shapes=False)
scene.frequency = 28e9
scene.tx_array = rt.PlanarArray(num_rows=1, num_cols=8,
    vertical_spacing=0.5, horizontal_spacing=0.5,
    pattern='iso', polarization='V')
scene.rx_array = rt.PlanarArray(num_rows=1, num_cols=1,
    vertical_spacing=0.5, horizontal_spacing=0.5,
    pattern='iso', polarization='V')
# Inspect material objects instead of silently assigning all surfaces
# the same material or claiming calibrated material parameters.
for name, obj in scene.objects.items():
    print(name, obj.radio_material)
scene.add(rt.Transmitter(name='tx', position=[0, 0, 10]))
scene.add(rt.Receiver(name='rx', position=[20, 0, 1.5]))
scene.get('tx').look_at(scene.get('rx'))
solver = rt.PathSolver(deterministic=True)
paths = solver(scene=scene, max_depth=2, los=True,
    specular_reflection=True, diffuse_reflection=False,
    refraction=False, diffraction=False, edge_diffraction=False,
    synthetic_array=False, seed=7)
# No claim that diffraction/scattering is enabled by this configuration.
f = rt.subcarrier_frequencies(64, 120e3)
h = paths.cfr(frequencies=f, normalize=False,
              normalize_delays=False, out_type='numpy')
# axes: rx, rx_ant, tx, tx_ant, time, subcarrier
h = np.asarray(h)
assert h.shape == (1, 1, 1, 8, 1, 64), h.shape
assert np.isfinite(h).all() and np.any(abs(h) > 0), 'Invalid or empty channel'
print('CFR shape:', h.shape, 'mean channel power gain:', float(np.mean(abs(h)**2)))
# Position validity, path counts and zero-channel cases must be checked.
# Changing frequency requires recomputing paths/material response; a shared
# geometric scene alone does not establish a real synchronized band pair.
