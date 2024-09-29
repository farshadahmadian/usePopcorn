import { ReactNode, useEffect, useState } from 'react';
import StarRating from './StarRating/StarRating';

const tempMovieData = [
  {
    score: 0.6,
    show: {
      id: 618,
      name: 'Better Call Saul',
      premiered: '2015-02-08',
      image: {
        original:
          'https://static.tvmaze.com/uploads/images/original_untouched/501/1253515.jpg',
      },
    },
  },
];

const tempWatchedData = [
  {
    score: 0.6,
    show: {
      id: 618,
      name: 'Better Call Saul',
      premiered: '2015-02-08',
      image: {
        original:
          'https://static.tvmaze.com/uploads/images/original_untouched/501/1253515.jpg',
      },
      runtime: 60,
      rating: { average: 8.6 },
      userRating: 8.5,
    },
  },
];

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
    const fetchData = async function (): Promise<WatchedFilm[]> {
      try {
        // if query.length >= 3 is set as a condition, and if when the search query has exactly 3 characters no movies can be found, at the same moment the both states "isLoading" and "error" will be true, and in the return statement, for one moment "is Loading" is painted and immediately after that "no result" is painted. But, at any moment, only and exactly one of the 3 react elements inside the <Box></Box> (in the return statement) must be painted
        if (!error && query.length >= 4 && !movies.length) setIsLoading(true);
        const response = await fetch(
          `https://api.tvmaze.com/search/shows?q=${query}`
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
        console.log(error);
        if (error instanceof Error) setError(error.message);
        else setError('Unknown Error!');
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
    fetchData();

    /* try {
      // before "promise" is setteled (while promise is pending), try block gets executed and since no error has occured, catch() block will not be executed. if some problems happen during the fetch process, and an error instance is thrown, it cannot be caught since the execution flow has passed the try-catch block
      const promise = fetchData();
      console.log(promise);
    } catch (error) {
      console.log("ERROR");
      console.log(error?.messages);
    } */
  }, [query, error, movies.length]); // if the object (array) "movies" is the dependancy, instead of the primitive value "movies.length", an infinite loop will happen. because at the beginning (componentDidMount) "query.length < 3" is true, and setMovies([]) is executed. Although the state "movies" was already [], but because [] !== [], it means the state is updated (a new object or array in a new memory address is created), therefore after the re-render, the useState() callback function will be executed again and it continues. But when the dependancy is movies.length, which is a number, because 0 === 0, the dependancy is not updated, so after the re-render, the useEffect() callback function will not be executed.

  const handleSelectedMovie = (id: number | null, imdbId: string | null) => {
    setSelectedImdbId(imdbId);
    id === selectedId ? setSelectedId(null) : setSelectedId(id);
  };

  const handleCloseSelectedMovie = () => {
    setSelectedImdbId(null);
    setSelectedId(null);
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
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
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
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
};

type WatchedMoviesListPropsType = {
  watched: WatchedFilm[];
};

const WatchedMoviesList = ({ watched }: WatchedMoviesListPropsType) => {
  return (
    <ul className='list'>
      {watched.map(movie => (
        <WatchedMovie key={movie.show.id} movie={movie} />
      ))}
    </ul>
  );
};

type WatchedMoviePropsType = {
  movie: WatchedFilm;
};

const WatchedMovie = ({ movie }: WatchedMoviePropsType) => {
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
    </li>
  );
};

type SelectedMoviePropsType = {
  selectedImdbId: string | null;
  onCloseSelectedMovie: () => void;
};

const SelectedMovieInfo = ({
  selectedImdbId,
  onCloseSelectedMovie,
}: SelectedMoviePropsType) => {
  const [selectedMovie, setSelectedMovie] = useState<SelectedFilm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    name,
    image,
    externals: { imdb } = { imdb: null },
    premiered,
    runtime,
    genres,
    rating: { average } = { average: null },
    summary,
  } = selectedMovie ?? {}; // if selectedMovie is null or undefined, then destruct {}. ({} does not have the property "name", so selectedMovie.name will be undefined. Therefore, variable "name" will have the value "undefined". but for nested, destructures, it must again be checked: {}.externals is undefined, so {}.externals.imdb is an error) => externals: { imdb } = { imdb: null } means: if the property "externals" does not exist in the object which is being destructed, e.g. {}, then assign the default value {imdb: null} to the property "externals" and then destruct "externals"
  const summaryText = getSummary(summary);
  useEffect(() => {
    // the return data type cannot be Promise<SelectedFilm> | Promise<null>
    const fetchSelectedMovie = async (): Promise<SelectedFilm | null> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.tvmaze.com/lookup/shows?imdb=${selectedImdbId}`
        );
        const data = await response.json();
        // if (data?.status)
        if (data?.status === 400) throw new Error('Bad Request');
        setSelectedMovie(data);
        // return data;
        return Promise.resolve(data);
      } catch (error) {
        console.log(error);
        // return null;
        return Promise.reject(null);
      } finally {
        setIsLoading(false);
        // setSelectedMovie(null)
      }
    };

    fetchSelectedMovie();
  }, [selectedImdbId]);

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
                {' '}
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
              <StarRating maxRating={10} size={24} />
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
