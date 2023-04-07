"use-client"
import React from "react"
import { ToastState } from "./state"
import { useEffect, useState, useRef, useCallback } from "react"
import Toast from "./Toast.jsx"
import "./style.css"
import ReactDOM from "react-dom"
// Visible toasts amount
const VISIBLE_TOASTS_AMOUNT = 3
// Default gap between toasts
const GAP = 14
// Default toast width
const TOAST_WIDTH = 356
// Viewport padding
const VIEWPORT_OFFSET = "32px"

const Toaster = (props: any) => {
  const {
    position = "bottom-right",
    offset,
    theme = "light",
    visibleToasts = VISIBLE_TOASTS_AMOUNT,
    style,
    duration,
    expand,
    className,
    toastOptions,
    closeButton,
  } = props

  const [toasts, setToasts] = useState<any>([])
  const [heights, setHeights] = useState<any>([])
  const [expanded, setExpanded] = useState<any>(false)
  const [interacting, setInteracting] = useState<any>(false)
  const listRef = useRef<any>()
  const [y, x] = position.split("-")

  useEffect(() => {
    return ToastState.subscribe((toast) => {
      // @ts-ignore
      if (toast.dismiss) {
        setToasts((toasts: any) =>
          toasts.map((t: any) => (t.id === toast.id ? { ...t, delete: true } : t))
        )
        return
      }
      ReactDOM.flushSync(() => {
        setToasts((toasts: any) => [toast, ...toasts])
      })
    })
  }, [])

  useEffect(() => {
    if (toasts?.length <= 1) {
      setExpanded(false)
    }
  }, [toasts])

  const removeToast = useCallback(
    (toast: any) => setToasts((toasts: any) => toasts.filter(({ id }: any) => id !== toast?.id)),
    []
  )

  return (
    <>
      <section tabIndex={-1}>
        <ol
          style={{
            "--front-toast-height": `${heights[0]?.height}px`,
            "--offset": typeof offset === "number" ? `${offset}px` : offset || VIEWPORT_OFFSET,
            "--width": `${TOAST_WIDTH}px`,
            "--gap": `${GAP}px`,
            ...style,
          }}
          ref={listRef}
          className={className}
          tabIndex={-1}
          data-kyu-toaster
          data-theme={theme}
          data-y-position={y}
          data-x-position={x}
          onMouseEnter={() => setExpanded(true)}
          onMouseMove={() => setExpanded(true)}
          onMouseLeave={() => {
            if (!interacting) {
              setExpanded(false)
            }
          }}
          onPointerDown={() => {
            setInteracting(true)
          }}
          onPointerUp={() => setInteracting(false)}
        >
          {toasts?.map((toast: any, index: any) => (
            <Toast
              key={toast.id}
              index={index}
              toast={toast}
              duration={duration}
              className={toastOptions?.className}
              descriptionClassName={toastOptions?.descriptionClassName}
              // invert={invert}
              visibleToasts={visibleToasts}
              closeButton={closeButton}
              interacting={interacting}
              position={position}
              style={toastOptions?.style}
              removeToast={removeToast}
              toasts={toasts}
              heights={heights}
              setHeights={setHeights}
              expandByDefault={expand}
              expanded={expanded}
            />
          ))}
        </ol>
      </section>
    </>
  )
}

export { Toaster }
