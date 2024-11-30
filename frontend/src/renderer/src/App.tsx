import { useEffect, useRef, useState } from "react";
import LanguageSelector from "./components/LanguageSelector";
import Progress from "./components/Progress";
// import Versions from "./components/Versions";
// import electronLogo from "./assets/electron.svg";
import WorkerJs from "./worker.js?worker";
import "./App.css";

interface ProgressItem {
  file: string;
  progress: number;
  status: "initiate" | "progress" | "done" | "ready" | "update" | "complete";
  output: string;
}

function App(): JSX.Element {
  const worker = useRef<Worker | undefined>(undefined);

  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new WorkerJs();
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e: MessageEvent<ProgressItem>): void => {
      switch (e.data.status) {
        case "initiate":
          // Model file start load: add a new progress item to the list.
          console.log("initiate", e.data);
          setReady(false);
          setProgressItems((prev) => [...prev, e.data]);
          break;

        case "progress":
          // Model file progress: update one of the progress items.
          console.log("progress", e.data);
          setProgressItems((prev) =>
            prev.map((item) => {
              if (item.file === e.data.file) {
                return { ...item, progress: e.data.progress };
              }
              return item;
            }),
          );
          break;

        case "done":
          // Model file loaded: remove the progress item from the list.
          console.log("done", e.data);
          setProgressItems((prev) =>
            prev.filter((item) => item.file !== e.data.file),
          );
          break;

        case "ready":
          // Pipeline ready: the worker is ready to accept messages.
          console.log("ready", e.data);
          setReady(true);
          break;

        case "update":
          // Generation update: update the output text.
          console.log("update", e.data);
          setOutput(e.data.output);
          break;

        case "complete":
          // Generation complete: re-enable the "Translate" button
          console.log("complete", e.data);
          setDisabled(false);
          if (e.data.output.length > 0)
            setOutput(e.data.output[0].translation_text);
          break;

        default:
          console.error("Unknown message status", e.data);
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return (): void => {
      worker.current?.removeEventListener("message", onMessageReceived);
    };
  });

  // Model loading
  const [ready, setReady] = useState<boolean | undefined>(undefined);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

  // Inputs and outputs
  const [input, setInput] = useState("うさぎは満月にいるかもしれません。");
  const [sourceLanguage, setSourceLanguage] = useState("jpn_Jpan");
  const [targetLanguage, setTargetLanguage] = useState("eng_Latn");
  const [output, setOutput] = useState("");

  const translate = (): void => {
    setDisabled(true);
    worker.current?.postMessage({
      text: input,
      src_lang: sourceLanguage,
      tgt_lang: targetLanguage,
    });
  };

  // return (
  //   <>
  //     <img alt="logo" className="logo" src={electronLogo} />
  //     <Versions></Versions>
  //   </>
  // );

  return (
    <>
      <h1>Transformers.js</h1>
      <h2>ML-powered multilingual translation in React!</h2>

      <div className="container">
        <div className="language-container">
          <LanguageSelector
            type={"Source"}
            defaultLanguage={"jpn_Jpan"}
            onChange={(x) => setSourceLanguage(x.target.value)}
          />
          <LanguageSelector
            type={"Target"}
            defaultLanguage={"eng_Latn"}
            onChange={(x) => setTargetLanguage(x.target.value)}
          />
        </div>

        <div className="textbox-container">
          <textarea
            value={input}
            rows={3}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
          <textarea value={output} rows={3} readOnly></textarea>
        </div>
      </div>

      <button disabled={disabled} onClick={translate}>
        Translate
      </button>

      <div className="progress-bars-container">
        {ready === false && <label>Loading models... (only run once)</label>}
        {progressItems.map((data) => (
          <div key={data.file}>
            <Progress text={data.file} percentage={data.progress} />
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
