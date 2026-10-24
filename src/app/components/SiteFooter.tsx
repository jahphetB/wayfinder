export function SiteFooter({
	onPrivacy,
	showMapCredit = false,
}: {
	readonly onPrivacy: () => void
	readonly showMapCredit?: boolean
}) {
	return (
		<footer className="site-footer" id="site-footer" role="contentinfo">
			{showMapCredit && (
				<a
					className="footer-attribution"
					href="https://www.openstreetmap.org/copyright"
				>
					© OpenStreetMap
				</a>
			)}
			<p className="site-credit">
				Wayfinder™ · Developed by{' '}
				<a href="https://github.com/jahphetB">Yaphet</a>
			</p>
			<button type="button" className="privacy-action" onClick={onPrivacy}>
				Privacy
			</button>
		</footer>
	)
}
