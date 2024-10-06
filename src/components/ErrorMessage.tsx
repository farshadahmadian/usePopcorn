type ErrorMessagePropsType = {
  message: string;
};
export const ErrorMessage = ({ message }: ErrorMessagePropsType) => {
  return <p className='error'>{message}</p>;
};
