import { useCallback, useEffect, useState } from 'react';

export const useContextMenu = (element: HTMLDivElement | null) => {
  const [visible, setVisible] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      setAnchorPoint({ x: event.pageX, y: event.pageY });
      setVisible(true);
    },
    [setVisible, setAnchorPoint],
  );
  const handleClick = useCallback(
    () => (visible ? setVisible(false) : null),
    [visible],
  );

  useEffect(() => {
    element?.addEventListener('click', handleClick);
    element?.addEventListener('contextmenu', handleContextMenu);
    return () => {
      element?.removeEventListener('click', handleClick);
      element?.removeEventListener('contextmenu', handleContextMenu);
    };
  });

  return { visible, anchorPoint };
};

export default { useContextMenu };
