import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import * as https from "https";
import * as os from "os";

/**
 * GitHub API (最新リリース取得) のエンドポイント
 * ここでは ollama/ollama の例
 */
const LATEST_RELEASE_URL =
  "https://api.github.com/repos/ollama/ollama/releases/latest";

/**
 * Windows用に配布されているアセット名 (例: OllamaSetup.exe)
 * ここでは名称を直接指定
 */
const WINDOWS_EXE_NAME = "OllamaSetup.exe";

/**
 * ユーザのホームディレクトリ (Windows: C:\Users\<Username>)
 * ダウンロード先として "Downloads" フォルダを使う例
 */
const homedir = os.homedir();
const downloadDir = path.join(homedir, "Downloads");
const exeFilePath = path.join(downloadDir, WINDOWS_EXE_NAME);

/**
 * 1. GitHub API から最新リリースの JSON を取得し、
 *    アセット一覧から 'OllamaSetup.exe' のダウンロードURLを返す関数
 */
async function getLatestWindowsExeUrl(): Promise<string> {
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
                `最新リリース情報の取得に失敗しました (status: ${res.statusCode})`,
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
              // data.assets はアセットの配列
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const assets: any[] = data.assets || [];
              // アセット名が "OllamaSetup.exe" のものを探す
              const winAsset = assets.find(
                (asset) => asset.name === WINDOWS_EXE_NAME,
              );

              if (!winAsset) {
                return reject(
                  new Error(
                    `最新リリースに ${WINDOWS_EXE_NAME} が見つかりませんでした。`,
                  ),
                );
              }

              // ダウンロードURL (browser_download_url) を返す
              const downloadUrl: string = winAsset.browser_download_url;
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
 * 2. ダウンロード (302リダイレクト対応)
 */
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // ダウンロード先フォルダを作成 (なければ)
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);

    https
      .get(url, (res) => {
        const statusCode = res.statusCode ?? 0;

        // 3xx (301, 302など) のリダイレクト
        if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
          const redirectUrl = res.headers.location;
          console.log(`リダイレクト (${statusCode}): ${redirectUrl}`);
          file.close();
          fs.unlinkSync(dest);
          return downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        }

        // 200番台以外はエラー扱い
        if (statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(
            new Error(
              `ダウンロードに失敗しました。ステータスコード: ${statusCode}`,
            ),
          );
        }

        // ダウンロード開始
        res.pipe(file);
        const size = parseInt(res.headers["content-length"] || "0", 10);
        let currentLength = 0;
        console.log(`ダウンロードサイズ: ${size} bytes`);
        res.on("data", (chunk) => {
          currentLength += chunk.length;
          console.log(
            `ダウンロード中: ${(currentLength / size) * 100}% ${chunk.length} bytes`,
          );
        });
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
 * 3. EXEファイルを起動 (インストーラを開始)
 *    "cmd /c start <exePath>" で別ウィンドウで実行
 */
function runExe(exePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`起動コマンド: start ${exePath}`);
    // start コマンドはすぐに戻るため、セットアップ完了を待ちたい場合は別途工夫が必要。
    const child = spawn("cmd", ["/c", "start", exePath], {
      stdio: "ignore",
      shell: false,
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`EXE の起動に失敗しました (終了コード: ${code})`),
        );
      }
      resolve();
    });
  });
}

export default async function main(): Promise<void> {
  try {
    // 1. 最新リリース情報から Windows 用 EXE のダウンロードURLを取得
    console.log("最新の Windows 用 EXE を取得しています...");
    const latestExeUrl = await getLatestWindowsExeUrl();
    console.log(`ダウンロードURL: ${latestExeUrl}`);

    // 2. ダウンロード (302リダイレクトにも対応)
    console.log("ダウンロードを開始します...");
    await downloadFile(latestExeUrl, exeFilePath);

    // 3. ダウンロードした EXE (セットアップファイル) を起動
    console.log("EXE を起動します (セットアップ開始)...");
    await runExe(exeFilePath);

    console.log("Ollama のセットアップを開始しました。");
    console.log("インストーラ画面に従ってセットアップを完了してください。");
  } catch (err) {
    console.error("エラーが発生しました:", err);
  }
}
