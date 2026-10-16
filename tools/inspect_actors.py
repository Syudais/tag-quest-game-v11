from pathlib import Path
from PIL import Image,ImageDraw
import plistlib,re,collections,math
root=Path('tag-quest-game/public/assets')
canvas=Image.new('RGB',(1000,750),'#343b43');d=ImageDraw.Draw(canvas)
for row,p in enumerate((root/'actors').glob('*.plist')):
 data=plistlib.loads(p.read_bytes());im=Image.open(p.with_suffix('.png')).convert('RGBA')
 for col,action in enumerate(['idle','run','attack','death']):
  n=next(n for n in data['frames'] if f'_{action}_' in n); v=data['frames'][n]; nums=list(map(int,re.findall(r'-?\d+',v['frame'])));x,y,w,h=nums
  crop=im.crop((x,y,x+w,y+h));crop.thumbnail((150,125));canvas.paste(crop,(col*250,row*150+20),crop); d.text((col*250,row*150),f'{p.stem} {action}',fill='white')
 print(p.stem,collections.Counter(v['sourceSize'] for v in data['frames'].values()),'rotated',sum(v['rotated'] for v in data['frames'].values()))
canvas.save(root/'actors-research.jpg')
