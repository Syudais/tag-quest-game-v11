from pathlib import Path
import urllib.request, concurrent.futures, json
ROOT=Path(__file__).resolve().parents[1]
BASE='https://raw.githubusercontent.com/open-duelyst/duelyst/2843f2400854136598631288c2e8dfb8f5173de7/'
items={}
for theme in ['shimzar','vanar','redrock','abyssian']:
    for layer,ext in [('background','jpg'),('midground','png')]:
        items[f'environments/{theme}-{layer}.{ext}']=f'app/resources/maps/{theme}/{layer}.{ext}'
for actor in ['f1_general','neutral_golemnature','boss_cindera','boss_borealjuggernaut','boss_chaosknight']:
    for ext in ['png','plist']:
        items[f'actors/{actor}.{ext}']=f'app/resources/units/{actor}.{ext}'
items['licenses/DUELYST-CC0.txt']='LICENSE'
def fetch(pair):
    dest,source=pair
    path=ROOT/'public/assets'/dest
    path.parent.mkdir(parents=True,exist_ok=True)
    if not path.exists():
        with urllib.request.urlopen(BASE+source, timeout=60) as r: path.write_bytes(r.read())
    return {'local':'assets/'+dest,'source':BASE+source,'bytes':path.stat().st_size}
if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        records=list(pool.map(fetch,items.items()))
    (ROOT/'public/assets/sources.json').write_text(json.dumps(records,indent=2))
    print('Downloaded',len(records),'files;',sum(r['bytes'] for r in records),'bytes')
