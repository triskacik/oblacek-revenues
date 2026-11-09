// This module is the single wrapper around Sonner, so it is the one place allowed to import it.
// eslint-disable-next-line no-restricted-imports
import { toast as sonnerToast } from 'sonner'

export type ToastAction = {
  label: string
  onClick: () => void
}

export type ToastOptions = {
  description?: string
  action?: ToastAction
  /** Stable id — showing again with the same id updates/replaces the toast. */
  id?: string | number
  duration?: number
}

type ToastId = string | number
type ToastVariant = 'default' | 'success' | 'error' | 'info' | 'warning'

/** Default auto-close durations (ms) by toast type. Override per call via `duration`. */
const TOAST_DURATION_MS = {
  default: 4_000,
  success: 3_000,
  info: 4_000,
  warning: 5_000,
  error: 8_000,
} as const satisfies Record<ToastVariant, number>

const withDefaults = (variant: ToastVariant, options?: ToastOptions) => ({
  duration: TOAST_DURATION_MS[variant],
  ...options,
})

const show = (
  method: typeof sonnerToast | typeof sonnerToast.success,
  variant: ToastVariant,
  message: string,
  options?: ToastOptions
) => method(message, withDefaults(variant, options))

/**
 * App-wide toast API. Swap the implementation in this file only
 * if the underlying library changes — call sites stay the same.
 *
 * @example
 * toast('Event has been created', {
 *   description: 'Sunday, December 03, 2023 at 9:00 AM',
 *   action: { label: 'Undo', onClick: () => console.log('Undo') },
 * })
 * toast.success('Saved')
 * toast.error('Something went wrong')
 */
function toast(message: string, options?: ToastOptions) {
  return show(sonnerToast, 'default', message, options)
}

toast.success = (message: string, options?: ToastOptions) =>
  show(sonnerToast.success, 'success', message, options)

toast.error = (message: string, options?: ToastOptions) =>
  show(sonnerToast.error, 'error', message, options)

toast.info = (message: string, options?: ToastOptions) =>
  show(sonnerToast.info, 'info', message, options)

toast.warning = (message: string, options?: ToastOptions) =>
  show(sonnerToast.warning, 'warning', message, options)

toast.dismiss = (id?: ToastId) => {
  sonnerToast.dismiss(id)
}

/** True while Sonner still considers the toast active (not dismissed). */
toast.isActive = (id: ToastId) => sonnerToast.getToasts().some(t => t.id === id)

export { toast }
