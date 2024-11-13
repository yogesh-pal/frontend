/* eslint-disable no-unused-vars */
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const TextFieldStyled = styled(TextField)(({
  width, theme, isDisabled, error, colorCode
}) => ({
  width: width || '100%',
  '.MuiInputBase-input': {
    color: isDisabled ? 'rgba(0, 0, 0, 0.38) !important' : `${theme?.input?.primary} !important`,
    backgroundColor: colorCode,
    backgroundClip: 'content-box',
    cursor: `${isDisabled ? 'default' : ''}`,
  },
  '.MuiInputLabel-root': {
    color: isDisabled ? 'rgba(0, 0, 0, 0.38) !important' : `${theme?.input?.primary} !important`
  },
  '.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: isDisabled && '1px !important'
  },
  '.Mui-focused.MuiInputLabel-root': {
    borderColor: `${theme?.input?.primary} !important`
  },
  '.Mui-focused.MuiOutlinedInput-notchedOutline': {
    borderColor: `${theme?.input?.primary} !important`,
  },
  '.Mui-focused.MuiFilledInput-underline': {
    backgroundColor: theme?.input?.secondary,
  },
  '.Mui-focused .MuiInput-underline': {
    backgroundColor: theme?.input?.secondary,
  },
  '.MuiFilledInput-underline': {
    backgroundColor: theme?.input?.secondary,
    '&:hover': {
      backgroundColor: theme?.input?.secondary,
    },
    '&:focus': {
      backgroundColor: theme?.input?.secondary,
    },
    '&:before': {
      borderColor: `${theme?.input?.primary} !important`
    },
    '&:after': {
      borderColor: `${theme?.input?.primary} !important`,
    }

  },
  '.MuiInput-underline': {
    '&:before': {
      borderColor: `${theme?.input?.primary} !important`
    },
    '&:after': {
      borderColor: `${theme?.input?.primary} !important`,
    }

  },
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: `${error ? 'red' : theme?.input?.primary} !important`
  },
  '&:hover': {
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: `${error ? 'red' : theme?.input?.primary} !important`
    },
  },
  svg: {
    color: theme?.input?.primary
  }
}));

export {
  TextFieldStyled
};
