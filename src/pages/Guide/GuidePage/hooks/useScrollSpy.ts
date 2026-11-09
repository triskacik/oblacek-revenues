import { useEffect, useState } from 'react'

/**
 * Id of the section currently being read: the last one whose top has passed the upper third of
 * the viewport (below the sticky header). At the very bottom the last section wins, so short
 * final sections can still become active.
 */
const useScrollSpy = (ids: string[]) => {
  const [activeId, setActiveId] = useState(ids[0])
  const key = ids.join('|')

  useEffect(() => {
    const sectionIds = key.split('|')
    const update = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom) {
        setActiveId(sectionIds[sectionIds.length - 1])
        return
      }
      const line = window.innerHeight * 0.33
      let current = sectionIds[0]
      for (const id of sectionIds) {
        const top = document.getElementById(id)?.getBoundingClientRect().top
        if (top !== undefined && top <= line) current = id
      }
      setActiveId(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [key])

  return activeId
}

export default useScrollSpy
