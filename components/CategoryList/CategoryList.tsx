import { useState, VFC } from "react";
import { SwiperSlide } from "swiper/react";
import { CustomSwiper, Item, Radius, SubItem } from "./styled";
import "swiper/css";

type Category = {
  japanese: string;
  english: string;
  color: string;
};

type Props = { categories: Category[]; onSlideChange: (index: number) => void };

export const CategoryList: VFC<Props> = ({ categories, onSlideChange }) => {
  return (
    <CustomSwiper
      grabCursor={true}
      slidesPerView={4}
      spaceBetween={20}
      centeredSlides={true}
      loop={true}
      slideToClickedSlide={true}
      onSlideChange={(swiper) => onSlideChange(swiper.realIndex)}
    >
      {categories.map((category) => (
        <SwiperSlide key={category.japanese}>
          {({ isActive }) => (
            <div>
              <Item isActive={isActive}>{category.japanese}</Item>
              <SubItem isActive={isActive}>{category.english}</SubItem>
              <Radius color={category.color} isActive={isActive} />
            </div>
          )}
        </SwiperSlide>
      ))}
    </CustomSwiper>
  );
};
