import { Film } from '../App';

type MoviePropsType = {
  movie: Film;
  onHandleSelectMovie: (id: number | null, imdbId: string | null) => void;
};

export const Movie = ({ movie, onHandleSelectMovie }: MoviePropsType) => {
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
