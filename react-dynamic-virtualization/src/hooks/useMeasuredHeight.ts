import { useLayoutEffect, useRef } from "react"

export function useMeasuredItem(onSizeChange: (height: number) => void) {
	const elementRef = useRef<HTMLDivElement | null>(null)

	useLayoutEffect(() => {
		const element = elementRef.current

		if (!element) {
			return
		}

		const observer = new ResizeObserver(([entry]) => {
			onSizeChange(entry.contentRect.height)
		})

		observer.observe(element)

		return () => {
			observer.disconnect()
		}
	}, [onSizeChange])

	return elementRef
}
