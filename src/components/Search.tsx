import { useEffect, useRef } from 'react';

type SearchPropsType = {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
};

export const Search = ({ query, setQuery }: SearchPropsType) => {
  const searchInput = useRef(null);

  useEffect(() => {
    // (document.querySelector('.search') as HTMLInputElement).focus();
    const focusOnSearchBar = () => {
      if (
        !searchInput.current ||
        searchInput.current === document.activeElement
      )
        return;
      (searchInput.current as HTMLInputElement).focus();
      setQuery('');
    };

    const handlePressEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') focusOnSearchBar();
    };

    focusOnSearchBar();
    document.addEventListener('keydown', handlePressEnter);

    return () => document.removeEventListener('keydown', handlePressEnter);
  }, [setQuery]);

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
