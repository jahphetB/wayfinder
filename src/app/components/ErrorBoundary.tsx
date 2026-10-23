import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
	readonly children: ReactNode
	readonly fallback: ReactNode
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	{ readonly hasError: boolean }
> {
	state = { hasError: false }

	static getDerivedStateFromError(): { readonly hasError: boolean } {
		return { hasError: true }
	}

	render(): ReactNode {
		return this.state.hasError ? this.props.fallback : this.props.children
	}
}
