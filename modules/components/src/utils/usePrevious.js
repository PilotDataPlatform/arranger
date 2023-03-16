import { useEffect, useRef } from 'react';

const usePrevious = (value) => {
  const ref = useRef();
  const updateRef = (value) => (ref.current = value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return [ref.current, updateRef];
};

export default usePrevious;
