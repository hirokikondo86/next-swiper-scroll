import styled, { css } from "styled-components";
import { Swiper } from "swiper/react";

export const CustomSwiper = styled(Swiper)`
  padding-top: 1rem;
  padding-bottom: 3rem;
`;

export const Item = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #828282;
  transition: all 0.1s ease;
  line-height: 20px;

  ${({ isActive }) =>
    isActive &&
    css`
      font-size: 30px;
      font-weight: bold;
      color: #000;
    `}
`;

export const SubItem = styled.small<{ isActive: boolean }>`
  font-size: 10px;
  color: #828282;

  ${({ isActive }) =>
    isActive &&
    css`
      bottom: -32px;
      width: 15px;
      height: 15px;
      font-weight: bold;
      color: #000;
    `}
`;

export const Radius = styled.span<{ color: string; isActive: boolean }>`
  display: block;
  border-radius: 50%;
  width: 8px;
  height: 8px;
  background-color: ${({ color }) => color};
  position: absolute;
  left: 50%;
  bottom: -18px;
  transform: translate(-50%);
  transition: all 0.1s ease;

  ${({ isActive }) =>
    isActive &&
    css`
      width: 12px;
      height: 12px;
      bottom: -22px;
    `}
`;
