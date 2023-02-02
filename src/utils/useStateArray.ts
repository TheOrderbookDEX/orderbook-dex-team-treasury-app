import { useState } from 'react';

export function useStateArray<T>(init: T[] = []): [
  array: T[],
  change: (index: number, value: T) => void,
  insert: (index: number, value: T) => void,
  remove: (index: number) => void,
] {
  const [ array, setArray ] = useState<T[]>(init);

  const change = (index: number, value: T) => {
    setArray(array => Object.assign([...array], { [index]: value }));
  };

  const insert = (index: number, value: T) => {
    setArray(array => [ ...array.slice(0, index), value, ...array.slice(index) ]);
  };

  const remove = (index: number) => {
    setArray(array => [ ...array.slice(0, index), ...array.slice(index+1) ]);
  };

  return [ array, change, insert, remove ];
}
