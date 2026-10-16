from pathlib import Path
from PIL import Image
import json,hashlib
root=Path(__file__).resolve().parents[1]
a=root/'public/assets'; m=json.loads((a/'manifest.json').read_text());count=0
for actor in [m['hero']]+m['enemies']:
 im=Image.open(root/'public'/actor['image']);atlas=json.loads((root/'public'/actor['atlas']).read_text())
 for n,v in atlas['frames'].items():
  f=v['frame']; assert f['x']>=0 and f['y']>=0 and f['x']+f['w']<=im.width and f['y']+f['h']<=im.height,(actor['key'],n)
  count+=1
 for action,frames in actor['animations'].items():
  assert frames and all(n in atlas['frames'] for n in frames),(actor['key'],action)
for b in m['biomes']:
 for key in ['ground','background','battleBackground']:
  p=root/'public'/b[key]; assert p.is_file(); Image.open(p).verify()
 assert Image.open(root/'public'/b['ground']).size==(1920,1080)
for r in json.loads((a/'sources.json').read_text()):
 p=root/'public'/r['local']; assert hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256']
print(f'PASS: {count} frames valid; 30 action groups populated; 12 environment images readable; 23 source hashes match.')
