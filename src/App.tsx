import { ReactNode, useCallback, useEffect, useState } from 'react';
import StarRating from './StarRating/StarRating';

const getSummary = (summary: string | null | undefined) => {
  if (!summary) return '';
  let text = summary;
  while (true) {
    const i1 = text.search('<');
    const i2 = text.search('>');
    if (i1 === -1 || i2 === -1) break;
    const part1 = text.substring(0, i1);
    const part2 = text.substring(i2 + 1);
    text = part1 + part2;
  }
  return text;
};

type Film = {
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

type WatchedFilm = Film & {
  show: {
    runtime: number | null;
    rating: { average: number | null };
    userRating: number | null;
  };
};

// type SelectedFilm = Pick<WatchedFilm, "show">; // {show: {}}
type SelectedFilm = WatchedFilm['show'] & {
  genres: string[];
  summary: string | null;
};

const average = (arr: (number | null)[]) =>
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
        if (!error && query.length >= 4 && !movies.length) setIsLoading(true);
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

const Loader = () => {
  return <p className='loader'>Loading ...</p>;
};

type ErrorMessagePropsType = {
  message: string;
};

const ErrorMessage = ({ message }: ErrorMessagePropsType) => {
  return <p className='error'>{message}</p>;
};

type childrenType = {
  children: ReactNode;
};

const Navbar = ({ children }: childrenType) => {
  return (
    <nav className='nav-bar'>
      <Logo />
      {children}
    </nav>
  );
};

const Logo = () => {
  return (
    <div className='logo'>
      <span role='img'>🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
};

type SearchPropsType = {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
};

const Search = ({ query, setQuery }: SearchPropsType) => {
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

type NumResultPropsType = {
  movies: Film[];
};

const NumResult = ({ movies }: NumResultPropsType) => {
  return (
    // if we use "movies.length &&" instead of "movies.length > 0 &&": if "movies" is an empty array, 0 will be returned, instead of false. Therefore 0 will be painted for a moment on the page. But if we use "movies.length > 0 &&" and if "movies" is an [], then false will be returned and nothing will be painted on the page because React does not paint boolean values (true, false), undefined, and null
    movies.length > 0 && (
      <p className='num-results'>
        Found <strong>{movies.length}</strong> results
      </p>
    )
  );
};

const Main = ({ children }: childrenType) => {
  return <main className='main'>{children}</main>;
};

type BoxPropsType = {
  children: ReactNode;
};

const Box = ({ children }: BoxPropsType) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const handleClick = () => setIsOpen(prevState => !prevState);

  return (
    <div className='box'>
      <button className='btn-toggle' onClick={handleClick}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  );
};

type MovieListPropsType = {
  movies: Film[];
  onHandleSelectMovie: (id: number | null, imdbId: string | null) => void;
};

const MovieList = ({ movies, onHandleSelectMovie }: MovieListPropsType) => {
  return (
    <ul className='list list-movies'>
      {movies.length > 0 &&
        movies?.map(movie => (
          <Movie
            onHandleSelectMovie={onHandleSelectMovie}
            key={movie.show.id}
            movie={movie}
          />
        ))}
    </ul>
  );
};

type MoviePropsType = {
  movie: Film;
  onHandleSelectMovie: (id: number | null, imdbId: string | null) => void;
};

const Movie = ({ movie, onHandleSelectMovie }: MoviePropsType) => {
  return (
    <li
      onClick={onHandleSelectMovie.bind(
        null,
        movie.show.id,
        movie.show.externals.imdb
      )}
    >
      <img src={movie.show.image?.medium} alt={`${movie.show.name} poster`} />
      <h3>{movie.show.name}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.show.premiered}</span>
        </p>
      </div>
    </li>
  );
};

type WatchedSummaryPropsType = {
  watched: WatchedFilm[];
};

const WatchedSummary = ({ watched }: WatchedSummaryPropsType) => {
  const avgImdbRating = average(
    watched.map(movie => movie.show.rating.average)
  );
  const avgUserRating = average(watched.map(movie => movie.show.userRating));
  const avgRuntime = average(watched.map(movie => movie.show.runtime));

  return (
    <div className='summary'>
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating?.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating?.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime?.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
};

type WatchedMoviesListPropsType = {
  watched: WatchedFilm[];
  onRemoveWatchedMovie: (watchedMovieId: number) => void;
};

const WatchedMoviesList = ({
  watched,
  onRemoveWatchedMovie,
}: WatchedMoviesListPropsType) => {
  return (
    <ul className='list'>
      {watched.map(movie => (
        <WatchedMovie
          key={movie.show.id}
          movie={movie}
          onRemoveWatchedMovie={onRemoveWatchedMovie}
        />
      ))}
    </ul>
  );
};

type WatchedMoviePropsType = {
  movie: WatchedFilm;
  onRemoveWatchedMovie: (watchedMovieId: number) => void;
};

const WatchedMovie = ({
  movie,
  onRemoveWatchedMovie,
}: WatchedMoviePropsType) => {
  return (
    <li>
      <img src={movie.show.image?.medium} alt={`${movie.show.name} poster`} />
      <h3>{movie.show.name}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.show.rating?.average}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.show.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.show.runtime} min</span>
        </p>
      </div>
      <button
        className='btn-delete'
        onClick={onRemoveWatchedMovie.bind(null, movie.show.id)}
      >
        &times;
      </button>
    </li>
  );
};

