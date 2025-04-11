import '../app/globals.css'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '../context/ThemeContext'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  )
}
