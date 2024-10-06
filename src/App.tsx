import { useCallback, useEffect, useState } from 'react';
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
  const [movies, setMovies] = useState<Film[]>([]);
  const [watched, setWatched] = useState<WatchedFilm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedImdbId, setSelectedImdbId] = useState<string | null>(null);

  const handleCloseSelectedMovie = useCallback(() => {
    setSelectedImdbId(null);
    setSelectedId(null);
  }, []);

  const handleAddWatchedMovie = (movie: WatchedFilm) => {
    setWatched(prevState => {
      if (
        prevState.some(watchedMovie => watchedMovie.show.id === movie.show.id)
      )
        return prevState;
      return [...prevState, movie];
    });
  };

  const handleRemoveWatchedMovie = (watchedMovieId: number) => {
    setWatched(prevState =>
      prevState.filter(watchedMovie => watchedMovie.show.id !== watchedMovieId)
    );
  };

  const handleSelectedMovie = (id: number | null, imdbId: string | null) => {
    setSelectedImdbId(imdbId);
    id === selectedId ? setSelectedId(null) : setSelectedId(id);
  };

  /* useEffect(() => {
    console.log("Only After the initial render (after componentDidMount)");
  }, [])

  useEffect(() => {
    console.log("After the initial render and also after each re-render");
  })

  console.log("During the initial render and also during each re-render");

  useEffect(()=>{
    console.log("After the initial render and also after the state 'query' is updated");
  }, [query]) */

  // console.log(Navbar(NumResult));

  // console.log(Navbar({ children: NumResult({ movies: movies }) })); // 1.type: "nav" 2. is NOT a component instance (is the react element returned as JSX)

  // console.log(<Navbar children={<NumResult movies={movies} />} />); // 1.type: function Navbar 2. is an instance of the Component Navbar

  // useEffect(function () {
  //   fetch("https://api.tvmaze.com/search/shows?q=better call soul")
  //     .then((response: Response) => {
  //       return response.json();
  //     })
  //     .then((data: WatchedFilm[]) => {
  //       console.log(data);
  //       setMovies(data);
  //       return data;
  //     })
  //     .catch((error: Error) => {
  //       console.log(error.message);
  //     });
  // }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async function (): Promise<WatchedFilm[]> {
      try {
        // if query.length >= 3 is set as a condition, and if when the search query has exactly 3 characters no movies can be found, at the same moment the both states "isLoading" and "error" will be true, and in the return statement, for one moment "is Loading" is painted and immediately after that "no result" is painted. But, at any moment, only and exactly one of the 3 react elements inside the <Box></Box> (in the return statement) must be painted
        if (!error && query.length >= 3) setIsLoading(true);
        const response = await fetch(
          `https://api.tvmaze.com/search/shows?q=${query}`,
          { signal: controller.signal }
        );

        // if (!response.ok) {
        //   throw new Error();
        // }
        const data: WatchedFilm[] = await response.json();
        setMovies(data);

        if (!data.length) throw new Error('No Result!');
        setError('');
        return data;
      } catch (error) {
        // console.log(error);
        if (error instanceof Error && error.name !== 'AbortError')
          setError(error.message);
        else if (!(error instanceof Error)) setError('Unknown Error!');
        return [];
      } finally {
        setIsLoading(false);
      }
    };

    if (query.length < 3) {
      setError('');
      setMovies([]);
      setIsLoading(false);
      return;
    }

    handleCloseSelectedMovie();
    fetchData();

    /* try {
      // before "promise" is setteled (while promise is pending), try block gets executed and since no error has occured, catch() block will not be executed. if some problems happen during the fetch process, and an error instance is thrown, it cannot be caught since the execution flow has passed the try-catch block
      const promise = fetchData();
      console.log(promise);
    } catch (error) {
      console.log("ERROR");
      console.log(error?.messages);
    } */

    // if we search for the movie abcd123, the first request will be sent when the third character is entered (this is a condition applied before calling the fetch()) so the first request will be with the query "abc", then immediately another request will be sent with the query "abcd", and then with "abcd1" and so on. if we do not cancel the previous request before sending a new http request (in case of typing fast or a slow connection), multiple issues might happen which are receiving and downloading large unneccessary data, each request that is sent might slow down the other requests, and finally if an unimportant request takes longer than the other requests (e.g. the request for the search "abc" takes longer than the final request which is "abc123") then the response for that unimportant request is the last response that is received and the final update of the states will be based on that response
    return () => {
      controller.abort();
    };
  }, [query, error, movies.length, handleCloseSelectedMovie]); // if the object (array) "movies" is the dependency, instead of the primitive value "movies.length", an infinite loop will happen. because at the beginning (componentDidMount) "query.length < 3" is true, and setMovies([]) is executed. Although the state "movies" was already [], but because [] !== [], it means the state is updated (a new object or array in a new memory address is created), therefore after the re-render, the useState() callback function will be executed again and it continues. But when the dependency is movies.length, which is a number, because 0 === 0, the dependency is not updated, so after the re-render, the useEffect() callback function will not be executed.

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
