import sys
sys.path.insert(0,'tag-quest-game/tools')
from download_assets import fetch
from PIL import Image,ImageDraw
names={'verdant':'shimzar/bg','glacier':'frostfire/background','ember':'magaari_ember_highlands/magaari_ember_highlands_background','void':'obsidian_woods/obsidian_woods_background'}
canvas=Image.new('RGB',(1000,600));d=ImageDraw.Draw(canvas)
for i,(name,p) in enumerate(names.items()):
 r=fetch((f'environments/{name}-explore.jpg',f'app/resources/scenes/{p}.jpg'))
 im=Image.open('tag-quest-game/public/'+r['local']);print(name,im.size,r['bytes']);im.thumbnail((500,275));canvas.paste(im,((i%2)*500,(i//2)*300+20));d.text(((i%2)*500+5,(i//2)*300+3),name,fill='white')
canvas.save('tag-quest-game/public/assets/exploration-research.jpg')
