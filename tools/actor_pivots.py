from pathlib import Path
from PIL import Image
import plistlib,re,statistics
root=Path('tag-quest-game/public/assets/actors')
for p in root.glob('*.plist'):
 data=plistlib.loads(p.read_bytes());im=Image.open(p.with_suffix('.png')).convert('RGBA');bbox=[]
 for n,v in data['frames'].items():
  if '_idle_' in n:
   x,y,w,h=map(int,re.findall(r'-?\d+',v['frame'])); crop=im.crop((x,y,x+w,y+h));bbox.append(crop.getbbox())
 print(p.stem,bbox[:2])
