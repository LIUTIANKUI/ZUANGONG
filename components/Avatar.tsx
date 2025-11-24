import React from 'react';

interface AvatarProps {
  seed: string;
  size?: 'sm' | 'md' | 'lg';
  square?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ seed, size = 'md', square = true }) => {
  const sizeClass = {
    sm: 'w-9 h-9',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  const roundedClass = square ? 'rounded-md' : 'rounded-full';

  return (
    <img
      src={`https://picsum.photos/seed/${seed}/200`}
      alt="Avatar"
      className={`${sizeClass} ${roundedClass} bg-gray-300 object-cover flex-shrink-0`}
    />
  );
};