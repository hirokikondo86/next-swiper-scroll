import React, { useState } from "react";
import { Background, Container, FocusedIndex } from "./styled";
import { NoBounce } from "../NoBounce";
import { SnapScrollView } from "../SnapScrollView";
import { SampleItem, sampleItems } from "../SampleItem/SampleItem";

export const HomeContent = () => {
  const [focusedIndex, setFocusedIndex] = useState(1);

  const handleSnap = ({ focusedIndex }: { focusedIndex: number }) => {
    setFocusedIndex(focusedIndex);
  };

  return (
    <>
      <NoBounce />
      <Container>
        <FocusedIndex>Focused: {focusedIndex}</FocusedIndex>
        <Background>
          <SnapScrollView
            items={sampleItems.map(({ color, width }, index) => (
              <SampleItem key={index} width={width} color={color}>
                {index}
              </SampleItem>
            ))}
            onSnap={handleSnap}
          />
        </Background>
      </Container>
    </>
  );
};
