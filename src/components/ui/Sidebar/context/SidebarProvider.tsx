import { useIsMobile } from '@/hooks/useIsMobile'
import usePersistentState from '@/hooks/usePersistentState'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SIDEBAR_KEYBOARD_SHORTCUT,
  SIDEBAR_STORAGE_KEY,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
} from '../consts'
import type { SidebarContextProps } from './SidebarContext'
import SidebarContext from './SidebarContext'
import { TooltipProvider } from '../../Tooltip/Tooltip'
import { cn } from '@/lib/utils'

const SidebarProvider = ({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)

  // Settings-owned default. Session toggles do not write here — only the settings tile does.
  const [storedDefaultOpen] = usePersistentState<boolean>(SIDEBAR_STORAGE_KEY, defaultOpen)

  // Ephemeral open state for the current session, seeded from the persisted default.
  const [_open, _setOpen] = useState(storedDefaultOpen)
  const open = openProp ?? _open
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }
    },
    [setOpenProp, open]
  )

  // When the user changes the default in settings, apply it to the current session too.
  useEffect(() => {
    if (setOpenProp) return
    _setOpen(storedDefaultOpen)
  }, [storedDefaultOpen, setOpenProp])

  // Helper to toggle the sidebar.
  const toggleSidebar = useCallback(
    () => (isMobile ? setOpenMobile(open => !open) : setOpen(open => !open)),
    [isMobile, setOpen, setOpenMobile]
  )

  // Adds a keyboard shortcut to toggle the sidebar.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? 'expanded' : 'collapsed'

  const contextValue = useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          className={cn(
            'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
            className
          )}
          data-slot='sidebar-wrapper'
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

export default SidebarProvider
