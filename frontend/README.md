# local-llm-research-webui

ローカル環境で動作する大規模言語モデル（LLM）向けのデスクトップアプリケーションです。
Electron と React/TypeScript を組み合わせ、バンドルされた Python 実行環境でローカル LLM を実行・管理できます。

## 📚 おすすめ開発環境

- VSCode
- ESLint（`dbaeumer.vscode-eslint`）
- Prettier（`esbenp.prettier-vscode`）

## 🗂 リポジトリ構成

```text
. 
├── frontend/                       # メインの Electron アプリケーション
│   ├── build/                     # パッケージング用アセット（アイコン、entitlements.plist など）
│   ├── dist/                      # 配布成果物およびバンドルされた Python ランタイム
│   ├── out/                       # トランスパイル後の main プロセスコード
│   ├── resources/                 # 静的リソース
│   ├── src/                       # ソースコード
│   │   ├── main/                  # Electron main プロセス（ウィンドウ管理、IPC、アップデート）
│   │   ├── preload/               # Preload スクリプト（安全な IPC ブリッジ）
│   │   └── renderer/              # React ベースの UI（HTML、TSX、CSS、コンポーネント）
│   ├── package.json               # 依存関係 & npm スクリプト
│   ├── tsconfig.*.json            # TypeScript 設定（Node & Web）
│   ├── electron.vite.config.ts    # Electron 向け Vite 設定
│   ├── electron-builder.yml       # Electron-Builder 設定
│   ├── vite.config.ts             # Vite 設定（renderer 用）
│   ├── tailwind.config.js         # Tailwind CSS 設定
│   └── postcss.config.js          # PostCSS 設定
└── local-llm-research-webui.code-workspace  # VSCode ワークスペース設定
```

## ⚙️ 技術スタック

- Electron: クロスプラットフォームのデスクトップアプリケーション
- React + TypeScript + Vite: UI 開発およびバンドル
- Tailwind CSS: ユーティリティファーストのスタイリング
- Electron-Builder: アプリケーションのパッケージング
- Node.js: main プロセスのスクリプト
- Python: ローカル LLM 実行環境（`dist/_internal/` に同梱）

## 🚀 開発 & 実行

```bash
cd frontend
npm install           # 依存パッケージのインストール
npm run dev           # Electron アプリを開発モードで起動
npm run dev:web       # ブラウザ上で renderer を起動
```

## 📦 ビルド & パッケージング

```bash
npm run build         # 型チェックとビルド（main & renderer）
npm run build:win     # Windows 用パッケージを生成
npm run build:mac     # macOS 用パッケージを生成
npm run build:linux   # Linux 用パッケージを生成
```

## ℹ️ 追加情報

- 自動アップデート設定: `dev-app-update.yml` および `electron-builder.yml`
- Python ランタイムと依存ライブラリは `frontend/dist/_internal/` にバンドル
- `CLAUDE.md` および `MEMO.md` に研究メモやモデル統合の詳細を記載

---
*この README は新規参加者がプロジェクトの構成と主要コンポーネントを理解しやすくするための概要です。*
