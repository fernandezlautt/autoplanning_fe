import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { getWeekDateString } from "@/lib/date-utils"

interface StepperProps {
  currentStep: number
  weekNumbers: number[] // Actual week numbers (e.g., [1, 2, 3] or [17, 18, 19])
  onStepClick?: (step: number) => void
  completedSteps?: number[]
  semesterStartDate?: string
}

export function Stepper({
  currentStep,
  weekNumbers,
  onStepClick,
  completedSteps = [],
  semesterStartDate,
}: StepperProps) {
  // Use actual week numbers instead of generating sequential steps
  const steps = weekNumbers.length > 0 ? weekNumbers : [1]
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [isScrolling, setIsScrolling] = React.useState(false)

  // Check scroll position and update buttons
  const checkScroll = React.useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    // Add small threshold to avoid flickering
    const threshold = 5
    setCanScrollLeft(scrollLeft > threshold)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - threshold)
  }, [])

  // Scroll to current step when it changes
  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const currentStepIndex = steps.findIndex(s => s === currentStep)
    if (currentStepIndex === -1) return

    // Wait for DOM to update
    setTimeout(() => {
      const stepElement = container.children[currentStepIndex * 2] as HTMLElement
      if (!stepElement) return

      const containerRect = container.getBoundingClientRect()
      const stepRect = stepElement.getBoundingClientRect()
      const stepCenter = stepRect.left + stepRect.width / 2
      const containerCenter = containerRect.left + containerRect.width / 2
      const scrollOffset = stepCenter - containerCenter

      // Only scroll if step is not fully visible
      if (stepRect.left < containerRect.left || stepRect.right > containerRect.right) {
        container.scrollBy({
          left: scrollOffset,
          behavior: 'smooth',
        })
      }
    }, 100)
  }, [currentStep, steps])

  // Check scroll on mount and resize
  React.useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(checkScroll)
    resizeObserver.observe(container)

    container.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      resizeObserver.disconnect()
      container.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, steps.length])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    setIsScrolling(true)
    const scrollAmount = container.clientWidth * 0.8
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })

    setTimeout(() => setIsScrolling(false), 500)
  }

  return (
    <div className="relative w-full">
      {/* Left scroll button - only show when can scroll left */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-sm border border-border rounded-full p-1.5 shadow-lg hover:bg-background transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Right scroll button - only show when can scroll right */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-sm border border-border rounded-full p-1.5 shadow-lg hover:bg-background transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className={cn(
          "flex items-center justify-between w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6",
          "overflow-x-auto scrollbar-hide",
          "scroll-smooth",
          // Show scrollbar on hover or when scrolling
          "hover:scrollbar-default",
          isScrolling && "scrollbar-default",
          // Add padding when scroll buttons are visible
          canScrollLeft && "pl-10",
          canScrollRight && "pr-10"
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
        }}
      >
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step)
        const isCurrent = step === currentStep
        const isClickable = onStepClick !== undefined

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all shrink-0",
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground scale-110"
                    : isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background text-muted-foreground",
                  isClickable && "hover:border-primary cursor-pointer",
                  !isClickable && "cursor-default"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step}</span>
                )}
              </button>
              <div className="mt-1 sm:mt-2 text-center hidden sm:block">
                <span
                  className={cn(
                    "text-xs font-medium block",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60"
                  )}
                >
                  Week {step}
                </span>
                <span
                  className={cn(
                    "text-[10px] mt-0.5 block",
                    isCurrent
                      ? "text-primary/80"
                      : "text-muted-foreground/60"
                  )}
                >
                  {getWeekDateString(step, semesterStartDate)}
                </span>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-1 sm:mx-2 transition-colors min-w-[20px]",
                  (completedSteps.includes(steps[index + 1]) || steps[index + 1] < currentStep)
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
      </div>
    </div>
  )
}
