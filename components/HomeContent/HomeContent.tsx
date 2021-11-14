import { CategoryList } from "../CategoryList";
import { Container, Header, Main, Footer, Contents } from "./styled";
import { categories } from "./constants";

export const HomeContent = () => {
  return (
    <Container>
      <Header>Header</Header>
      <Main>
        <Contents>Contents</Contents>
        <CategoryList categories={categories} />
      </Main>
      <Footer>Footer</Footer>
    </Container>
  );
};
