import { useLayoutEffect } from 'react';

/*  Masonry layout
    The grid has tiny 2px rows. Each card spans enough rows to fit its
    own height (+ the gap), so short and tall cards pack together like
    Google Keep. Re-runs when the notes change or anything resizes.      */

const ROW_HEIGHT = 2;

export default function useMasonry(gridRef, deps) {
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    let frame = 0;

    function layout() {
      const gap = parseFloat(getComputedStyle(grid).getPropertyValue('--gap')) || 16;
      grid.querySelectorAll(':scope > .note').forEach((card) => {
        card.style.gridRowEnd = 'auto';
        const height = card.getBoundingClientRect().height;
        card.style.gridRowEnd = `span ${Math.ceil((height + gap) / ROW_HEIGHT)}`;
      });
    }

    function scheduleLayout() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layout);
    }

    layout();

    const observer = new ResizeObserver(scheduleLayout);
    observer.observe(grid);
    Array.from(grid.children).forEach((card) => observer.observe(card));
    document.fonts?.ready.then(scheduleLayout);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
