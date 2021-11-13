import styled from "styled-components";

export const Container = styled.div<{ width: string; color: string }>`
  width: ${({ width }) => width};
  height: 100px;
  background-color: ${({ color }) => color};
  text-align: center;
  color: #333;
`;
