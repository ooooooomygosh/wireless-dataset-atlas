"""Geometric scan of a bundled Sionna scene; no physical LiDAR echo model.

Tested with sionna-rt==2.2.0, mitsuba==3.9.1, drjit==1.5.0.
No dataset download, depth-image conversion, or mesh-surface sampling.
"""
import json
from importlib.metadata import version

import numpy as np
import mitsuba as mi

# Select the tested backend before importing Sionna.
mi.set_variant("metal_ad_mono_polarized")
import sionna.rt as rt


def geometric_scan(scene, origin_world, directions_world,
                   min_range_m=0.01, max_range_m=20.0):
    """Return world-space first-hit points and original ray indices.

    The input directions are normalized here, so ray parameter t is distance.
    Filter invalid/near hits without treating them as real sensor returns.
    A nearest surface inside min_range is discarded, not made transparent.
    """
    origin = np.asarray(origin_world, dtype=np.float32)
    dirs = np.asarray(directions_world, dtype=np.float32)
    norms = np.linalg.norm(dirs, axis=1, keepdims=True)
    if origin.shape != (3,) or dirs.ndim != 2 or dirs.shape[1] != 3:
        raise ValueError("Expected origin [3] and directions [N,3]")
    if np.any(norms == 0) or not np.isfinite(dirs).all():
        raise ValueError("Directions must be finite and nonzero")
    dirs = dirs / norms
    rays = mi.Ray3f(o=mi.Point3f(*origin.tolist()), d=mi.Vector3f(dirs.T))
    rays.maxt = max_range_m
    hit = scene.mi_scene.ray_intersect(rays)
    valid = np.asarray(hit.is_valid(), dtype=bool)
    distances = np.asarray(hit.t, dtype=np.float32)
    xyz_world = np.asarray(hit.p, dtype=np.float32).T
    valid &= np.isfinite(distances) & (distances >= min_range_m)
    valid &= distances <= max_range_m
    return xyz_world[valid], distances[valid], np.flatnonzero(valid), dirs


def main():
    # The bundled box has bounds [-5,-5,0] to [5,5,5], in scene metres.
    scene = rt.load_scene(rt.scene.box)
    origin = np.array([0.0, 0.0, 2.5], dtype=np.float32)
    az = np.linspace(-np.pi, np.pi, 128, endpoint=False)
    el = np.deg2rad(np.linspace(-70.0, 70.0, 32))
    aa, ee = np.meshgrid(az, el, indexing="xy")
    dirs = np.column_stack((np.cos(ee).ravel()*np.cos(aa).ravel(),
                            np.cos(ee).ravel()*np.sin(aa).ravel(),
                            np.sin(ee).ravel())).astype(np.float32)
    points, ranges, indices, unit_dirs = geometric_scan(scene, origin, dirs)

    # Analytic distance from the centre to an axis-aligned box boundary.
    with np.errstate(divide="ignore"):
        expected = np.min(np.array([5., 5., 2.5]) / np.abs(unit_dirs), axis=1)
    error = float(np.max(np.abs(ranges-expected[indices])))
    reconstruction_error = float(np.max(np.abs(
        points - (origin + unit_dirs[indices]*ranges[:, None]))))
    assert len(points) == len(dirs) == 4096
    assert error < 1e-4
    assert np.isfinite(points).all()

    # No surface is within 2 m of the interior scan origin.
    short_points, _, _, _ = geometric_scan(scene, origin, dirs, max_range_m=2.)
    assert len(short_points) == 0

    # From outside: +x misses; -x hits the NEAR wall x=5 at 5 m,
    # not the far wall x=-5 at 15 m. This checks viewpoint occlusion.
    outside_points, outside_ranges, outside_indices, _ = geometric_scan(
        scene, [10., 0., 2.5], [[1., 0., 0.], [-1., 0., 0.]])
    assert outside_indices.tolist() == [1]
    assert np.allclose(outside_ranges, [5.])
    assert np.allclose(outside_points, [[5., 0., 2.5]])

    print(json.dumps({
        "status": "passed",
        "versions": {k: version(k) for k in ["sionna-rt", "mitsuba", "drjit"]},
        "backend": mi.variant(),
        "scene": "bundled sionna.rt.scene.box",
        "origin_world_m": origin.tolist(),
        "angular_grid": {"azimuth_samples": 128, "elevation_samples": 32,
                         "elevation_deg": [-70,70]},
        "rays": len(dirs), "valid_points": len(points),
        "point_shape": list(points.shape),
        "range_min_max_m": [float(ranges.min()), float(ranges.max())],
        "analytic_range_max_abs_error_m": error,
        "point_reconstruction_max_abs_error_m": reconstruction_error,
        "max_range_2m_valid_points": len(short_points),
        "outside_ray_indices_with_hit": outside_indices.tolist(),
        "outside_near_wall_range_m": outside_ranges.tolist(),
        "outside_near_wall_xyz_m": outside_points.tolist(),
        "first_three_points_m": points[:3].tolist(),
        "downloaded_raw_data": False,
        "physical_lidar_echo_or_noise_simulated": False
    }, indent=2))


if __name__ == "__main__":
    main()
