import FormLabel from '@mui/material/FormLabel';
import { Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';

const CheckboxPrimary = styled(Checkbox)(({ theme }) => ({
  color: `${theme?.input?.primary} !important`,
  '&.Mui-checked': {
    color: theme?.checkbox?.primary,
  },
  '&.Mui-disabled': {
    color: '#00000061 !important',
  }
}));

const CheckboxLabelPrimary = styled(FormLabel)(({ theme }) => ({
  color: `${theme?.input?.primary} !important`,
  position: 'absolute',
  fontSize: '0.8em',
  top: '-1%',
  left: '0%'
}));

export {
  CheckboxPrimary,
  CheckboxLabelPrimary
};
