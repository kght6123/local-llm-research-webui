import { useState } from "react";

function Versions(): JSX.Element {
  const [versions] = useState(window.electron.process.versions);
  return (
    <ul>
      <li>Electron v{versions.electron}</li>
      <li>Chromium v{versions.chrome}</li>
      <li>Node v{versions.node}</li>
    </ul>
  );
}

export default Versions;
