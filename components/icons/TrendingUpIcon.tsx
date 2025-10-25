
import React from 'react';

interface TrendingUpIconProps extends React.SVGProps<SVGSVGElement> {
  positive: boolean;
}

export const TrendingUpIcon: React.FC<TrendingUpIconProps> = ({ positive, ...props }) => {
  const colorClass = positive ? 'text-green-400' : 'text-red-400';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass} {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
};
