"use client"

import React from "react"
import { useEffect, useState, useRef, useMemo, useCallback, isValidElement } from "react"
import { Loader, getAsset } from "./assets.tsx"
const TOAST_LIFETIME = 4000
const TIME_BEFORE_UNMOUNT = 200
const GAP = 14

const Toast = (props) => {
  const {
    invert: ToasterInvert,
    index,
    toast,
    toasts,
    style,
    heights,
    setHeights,
    position,
    visibleToasts,
    removeToast,
    duration: durationFromToaster,
    expanded,
    expandByDefault,
    interacting,
    className = "",
    closeButton,
    descriptionClassName = "",
  } = props

  const [mounted, setMounted] = useState(false)
  const [offsetBeforeRemove, setOffsetBeforeRemove] = useState(0)
  const [removed, setRemoved] = useState(false)
  const [swiping, setSwiping] = useState(false)
  const [swipeOut, setSwipeOut] = useState(false)
  const [initialHeight, setInitialHeight] = useState(0)
  const [promiseStatus, setPromiseStatus] = useState(null)
  const [promiseResult, setPromiseResult] = useState(null)
  const toastRef = useRef(null)
  const offset = useRef(0)
  const closeTimerStartTimeRef = useRef(0)
  const toastType = toast.type
  const isVisible = index + 1 <= visibleToasts
  const isFront = index === 0
  const [y, x] = position?.split("-")
  const toastClassname = toast.className || ""
  const invert = toast.invert || ToasterInvert
  const isEmojiRegex = /\p{Extended_Pictographic}/gu
  const isPromise = () => Boolean(toast.promise)
  const disabled = promiseStatus === "loading"
  const toastDescriptionClassname = toast.descriptionClassName || ""

  const heightIndex = useMemo(
    () => heights.findIndex((height) => height.toastId === toast.id) || 0,
    [heights, toast.id]
  )

  const duration = useMemo(
    () => toast.duration || durationFromToaster || TOAST_LIFETIME,
    [toast.duration, durationFromToaster]
  )
  const closeTimerRemainingTimeRef = useRef(duration)
  const lastCloseTimerStartTimeRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const toastNode = toastRef.current
    if (toastNode) {
      const height = toastNode.getBoundingClientRect().height
      setInitialHeight(height)
      setHeights((h) => [{ toastId: toast.id, height }, ...h])
      return () => setHeights((h) => h.filter((height) => height.toastId !== toast.id))
    }
  }, [setHeights, toast.id])

  const deleteToast = useCallback(() => {
    setRemoved(true)
    setOffsetBeforeRemove(offset.current)
    setHeights((h) => h.filter((height) => height.toastId !== toast.id))
    setTimeout(() => {
      removeToast(toast)
    }, TIME_BEFORE_UNMOUNT)
  }, [toast, removeToast, setHeights, offset])

  useEffect(() => {
    let timeoutId
    const startTimer = () => {
      closeTimerStartTimeRef.current = new Date().getTime()
      timeoutId = setTimeout(() => {
        deleteToast()
      }, closeTimerRemainingTimeRef.current)
    }
    const pauseTimer = () => {
      if (lastCloseTimerStartTimeRef.current < closeTimerStartTimeRef.current) {
        const elapsedTime = new Date().getTime() - closeTimerStartTimeRef.current
        closeTimerRemainingTimeRef.current = closeTimerRemainingTimeRef.current - elapsedTime
      }
      lastCloseTimerStartTimeRef.current = new Date().getTime()
    }
    if (expanded || interacting) {
      pauseTimer()
    } else {
      startTimer()
    }
    return () => clearTimeout(timeoutId)
  }, [
    expanded,
    interacting,
    expandByDefault,
    toast,
    duration,
    deleteToast,
    toast.promise,
    promiseStatus,
  ])

  const toastsHeightBefore = useMemo(() => {
    return heights.reduce((prev, curr, reducerIndex) => {
      if (reducerIndex >= heightIndex) {
        return prev
      }
      return prev + curr.height
    }, 0)
  }, [heights, heightIndex])

  offset.current = useMemo(
    () => heightIndex * GAP + toastsHeightBefore,
    [heightIndex, toastsHeightBefore]
  )

  useEffect(() => {
    if (isPromise(toast)) {
      setPromiseStatus("loading")
      const promiseHandler = (promise) => {
        promise
          .then((data) => {
            if (toast.success && typeof toast.success === "function") {
              setPromiseResult(toast.success(data))
            }
            setPromiseStatus("success")
          })
          .catch((error) => {
            setPromiseStatus("error")
            if (toast.error && typeof toast.error === "function") {
              setPromiseResult(toast.error(error))
            }
          })
      }

      if (toast.promise instanceof Promise) {
        promiseHandler(toast.promise)
      } else if (typeof toast.promise === "function") {
        promiseHandler(toast.promise())
      }
    }
  }, [toast])

  useEffect(() => {
    if (toast.delete) {
      deleteToast()
    }
  }, [toast.delete])

  const promiseTitle = useMemo(() => {
    if (!isPromise(toast)) return null

    switch (promiseStatus) {
      case "loading":
        return toast.loading
      case "success":
        return typeof toast.success === "function" ? promiseResult : toast.success
      // Add a warning API to this as well- use error icon as a warning icon and add a new icon to error from react-icons
      case "error":
        return typeof toast.error === "function" ? promiseResult : toast.error
      default:
        return null
    }
  }, [promiseStatus, promiseResult])

  return (
    <li
      aria-live={toast.important ? "assertive" : "polite"}
      aria-atomic="true"
      role="status"
      tabIndex={0}
      ref={toastRef}
      className={className + " " + toastClassname}
      data-kyu-toast=""
      data-styled={!Boolean(toast.jsx)}
      data-mounted={mounted}
      data-promise={Boolean(toast.promise)}
      data-removed={removed}
      data-visible={isVisible}
      data-y-position={y}
      data-x-position={x}
      data-index={index}
      data-front={isFront}
      data-swiping={swiping}
      data-type={promiseStatus !== "loading" && promiseStatus ? promiseStatus : toastType}
      data-invert={invert}
      data-swipe-out={swipeOut}
      data-expanded={Boolean(expanded || (expandByDefault && mounted))}
      style={{
        "--index": index,
        "--toasts-before": index,
        "--z-index": toasts.length - index,
        "--offset": `${removed ? offsetBeforeRemove : offset.current}px`,
        "--initial-height": expandByDefault ? "auto" : `${initialHeight}px`,
        ...style,
        ...toast.style,
      }}
    >
      {closeButton && !toast.jsx ? (
        <button
          aria-label="Close toast"
          data-disabled={disabled}
          data-close-button
          onClick={
            disabled
              ? undefined
              : () => {
                  deleteToast()
                  toast.onDismiss?.(toast)
                }
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      ) : null}
      {toast.jsx || isValidElement(toast.title) ? (
        toast.jsx || toast.title
      ) : (
        <>
          {toastType || toast.icon || toast.promise ? (
            <div data-icon="">
              {toast.promise ? <Loader visible={promiseStatus === "loading"} /> : null}
              {toast.icon || getAsset(promiseStatus ?? toast.type)}
            </div>
          ) : null}

          <div data-content="">
            <div data-title="">
              <>{toast.title ?? promiseTitle}</>
            </div>
            {toast.description ? (
              <div data-description="" className={descriptionClassName + toastDescriptionClassname}>
                {toast.description}
              </div>
            ) : null}
          </div>
          {toast.cancel ? (
            <button
              data-button
              data-cancel
              onClick={() => {
                deleteToast()
                if (toast.cancel?.onClick) {
                  toast.cancel.onClick()
                }
              }}
            >
              {toast.cancel.label}
            </button>
          ) : null}
          {toast.action ? (
            <button
              data-button=""
              onClick={() => {
                deleteToast()
                toast.action?.onClick()
              }}
            >
              {toast.action.label}
            </button>
          ) : null}
        </>
      )}
      {/* {isEmojiRegex.test(toast?.icon) ? <div>{toast?.icon}</div> : null} */}
    </li>
  )
}

export default Toast
