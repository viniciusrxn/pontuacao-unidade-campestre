import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, isMobile]);

  return null;
};

export default ScrollToTop;


