import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { InputLabel, Select } from '@mui/material';
import { styled } from '@mui/material/styles';

const SelectLabelStyled = styled(InputLabel)(({ theme, isDisabled }) => ({
  color: isDisabled ? 'rgba(0, 0, 0, 0.38) !important' : `${theme?.menu?.primary} !important`,
}));

const SelectStyled = styled(Select)(({ theme, border }) => ({
  color: `${theme?.menu?.primary} !important`,
  width: '100%',
  '&:before': {
    border,
    borderColor: `${theme?.menu?.primary} !important`,
  },
  '&:after': {
    border,
    borderColor: `${theme?.menu?.primary} !important`,
  },
  '.MuiInputBase-input': {
    color: `${theme?.menu?.primary} !important`,
  },
  '.MuiInputLabel-root': {
    color: `${theme?.menu?.primary} !important`
  },
  '.Mui-focused .MuiInputLabel-root': {
    border,
    borderColor: `${theme?.menu?.primary} !important`
  },
  '.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border,
    borderColor: `${theme?.menu?.primary} !important`
  },
  '.MuiOutlinedInput-notchedOutline': {
    border,
    borderColor: `${theme?.menu?.primary} !important`
  },
  '&:hover': {
    '.MuiOutlinedInput-notchedOutline': {
      border,
      borderColor: `${theme?.menu?.primary} !important`
    },
  },
  '&.MuiFilledInput-underline': {
    backgroundColor: `${theme?.input?.secondary} !important`,
    '&:hover': {
      backgroundColor: theme?.input?.secondary,
    },
    '&:before': {
      border,
      borderColor: `${theme?.input?.primary} !important`
    },
    '&:after': {
      border,
      borderColor: `${theme?.input?.primary} !important`,
    }

  },
  svg: {
    color: theme?.input?.primary
  }

}));

const SelectMenuStyle = styled(MenuItem)(({ theme }) => ({
  color: `${theme?.menu?.primary} !important`,
  '&:after': {
    backgroundColor: `${theme?.menu?.primary} !important`,
  },
  '&:hover': {
    backgroundColor: `${theme?.menu?.secondary} !important`,
  },
  '&.Mui-selected': {
    backgroundColor: `${theme?.menu?.secondary} !important`,
  },
  [`&.${menuItemClasses.focusVisible}`]: {
    backgroundColor: `${theme?.menu?.secondary} !important`,
  },
}));

export {
  SelectLabelStyled,
  SelectMenuStyle,
  SelectStyled
};
