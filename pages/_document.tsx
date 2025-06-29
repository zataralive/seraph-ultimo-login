import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Seraph: The Last Login</title>
        <script src="https://cdn.tailwindcss.com"></script>
        {/* The importmap for react/react-dom is not needed as Next.js handles these dependencies */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
