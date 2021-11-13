import { ReactChild, VFC } from "react";
import { Container } from "./styled";
import { getRandomInt } from "../../utils/getRandomInt";

const sampleItemColors = [
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "black",
  "white",
];

export const sampleItems: {
  color: string;
  width: string;
}[] = sampleItemColors.map((color) => ({
  color,
  width: `${getRandomInt(100, 200)}px`,
}));

export const SampleItem: VFC<{
  children: ReactChild;
  width: string;
  color: string;
}> = ({ children, width, color }) => {
  return (
    <Container width={width} color={color}>
      {children}
    </Container>
  );
};
