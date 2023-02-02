import { FormEvent, useState } from 'react';

export function useValidatedForm(send: () => void): [
  validated: boolean,
  submit: (event: FormEvent<HTMLFormElement>) => void,
] {
  const [ validated, setValidated ] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.checkValidity()) {
      setValidated(false);
      send();

    } else {
      setValidated(true);
    }
  };

  return [ validated, submit ];
}
