import { createContext, useState } from 'react';

export const AppContext = createContext();

export default AppProvider = ({ children }) => {
  const [token, SetToken] = useState('');

  console.log("Token Atualizado:", token)
  return (
    <AppContext.Provider value={[token, SetToken]}>
      {children}
    </AppContext.Provider>
  );
};