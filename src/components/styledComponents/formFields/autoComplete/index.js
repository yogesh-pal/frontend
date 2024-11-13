import { Autocomplete } from '@mui/material';
import { styled } from '@mui/material/styles';

const AutoCompleteStyled = styled(Autocomplete)(({ theme, border }) => ({
  width: '100%',
  '.MuiInputBase-input': {
    color: `${theme?.menu?.primary} !important`,
  },
  '.MuiInputLabel-root': {
    color: `${theme?.menu?.primary} !important`
  },
  '.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border,
    borderColor: `${theme?.menu?.primary} !important`
  },
  '.MuiOutlinedInput-notchedOutline': {
    border,
    borderColor: `${theme?.menu?.primary} !important`
  },
  svg: {
    color: theme?.input?.primary
  }

}));

export {
  AutoCompleteStyled
};
