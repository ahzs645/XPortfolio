import { useState, useEffect } from 'react';

function useMouse(ref) {
  const [state, setState] = useState({
    docX: 0,
    docY: 0,
    posX: 0,
    posY: 0,
    elX: 0,
    elY: 0,
    elW: 0,
    elH: 0,
  });

  useEffect(() => {
    const moveHandler = (event) => {
      const newState = {
        docX: event.pageX,
        docY: event.pageY,
        posX: event.clientX,
        posY: event.clientY,
      };

      if (ref && ref.current) {
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const posX = left + window.scrollX;
        const posY = top + window.scrollY;
        newState.elX = event.pageX - posX;
        newState.elY = event.pageY - posY;
        newState.elW = width;
        newState.elH = height;
      }

      setState(newState);
    };

    document.addEventListener('mousemove', moveHandler);

    return () => {
      document.removeEventListener('mousemove', moveHandler);
    };
  }, [ref]);

  return state;
}

export default useMouse;
