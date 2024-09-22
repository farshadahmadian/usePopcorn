import { ReactNode, useEffect, useState } from "react";

const tempMovieData = [
  {
    score: 0.6,
    show: {
      id: 618,
      name: "Better Call Saul",
      premiered: "2015-02-08",
      image: {
        original:
          "https://static.tvmaze.com/uploads/images/original_untouched/501/1253515.jpg",
      },
    },
  },
];

const tempWatchedData = [
  {
    score: 0.6,
    show: {
      id: 618,
      name: "Better Call Saul",
      premiered: "2015-02-08",
      image: {
        original:
          "https://static.tvmaze.com/uploads/images/original_untouched/501/1253515.jpg",
      },
      runtime: 60,
      rating: { average: 8.6 },
      userRating: 8.5,
    },
  },
];

type Film = {
  score: number;
  show: {
    id: number;
    name: string;
    premiered: string;
    image: { original: string } | null;
  };
};

type WatchedFilm = Film & {
  show: {
    runtime: number;
    rating: { average: number };
    userRating: number;
  };
};

const average = (arr: number[]) =>
  arr.reduce(
    (acc: number, cur: number, i: number, arr: number[]): number =>
      acc + cur / arr.length,
    0
  );

export default function App() {
  const [movies, setMovies] = useState<Film[]>([]);
  const [watched, setWatched] = useState<WatchedFilm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
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

  const query = "better call soul";
  useEffect(() => {
    const fetchData = async function (): Promise<WatchedFilm[]> {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://api.tvmaze.com/search/shows?q=${query}`
        );

        // if (!response.ok) {
        //   throw new Error();
        // }
        const data: WatchedFilm[] = await response.json();
        setMovies(data);

        if (!data.length) throw new Error("No Result!");

        return data;
      } catch (error) {
        console.log(error);
        setError(error.message);
        return [];
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    /* try {
      // before "promise" is setteled (while promise is pending), try block gets executed and since no error has occured, catch() block will not be executed. if some problems happen during the fetch process, and an error instance is thrown, it cannot be caught since the execution flow has passed the try-catch block
      const promise = fetchData();
      console.log(promise);
    } catch (error) {
      console.log("ERROR");
      console.log(error?.messages);
    } */

    return () => {
      console.log("UNMOUNTED");
    };
  }, []);

  useEffect(() => {
    // console.log(movies);
  });

  return (
    <>
      <Navbar>
        <NumResult movies={movies} />
      </Navbar>
      {/* <Main children={<ListBox children={<MovieList movies={movies} />} />} /> */}
      {/* <Main children={<ListBox children={MovieList({ movies: movies })} />} /> !WRONG! */}
      <Main>
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && <MovieList movies={movies} />}
        </Box>
        <Box>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </Box>
      </Main>
    </>
  );
}

const Loader = () => {
  return <p className="loader">Loading ...</p>;
};

type ErrorMessagePropsType = {
  message: string;
};

const ErrorMessage = ({ message }: ErrorMessagePropsType) => {
  return <p className="error">{message}</p>;
};

type childrenType = {
  children: ReactNode;
};

const Navbar = ({ children }: childrenType) => {
  return (
    <nav className="nav-bar">
      <Logo />
      <Search />
      {children}
    </nav>
  );
};

const Logo = () => {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
};

const Search = () => {
  const [query, setQuery] = useState("");
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
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
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
      </p>
    )
  );
};

const Main = ({ children }: childrenType) => {
  return <main className="main">{children}</main>;
};

const Box = ({ children }: childrenType) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
};

type MovieListPropsType = {
  movies: Film[];
};

const MovieList = ({ movies }: MovieListPropsType) => {
  return (
    <ul className="list">
      {movies.length > 0 &&
        movies?.map((movie) => <Movie key={movie.show.id} movie={movie} />)}
    </ul>
  );
};

type MoviePropsType = {
  movie: Film;
};

const Movie = ({ movie }: MoviePropsType) => {
  return (
    <li>
      <img src={movie.show.image?.original} alt={`${movie.show.name} poster`} />
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
    watched.map((movie) => movie.show.rating.average)
  );
  const avgUserRating = average(watched.map((movie) => movie.show.userRating));
  const avgRuntime = average(watched.map((movie) => movie.show.runtime));

  return (
    <div className="summary">
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
    <ul className="list">
      {watched.map((movie) => (
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
      <img src={movie.show.image?.original} alt={`${movie.show.name} poster`} />
      <h3>{movie.show.name}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.show.rating.average}</span>
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
