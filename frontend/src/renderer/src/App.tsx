import { useEffect, useState } from "react";
import Versions from "./components/Versions";
import electronLogo from "./assets/electron.svg";

import "./App.css";

function App(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  useEffect(() => {
    window.api.ping().then((r) => setMessage(r));
    // Send a message to the main process with no response
    window.electron.ipcRenderer.send("electron:say", "hello");

    // Send a message to the main process with the response asynchronously
    window.electron.ipcRenderer.invoke("doAThing", ["aaa"]).then((re) => {
      console.log(re);
    });

    // Receive messages from the main process
    const reply = (_event, args): void => {
      alert(args);
      console.log(args);
    };
    window.electron.ipcRenderer.on("reply", reply);

    return (): void => {
      // Remove a listener
      const removeListener = window.electron.ipcRenderer.on("reply", reply);
      removeListener();
    };
  }, []);
  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      {message && <h1>{message}</h1>}
      <Versions></Versions>
    </>
  );
}

export default App;
