import { motion } from 'motion/react';
import type * as React from 'react';

export function SidebarToggle(props: React.ComponentProps<typeof motion.svg>) {
  return (
    <motion.svg
      fill='none'
      viewBox='0 0 20 20'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <title> Path </title>
      <path
        d='M5 14L5 6C5 5.44772 5.44772 5 6 5L8 5C8.55228 5 9 5.44772 9 6L9 14C9 14.5523 8.55228 15 8 15L6 15C5.44772 15 5 14.5523 5 14Z'
        fill='#A3A3A3'
        opacity={0.6}
      />
      <rect
        height='16'
        rx='4'
        stroke='#A3A3A3'
        strokeWidth='1.5'
        width='16'
        x='2'
        y='2'
      />
    </motion.svg>
  );
}
