import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    overflow-x: hidden;
    margin: 0;
    background: #eee;
  }

  .swiper-slide {
    text-align: center;
  }
`;
