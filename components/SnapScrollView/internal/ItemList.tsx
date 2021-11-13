import { VFC } from "react";
import { Container } from "./styled";

export const ItemList: VFC<{
  items: React.ReactElement[];
  itemMargin: string;
  groupIndex: number;
  snapTo(commonIndex: number): Promise<void>;
}> = ({ items, itemMargin, groupIndex, snapTo }) => {
  return (
    <>
      {items.map((item, index) => {
        const commonIndex = index + groupIndex * items.length;
        return (
          <Container
            key={commonIndex}
            className="item"
            margin={itemMargin}
            onClick={() => snapTo(commonIndex)}
          >
            {item}
          </Container>
        );
      })}
    </>
  );
};
