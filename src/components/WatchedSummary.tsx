import { WatchedFilm, average } from '../App';

type WatchedSummaryPropsType = {
  watched: WatchedFilm[];
};
export const WatchedSummary = ({ watched }: WatchedSummaryPropsType) => {
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
