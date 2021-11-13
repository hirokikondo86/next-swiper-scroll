import { createGlobalStyle } from "styled-components";

export const NoBounce = createGlobalStyle`
    html, body {
        // No Bounce
        overflow: hidden;
        margin: 0;
    }
`;
