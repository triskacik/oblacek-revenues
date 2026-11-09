import AddEntryContext from '@/contexts/AddEntry/AddEntryContext'
import { useContext } from 'react'

const useAddEntry = () => {
  const context = useContext(AddEntryContext)
  if (!context) throw new Error('useAddEntry must be used within AddEntryProvider')
  return context
}

export default useAddEntry
