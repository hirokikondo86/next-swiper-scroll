import styled from "styled-components";

export const Container = styled.div<{
  itemMarginPixel: number;
  isVertical: boolean;
}>`
  margin: ${({ isVertical, itemMarginPixel }) =>
    isVertical ? `${itemMarginPixel}px 0` : `0 ${itemMarginPixel}px`};
`;
