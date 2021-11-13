import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
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

export const SnapScrollView: React.FC<Props> = ({
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
    const clientSize = isVertical ? ClientSize.HEIGHT : ClientSize.WIDTH;

    const snapScrollViewElement = snapScrollViewRef.current;
    const snapScrollViewElementSize = snapScrollViewElement?.[clientSize] || 0;
    const itemGroupElement = itemGroupRef.current;
    const itemGroupElementSize = itemGroupElement?.[clientSize] || 0;
    const itemElements = Array.from(
      itemGroupElement?.getElementsByClassName("item") || []
    );
    const itemElementSizes = itemElements.map(
      (itemElement) => itemElement[clientSize] || 0
    );

    const baseTranslate = -itemGroupElementSize;
    const innerTranslate = getInnerTranslateWhenItemIsInCenter(items.length, {
      itemElementSizes,
      snapScrollViewElementSize,
      baseTranslate,
    });

    setState((_state) => ({
      ..._state,
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
    setState((_state) => ({ ..._state, currentFocusedItemIndex }));
  }, [getFocusedItemIndex, state.lastInnerTranslate]);

  const snapTo = useCallback(
    async (commonIndex: number) => {
      const innerTranslate = getInnerTranslateWhenItemIsInCenter(commonIndex);
      if (innerTranslate === state.lastInnerTranslate && state.offset === 0) {
        return;
      }
      const { commonIndex: focusedItemCommonIndex } =
        getFocusedItemIndex(innerTranslate);
      const focusedItemItemGroupIndex = Math.floor(
        focusedItemCommonIndex / items.length
      );

      setState((_state) => {
        const diff = 1 - focusedItemItemGroupIndex;
        const baseTranslate =
          focusedItemItemGroupIndex === 1
            ? _state.baseTranslate
            : _state.baseTranslate - diff * _state.itemGroupElementSize;
        return {
          ..._state,
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

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.persist();

      if (state.isGrabbing) {
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

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.persist();

      let grabStartPoint = state.grabStartPoint;

      // Grab start
      if (!state.isGrabbing) {
        grabStartPoint =
          event.changedTouches[0][
            isVertical ? ClientCoordinate.Y : ClientCoordinate.X
          ];
        setState((_state) => ({
          ..._state,
          isGrabbing: true,
          grabStartPoint,
        }));
      }

      const offset =
        grabStartPoint -
        event.changedTouches[0][
          isVertical ? ClientCoordinate.Y : ClientCoordinate.X
        ];
      const now = new Date().getTime();
      setState((_state) => {
        const time = now - _state.lastMovedAt;
        const scrollVelocity = (_state.offset - offset) / time;
        return { ..._state, offset, scrollVelocity, lastMovedAt: now };
      });
    },
    [isVertical, state.grabStartPoint, state.isGrabbing]
  );

  return (
    <Container
      ref={snapScrollViewRef}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <Base
        className="base"
        transform={
          isVertical
            ? `translate3d(0px, ${state.baseTranslate}px, 0px)`
            : `translate3d(${state.baseTranslate}px, 0px, 0px)`
        }
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
                  itemMargin={
                    isVertical
                      ? `${itemMarginPixel}px 0`
                      : `0 ${itemMarginPixel}px`
                  }
                  groupIndex={i}
                  snapTo={snapTo}
                />
              </ItemGroup>
            ) : (
              <ItemGroup key={i} className="item-group" isVertical={isVertical}>
                <ItemList
                  items={items}
                  itemMargin={
                    isVertical
                      ? `${itemMarginPixel}px 0`
                      : `0 ${itemMarginPixel}px`
                  }
                  groupIndex={i}
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
