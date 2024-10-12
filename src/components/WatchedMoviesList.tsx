import { WatchedFilm } from '../App';
import { WatchedMovie } from './WatchedMovie';

type WatchedMoviesListPropsType = {
  watched: WatchedFilm[];
  onRemoveWatchedMovie: (watchedMovieId: number) => void;
};

export const WatchedMoviesList = ({
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
