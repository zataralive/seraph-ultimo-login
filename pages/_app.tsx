
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* You can add default Head elements here if needed, or manage them per-page */}
        {/* For example, if you want a consistent title, but _document.tsx is often preferred for static head elements like charset/viewport */}
        {null} {/* Explicitly add a null child to satisfy the 'children' prop requirement */}
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