type SelectedMoviePropsType = {
  selectedImdbId: string | null;
  onCloseSelectedMovie: () => void;
  onAddWatchedMovie: (movie: WatchedFilm) => void;
  watched: WatchedFilm[];
};

const SelectedMovieInfo = ({
  selectedImdbId,
  onCloseSelectedMovie,
  onAddWatchedMovie,
  watched,
}: SelectedMoviePropsType) => {
  const [selectedMovie, setSelectedMovie] = useState<SelectedFilm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(0);
  // const [isInWatchedList, setIsInWatchedList] = useState<boolean>(false);
  const {
    id,
    name,
    image,
    externals: { imdb } = { imdb: null },
    premiered,
    runtime,
    genres,
    rating: { average } = { average: null },
    summary,
  } = selectedMovie ?? {}; // if selectedMovie is null or undefined, then destruct {}. ({} does not have the property "name", so selectedMovie.name will be undefined. Therefore, variable "name" will have the value "undefined". but for nested, destructures, it must again be checked: {}.externals is undefined, so {}.externals.imdb is an error) => externals: { imdb } = { imdb: null } means: if the property "externals" does not exist in the object which is being destructed, e.g. {}, then assign the default value {imdb: null} to the property "externals" and then destruct "externals"

  // "isInWatchedList" must be a "derived state". If it is a state, as commented above, it will not work. Because each time the "+ add to list" button is clicked, this component (SelectedMovieInfo) is unmounted and the next time that a "Movie" is selected in the "MovieList", a new instance of this component will be created with a reseted state. But a "derived state" works because on each mount, the derived state "isInWatchedList" is initialized based on the state "watched" which is a list of the watched movies and is the state of the component "App" therefore after the component "SelectedMovieInfo" is unmounted, the state "watched" is preserved because the component "App" is re-rendered but it is not unmounted (untill the page is refreshed).
  // derived state: (1)if updating the state A is dependant on state B, probably state A must be a derived state instead of a state (2)the value of the state is needed on the first render (mount) and in each re-render during the render phase (during the function call) so that the value can be immediately used in the return statement (JSX). (using a value (derived state) immediately, instead of creating a state and update it using an "event handler or useEffect()" and using the updated state after the browser paint). for example, when a "Movie" is clicked and the "SelectedMovieInfo" component is rendered (called), the derived state "isInWatchedList" is initialized immediately based on a parent state and is used in the return statement and the component is mounted and the UI is painted based on that value
  const isInWatchedList = watched
    .map(watchedMovie => watchedMovie.show.id)
    .includes(id!);

  const selectedMovieUserRating = watched.find(
    watchedMovie => watchedMovie.show.id === id
  )?.show.userRating;

  const summaryText = getSummary(summary);
  useEffect(() => {
    const controller = new AbortController();

    // the return data type cannot be Promise<SelectedFilm> | Promise<null>
    const fetchSelectedMovie = async (): Promise<SelectedFilm | null> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.tvmaze.com/lookup/shows?imdb=${selectedImdbId}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        // if (data?.status)
        if (data?.status === 400) throw new Error('Bad Request');
        setSelectedMovie(data);
        // return data;
        return Promise.resolve(data);
      } catch (error) {
        if (error?.name !== 'AbortError') console.log(error);
        // return null; // async function returns a promise. the returned promise will be a "fulfilled (resolved)" promise with the result null
        return Promise.resolve(null); // Promise.resolve(null) returns a promise which is resolved with the value null

        // return Promise.reject(null); // Promise.reject(null) returns a rejected promise with the result null. a rejected promise throws an error instance (exception)
      } finally {
        setIsLoading(false);
        // setSelectedMovie(null)
      }
    };

    fetchSelectedMovie();

    return () => {
      controller.abort();
    };
  }, [selectedImdbId]);

  // after clicking on a "Movie" (if the movie has the DETAILS), the "render" message will be logged 3 times and the "clean up" message will be logged 2 times. each of them will be called once because of the "react strict mode". so there are 2 real logs for "render" message and 1 real log for the "clean up" message. First the component is rendered, then painted, and then useEffec() call back function is called (1st real render message is logged). but because the other useEffec() updates a state, the component is re-rendered. this re-render causese the "name, which is in the dependency array" to update (because the other state (selectedMovie) is updated so name is selectedMovie.name). it will cause this useEffec() callback function to be called again, but before that the clean up function is called (the real clean up message). and now, the useEffec() callback function is called again to sync the effect with the state (2nd real render message)
  useEffect(() => {
    console.log('render or re-render');
    document.title = name || 'usePopcorn';
    return () => {
      document.title = 'usePopcorn';
      console.log(
        `component 'SelectedMovieInfo' is re-rendered or unmounted. ${name}` // even after the component is unmounted and it is out of the stack, the clean up callback function which is registered in the event loop has access to the variable "name". This is because of "closure". The clean up callback function has access to all the variables not only in the scope of the useEffect(), but also in the scope of the "SelectedMovieInfo" function
      );
    };
  }, [name]);

  useEffect(() => {
    const handlePressEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseSelectedMovie();
        console.log(event.code);
      }
    };
    document.addEventListener('keydown', handlePressEscape); // 1)when this component (SelectedMovieInfo) is rendered for the first time (mounted) "handlePressEscape" event handler function is registered in the event loop (empty dependency array => actually the dependency array is not empty but the function definition "onCloseSelectedMovie" is memoized using useCallback() hook with an empty array dependency in the App component, and since its "reference" is passed (prop drilling) to this component without any modification, it will never change). If the event handler is not removed by the clean up callback function, this event handler will be called when the related event is triggered even if this component is unmounted. 2)The other consequence of not using the clean up callback function is that, whenever a new Movie is clicked, a new event handler is registered in the event loop (because a new instance of the component "SelectedMovieInfo" with a new "key" is mounted) while the previous event handlers still exist and therefore all the event handlers will be called (if a console.log() is called, several logs can be seen by pressing the Escape key once). 3)Finally, if there is the clean up call back function: when a Movie is clicked, the "SelectedMovieInfo" component is mounted therefore the useEffect() callback function is called and registers the "handlePressEscape" event handler. now, because of the react strict mode, the component is unmounted and the registered event handler is removed. then the component is mounted again and the useEffect() callback registers the event handler in the event loop, so at the end only one event handler is registered because the first one was removed on component unmount. now if the Escape key is pressed only one log is printed. But if the clean up callback function does not exist: when a Movie is clicked, the useEffect() is called and registers the "handlePressEscape" event handler in the event loop. then the component is unmounted due to react strict mode and mounted again which creates and registers a new event handler function. now if the Escape key is pressed, both event handlers will be called which results in 2 logs
    return () => {
      document.removeEventListener('keydown', handlePressEscape);
    };
  }, [onCloseSelectedMovie]);

  const handleAddWatchedMovie = () => {
    if (!selectedMovie) return;
    const watchedMovie: WatchedFilm = {
      score: average,
      show: {
        externals: { imdb, thetvdb: null, tvrage: null },
        id: id!,
        image: image!,
        name: name!,
        premiered: premiered!,
        rating: {
          average,
        },
        runtime: runtime!,
        userRating,
      },
    };
    onAddWatchedMovie(watchedMovie);
    onCloseSelectedMovie();
  };

  return (
    <div className='details'>
      {isLoading ? (
        <Loader />
      ) : selectedMovie ? (
        <>
          <header>
            <button className='btn-back' onClick={onCloseSelectedMovie}>
              &larr;
            </button>
            <img src={image?.medium} alt={name || 'Movie Not Found!'} />
            <div className='details-overview'>
              <h2>{name}</h2>
              <p>
                {premiered} &bull;{runtime}{' '}
              </p>
              <p>{genres?.join(', ')}</p>
              <p>
                <span>⭐</span>
                {average} IMDB Rating
              </p>
            </div>
          </header>

          <section>
            <div className='rating'>
              {!isInWatchedList ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    setRateState={setUserRating}
                  />
                  {userRating > 0 && (
                    <button onClick={handleAddWatchedMovie} className='btn-add'>
                      + Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>You have already rated {selectedMovieUserRating}</p>
              )}
            </div>

            <em>{summaryText}</em>
          </section>
        </>
      ) : (
        <ErrorMessage message='Details Not Found!' />
      )}
    </div>
  );
};

/* 
useEffect(callback) callback function will be called after the browser paints the DOM on the screen. So, the component "SelectedMovieInfo" will first return the content 'Details Not Found!' because the "selectedMovie" is null. after that, when the data is fetched (useEffec() callback function is called), the state will be updated so the component will be re-rendered and this time the state is not null 

*/
