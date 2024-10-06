type SearchPropsType = {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
};
export const Search = ({ query, setQuery }: SearchPropsType) => {
  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
  );
};
