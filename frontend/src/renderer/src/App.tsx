import { useEffect, useState } from "react";
import Versions from "./components/Versions";
import electronLogo from "./assets/electron.svg";

import "./App.css";

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
  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      {message && <h1>{message}</h1>}
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
      Current value: <strong>{counter}</strong>
      <Versions></Versions>
    </>
  );
}

export default App;
