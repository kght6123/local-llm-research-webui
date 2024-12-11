import { useEffect, useState } from "react";
import Versions from "./components/Versions";
import electronLogo from "./assets/electron.svg";

import "./App.css";

function App(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  useEffect(() => {
    window.api.ping().then((r) => setMessage(r));
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
