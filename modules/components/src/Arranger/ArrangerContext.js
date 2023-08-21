import React, { createContext, useState } from 'react';

export const ArrangerStateContext = createContext({
  arrangerState: { columnState: {}, aggregationState: {} },
  setArrangerState: () => {},
});

const ArrangerStateContextProvider = ({ children }) => {
  const [arrangerState, setArrangerState] = useState({ columnState: {}, aggregationState: {} });

  const setState = (newState) => {
    setArrangerState({ ...arrangerState, ...newState });
  };

  return (
    <>
      <ArrangerStateContext.Provider value={{ arrangerState, setArrangerState: setState }}>
        {children}
      </ArrangerStateContext.Provider>
    </>
  );
};

export default ArrangerStateContextProvider;
