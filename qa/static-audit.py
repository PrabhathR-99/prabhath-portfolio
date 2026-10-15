from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import collections,re,subprocess
root=Path(__file__).resolve().parents[1]/'dist'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.scope='live';self.templates=[];self.tags=[];self.ids=collections.defaultdict(list)
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='template':self.templates.append(self.scope);self.scope=d.get('id','template')
  self.tags.append((tag,d,self.scope))
  if 'id' in d:self.ids[self.scope].append(d['id'])
 def handle_endtag(self,tag):
  if tag=='template' and self.templates:self.scope=self.templates.pop()
errors=[];counts=collections.Counter()
for f in root.rglob('*.html'):
 p=Page();p.feed(f.read_text());counts['pages']+=1
 for scope,ids in p.ids.items():
  for id,n in collections.Counter(ids).items():
   if n>1:errors.append((str(f.relative_to(root)),scope,'duplicate id',id))
 for tag,d,scope in p.tags:
  for attr in ['src','href','data-banner-image','data-award-image']:
   val=d.get(attr,'')
   if not val:continue
   u=urlsplit(val)
   if u.scheme or u.netloc:continue
   if not u.path:
    if u.fragment and u.fragment not in p.ids[scope] and u.fragment not in p.ids['live']:
     errors.append((str(f.relative_to(root)),scope,'anchor',val))
    continue
   path=root/unquote(u.path.lstrip('/')) if u.path.startswith('/') else f.parent/unquote(u.path)
   if path.is_dir():path=path/'index.html'
   counts['local refs']+=1
   if not path.exists():errors.append((str(f.relative_to(root)),scope,'missing '+attr,val))
  if tag=='img' and 'alt' not in d:errors.append((str(f.relative_to(root)),scope,'missing alt',d.get('src')))
  if tag=='a' and d.get('target')=='_blank' and 'noopener' not in d.get('rel',''):errors.append((str(f.relative_to(root)),scope,'unsafe blank',d.get('href')))
for f in root.glob('*.css'):
 for val in re.findall(r'url\([\'"]?([^\)\'\"]+)',f.read_text()):
  if val.startswith(('data:','http','%23')):continue
  p=root/val.lstrip('/') if val.startswith('/') else f.parent/val
  if not p.exists():errors.append((str(f.relative_to(root)),'css','missing url',val))
for f in root.glob('*.js'):
 r=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
 if r.returncode:errors.append((str(f),'syntax',r.stderr))
 counts['scripts']+=1
print(dict(counts))
for error in errors:print(error)
print('Total findings',len(errors))
assert not errors, 'Static audit failed'
