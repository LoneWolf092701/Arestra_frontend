import React, { createContext, useState, useEffect } from 'react';

export const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [propertyType, setPropertyType] = useState(() => {
    const storedType = localStorage.getItem('propertyType');
    return storedType ? JSON.parse(storedType) : '';
  });

  useEffect(() => {
    localStorage.setItem('propertyType', JSON.stringify(propertyType));
  }, [propertyType]);

  return (
    <PropertyContext.Provider value={{ propertyType, setPropertyType }}>
      {children}
    </PropertyContext.Provider>
  );
};
