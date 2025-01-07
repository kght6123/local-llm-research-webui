import { useEffect, useState } from "react";
import Versions from "./components/Versions";
import electronLogo from "./assets/electron.svg";
import ollama from "ollama/browser";

import "./App.css";
import { OperationProgress } from "src/types";

function App(): JSX.Element {
  const [message, setMessage] = useState<string>("");
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
      <Versions></Versions>
    </>
  );
}

export default App;
