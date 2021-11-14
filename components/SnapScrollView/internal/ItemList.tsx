import { VFC } from "react";
import { Container } from "./styled";

export const ItemList: VFC<{
  items: React.ReactElement[];
  groupIndex: number;
  itemMarginPixel: number;
  isVertical: boolean;
  snapTo(commonIndex: number): Promise<void>;
}> = ({ items, groupIndex, itemMarginPixel, isVertical, snapTo }) => {
  return (
    <>
      {items.map((item, index) => {
        const commonIndex = index + groupIndex * items.length;
        return (
          <Container
            key={commonIndex}
            className="item"
            itemMarginPixel={itemMarginPixel}
            isVertical={isVertical}
            onClick={() => snapTo(commonIndex)}
          >
            {item}
          </Container>
        );
      })}
    </>
  );
};
