import styled from "styled-components";

export const Container = styled.div``;

export const Header = styled.header`
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  background-color: #ddd;
`;

export const Main = styled.main`
  margin-top: 60px;
`;

export const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: #ddd;
`;

export const Contents = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 550px;
`;

export const Text = styled.p<{ color: string }>`
  color: ${({ color }) => color};
`;
