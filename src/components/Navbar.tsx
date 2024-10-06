import { ReactNode } from 'react';
import { Logo } from './Logo';

export type childrenType = {
  children: ReactNode;
};

export const Navbar = ({ children }: childrenType) => {
  return (
    <nav className='nav-bar'>
      <Logo />
      {children}
    </nav>
  );
};
