import { useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';

export function usePictureInPicture() {
  const [isPiP, setIsPiP] = useState(false);
  const pipRootRef = useRef(null);
  const pipWindowRef = useRef(null);

  const isSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  const openPiP = useCallback(async (renderContent) => {
    if (!isSupported) {
      alert('Picture-in-Picture is supported in Chrome and Edge 116+. Please use one of those browsers.');
      return;
    }

    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 400,
        height: 600,
        disallowReturnToOpener: false,
      });

      pipWindowRef.current = pipWindow;

      // Copy all stylesheets from the main document into the PiP window
      [...document.styleSheets].forEach((sheet) => {
        try {
          const cssRules = [...sheet.cssRules].map((rule) => rule.cssText).join('');
          const styleEl = pipWindow.document.createElement('style');
          styleEl.textContent = cssRules;
          pipWindow.document.head.appendChild(styleEl);
        } catch {
          // Cross-origin sheets — copy via <link> instead
          if (sheet.href) {
            const linkEl = pipWindow.document.createElement('link');
            linkEl.rel = 'stylesheet';
            linkEl.href = sheet.href;
            pipWindow.document.head.appendChild(linkEl);
          }
        }
      });

      // Match the body classes (dark mode, fonts, etc.)
      pipWindow.document.body.className = document.body.className;
      pipWindow.document.documentElement.className = document.documentElement.className;
      pipWindow.document.body.style.cssText = `margin:0;padding:0;overflow:hidden;background:hsl(220,15%,8%);`;

      // Create a mount point
      const container = pipWindow.document.createElement('div');
      container.id = 'pip-root';
      container.style.cssText = 'width:100%;height:100vh;overflow:hidden;';
      pipWindow.document.body.appendChild(container);

      const root = ReactDOM.createRoot(container);
      pipRootRef.current = root;
      root.render(renderContent);

      setIsPiP(true);

      pipWindow.addEventListener('pagehide', () => {
        pipRootRef.current = null;
        pipWindowRef.current = null;
        setIsPiP(false);
      });

    } catch (err) {
      console.error('PiP failed:', err);
    }
  }, [isSupported]);

  const closePiP = useCallback(() => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
    }
  }, []);

  const updatePiP = useCallback((renderContent) => {
    if (pipRootRef.current) {
      pipRootRef.current.render(renderContent);
    }
  }, []);

  return { isPiP, isSupported, openPiP, closePiP, updatePiP };
}