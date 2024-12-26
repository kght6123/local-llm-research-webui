import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import * as https from "https";
import * as os from "os";

/** GitHub API: 最新リリース情報のエンドポイント */
const LATEST_RELEASE_URL =
  "https://api.github.com/repos/ollama/ollama/releases/latest";

/** ユーザのダウンロードフォルダを使用する */
const homedir = os.homedir();
const downloadDir = path.join(homedir, "Downloads");
const zipFilePath = path.join(downloadDir, "Ollama-darwin.zip");
const appPath = path.join(downloadDir, "Ollama.app");

/**
 * (1) GitHub API から最新リリースの JSON を取得し、
 *     'Ollama-darwin.zip' のダウンロードURLを返す
 */
async function getLatestDarwinZipUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(
        LATEST_RELEASE_URL,
        {
          // GitHub API は User-Agent ヘッダが必要な場合がある
          headers: { "User-Agent": "Node.js" },
        },
        (res) => {
          if (res.statusCode !== 200) {
            return reject(
              new Error(
                `最新リリース情報の取得に失敗しました。ステータスコード: ${res.statusCode}`,
              ),
            );
          }

          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });

          res.on("end", () => {
            try {
              const data = JSON.parse(body);
              // data.assets は配列。ここから 'Ollama-darwin.zip' を探す
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const assets: any[] = data.assets || [];
              const darwinAsset = assets.find(
                (asset) => asset.name === "Ollama-darwin.zip",
              );
              if (!darwinAsset) {
                return reject(
                  new Error(
                    "最新リリースに Ollama-darwin.zip が見つかりませんでした。",
                  ),
                );
              }
              // browser_download_url を取得
              const downloadUrl = darwinAsset.browser_download_url;
              resolve(downloadUrl);
            } catch (err) {
              reject(err);
            }
          });
        },
      )
      .on("error", (err) => {
        reject(err);
      });
  });
}

/**
 * (2) リダイレクトに手動対応しながらファイルをダウンロード
 */
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);

    https
      .get(url, (res) => {
        const statusCode = res.statusCode ?? 0;

        // リダイレクト対応 (301, 302 など)
        if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
          const redirectUrl = res.headers.location;
          console.log(`リダイレクト (${statusCode}): ${redirectUrl}`);
          file.close();
          fs.unlinkSync(dest);
          return downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        }

        // 200番台以外はエラー
        if (statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(
            new Error(
              `ダウンロードに失敗しました。ステータスコード: ${statusCode}`,
            ),
          );
        }

        // データをファイルへ書き込み
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => {
            console.log(`ダウンロード完了: ${dest}`);
            resolve();
          });
        });
      })
      .on("error", (err) => {
        file.close();
        fs.unlink(dest, () => reject(err));
      });
  });
}

/**
 * (3) macOS の 'open' コマンドを呼び出す
 */
function openFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`open ${filePath} を実行します...`);
    const child = spawn("open", [filePath], { stdio: "ignore" });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`open に失敗しました (終了コード: ${code})`));
      }
      resolve();
    });
  });
}

(async function main(): Promise<void> {
  try {
    // 1. GitHub API から最新リリースの 'Ollama-darwin.zip' ダウンロードURLを取得
    console.log("最新の darwin 用 ZIP を取得しています...");
    const latestZipUrl = await getLatestDarwinZipUrl();
    console.log(`ダウンロードURL: ${latestZipUrl}`);

    // 2. ZIPファイルをダウンロード (302対応)
    await downloadFile(latestZipUrl, zipFilePath);

    // 3. ZIPファイルを open で解凍 (Archive Utility を呼び出す)
    await openFile(zipFilePath);

    // 3-1. 解凍完了を簡易的に待機 (.app が生成されるまでループ)
    console.log("解凍完了を待機中...");
    const MAX_WAIT = 15; // 最大待機秒数の例
    let waited = 0;
    while (!fs.existsSync(appPath)) {
      await new Promise((r) => setTimeout(r, 1000));
      waited++;
      if (waited >= MAX_WAIT) {
        throw new Error(
          `解凍待ちタイムアウト: ${appPath} が見つかりませんでした`,
        );
      }
    }
    console.log(`.app が展開されたのを確認しました: ${appPath}`);

    // 4. Ollama.app を起動
    await openFile(appPath);
    console.log("Ollama.app を起動しました。");
  } catch (err) {
    console.error("エラーが発生しました:", err);
  }
})();
