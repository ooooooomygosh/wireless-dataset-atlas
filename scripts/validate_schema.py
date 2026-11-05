"""Optional full JSON Schema check: pip install jsonschema==4.25.1."""
import json
from pathlib import Path
import jsonschema

root = Path(__file__).resolve().parents[1]
jsonschema.validate(json.loads((root/'data/atlas.json').read_text()),
                    json.loads((root/'data/schema.json').read_text()))
print('JSON Schema validation passed')
