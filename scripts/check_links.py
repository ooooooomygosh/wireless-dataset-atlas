"""Check source landing URLs only. Never download original datasets."""
import json, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=json.loads((root/'data/atlas.json').read_text())

def check(s):
    try:
        req=urllib.request.Request(s['url'],method='HEAD',headers={'User-Agent':'WirelessDatasetAtlas/1.0 source-link-check'})
        with urllib.request.urlopen(req,timeout=15) as r:
            return s['id'],dict(httpStatus=r.status,finalUrl=r.url,linkCheck='可访问',linkCheckedAt='2026-11-05')
    except urllib.error.HTTPError as e:
        return s['id'],dict(httpStatus=e.code,linkCheck='访问限制/需浏览器核验' if e.code in [401,403,429,405] else 'HTTP错误/需复核',linkCheckedAt='2026-11-05')
    except Exception as e:
        return s['id'],dict(linkCheck='连接失败/需复核',linkError=type(e).__name__,linkCheckedAt='2026-11-05')
cache_path=root/'data/link-checks.json'
cache=json.loads(cache_path.read_text()) if cache_path.exists() else {}
by_url={x.get('url'):x for x in cache.values()}
pending=[s for s in p['sources'] if s['url'] not in by_url]
with ThreadPoolExecutor(max_workers=6) as pool:
    fresh=dict(pool.map(check,pending))
checks={}
for source in p['sources']:
    checks[source['id']]=dict(by_url.get(source['url']) or fresh[source['id']])
    checks[source['id']]['url']=source['url']
(root/'data/link-checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2))
for source in p['sources']:source.update(checks[source['id']])
(root/'data/atlas.json').write_text(json.dumps(p,ensure_ascii=False,indent=2))
print('Checks:',len(checks));print({k:sum(v['linkCheck']==k for v in checks.values()) for k in set(v['linkCheck'] for v in checks.values())})
