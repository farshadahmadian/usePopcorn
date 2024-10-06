import { ReactNode, useState } from "react";

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
    image: { original: string };
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

  const jsx = <h1>Something went wrong</h1>;

  // fetch() returns a promise with the data type "Promise<Response>". the callbeck function of .then(callback) receives the result of the promise, if it is resolved. So the data type will be "Response" (response: Response). Response.json() returns another promise. if this promise is resolved, the callback function of .then(callback) receives the resolved value (data) which is an array of objects. each object is {score: number, show: object}. where "show" is an object with many properties some of which are included in "WatchedFilm" type and "Film" type.
  fetch("https://api.tvmaze.com/search/shows?q=better call soul")
    .then((response: Response) => {
      return response.json();
    })
    // .then((data: Film[]) => {
    .then((data: WatchedFilm[]) => {
      // setMovies(data); // the argument must be of the data type of "Film[]", but "data" which is of the data type "WatchedFilm[]" can also be passed as the argument because "type WatchedFilm" includes type "Film" completely and has some more properties. so any variable of the data type "WatchedFilm" has all the properties of the data type "Film" + some more properties
      console.log(data);
      return data;
    })
    .catch((error) => {
      console.log(error.messages);
    });

  return movies.length === 0 ? (
    jsx
  ) : (
    <>
      <Navbar>
        <NumResult movies={movies} />
      </Navbar>
      <Main>
        <Box>
          <MovieList movies={movies} />
        </Box>
        <Box>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </Box>
      </Main>
    </>
  );
}

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
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
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
      {movies?.map((movie) => (
        <Movie key={movie.show.id} movie={movie} />
      ))}
    </ul>
  );
};

type MoviePropsType = {
  movie: Film;
};

const Movie = ({ movie }: MoviePropsType) => {
  return (
    <li>
      <img src={movie.show.image.original} alt={`${movie.show.name} poster`} />
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
      <img src={movie.show.image.original} alt={`${movie.show.name} poster`} />
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
