import { useCallback, useState } from 'react';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { Navbar } from './components/Navbar';
import { Search } from './components/Search';
import { NumResult } from './components/NumResult';
import { Main } from './components/Main';
import { Box } from './components/Box';
import { MovieList } from './components/MovieList';
import { WatchedSummary } from './components/WatchedSummary';
import { WatchedMoviesList } from './components/WatchedMoviesList';
import { SelectedMovieInfo } from './components/SelectedMovieInfo';
import { useMovies } from './hooks/useMovies';
import { useLocalStorage } from './hooks/useLocalStorage';

export type Film = {
  score: number | null;
  show: {
    id: number | null;
    name: string | null;
    premiered: string | null;
    image: { medium: string } | null;
    externals: {
      imdb: string | null;
      thetvdb: number | null;
      tvrage: number | null;
    };
  };
};

export type WatchedFilm = Film & {
  show: {
    runtime: number | null;
    rating: { average: number | null };
    userRating: number | null;
    ratingDecisionCounter?: number;
  };
};

// type SelectedFilm = Pick<WatchedFilm, "show">; // {show: {}}
export type SelectedFilm = WatchedFilm['show'] & {
  genres: string[];
  summary: string | null;
};

export const average = (arr: (number | null)[]) =>
  arr.reduce(
    (acc: number, cur: number, i: number, arr: number[]): number =>
      acc + cur / arr.length,
    0
  );

export default function App() {
  const handleCloseSelectedMovie = useCallback(() => {
    setSelectedImdbId(null);
    setSelectedId(null);
  }, []);

  const [query, setQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedImdbId, setSelectedImdbId] = useState<string | null>(null);

  const { isLoading, error, movies } = useMovies(
    query,
    handleCloseSelectedMovie
  );
  const [watched, setWatched] = useLocalStorage([], 'watchedMovies');

  const handleAddWatchedMovie = (movie: WatchedFilm) => {
    setWatched(prevState => {
      if (
        prevState.some(watchedMovie => watchedMovie.show.id === movie.show.id)
      )
        return prevState;
      return [...prevState, movie];
    });

    // localStorage.setItem('watchedMovies', JSON.stringify([...watched, movie]));
    // localStorage.setItem("watchedMovies", JSON.stringify(watched)) // "watched" is a "stale" state here
  };

  const handleRemoveWatchedMovie = (watchedMovieId: number) => {
    setWatched(prevState =>
      prevState.filter(watchedMovie => watchedMovie.show.id !== watchedMovieId)
    );

    // localStorage.setItem(
    //   'watchedMovies',
    //   JSON.stringify(
    //     watched.filter(watchedMovie => watchedMovie.show.id !== watchedMovieId)
    //   )
    // );
  };

  const handleSelectedMovie = (id: number | null, imdbId: string | null) => {
    setSelectedImdbId(imdbId);
    id === selectedId ? setSelectedId(null) : setSelectedId(id);
  };

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </Navbar>
      {/* <Main children={<ListBox children={<MovieList movies={movies} />} />} /> */}
      {/* <Main children={<ListBox children={MovieList({ movies: movies })} />} /> !WRONG! */}
      <Main>
        <Box>
          {isLoading && !error && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <MovieList
              onHandleSelectMovie={handleSelectedMovie}
              movies={movies}
            />
          )}
        </Box>
        <Box>
          {selectedId !== null ? (
            <SelectedMovieInfo
              key={selectedId} // without key, one instance of the component "SelectedMovieInfo" is created and when we click on other movies in the list, different props will be passed to the same component instance. so the state "selectedMovie" in the component "SelectedMovieInfo" will not be reset to null, and we cannot see the loader. Also, after clicking on another movie, the states that are not passed as prop will be preserved. For example, the rating will not change
              selectedImdbId={selectedImdbId}
              onCloseSelectedMovie={handleCloseSelectedMovie}
              onAddWatchedMovie={handleAddWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onRemoveWatchedMovie={handleRemoveWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
