import { useState } from "react";
import { CategoryList } from "../CategoryList";
import { Container, Header, Main, Footer, Contents, Text } from "./styled";
import { categories } from "./constants";

export const HomeContent = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleSlideChange = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <Container>
      <Header>Header</Header>
      <Main>
        <Contents>
          <Text color={categories[activeIndex].color}>
            {categories[activeIndex].english}
          </Text>
        </Contents>
        <CategoryList
          categories={categories}
          onSlideChange={handleSlideChange}
        />
      </Main>
      <Footer>Footer</Footer>
    </Container>
  );
};
