import { useEffect, useState } from "react";
import Versions from "./components/Versions";
import ollama from "ollama/browser";

import { OperationProgress } from "src/types";
import { ToggleLabel } from "./components/atoms/ToggleLabel";

function App(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [progress, setProgress] = useState<OperationProgress>();
  useEffect(() => {
    window.api.onUpdateProgress((value) => {
      setProgress(value);
    });
  }, []);
  const [isPressed, setPressed] = useState<boolean>(false);
  const [isPressed1, setPressed1] = useState<boolean>(false);
  const [isPressed2, setPressed2] = useState<boolean>(false);
  return (
    <>
      {/* サイドバー https://x.com/kght6123/status/1600129834050416640 */}
      <div
        className="flex h-screen w-screen bg-gray-900"
        style={
          {
            "--sidebar-size": "280px",
            "--sidebar-mini-size": "4rem",
          } as React.CSSProperties
        }
      >
        <input
          type="checkbox"
          id="sidebar"
          className="peer/sidebar"
          checked={isPressed}
          // onChange={(e) => {console.log(e.target.checked);setPressed(e.target.checked)}}
        />
        <div className="h-screen bg-gray-800 transition-all peer-checked/sidebar:w-[var(--sidebar-size)] peer-[:not(:checked)]/sidebar:w-0 sm:peer-checked/sidebar:w-0 sm:peer-[:not(:checked)]/sidebar:w-[var(--sidebar-size)]">
          <ToggleLabel
            className="flex p-4 text-white"
            htmlFor="sidebar"
            isPressed={isPressed1}
            onPressChange={(isPressed1) => {
              console.log("isPressed1", isPressed1, isPressed2);
              // setPressed(isPressed1 === isPressed2);
              // setPressed1(isPressed1);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
              />
            </svg>
            <span className="pl-4">メニューの開閉</span>
          </ToggleLabel>
          <div className="p-2 text-white">PC/Tablet向け</div>
        </div>
        <div className="h-screen bg-gray-900 transition-all peer-checked/sidebar:w-0 peer-[:not(:checked)]/sidebar:w-[var(--sidebar-mini-size)] sm:peer-checked/sidebar:w-[var(--sidebar-mini-size)] sm:peer-[:not(:checked)]/sidebar:w-0">
          <ToggleLabel
            className="flex p-4 text-white"
            htmlFor="sidebar"
            isPressed={isPressed2}
            onPressChange={(isPressed2) => {
              console.log("isPressed2", isPressed2, isPressed1);
              // setPressed(isPressed2 === isPressed1);
              // setPressed2(isPressed2);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
              />
            </svg>
          </ToggleLabel>
          <div className="p-1 text-white">Mobile向け</div>
        </div>
        <div className="h-screen bg-white p-4 transition-all peer-checked/sidebar:w-[calc(100vw-var(--sidebar-size))] peer-[:not(:checked)]/sidebar:w-[calc(100vw-var(--sidebar-mini-size))] sm:peer-checked/sidebar:w-[calc(100vw-var(--sidebar-mini-size))] sm:peer-[:not(:checked)]/sidebar:w-[calc(100vw-var(--sidebar-size))]">
          {/* 本体コンテンツ */}
          {message && <p className="font-black text-xl">{message}</p>}
          {progress && (
            <p>
              {progress.status}...
              {progress.status === "download" || progress.status === "pull"
                ? `${Math.round(((progress.completed || 0) / (progress.total || 0)) * 100)}%`
                : progress.value}
            </p>
          )}
          <button
            onClick={() => window.api.install().then((r) => setMessage(r))}
          >
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
                  model:
                    "huggingface.co/MaziyarPanahi/gemma-2-2b-it-GGUF:IQ1_M",
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
                  model:
                    "huggingface.co/MaziyarPanahi/gemma-2-2b-it-GGUF:IQ1_M",
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
        </div>
      </div>
    </>
  );
}

export default App;
