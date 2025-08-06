export * from './attendees'
export * from './discord'
export * from './github'
export * from './gmail'
export * from './google'
export * from './instagram'
export * from './linkedin'
export * from './logo'
export * from './microsoft'
export * from './notes'
export * from './twitter'
export * from './youtube'
export * from './zoom'

export function RSS(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
	return (
		<svg
			fill="none"
			height="16"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			viewBox="0 0 24 24"
			width="16"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>Path</title>
			<path d="M4 11a9 9 0 0 1 9 9" />
			<path d="M4 4a16 16 0 0 1 16 16" />
			<circle
				cx="5"
				cy="19"
				r="1"
			/>
		</svg>
	)
}
