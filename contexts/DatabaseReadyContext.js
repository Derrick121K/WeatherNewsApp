import { createContext } from 'react';

const DatabaseReadyContext = createContext({
  ready: false,
  setReady: () => {},
});

export default DatabaseReadyContext;
