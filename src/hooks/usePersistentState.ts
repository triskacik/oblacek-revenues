import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

type UsePersistentStateOptions = {
  seedInitialValue?: boolean
}

const getStorageSubscribe = (key: string) => (callback: () => void) => {
  window.addEventListener(`storage_${key}`, callback)
  return () => window.removeEventListener(`storage_${key}`, callback)
}

/**
 * usePersistentState is a custom React hook for synchronizing state with a persistent storage (e.g., localStorage).
 * It provides a stateful value and a setter function, similar to useState, but persists the value under a given key.
 * Changes to the value from other tabs or windows are synchronized using a custom event system.
 *
 * @template T The type of the stored value.
 * @param {string} key - The key under which the value is stored in the provided storage.
 * @param {T} initialValue - The initial value to use if storage does not have a value.
 * @param {Storage} [storage=localStorage] - The Storage object to use (defaults to localStorage).
 * @returns {[T, (newValue: React.SetStateAction<T>) => void]} - Returns a tuple with the current value and a setter.
 *
 * @example
 * const [count, setCount] = usePersistentState<number>('counter', 0, queryStorage);
 */

const usePersistentState = <T>(
  key: string,
  initialValue: T,
  storage: Storage = localStorage,
  options?: UsePersistentStateOptions
) => {
  const [stableInitialValue] = useState(initialValue)

  const lastStringValue = useRef<string | null>(JSON.stringify(initialValue))
  const lastValue = useRef<T>(initialValue)

  const getStorageValue = useCallback(() => {
    const stringValue = storage.getItem(key)
    if (stringValue !== lastStringValue.current) {
      lastStringValue.current = stringValue
      lastValue.current = lastStringValue.current
        ? JSON.parse(lastStringValue.current)
        : stableInitialValue
    }
    return lastValue.current
  }, [key, storage, stableInitialValue])
  const subscribe = useMemo(() => getStorageSubscribe(key), [key])

  const value = useSyncExternalStore(subscribe, getStorageValue)

  useEffect(() => {
    if (!options?.seedInitialValue) return
    if (storage.getItem(key) === null) {
      storage.setItem(key, JSON.stringify(stableInitialValue))
      window.dispatchEvent(new Event(`storage_${key}`))
    }
  }, [key, storage, stableInitialValue, options?.seedInitialValue])

  const setValue = useCallback(
    (newValue: React.SetStateAction<T>) => {
      const valueToStore =
        typeof newValue === 'function'
          ? (newValue as (prevState: T) => T)(getStorageValue())
          : newValue
      storage.setItem(key, JSON.stringify(valueToStore))
      window.dispatchEvent(new Event(`storage_${key}`))
    },
    [key, storage, getStorageValue]
  )

  const returnValue = useMemo(() => [value, setValue] as const, [value, setValue])

  return returnValue
}

export default usePersistentState
