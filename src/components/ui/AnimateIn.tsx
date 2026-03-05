import { useRef, useEffect, useState, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface AnimateInProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Lightweight scroll-reveal wrapper using IntersectionObserver.
 * Child fades/slides in when it enters the viewport.
 */
export function AnimateIn({ children, className, delay = 0 }: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '40px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'ease-out',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4',
        className,
      )}
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '600ms',
        transitionDelay: visible ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </div>
  )
}
