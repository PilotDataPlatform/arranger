import React, { createContext, useState } from 'react';
import './ArrangerContext.css';

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
    <div className="arranger-context">
      <ArrangerStateContext.Provider value={{ arrangerState, setArrangerState: setState }}>
        {children}
      </ArrangerStateContext.Provider>
    </div>
  );
};

export default ArrangerStateContextProvider;
