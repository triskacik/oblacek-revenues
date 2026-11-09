import { createContext, useContext } from 'react'

type FieldIdContextValue = {
  /**
   * Maps a react-hook-form field name to a DOM-unique id, so several forms on one page
   * (e.g. settings cards) never produce colliding `id`/`htmlFor` attributes.
   */
  getFieldId: (field: string) => string
}

export const FieldIdContext = createContext<FieldIdContextValue>({
  getFieldId: field => field,
})

export const useFieldId = () => useContext(FieldIdContext)
