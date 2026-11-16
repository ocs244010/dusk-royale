# ダスクロワイヤル 未来版

ブラウザで遊ぶバトルロイヤルFPS。three.js（r128）を同梱しているので、1人で遊ぶだけならインターネットなしでも動く（タイトル画面のフォントだけはネットがないと標準フォントになる）。友達とのオンライン対戦にはインターネットが必要。

## VS Code で動かす

1. このフォルダを VS Code で開く（ファイル → フォルダーを開く）
2. 右下に「推奨拡張機能」の案内が出たら **Live Server** をインストール
3. `index.html` を右クリック →「Open with Live Server」
4. ブラウザが開いてゲームが始まる

`index.html` をダブルクリックして直接開いても動くことが多いが、ブラウザによってはファイルの読み込みが止められるので Live Server がおすすめ。

## 友達と対戦する（オンライン・2〜4人）

友達がURLで開けるように、GitHub Pages で公開する。Live Server の `127.0.0.1` のURLは自分のPCの中でしか開けない。

1. GitHub で新しいリポジトリを作る（Public にする。例：`dusk-royale`）
2. リポジトリの画面で「Add file」→「Upload files」を押し、このフォルダの中身（`index.html`、`lib`、`src` など）をまとめてドラッグして「Commit changes」
3. 「Settings」→「Pages」→ Branch を `main`、フォルダを `/ (root)` にして「Save」
4. 1〜2分後、`https://ユーザー名.github.io/dusk-royale/` で開けるようになる

遊び方
1. 1人がそのURLを開き、名前を入れて「部屋を作る」
2. 出てきた「招待URLをコピー」を友達に送る（部屋コード5文字を伝えて「入る」でもよい）
3. 全員そろったら、部屋を作った人が「全員で出撃する」。足りない人数はCPUが入る
4. 試合が終わったら、部屋を作った人の「全員でもう一度」で続けて遊べる

しくみ：部屋を作った人のPCが試合（CPU・アイテム・安全地帯）を動かし、ほかの人とは PeerJS（WebRTC）で直接つながる。部屋を作った人がページを閉じると全員の試合が終わる。学校や会社のネットワークでは、つながらないことがある。

## コードを直すとき

ゲームの中身は `src/` に分かれている。`index.html` はそれをつなげて作ったもの。

| ファイル | 中身 |
|---|---|
| `src/br_head.html` | 画面のHTMLとCSS（タイトル、HUD、メニュー） |
| `src/engine.js` | マップ生成、地形、建物・構造物・地区、植物、空 |
| `src/br.js` | ゲーム本体（プレイヤー操作、武器、CPU、安全地帯、降下） |
| `src/net.js` | オンライン対戦（部屋づくり・同期） |
| `src/glb.js` | 兵士の3Dモデル（base64） |
| `lib/` | three.js と読み込み用の追加スクリプト |

`src/` を直したら、ターミナルで

```
python build.py
```

（Windows で `python` が無いと言われたら `py build.py`）を実行すると `index.html` が作り直される。`Ctrl+Shift+B` でも同じことができる。Live Server を開いたままならブラウザが自動で再読み込みされる。

`index.html` を直接直してもよいが、その後 `build.py` を実行すると上書きされるので注意。

## ライセンス

`lib/` の three.js と PeerJS は MIT ライセンス（`lib/LICENSE-three.txt`、`lib/LICENSE-peerjs.txt`）。
