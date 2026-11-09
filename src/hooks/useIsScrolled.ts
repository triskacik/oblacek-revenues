import { useEffect, useState } from 'react'

/** True once the page is scrolled past `offset` px (e.g. to lift a sticky header with a shadow). */
const useIsScrolled = (offset = 8) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > offset)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [offset])

  return isScrolled
}

export default useIsScrolled
