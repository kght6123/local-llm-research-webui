import { useEffect, useState } from "react";
import Versions from "./components/Versions";
import electronLogo from "./assets/electron.svg";
import ollama from "ollama/browser";

import "./App.css";
import { OperationProgress } from "src/types";

function App(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [counter, setCounter] = useState<number>(0);
  useEffect(() => {
    // カスタムAPIを実行する
    window.api.ping().then((r) => setMessage(r));
    // window.api
    //   .run("自己紹介をしてください。")
    //   // .textGeneration("自己紹介をしてください。")
    //   .then((r) => setMessage(r));

    window.api.onUpdateCounter((value) => {
      setCounter((oldValue: number): number => {
        return oldValue + value;
      });
      window.api.counterValue(counter + value);
    });

    window.api.onUpdateMessage((value) => {
      console.log("value", value);
      setMessage(value);
    });

    // メインプロセスに応答なしでメッセージを送信
    window.electron.ipcRenderer.send("electron:say", "hello");

    // メインプロセスに非同期でメッセージを送信
    window.electron.ipcRenderer.invoke("doAThing", ["aaa"]).then((re) => {
      console.log(re);
    });

    // Receive messages from the main process
    const reply = (_event, args): void => {
      alert(args);
      console.log(args);
    };
    const removeListener = window.electron.ipcRenderer.on("reply", reply);

    return (): void => {
      // Remove a listener
      removeListener();
    };
  }, []);

  const [progress, setProgress] = useState<OperationProgress>();
  useEffect(() => {
    window.api.onUpdateProgress((value) => {
      setProgress(value);
    });
  }, []);

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      {message && <p className="font-black text-xl">{message}</p>}
      {progress && (
        <p>
          {progress.status}...
          {progress.status === "download" || progress.status === "pull"
            ? `${Math.round((progress.completed || 0 / progress.total || 0) * 100)}%`
            : progress.value}
        </p>
      )}
      <button
        onClick={() =>
          window.api
            .textGeneration("自己紹介をしてください。")
            .then((r) => setMessage(r))
        }
      >
        Text Generation
      </button>
      <button
        onClick={() =>
          window.api.run("自己紹介をしてください。").then((r) => setMessage(r))
        }
      >
        Text Classification
      </button>
      <button onClick={() => window.api.install().then((r) => setMessage(r))}>
        Install Ollama
      </button>
      <button
        onClick={() =>
          ollama
            .pull({
              model: "llama3.2:1b",
              stream: true,
            })
            .then(async (stream) => {
              for await (const chunk of stream) {
                // setMessage(
                //   `${chunk.digest}/${chunk.total} ${chunk.status} completed=${chunk.completed}`,
                // );
                setProgress({
                  completed: chunk.completed,
                  total: chunk.total,
                  status: "pull",
                  value: chunk.digest,
                });
              }
            })
            .finally(() => {
              setProgress({
                completed: 0,
                total: 0,
                status: "done",
                value: "",
              });
            })
        }
      >
        Ollama Pull
      </button>
      {/* huggingface.co/{ユーザー名}/{リポジトリ名} */}
      <button
        onClick={() =>
          ollama
            .pull({
              model: "huggingface.co/MaziyarPanahi/gemma-2-2b-it-GGUF:IQ1_M",
              stream: true,
            })
            .then(async (stream) => {
              for await (const chunk of stream) {
                // setMessage(
                //   `${chunk.digest} ${chunk.completed}/${chunk.total} ${chunk.status}`,
                // );
                setProgress({
                  completed: chunk.completed,
                  total: chunk.total,
                  status: "pull",
                  value: chunk.digest,
                });
              }
            })
            .finally(() => {
              setProgress({
                completed: 0,
                total: 0,
                status: "done",
                value: "",
              });
            })
        }
      >
        Ollama Huggingface Pull
      </button>
      <button
        onClick={() => {
          setMessage("");
          ollama
            .chat({
              model: "llama3.2:1b",
              messages: [{ role: "user", content: "Why is the sky blue?" }],
              stream: true,
            })
            .then(async (stream) => {
              for await (const chunk of stream) {
                setMessage((message) => {
                  return (message += chunk.message.content);
                });
              }
            });
        }}
      >
        Ollama Chat
      </button>
      <button
        onClick={() => {
          setMessage("");
          ollama
            .chat({
              model: "huggingface.co/MaziyarPanahi/gemma-2-2b-it-GGUF:IQ1_M",
              messages: [{ role: "user", content: "Why is the sky blue?" }],
              stream: true,
            })
            .then(async (stream) => {
              for await (const chunk of stream) {
                setMessage((message) => {
                  return (message += chunk.message.content);
                });
              }
            });
        }}
      >
        Ollama Huggingface Chat
      </button>
      Current value: <strong>{counter}</strong>
      <Versions></Versions>
    </>
  );
}

export default App;
