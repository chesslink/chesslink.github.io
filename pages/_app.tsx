import "../styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  const measurementId = "G-0THG02423M";

  return (
    <>
      <Head>
        <title>Chesslink</title>
        <meta
          name="description"
          content="Online correspondence chess - free and without registration"
          key="desc"
        />
        <meta
          name="keywords"
          content="chess, correspondence, free, anonymous"
        />
        <meta
          property="og:image"
          content="https://chesslink.github.io/zoe-holling-UDfmSK4AS3E-unsplash-crop.jpg"
        />
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied'
          });
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `,
          }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
