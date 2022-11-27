import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  const GA_TRACKING_ID = "G-0THG02423M";

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
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        ></script>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'analytics_storage': 'denied'
              });
              gtag('config', '${GA_TRACKING_ID}');
              `,
          }}
        ></script>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
