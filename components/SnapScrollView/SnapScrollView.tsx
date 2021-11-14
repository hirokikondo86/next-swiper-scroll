import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  TouchEvent,
} from "react";
import { ItemList } from "./internal/ItemList";
import { Base, Container, Inner, ItemGroup } from "./styled";
import { ClientCoordinate, ClientSize } from "./constants";

type State = {
  isGrabbing: boolean;
  grabStartPoint: number;
  offset: number;
  lastInnerTranslate: number;
  baseTranslate: number;
  itemGroupElementSize: number;
  snapScrollViewElementSize: number;
  currentFocusedItemIndex: number;
  itemElementSizes: number[];
  scrollVelocity: number; // px/msec
  lastMovedAt: number;
};

type Props = {
  items: React.ReactElement[];
  itemMarginPixel?: number;
  transitionDuration?: number;
  isVertical?: boolean;
  onSnap?({ focusedIndex }: { focusedIndex: number }): void;
};

export const SnapScrollView: React.VFC<Props> = ({
  items,
  itemMarginPixel = 16,
  transitionDuration = 300,
  isVertical = false,
  onSnap,
}) => {
  const [state, setState] = useState<State>({
    isGrabbing: false,
    grabStartPoint: 0,
    offset: 0,
    lastInnerTranslate: 0,
    baseTranslate: 0,
    itemGroupElementSize: 0,
    snapScrollViewElementSize: 0,
    currentFocusedItemIndex: 0,
    itemElementSizes: [],
    scrollVelocity: 0,
    lastMovedAt: 0,
  });

  const snapScrollViewRef = useRef<HTMLDivElement>(null);
  const itemGroupRef = useRef<HTMLDivElement>(null);

  const getFocusedItemIndex = useCallback(
    (translate: number) => {
      let hand = -state.snapScrollViewElementSize / 2 + state.baseTranslate;
      let currentFocusedItemIndex = 0;
      let commonIndex = 0;
      // `3000` は計算すれば必要十分な数字出るのでは？
      for (let i = 0; i < 3000; i++) {
        const targetItemIndex = i % items.length;
        const min = hand;
        const rangeWidth =
          state.itemElementSizes[targetItemIndex] + itemMarginPixel * 2;
        const max = hand + rangeWidth;

        if (min <= -translate && -translate <= max) {
          currentFocusedItemIndex = targetItemIndex;
          commonIndex = i;
          break;
        }
        hand += rangeWidth;
      }
      console.log(commonIndex);
      return { currentFocusedItemIndex, commonIndex };
    },
    [
      items,
      itemMarginPixel,
      state.snapScrollViewElementSize,
      state.itemElementSizes,
      state.baseTranslate,
    ]
  );

  // Returns translate when item with commonIndex is centered
  const getInnerTranslateWhenItemIsInCenter = useCallback(
    (
      itemCommonIndex: number,
      config: {
        itemElementSizes: State["itemElementSizes"];
        snapScrollViewElementSize: State["snapScrollViewElementSize"];
        baseTranslate: State["baseTranslate"];
      } = {
        itemElementSizes: state.itemElementSizes,
        snapScrollViewElementSize: state.snapScrollViewElementSize,
        baseTranslate: state.baseTranslate,
      }
    ) => {
      let prevItemsWidth = 0;
      prevItemsWidth += itemMarginPixel;
      for (let i = 0; i < itemCommonIndex; i++) {
        const targetItemIndex = i % items.length;
        prevItemsWidth += config.itemElementSizes[targetItemIndex];
        prevItemsWidth += itemMarginPixel * 2;
      }
      // 一つ前アイテムのサイズ（初期表示だと0になる）
      prevItemsWidth +=
        config.itemElementSizes[itemCommonIndex % items.length] / 2;

      // This defines snapToAlignment
      const translate = -(
        prevItemsWidth -
        config.snapScrollViewElementSize / 2 +
        config.baseTranslate
      );
      return translate;
    },
    [
      items,
      itemMarginPixel,
      state.itemElementSizes,
      state.snapScrollViewElementSize,
      state.baseTranslate,
    ]
  );

  useEffect(() => {
    // 縦か横か取得
    const clientSize = isVertical ? ClientSize.HEIGHT : ClientSize.WIDTH;

    // SnapScrollView要素を取得
    const snapScrollViewElement = snapScrollViewRef.current;
    // SnapScrollView要素のサイズを取得
    const snapScrollViewElementSize = snapScrollViewElement?.[clientSize] || 0;

    // ItemGroup要素を取得
    const itemGroupElement = itemGroupRef.current;
    // ItemGroup要素のサイズを取得
    const itemGroupElementSize = itemGroupElement?.[clientSize] || 0;

    // itemList内のclassName=itemの要素を取得
    const itemElements = Array.from(
      itemGroupElement?.getElementsByClassName("item") || []
    );
    // Itemのサイズを取得
    const itemElementSizes = itemElements.map(
      (itemElement) => itemElement[clientSize] || 0
    );

    const baseTranslate = -itemGroupElementSize;
    const innerTranslate = getInnerTranslateWhenItemIsInCenter(items.length, {
      itemElementSizes,
      snapScrollViewElementSize,
      baseTranslate,
    });

    setState((prevState) => ({
      ...prevState,
      itemGroupElementSize,
      snapScrollViewElementSize,
      itemElementSizes,
      lastInnerTranslate: innerTranslate,
      baseTranslate,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVertical, items.length]);

  useEffect(() => {
    const { currentFocusedItemIndex } = getFocusedItemIndex(
      state.lastInnerTranslate
    );
    setState((prevState) => ({ ...prevState, currentFocusedItemIndex }));
  }, [getFocusedItemIndex, state.lastInnerTranslate]);

  const snapTo = useCallback(
    async (commonIndex: number) => {
      const innerTranslate = getInnerTranslateWhenItemIsInCenter(commonIndex);
      // 移動がない場合は何もしない
      if (innerTranslate === state.lastInnerTranslate && state.offset === 0) {
        return;
      }
      const { commonIndex: focusedItemCommonIndex } =
        getFocusedItemIndex(innerTranslate);
      const focusedItemItemGroupIndex = Math.floor(
        focusedItemCommonIndex / items.length
      );

      setState((prevState) => {
        const diff = 1 - focusedItemItemGroupIndex;
        const baseTranslate =
          focusedItemItemGroupIndex === 1
            ? prevState.baseTranslate
            : prevState.baseTranslate - diff * prevState.itemGroupElementSize;
        return {
          ...prevState,
          lastInnerTranslate: innerTranslate,
          offset: 0,
          isGrabbing: false,
          baseTranslate,
        };
      });
    },
    [
      getInnerTranslateWhenItemIsInCenter,
      state.lastInnerTranslate,
      state.offset,
      getFocusedItemIndex,
      items.length,
    ]
  );

  // タッチスクロールを終了した時
  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.persist();

      // タッチスクロールをしている時のみ
      if (state.isGrabbing) {
        // スクロール終了位置を取得
        const offset =
          state.grabStartPoint -
          event.changedTouches[0][
            isVertical ? ClientCoordinate.Y : ClientCoordinate.X
          ];

        let momentumDistance = 0;
        for (let i = 0; i < 300; i++) {
          momentumDistance += state.scrollVelocity * 0.98 ** i;
        }
        let translate = state.lastInnerTranslate - offset + momentumDistance;
        const { commonIndex, currentFocusedItemIndex } =
          getFocusedItemIndex(translate);
        snapTo(commonIndex);

        if (onSnap) {
          onSnap({ focusedIndex: currentFocusedItemIndex });
        }
      }
    },
    [
      getFocusedItemIndex,
      isVertical,
      onSnap,
      snapTo,
      state.grabStartPoint,
      state.isGrabbing,
      state.lastInnerTranslate,
      state.scrollVelocity,
    ]
  );

  // タッチスクロールで動かしている時
  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.persist();

      // タッチを開始した地点
      let grabStartPoint = state.grabStartPoint;

      // タッチを開始
      if (!state.isGrabbing) {
        // タッチを開始した地点
        grabStartPoint =
          event.changedTouches[0][
            isVertical ? ClientCoordinate.Y : ClientCoordinate.X
          ];
        setState((prevState) => ({
          ...prevState,
          isGrabbing: true,
          grabStartPoint,
        }));
      }

      // タッチ開始した位置からの現在移動しているところまでの相対位置
      const offset =
        grabStartPoint -
        event.changedTouches[0][
          isVertical ? ClientCoordinate.Y : ClientCoordinate.X
        ];
      const now = new Date().getTime();
      setState((prevState) => {
        // 前回のスクロール時間からの経過時間
        const time = now - prevState.lastMovedAt;
        // スクロール速度を計算
        const scrollVelocity = (prevState.offset - offset) / time;
        return { ...prevState, offset, scrollVelocity, lastMovedAt: now };
      });
    },
    [isVertical, state.grabStartPoint, state.isGrabbing]
  );

  return (
    <Container
      ref={snapScrollViewRef}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      //   onMouseDown={handleMouseDown}
      //   onMouseUp={handleMouseUp}
      //   onMouseMove={handleMouseMove}
    >
      <Base
        className="base"
        isVertical={isVertical}
        baseTranslate={state.baseTranslate}
      >
        <Inner
          className="inner"
          isVertical={isVertical}
          lastInnerTranslate={state.lastInnerTranslate}
          offset={state.offset}
          isGrabbing={state.isGrabbing}
          transitionDuration={transitionDuration}
        >
          {[...Array(3)].map((_, i) =>
            i === 0 ? (
              <ItemGroup
                key={i}
                className="item-group"
                ref={itemGroupRef}
                isVertical={isVertical}
              >
                <ItemList
                  items={items}
                  groupIndex={i}
                  itemMarginPixel={itemMarginPixel}
                  isVertical={isVertical}
                  snapTo={snapTo}
                />
              </ItemGroup>
            ) : (
              <ItemGroup key={i} className="item-group" isVertical={isVertical}>
                <ItemList
                  items={items}
                  groupIndex={i}
                  itemMarginPixel={itemMarginPixel}
                  isVertical={isVertical}
                  snapTo={snapTo}
                />
              </ItemGroup>
            )
          )}
        </Inner>
      </Base>
    </Container>
  );
};
