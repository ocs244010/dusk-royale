"""src/ のファイルをつなげて index.html を作り直すスクリプト。
使い方: VS Code のターミナルで  python build.py
"""
from pathlib import Path
D = Path(__file__).parent
S = D / "src"
head = (S / "br_head.html").read_text(encoding="utf8")
glb = (S / "glb.js").read_text(encoding="utf8")
engine = (S / "engine.js").read_text(encoding="utf8")
game = (S / "br.js").read_text(encoding="utf8")
ERRBOX = """<script>
(function(){function show(m){var d=document.getElementById('errbox');if(!d){d=document.createElement('div');d.id='errbox';d.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#3a0d12;color:#ffd6d6;border:1px solid #ff6b6b;border-radius:6px;padding:10px 12px;font:13px/1.5 monospace;white-space:pre-wrap;max-height:40vh;overflow:auto';(document.body||document.documentElement).appendChild(d);d.textContent='エラーが出ました。この文章をそのままClaudeに送ってください。\\n\\n'}d.textContent+=m+'\\n'}
window.addEventListener('error',function(e){if(!e.message)return;show((e.message||'error')+(e.filename?'  ('+e.filename.split('/').pop()+':'+e.lineno+':'+e.colno+')':'')+(e.error&&e.error.stack?'\\n'+e.error.stack.split('\\n').slice(0,4).join('\\n'):''))},true);
window.addEventListener('unhandledrejection',function(e){show('Promise: '+(e.reason&&(e.reason.stack||e.reason.message)||e.reason))});
window.addEventListener('load',function(){setTimeout(function(){if(typeof THREE==='undefined')show('three.js が読み込めていません（lib フォルダがあるか確認）');else{try{var c=document.createElement('canvas');if(!(c.getContext('webgl2')||c.getContext('webgl')))show('このブラウザ／表示ではWebGLが使えません。ChromeやEdgeで開いてください');}catch(x){}}},500)});
})();
</script>
"""
html = (
    '<!doctype html>\n<html lang="ja">\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    + ERRBOX
    + head
    + '<script src="lib/three.min.js"></script>\n'
    + '<script src="lib/GLTFLoader.js"></script>\n'
    + '<script src="lib/SkeletonUtils.js"></script>\n'
    + "<script>\n" + glb + "</script>\n"
    + "<script>\n(()=>{\n" + engine + game + "</script>\n"
    # Live Server inserts its reload script just before </body>; without it, it picks an </svg> inside the game code and breaks it
    + "</body>\n</html>\n"
)
(D / "index.html").write_text(html, encoding="utf8")
print("index.html を作り直しました")
