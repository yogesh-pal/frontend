import { FormLabel, Radio } from '@mui/material';
import { styled } from '@mui/material/styles';

const RadiobuttonStyle = styled(Radio)(({ theme }) => ({
  color: `${theme?.input?.primary} !important`,
  padding: '0 9px',
  '&.Mui-checked': {
    color: theme?.radio?.primary,
  },
}));

const RadioLabelStyled = styled(FormLabel)(({ theme }) => ({
  color: `${theme?.input?.primary} !important`,
  position: 'absolute',
  fontSize: '0.8em',
  top: '-1%',
  left: '0%'
}));

export {
  RadiobuttonStyle,
  RadioLabelStyled
};
