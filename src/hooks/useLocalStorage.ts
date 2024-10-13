import { useState, useEffect } from 'react';
import { WatchedFilm } from '../App';

export const useLocalStorage = (
  initialValue: WatchedFilm[],
  localStorageKey: string
) => {
  const [state, setState] = useState<WatchedFilm[]>(() => {
    return (
      JSON.parse(localStorage.getItem(localStorageKey) || '[]') || initialValue
    );
  });

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }, [state, localStorageKey]);

  return [state, setState] as const; // "const assertion" is needed. The reason is that 'return [watched, setWatched]' returns an "array" whose data type is '(WatchedFilm[] | React.Dispatch<React.SetStateAction<WatchedFilm[]>>)[]' which means each element in this array can have one of these 2 data types. But the "const assertion" makes the returned value a "tuple" with the data type 'readonly [WatchedFilm[], React.Dispatch<React.SetStateAction<WatchedFilm[]>>]', therefore each index has its own data type
};
