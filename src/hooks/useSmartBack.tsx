import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Returns a handler that mimics the browser Back button:
 * - If there's any in-app history before the current entry, go back one entry.
 * - Otherwise (direct link, bookmark, fresh tab), fall back to the destination.
 *
 * Uses React Router's internal stack index (history.state.idx) instead of
 * location.key, because the initial entry keeps key='default' even after
 * navigating forward and back to it — which would incorrectly trigger the
 * fallback for users who'd been moving between sections.
 */
export function useSmartBack(fallback: string = '/dashboard') {
  const navigate = useNavigate();

  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [navigate, fallback]);
}
