import { WatchedFilm } from '../App';

type WatchedMoviePropsType = {
  movie: WatchedFilm;
  onRemoveWatchedMovie: (watchedMovieId: number) => void;
};

export const WatchedMovie = ({
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
