import { ReactNode, useState } from 'react';

type BoxPropsType = {
  children: ReactNode;
};
export const Box = ({ children }: BoxPropsType) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const handleClick = () => setIsOpen(prevState => !prevState);

  return (
    <div className='box'>
      <button className='btn-toggle' onClick={handleClick}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  );
};
