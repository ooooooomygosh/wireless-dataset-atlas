import sys, unittest, tempfile, csv
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'tutorials'))
from core import *

class PhysicalTests(unittest.TestCase):
    def test_matched_beam_and_conjugation(self):
        w = dft_codebook(8)
        p = beam_power(w[:, 3][None], w)
        self.assertEqual(int(p.argmax()), 3)
        self.assertAlmostEqual(float(p.max()), 1.)
        self.assertTrue(np.allclose(w.conj().T@w, np.eye(8)))
    def test_dimension_guard(self):
        with self.assertRaises(ValueError): beam_power(np.ones((2, 3)), dft_codebook(4))
    def test_groups_disjoint(self):
        g=np.repeat(np.arange(10),4); splits=group_split(g)
        for i in range(3):
            for j in range(i): self.assertFalse(set(g[splits[i]])&set(g[splits[j]]))
    def test_duplicate_pairing(self):
        with self.assertRaises(ValueError): paired_indices(['a','a'],['a'])
        self.assertEqual(paired_indices(['a','b'],['b']).tolist(),[[1,0]])
    def test_units_zero_and_indices(self):
        p=np.array([[1.,4.],[0.,0.]])
        e=evaluate(p,np.array([1,0])); self.assertEqual(e['normalized_gain'],1)
        self.assertEqual(e['zero_channel_samples'],1)
        self.assertNotIn('mean_SE_bit_s_Hz',e)
        with self.assertRaises(ValueError): evaluate(p,[2,0])
    def test_parser_fixture(self):
        import importlib.util
        spec=importlib.util.spec_from_file_location('ds',Path(__file__).resolve().parents[1]/'tutorials/03_deepsense.py')
        ds=importlib.util.module_from_spec(spec);spec.loader.exec_module(ds)
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);np.savetxt(root/'p.txt',np.arange(64))
            (root/'s.csv').write_text('beam\np.txt\n')
            rows,power,valid=ds.load_power(root/'s.csv',root,'beam')
            self.assertEqual(power.shape,(1,64));self.assertEqual(int(power.argmax()),63)

    def test_deepmimo_forward_convention(self):
        import importlib.util
        spec=importlib.util.spec_from_file_location('dm_example',Path(__file__).resolve().parents[1]/'tutorials/01_deepmimo.py')
        module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
        f=module.dft_codebook(8)
        h=np.broadcast_to(f[:,2].conj()[None,None,:,None],(1,1,8,4))
        gain=module.beam_power(h,f)
        self.assertEqual(int(gain.argmax()),2)
        self.assertAlmostEqual(float(gain.max()),1.)
        self.assertTrue(np.allclose(module.beam_power(np.zeros_like(h),f),0))

if __name__ == '__main__': unittest.main()
