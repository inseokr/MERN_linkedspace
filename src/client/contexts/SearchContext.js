import React, { createContext, useState } from "react";

export const SearchContext = createContext();

export function SearchProvider(props) {
  const [search, setSearch] = useState("fremont,ca,usa");
  const changeSearch = e => setSearch(e.target.value);
  return (
      <SearchContext.Provider value={{ search, changeSearch }}>
        {props.children}
      </SearchContext.Provider>
  );
}