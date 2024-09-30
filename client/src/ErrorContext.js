import React, { createContext, useState, useContext } from 'react';

const ErrorContext = createContext();

export const useError = () => useContext(ErrorContext);

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000); // Clear notification after 5 seconds
  };

  return (
    <ErrorContext.Provider value={{ error, showError, notification, showNotification }}>
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorContext;