import { useEffect, useState } from "react";
import Versions from "./components/Versions";
import ollama from "ollama/browser";
import {
  Button,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  ToggleButton,
} from "react-aria-components";

import { OperationProgress } from "src/types";
import clsx from "clsx";
import Chat from "./components/Chat";

function App(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [progress, setProgress] = useState<OperationProgress>();
  const [toggleLeftSidebar, setToggleLeftSidebar] = useState<boolean>(true);
  const [toggleRightSidebar, setToggleRightSidebar] = useState<boolean>(true);
  useEffect(() => {
    window.api.onUpdateProgress((value) => {
      setProgress(value);
    });
  }, []);
  return (
    <>
      {/* サイドバー https://x.com/kght6123/status/1600129834050416640 */}
      <div
        className="flex h-screen w-screen bg-gray-800"
        style={
          {
            "--sidebar-size": "280px",
            "--sidebar-mini-size": "64px",
          } as React.CSSProperties
        }
      >
        <div
          className={clsx(
            "h-screen bg-gray-900 transition-all @container/sidebar relative",
            toggleLeftSidebar && "w-[var(--sidebar-size)]",
            !toggleLeftSidebar && "w-[var(--sidebar-mini-size)]",
          )}
        >
          <div className="absolute top-[calc(50%-2rem)] -right-10 z-10">
            <ToggleButton
              className="flex justify-center items-center content-center text-white h-14 w-14 [&>svg]:aria-[pressed=false]:rotate-180 transition-transform"
              isSelected={toggleLeftSidebar}
              onChange={setToggleLeftSidebar}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-4 stroke-gray-700 stroke-[6] fill-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </ToggleButton>
          </div>
          <div className="px-2 py-4 text-white flex flex-col gap-4">
            <Button
              onPress={() => alert("Hello world!")}
              className="flex items-center py-4 px-2 text-black bg-gray-100 h-14 w-full justify-center gap-4 rounded-lg font-bold relative"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-5 stroke-current fill-none stroke-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                />
              </svg>
              <span className="@[280px]/sidebar:inline hidden">
                New&nbsp;Chat
              </span>
            </Button>
            <DisclosureGroup>
              <Disclosure id="personal">
                <Heading>
                  <Button
                    slot="trigger"
                    className="group/item py-2 px-1 text-left block overflow-hidden hover:overflow-visible hover:w-auto w-full @[280px]/sidebar:hover:w-full bg-gray-900 hover:bg-gray-800 rounded-lg"
                  >
                    <div className="text-clip whitespace-nowrap overflow-hidden group-hover/item:overflow-visible py-2 pl-2 pr-4 relative">
                      Chat Room1
                      <Button className="absolute -right-10 rounded-e-lg @[280px]/sidebar:-right-1 group-hover/item:block hidden bg-gray-900 py-4 px-2 -top-2 hover:bg-gray-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="size-6 stroke-current stroke-2 fill-none"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </Button>
                    </div>
                  </Button>
                </Heading>
                <DisclosurePanel>
                  <p>Details about personal information here.</p>
                </DisclosurePanel>
              </Disclosure>
            </DisclosureGroup>
          </div>
        </div>
        <div className="h-screen bg-white p-4 transition-all grow flex flex-col">
          {/* 本体コンテンツ、growで横幅を伸縮 */}
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
            className="inline-block mt-4 mr-2 mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            onClick={() => window.api.install().then((r) => setMessage(r))}
          >
            Install Ollama
          </button>
          <button
            className="inline-block mt-4 mr-2 mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
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
            className="inline-block mt-4 mr-2 mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
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
            className="inline-block mt-4 mr-2 mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
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
            className="inline-block mt-4 mr-2 mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
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
          <Versions />
          <div className="flex-1 flex flex-col">
            <Chat model="llama3.2:1b" placeholder="Type your message..." />
          </div>
        </div>
        <div
          className={clsx(
            "h-screen bg-gray-900 transition-all @container/sidebar relative",
            toggleRightSidebar && "w-[var(--sidebar-size)]",
            !toggleRightSidebar && "w-[var(--sidebar-mini-size)]",
          )}
        >
          <div className="absolute top-[calc(50%-2rem)] -left-10 z-10">
            <ToggleButton
              className="flex justify-center items-center content-center text-white h-14 w-14 [&>svg]:aria-[pressed=true]:rotate-180 transition-transform"
              isSelected={toggleRightSidebar}
              onChange={setToggleRightSidebar}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-4 stroke-gray-700 stroke-[6] fill-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </ToggleButton>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
