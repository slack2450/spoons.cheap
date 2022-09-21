import { styled, TextField, TextFieldProps, Autocomplete } from '@mui/material';
import React from 'react';
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
  onChange: (event: React.SyntheticEvent, pub: Pub | null) => void;
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
      isOptionEqualToValue={(option, value) => option.venueId === value.venueId}
    />
  );
}
