from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
import plistlib,re,json,statistics,hashlib
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'public/assets'
def nums(v): return list(map(int,re.findall(r'-?\d+',v)))
def actor(name,scale):
    data=plistlib.loads((ASSETS/'actors'/f'{name}.plist').read_bytes())
    image=Image.open(ASSETS/'actors'/f'{name}.png').convert('RGBA')
    frames={}; animations={a:[] for a in ['idle','run','attack','cast','hit','death']}; feet=[]
    for frame,v in data['frames'].items():
        x,y,w,h=nums(v['frame']); sx,sy,sw,sh=nums(v['sourceColorRect']); ow,oh=nums(v['sourceSize'])
        frames[frame]={'frame':{'x':x,'y':y,'w':w,'h':h},'rotated':v['rotated'],'trimmed':(sw,sh)!=(ow,oh),'spriteSourceSize':{'x':sx,'y':sy,'w':sw,'h':sh},'sourceSize':{'w':ow,'h':oh}}
        for a in animations:
            if f'_{a}_' in frame: animations[a].append(frame)
        if '_idle_' in frame:
            bbox=image.crop((x,y,x+w,y+h)).getbbox()
            if bbox: feet.append((bbox[3]+sy)/oh)
    for a in animations: animations[a].sort()
    if not animations['cast']: animations['cast']=animations['attack'].copy()
    atlas={'frames':frames,'meta':{'app':'Tag Quest asset converter','image':name+'.png','format':'RGBA8888','size':{'w':image.width,'h':image.height},'scale':'1'}}
    (ASSETS/'actors'/f'{name}.json').write_text(json.dumps(atlas,separators=(',',':')))
    return {'key':name,'image':f'assets/actors/{name}.png','atlas':f'assets/actors/{name}.json','animations':animations,'fps':{'idle':10,'run':12,'attack':24,'cast':18,'hit':12,'death':20},'scale':scale,'origin':{'x':.5,'y':round(statistics.median(feet),3)}}
hero=actor('f1_general',3)
enemies=[actor(n,s) for n,s in [('neutral_golemnature',3.2),('boss_borealjuggernaut',3),('boss_cindera',3),('boss_chaosknight',3)]]
regions=[('verdant','Verdant Ruins','A lost garden above the clouds','shimzar','#9fd783','neutral_golemnature'),('glacier','Frostfall Citadel','The frozen sentinel waits','vanar','#83dce7','boss_borealjuggernaut'),('ember','Ember Reach','Cross the highlands to the redstone forge','redrock','#efa16e','boss_cindera'),('void','Hollow Gate','Restore the final seal','abyssian','#d693d8','boss_chaosknight')]
biomes=[];canvas=Image.new('RGB',(1440,1000),'#161d26');draw=ImageDraw.Draw(canvas)
for i,(id,name,subtitle,theme,accent,enemyKey) in enumerate(regions):
    ground=Image.open(ASSETS/'environments'/f'{theme}-midground.png').convert('RGBA')
    if ground.size!=(1920,1080):
        norm=Image.new('RGBA',(1920,1080));ground.thumbnail((1850,1080));norm.alpha_composite(ground,((1920-ground.width)//2,1080-ground.height));ground=norm
    ground.save(ASSETS/'environments'/f'{id}-ground.png',optimize=True)
    biome={'id':id,'name':name,'subtitle':subtitle,'background':f'assets/environments/{id}-explore.jpg','battleBackground':f'assets/environments/{theme}-background.jpg','ground':f'assets/environments/{id}-ground.png','accent':accent,'enemyKey':enemyKey,'walkBounds':{'cx':.5,'cy':.57,'rx':.27,'ry':.17}}
    biomes.append(biome)
    for j,key in enumerate(['background','battleBackground']):
        bg=Image.open(ROOT/'public'/biome[key]).convert('RGBA').resize((1920,1080),Image.Resampling.LANCZOS)
        bg.alpha_composite(ground)
        sample=bg.convert('RGB');sample.thumbnail((710,216))
        canvas.paste(sample,(j*720,i*250+28));draw.text((j*720+8,i*250+8),f'{name} / '+('EXPLORE' if j==0 else 'BATTLE'),fill=accent)
manifest={'source':{'repository':'https://github.com/open-duelyst/duelyst','commit':'2843f2400854136598631288c2e8dfb8f5173de7','license':'CC0-1.0'},'hero':hero,'enemies':enemies,'biomes':biomes}
for file in [ASSETS/'manifest.json',ROOT/'ASSET_MANIFEST.json']: file.write_text(json.dumps(manifest,indent=2))
canvas.save(ASSETS/'environment-contact-sheet.jpg',quality=92)
# Rebuild complete source list including four exploration images.
from download_assets import items,BASE
extra={'verdant':'shimzar/bg','glacier':'frostfire/background','ember':'magaari_ember_highlands/magaari_ember_highlands_background','void':'obsidian_woods/obsidian_woods_background'}
for id,source in extra.items(): items[f'environments/{id}-explore.jpg']=f'app/resources/scenes/{source}.jpg'
records=[]
for dest,source in items.items():
    p=ASSETS/dest
    records.append({'local':'assets/'+dest,'source':BASE+source,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(ASSETS/'sources.json').write_text(json.dumps(records,indent=2))
print('Ready: 4 environments, 4 bosses,',sum(len(a['animations']['attack']) for a in [hero]+enemies),'attack frames; source files',len(records))
