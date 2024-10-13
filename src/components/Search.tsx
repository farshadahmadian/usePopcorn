import { useCallback, useEffect, useRef } from 'react';
import { useKey } from '../hooks/useKey';

type SearchPropsType = {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
};

export const Search = ({ query, setQuery }: SearchPropsType) => {
  const searchInput = useRef(null);

  const focusOnSearchBar = useCallback(() => {
    if (!searchInput.current || searchInput.current === document.activeElement)
      return;
    (searchInput.current as HTMLInputElement).focus();
    setQuery('');
  }, [setQuery]);

  useEffect(() => {
    focusOnSearchBar();
  }, [focusOnSearchBar]);

  useKey('Enter', focusOnSearchBar);

  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={e => setQuery(e.target.value)}
      ref={searchInput}
    />
  );
};
