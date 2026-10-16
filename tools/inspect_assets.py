from pathlib import Path
from PIL import Image, ImageDraw
import plistlib,re,collections
root=Path('tag-quest-game/public/assets')
canvas=Image.new('RGB',(1000,1200),'#252323'); d=ImageDraw.Draw(canvas)
for i,t in enumerate(['shimzar','vanar','redrock','abyssian']):
 for j,layer in enumerate(['background','midground']):
  p=next((root/'environments').glob(f'{t}-{layer}.*')); im=Image.open(p); print(p.name,im.size,im.mode)
  im.thumbnail((495,260)); canvas.paste(im,(j*500,i*300+25),im if im.mode=='RGBA' else None);d.text((j*500+5,i*300+5),p.name,fill='white')
canvas.save('tag-quest-game/public/assets/environment-research.jpg')
for p in (root/'actors').glob('*.plist'):
 data=plistlib.loads(p.read_bytes()); groups=collections.Counter(re.sub(r'_\d+\.png$','',n).removeprefix(p.stem+'_') for n in data['frames']);print(p.name,groups,data['metadata'])
