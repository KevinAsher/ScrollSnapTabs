import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Tabs, Tab, createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import SwipeableViews from "react-swipeable-views";
import styled from "styled-components";
import useWindowSize from "./useWindowSize";
import tabs from "./data";
import animateScrollTo from "animated-scroll-to";

import "./styles.css";

const Line = styled.div`
  height: 1rem;
  margin-bottom: 0.5rem;
  background-color: hsla(0, 0%, 0%, 0.09);
  width: ${(props) => props.width || "100%"};
`;
const ContentContainer = styled.div`
  padding: 1rem;
  padding-top: 0;
`;

const StyledTabPanels = styled.div`
  /* width: 100vw; */
  scroll-snap-type: x mandatory;
  display: flex;
  -webkit-overflow-scrolling: touch;
  scroll-snap-stop: always;
  overflow-x: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const StyledTabPanel = styled.div`
  /* min-width: 100vw; */
  min-width: 100%;
  min-height: 10rem;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  &[hidden] {
    display: block !important;
  }
  &:focus {
    outline: none;
  }
`;

const StyledContent = styled.div`
  h1 {
    font-size: 1.5rem;
    margin: 1rem 0 1rem 0;
    font-weight: bold;
    font-family: "Source Sans Pro", -apple-system, system-ui, BlinkMacSystemFont,
      "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
  }
  img {
    width: 100%;
    height: 15rem;
    object-fit: cover;
  }
