import { schema } from "@yellowipe/schemas";
import { useState } from "react";

function App() {
  const [hello, setHello] = useState("hello");

  return (
    <>
      <button
        onClick={() => {
          const { hello: updatedHello } = schema.parse({ hello });
          setHello(updatedHello);
        }}
      >
        {hello}
      </button>
    </>
  );
}

export default App;
