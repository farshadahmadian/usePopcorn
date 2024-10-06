import { Film } from '../App';
import { Movie } from './MoviePropsType';

type MovieListPropsType = {
  movies: Film[];
  onHandleSelectMovie: (id: number | null, imdbId: string | null) => void;
};

export const MovieList = ({
  movies,
  onHandleSelectMovie,
}: MovieListPropsType) => {
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