`;

const styles = {
  tabs: {
    background: "#fff"
  },
  slide: {
    padding: 15,
    minHeight: 100,
    color: "#fff"
  },
  slide1: {
    backgroundColor: "#FEA900"
  },
  slide2: {
    backgroundColor: "#B3DC4A"
  },
  slide3: {
    backgroundColor: "#6AC0FF"
  },
  slide4: {
    backgroundColor: "#e980ff"
  }
};

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#000000"
    },
    secondary: {
      main: "#888888"
    }
  }
});

const StyledTabPanelContent = React.memo(({ img, title }) => {
  return (
    <StyledContent>
      <img src={img} alt="landscape" draggable="false" />
      <ContentContainer>
        <h1>{title}</h1>
        <div style={{ marginBottom: "1.25rem" }}>
          {[...new Array(4).keys()].map((i) => {
            return <Line width={i === 3 ? "50%" : "100%"} />;
          })}
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          {[...new Array(3).keys()].map((i) => {
            return <Line width={i === 2 ? "33%" : "100%"} />;
          })}
        </div>
        <div>
          {[...new Array(2).keys()].map((i) => {
            return <Line width={i === 1 ? "80%" : "100%"} />;
          })}
        </div>
      </ContentContainer>
      <img src={img} alt="landscape" draggable="false" />
      <ContentContainer>
        <h1>{title}</h1>
        <div style={{ marginBottom: "1.25rem" }}>
          {[...new Array(4).keys()].map((i) => {
            return <Line width={i === 3 ? "50%" : "100%"} />;
          })}
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          {[...new Array(3).keys()].map((i) => {
            return <Line width={i === 2 ? "33%" : "100%"} />;
          })}
        </div>
        <div>
          {[...new Array(2).keys()].map((i) => {
            return <Line width={i === 1 ? "80%" : "100%"} />;
          })}
        </div>
      </ContentContainer>
      <img src={img} alt="landscape" draggable="false" />
      <ContentContainer>
        <h1>{title}</h1>
        <div style={{ marginBottom: "1.25rem" }}>
          {[...new Array(4).keys()].map((i) => {
            return <Line width={i === 3 ? "50%" : "100%"} />;
          })}
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          {[...new Array(3).keys()].map((i) => {
            return <Line width={i === 2 ? "33%" : "100%"} />;
          })}
        </div>
        <div>
          {[...new Array(2).keys()].map((i) => {
            return <Line width={i === 1 ? "80%" : "100%"} />;
          })}
        </div>
      </ContentContainer>
    </StyledContent>
  );
});

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function useReactiveTabIndicator({ tabRefs, tabPanelsRef, tabIndicatorRef }) {
  const [tabIndicatorWidth, setTabIndicatorWidth] = useState(null);
  const lastRelativeScroll = React.useRef(0);
  const indicatorXPositionRef = React.useRef(0);
  const indicatorXScaleRef = React.useRef(1);
  const [index, setIndex] = useState(0);
  const lastTabRef = React.useRef(null);
  const previousIndex = usePrevious(index);
  const scrollLeftRef = React.useRef(0);
  const skipSettingIndexRef = React.useRef(false);
  const skipForcedScrollRef = React.useRef(false);
  const tabPanelsClientWidthRef = React.useRef();
  const tabClientWidthRefs = React.useRef();
  const tabOffsetLeftRefs = React.useRef();
  const rafActiveRef = React.useRef(false);
  const rafIdRef = React.useRef();
  const targetTranslateXRef = React.useRef();
  const targetScaleXRef = React.useRef();
  const hasScrollInitiatedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    // console.log(
    //   "setting tabIndicatorRef to",
    //   tabIndicatorRef.current.clientWidth
    // );
    setTabIndicatorWidth(tabIndicatorRef.current.clientWidth);
    tabPanelsClientWidthRef.current = tabPanelsRef.current.clientWidth;

    tabClientWidthRefs.current = tabRefs.current.map((el) => el.clientWidth);
    tabOffsetLeftRefs.current = tabRefs.current.map((el) => el.offsetLeft);
  }, []);

  React.useEffect(() => {
    // console.log("onChange just ran");
    if (!skipForcedScrollRef.current) {
      skipSettingIndexRef.current = true;

      tabPanelsRef.current.style = "scroll-snap-type: none";

      animateScrollTo([index * tabPanelsRef.current.clientWidth, 0], {
        elementToScroll: tabPanelsRef.current,
        // minDuration: 350,
        // minDuration: 350,
        maxDuration: 300,

        // acceleration until halfway, then deceleration
        easing: (t) => {
          return --t * t * t + 1;
        }
      })
        .then(() => {
          skipSettingIndexRef.current = false;

          tabPanelsRef.current.style = "scroll-snap-type: x mandatory";

          // On ios, setting scroll-snap-type resets the scroll position
          // so we need to reajust it to where it was before.
          tabPanelsRef.current.scrollTo(
            index * tabPanelsRef.current.clientWidth,
            0
          );
        })
        .finally(() => {});
    } else {
      // console.log("animateScrollTo was skipped");
      skipForcedScrollRef.current = false;
    }
    hasScrollInitiatedRef.current = false;
    // console.log({ index });
  }, [index]);

  const onScrollChanged = () => {
    function updateAnimation(
      originTranslateX,
      easeTranslateX,
      originScaleX,
      easeScaleX
    ) {
      let diffTranslateX = targetTranslateXRef.current - originTranslateX;
      let translateX = Math.abs(diffTranslateX) < 0.01 ? 0 : diffTranslateX * easeTranslateX;

      let diffScaleX = targetScaleXRef.current - originScaleX;
      let scaleX = Math.abs(diffScaleX) < 0.01 ? 0 : diffScaleX * easeScaleX;

      // console.log(Math.abs(translateX - originTranslateX), Math.abs(scaleX - originScaleX))
      if (translateX !== 0 || scaleX !== 0) {
        // Update `originTranslateX` scroll position
        originTranslateX += translateX;
        // Round value for better performance
        originTranslateX = parseFloat(originTranslateX.toFixed(2));

        // Update `originTranslateX` scroll position
        originScaleX += scaleX;
        // Round value for better performance
        originScaleX = parseFloat(originScaleX.toFixed(2));

        // Call `update` again, using `requestAnimationFrame`
        rafIdRef.current = requestAnimationFrame(() =>
          updateAnimation(
            originTranslateX,
            easeTranslateX,
            originScaleX,
            easeScaleX
          )
        );
      } else {
        // If `translateX === 0` && scaleX === 0
        // Update `current`, and finish the animation loop
        originTranslateX = targetTranslateXRef.current;
        originScaleX = targetScaleXRef.current;
        rafActiveRef.current = false;

        // cancelAnimationFrame(rafIdRef.current);
        
        // setTimeout(() => {
          // if (!rafActiveRef.current && rafIdRef.current) {
            // rafIdRef.current = null;
          // }
        // }, 1000);
        
      }

      

      // console.log({ originScaleX, originTranslateX });

      const scaleXCss = `scaleX(${originScaleX})`;
      const translateXCss = `translateX(${originTranslateX}px)`;

      // console.log({ scaleXCss, translateXCss})
      tabIndicatorRef.current.style.transform = `${translateXCss} ${scaleXCss}`;
    }
    updateAnimation(
      indicatorXPositionRef.current,
      0.01,
      indicatorXScaleRef.current,
      0.01
    );
  };

  const startAnimation = React.useCallback((scroll) => {
    const relativeScroll = scroll / tabPanelsClientWidthRef.current;

    const RIGHT = "RIGHT";
    const LEFT = "LEFT";

    function calculateScaleX(
      nextTabWidth,
      currentTabWidth,
      currentTabScrollProgress
    ) {
      let scaleX;
      const tabWidthRatio = nextTabWidth / currentTabWidth;

      if (tabWidthRatio < 1) {
        scaleX = 1 - currentTabScrollProgress * (1 - tabWidthRatio);
      } else {
        scaleX = 1 + currentTabScrollProgress * (tabWidthRatio - 1);
      }

      return scaleX;
    }

    const direction =
      lastRelativeScroll.current < relativeScroll ? RIGHT : LEFT;

    let currentTab = null;
    if (lastTabRef.current === null) {
      currentTab = tabRefs.current[previousIndex || 0];
      lastTabRef.current = currentTab;
    }

    if (direction === RIGHT) {
      /**
       *   Scroll Direction -->
       *              |----T1----|----T2----|----T3----|
       *                        ----------
       *                        ^ ----------
       *                        ^ ^
       *                        ^ ^
       *   _____________________^ ^________________________
       *   Last Relative scroll    Current Relative scroll
       *
       *   Valid Previous currentTab:
       *   - T1 (Scrolling left to right)
       *   - T2 (Was already on T2, scrolled left a bit, then scrolled right again)
       */

      if (Math.trunc(relativeScroll) > Math.trunc(lastRelativeScroll.current)) {
        currentTab = tabRefs.current[Math.trunc(relativeScroll)];
      } else {
        /**
         *   Scroll Direction -->
         *           |----T1----|----T2----|----T3----|
         *                        ----------
         *                        ^ ----------
         *                        ^ ^
         *                        ^ ^
         *   _____________________^ ^________________________
         *   Last Relative scroll    Current Relative scroll
         *
         *   Valid Previous currentTab:
         *   - T2 (Already on T2 and scrolling left to right)
         *   - T3 (scrolling left to right from T3, and then right to lef)
         */

        // don't do anything on this case because is not on a switching point
        currentTab = lastTabRef.current;
      }
    } else if (direction === LEFT) {
      // being very explicit for readability

      /**
       *   Scroll Direction <--
       *                 |----T1----|----T2----|----T3----|
       *                           ----------
       *                           ^ ----------
       *                           ^ ^
       *                           ^ ^
       *   ________________________^ ^________________________
       *   Current Relative scroll    Last Relative scroll
       *
       *   Valid Previous currentTab:
       *   - T2 (was already on T2 scrolling right to left)
       *   - T3 (scrolling right to left)
       */

      if (
        Math.trunc(relativeScroll) < Math.trunc(lastRelativeScroll.current) ||
        relativeScroll % 1 === 0
      ) {
        currentTab = tabRefs.current[Math.trunc(lastRelativeScroll.current)];
      } else {
        /**
         *   Scroll Direction <--
         *              |----T1----|----T2----|----T3----|
         *                           ----------
         *                           ^ ----------
         *                           ^ ^
         *   ________________________^ ^________________________
         *   Current Relative scroll    Last Relative scroll
         *
         *   Valid Previous currentTab:
         *   - T2 (was already on T2 scrolling left to right, and then right to left)
         *   - T3 (scrolling left to right)
         */

        // don't do anything on this case because is not on a switching point
        currentTab = lastTabRef.current;
      }
    }

    if (!currentTab) {
      alert("Unhandled case for currentTab!");
    }

    const currentTabIndex = tabRefs.current.findIndex(
      (tab) => tab === currentTab
    );

    const currentTabWidth = tabClientWidthRefs.current[currentTabIndex];

    let nextTabFromScrollDirection =
      direction === RIGHT
        ? tabRefs.current[Math.ceil(relativeScroll)]
        : tabRefs.current[Math.floor(relativeScroll)];

    scrollLeftRef.current = tabOffsetLeftRefs.current[currentTabIndex];

    let nextTabFromScrollDirectionWidth;
    let translateX;
    let scaleX;

    let currentTabScrollProgress;

    if (
      currentTab !== nextTabFromScrollDirection ||
      lastTabRef.current !== currentTab
    ) {
      currentTabScrollProgress =
        direction === RIGHT ? relativeScroll % 1 : 1 - (relativeScroll % 1);

      nextTabFromScrollDirectionWidth = nextTabFromScrollDirection.clientWidth;

      scaleX = calculateScaleX(
        nextTabFromScrollDirectionWidth,
        currentTabWidth,
        currentTabScrollProgress
      );

      if (direction === RIGHT) {
        translateX =
          scrollLeftRef.current + (relativeScroll % 1) * currentTabWidth;
      } else {
        translateX =
          scrollLeftRef.current -
          (1 - (relativeScroll % 1 || 1)) * nextTabFromScrollDirectionWidth;
      }
    } else {
      currentTabScrollProgress =
        direction === RIGHT
          ? 1 - (relativeScroll % 1 || 1)
          : relativeScroll % 1;

      let wasGonnaBeNextTab;
      let wasGonnaBeNextTabIndex;
      if (direction === LEFT) {
        wasGonnaBeNextTabIndex = currentTabIndex + 1;
        wasGonnaBeNextTab = tabRefs.current[wasGonnaBeNextTabIndex];
      } else {
        wasGonnaBeNextTabIndex = currentTabIndex - 1;
        wasGonnaBeNextTab = tabRefs.current[wasGonnaBeNextTabIndex];
      }
      nextTabFromScrollDirectionWidth =
        tabClientWidthRefs.current[wasGonnaBeNextTabIndex];

      scaleX = calculateScaleX(
        nextTabFromScrollDirectionWidth,
        currentTabWidth,
        currentTabScrollProgress
      );

      if (direction === RIGHT) {
        translateX =
          scrollLeftRef.current -
          currentTabScrollProgress * nextTabFromScrollDirectionWidth;
      } else {
        translateX =
          scrollLeftRef.current + currentTabScrollProgress * currentTabWidth;
      }
    }

    targetTranslateXRef.current = translateX;
    targetScaleXRef.current = scaleX;
    if (!rafActiveRef.current) {
      rafActiveRef.current = true;

      if (!hasScrollInitiatedRef.current) {
        requestAnimationFrame(() => {
          rafIdRef.current = requestAnimationFrame(() => onScrollChanged());
        });
        hasScrollInitiatedRef.current = true;
      } else {
        rafIdRef.current = requestAnimationFrame(() => onScrollChanged());
      }
      // console.log('requestAnimationFrame')
    }

    indicatorXScaleRef.current = targetScaleXRef.current;
    indicatorXPositionRef.current = targetTranslateXRef.current;

    // console.log({
    //   transform: tabIndicatorRef.current.style.transform,
    //   currentTab: currentTab.textContent,
    //   lastTabRef: lastTabRef.current.textContent
    // });
    if (lastTabRef.current !== currentTab) {
      if (!skipSettingIndexRef.current && index !== currentTabIndex) {
        // console.log("setting index from scroll to", currentTabIndex);

        skipForcedScrollRef.current = true;
        setIndex(currentTabIndex);
      }
      // console.log("setting tab indicator width to", currentTabWidth);
      
      setTabIndicatorWidth(currentTabWidth);

      // Is this really necessary? Commenting it out as it needs more testing.
      // tabIndicatorRef.current.style.transform = `${translateXCss} scaleX(1)`;
    }

    lastRelativeScroll.current = relativeScroll;

    if (lastTabRef.current !== currentTab) {
      lastTabRef.current = currentTab;
    }
  }, []);

  return { tabIndicatorWidth, index, setIndex, startAnimation };
}

function App() {
  const tabPanelsRef = React.useRef(null);
  const tabPanelsScrollWidthRef = React.useRef(null);
  const tabIndicatorRef = React.useRef(null);
  const { width } = useWindowSize();
  const tabsActionRef = React.useRef(null);

  const arrLength = tabs.length;
  const panelRefs = React.useRef([]);
  const tabRefs = React.useRef([]);

  const {
    tabIndicatorWidth,
    index,
    setIndex,
    startAnimation
  } = useReactiveTabIndicator({ tabRefs, tabPanelsRef, tabIndicatorRef });

  const addToRefs = (arrRefs) => (el) => {
    if (el && !arrRefs.current.includes(el)) {
      arrRefs.current.push(el);
    }
  };

  React.useEffect(() => {
    tabPanelsScrollWidthRef.current = tabPanelsRef.current.scrollWidth;
  }, [width]);

  const onChange = (e, i) => {
    setIndex(i);
  };

  let tabIndicatorStyle = {
    left: 0,
    transition: "none",

    // transition: "translate 0.15s ease-in",
    willChange: "transform, width",
    transformOrigin: "left 50% 0"
  };

  if (tabIndicatorWidth) {
    tabIndicatorStyle = { ...tabIndicatorStyle, width: tabIndicatorWidth };
  }

  const onScrollListener = React.useCallback((e) => {
    startAnimation(e.target.scrollLeft);
  }, []);

  React.useEffect(() => {
    tabPanelsRef.current.addEventListener("scroll", onScrollListener, {
      // passive: true
    });

    return () => {
      tabPanelsRef.current.removeEventListener("scroll", onScrollListener);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <div>
          <Tabs
            action={tabsActionRef}
            value={index}
            variant="scrollable"
            TabIndicatorProps={{
              ref: tabIndicatorRef,
              style: tabIndicatorStyle
            }}
            onChange={(e, val) => onChange(e, val)}
          >
            {tabs.map(({ img, title }, i) => (
              <Tab label={title} ref={addToRefs(tabRefs)} />
            ))}
          </Tabs>
          <StyledTabPanels
            ref={tabPanelsRef}
            // onScroll={(e) => {
            //   // const t0 = performance.now();
            //   startAnimation(e.target.scrollLeft);
            //   // const t1 = performance.now();
            //   // console.log(`onScrollChanged took ${t1 - t0}ms`);
            // }}
          >
            {tabs.map(({ img, title }, i) => {
              return (
                <StyledTabPanel ref={addToRefs(panelRefs)} key={i}>
                  <StyledTabPanelContent img={img} title={title} />
                </StyledTabPanel>
              );
            })}
          </StyledTabPanels>
          {/* <SwipeableViews
            enableMouseEvents
            index={index}
            onSwitching={(i, type) => {
              setFineIndex(i);
              if (type === "end") {
                onChange(i);
              }
            }}
          >
            <div style={{ ...styles.slide, ...styles.slide1 }}>slide n°1</div>
            <div style={{ ...styles.slide, ...styles.slide2 }}>slide n°2</div>
            <div style={{ ...styles.slide, ...styles.slide3 }}>slide n°3</div>
            <div style={{ ...styles.slide, ...styles.slide4 }}>slide n°4</div>
          </SwipeableViews> */}
        </div>
      </div>
    </ThemeProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
