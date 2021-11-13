import styled from "styled-components";

export const Container = styled.div`
  height: 100%;
  overflow: hidden;
`;

export const Base = styled.div<{ transform: string }>`
  transform: ${({ transform }) => transform};
`;

export const Inner = styled.div<{
  isVertical: boolean;
  lastInnerTranslate: number;
  offset: number;
  isGrabbing: boolean;
  transitionDuration: number;
}>`
  display: flex;
  align-items: center;
  flex-direction: ${({ isVertical }) => (isVertical ? "column" : "row")};
  height: 100%;
  transform: ${({ isVertical, lastInnerTranslate, offset }) =>
    isVertical
      ? `translate3d(0px, ${lastInnerTranslate - offset}px, 0px)`
      : `translate3d(${lastInnerTranslate - offset}px, 0px, 0px)`};
  transition-duration: ${({ isGrabbing, transitionDuration }) =>
    isGrabbing ? "0s" : `${transitionDuration}ms`};
`;

export const ItemGroup = styled.div<{ isVertical?: boolean }>`
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: ${({ isVertical }) => (isVertical ? "column" : "row")};
`;
