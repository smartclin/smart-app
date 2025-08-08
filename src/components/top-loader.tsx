import NextTopLoader from 'nextjs-toploader'

export function TopLoader() {
  return (
    <NextTopLoader
      color='#2299DD'
      crawl={true}
      crawlSpeed={200}
      easing='ease'
      height={3}
      initialPosition={0.08}
      shadow='0 0 10px #2299DD,0 0 5px #2299DD'
      showAtBottom={false}
      showSpinner={true}
      speed={200}
      zIndex={1600}
    />
  )
}
