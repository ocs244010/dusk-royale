# ダスクロワイヤル 未来版

ブラウザで遊ぶバトルロイヤルFPS。three.js（r128）を同梱しているので、インターネットにつながっていなくても動く（タイトル画面のフォントだけはネットがないと標準フォントになる）。

## VS Code で動かす

1. このフォルダを VS Code で開く（ファイル → フォルダーを開く）
2. 右下に「推奨拡張機能」の案内が出たら **Live Server** をインストール
3. `index.html` を右クリック →「Open with Live Server」
4. ブラウザが開いてゲームが始まる

`index.html` をダブルクリックして直接開いても動くことが多いが、ブラウザによってはファイルの読み込みが止められるので Live Server がおすすめ。

## コードを直すとき

ゲームの中身は `src/` に分かれている。`index.html` はそれをつなげて作ったもの。

| ファイル | 中身 |
|---|---|
| `src/br_head.html` | 画面のHTMLとCSS（タイトル、HUD、メニュー） |
| `src/engine.js` | マップ生成、地形、建物・構造物・地区、植物、空 |
| `src/br.js` | ゲーム本体（プレイヤー操作、武器、CPU、安全地帯、降下） |
| `src/glb.js` | 兵士の3Dモデル（base64） |
| `lib/` | three.js と読み込み用の追加スクリプト |

`src/` を直したら、ターミナルで

```
python build.py
```

（Windows で `python` が無いと言われたら `py build.py`）を実行すると `index.html` が作り直される。`Ctrl+Shift+B` でも同じことができる。Live Server を開いたままならブラウザが自動で再読み込みされる。

`index.html` を直接直してもよいが、その後 `build.py` を実行すると上書きされるので注意。

## ライセンス

`lib/` の three.js は MIT ライセンス（`lib/LICENSE-three.txt`）。
