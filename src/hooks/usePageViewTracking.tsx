import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { fbqTrack } from '@/utils/metaPixel';

/**
 * Fires a Meta Pixel `PageView` event on every SPA route change.
 *
 * The initial PageView is already fired by the inline pixel snippet in
 * index.html, so we skip the very first invocation to avoid duplicates.
 */
export const usePageViewTracking = (): void => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fbqTrack('PageView');
  }, [location.pathname, location.search]);
};
