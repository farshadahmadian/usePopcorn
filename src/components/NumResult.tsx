import { Film } from '../App';

type NumResultPropsType = {
  movies: Film[];
};
export const NumResult = ({ movies }: NumResultPropsType) => {
  return (
    // if we use "movies.length &&" instead of "movies.length > 0 &&": if "movies" is an empty array, 0 will be returned, instead of false. Therefore 0 will be painted for a moment on the page. But if we use "movies.length > 0 &&" and if "movies" is an [], then false will be returned and nothing will be painted on the page because React does not paint boolean values (true, false), undefined, and null
    movies.length > 0 && (
      <p className='num-results'>
        Found <strong>{movies.length}</strong> results
      </p>
    )
  );
};
