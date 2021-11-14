import type { AppProps } from "next/app";
import { GlobalStyle } from "../components/GlobalStyle";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
