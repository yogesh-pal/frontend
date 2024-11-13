import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { TextFieldStyled, SelectMenuStyle } from '../../../../components/styledComponents';

const AutocompleteComponent = ({ options, label, selectValueHandler }) => (
  <Autocomplete
    id='country-select-demo'
    sx={{ width: 300 }}
    options={options}
    autoHighlight
    onChange={selectValueHandler}
    getOptionLabel={(option) => option.vendor_name}
    renderOption={(props, option) => (
      <SelectMenuStyle {...props}>
        {option.vendor_name}
      </SelectMenuStyle>
    )}
    renderInput={(params) => (
      <TextFieldStyled
        {...params}
        label={label}
        inputProps={{
          ...params.inputProps,
          autoComplete: 'new-password',
        }}
      />
    )}
  />
);

export default React.memo(AutocompleteComponent, (prevProps, nextPros) => {
  if (prevProps.options !== nextPros.options || prevProps.label !== nextPros.label) {
    return false;
  }
  return true;
});
