import { useCallback } from "react"
import { useMeasuredItem } from "../hooks/useMeasuredHeight"

export function VirtualizedListItem({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	const onSizeChange = useCallback((height: number) => {
		console.log(height)
	}, [])

	const ref = useMeasuredItem(onSizeChange)

	return (
		<div ref={ref} {...props}>
			{children}
		</div>
	)
}
