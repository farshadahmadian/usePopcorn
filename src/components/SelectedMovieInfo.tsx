import { useState, useEffect, useRef } from 'react';
import { WatchedFilm, SelectedFilm } from '../App';
import { Loader } from './Loader';
import StarRating from './StarRating/StarRating';
import { ErrorMessage } from './ErrorMessage';
import { useKey } from '../hooks/useKey';

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

type SelectedMoviePropsType = {
  selectedImdbId: string | null;
  onCloseSelectedMovie: () => void;
  onAddWatchedMovie: (movie: WatchedFilm) => void;
  watched: WatchedFilm[];
};

export const SelectedMovieInfo = ({
  selectedImdbId,
  onCloseSelectedMovie,
  onAddWatchedMovie,
  watched,
}: SelectedMoviePropsType) => {
  const [selectedMovie, setSelectedMovie] = useState<SelectedFilm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(0);
  // const [isInWatchedList, setIsInWatchedList] = useState<boolean>(false);

  // countRef.current is the number of the times that the user clicks on a rating star but before clicking on the add button, they change their mind and choose a new rating. It cannot be a normal variable, because every time that "userRating" state is updated (the user changes their mind), the component is re-rendered and the normal variable will be initialized again (reset) so always after clicking the "add" button, the norma variable will have the value 1. A state is not the best option either, because the value of the variable is not supposed to update the DOM and updating the value does not need to re-render the component. Therefore, "ref" is the best option here to have a variable which 1)persists its value during a render and 2)updating ref.current does not cause a re-render
  const countRef = useRef<number>(0);

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
    let isMounted = true;
    const controller = new AbortController();

    // the return data type cannot be Promise<SelectedFilm> | Promise<null>
    const fetchSelectedMovie = async (): Promise<SelectedFilm | null> => {
      console.log('fetching');
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.tvmaze.com/lookup/shows?imdb=${selectedImdbId}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        // if (data?.status)
        if (data?.status === 400) throw new Error('Bad Request');
        if (isMounted) setSelectedMovie(data);
        // return data;
        return Promise.resolve(data);
      } catch (error) {
        if (error?.name !== 'AbortError') console.log(error);
        // return null; // async function returns a promise. the returned promise will be a "fulfilled (resolved)" promise with the result null
        return Promise.resolve(null); // Promise.resolve(null) returns a promise which is resolved with the value null

        // return Promise.reject(null); // Promise.reject(null) returns a rejected promise with the result null. a rejected promise throws an error instance (exception)
      } finally {
        console.log('finally');
        if (isMounted) setIsLoading(false);
        // setSelectedMovie(null)
      }
    };

    fetchSelectedMovie();

    return () => {
      console.log('unmounting');
      controller.abort();
      isMounted = false;
    };
  }, [selectedImdbId]);

  // after clicking on a "Movie" (if the movie has the DETAILS), the "render" message will be logged 3 times and the "clean up" message will be logged 2 times. each of them will be called once because of the "react strict mode". so there are 2 real logs for "render" message and 1 real log for the "clean up" message. First the component is rendered, then painted, and then useEffec() call back function is called (1st real render message is logged). but because the other useEffec() updates a state, the component is re-rendered. this re-render causese the "name, which is in the dependency array" to update (because the other state (selectedMovie) is updated so name is selectedMovie.name). it will cause this useEffec() callback function to be called again, but before that the clean up function is called (the real clean up message). and now, the useEffec() callback function is called again to sync the effect with the state (2nd real render message)
  useEffect(() => {
    // console.log('render or re-render');
    document.title = name || 'usePopcorn';
    return () => {
      document.title = 'usePopcorn';
      /* console.log(
        `component 'SelectedMovieInfo' is re-rendered or unmounted. ${name}` // even after the component is unmounted and it is out of the stack, the clean up callback function which is registered in the event loop has access to the variable "name". This is because of "closure". The clean up callback function has access to all the variables not only in the scope of the useEffect(), but also in the scope of the "SelectedMovieInfo" function
      ); */
    };
  }, [name]);

  useKey('Escape', onCloseSelectedMovie);

  /* useEffect(() => {
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
  }, [onCloseSelectedMovie]); */

  useEffect(() => {
    if (userRating) countRef.current++;
  }, [userRating]);

  const handleAddWatchedMovie = () => {
    if (!selectedMovie) return;
    // type watchedFilmWithRef = WatchedFilm & {
    //   show: {
    //     count?: number;
    //   };
    // };
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
        ratingDecisionCounter: countRef.current,
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
