import React from "react"
import ReactDOM from "react-dom/client"
import Toaster from "./Toaster.jsx"
import { toast } from "./state.ts"
const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  <React.StrictMode>
    <Toaster theme="light" expand={true} closeButton />
    <button
      onClick={() =>
        toast.promise(
          () =>
            new Promise((resolve, reject) =>
              setTimeout(() => {
                resolve({ name: "Cue" })
              }, 2000)
            ),
          {
            loading: "Loading...",
            success: (data) => {
              return `${data.name} toast has been added`
            },
            error: "Error - cue",
          }
        )
      }
    >
      Kyu
    </button>
  </React.StrictMode>
)
