import { styled, TextField, TextFieldProps } from '@material-ui/core';
import { Autocomplete, UseAutocompleteProps } from '@material-ui/lab';
import React from 'react';
import { FixMeLater } from './FixMeLater';
import { Pub } from './types/Pub';

function AutocompleteInput(props: TextFieldProps): JSX.Element {
  return <TextField {...props} placeholder="Search Pubs" variant="outlined" />;
}

const StyledAutoCompleteInput = styled(AutocompleteInput)({
  '& fieldset': {
    borderRadius: '25px',
    borderWidth: '2px',
  },
  '&:hover fieldset': {
    borderWidth: '2px',
  },
  borderRadius: '25px',
  backgroundColor: '#dcdcdc',
  boxShadow: '5px 5px 8px rgba(0,0,0,0.3)',
});

type SearchProps = {
  options: Pub[];
  onChange: UseAutocompleteProps<
    Pub,
    undefined,
    undefined,
    undefined
  >['onChange'];
  className?: string;
};

export function Search(props: SearchProps): JSX.Element {
  return (
    <Autocomplete
      onChange={props.onChange}
      fullWidth
      options={props.options}
      getOptionLabel={(option: Pub) => `${option.name}, ${option.town}`}
      renderInput={(params: TextFieldProps) => (
        <StyledAutoCompleteInput {...params} className={props.className} />
      )}
      getOptionSelected={(option: FixMeLater, value: FixMeLater) =>
        option.venueId === value.venueId
      }
    />
  );
}
