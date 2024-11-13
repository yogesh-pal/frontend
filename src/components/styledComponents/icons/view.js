import VisibilityIcon from '@mui/icons-material/Visibility';
import { styled } from '@mui/material/styles';

export const View = styled(VisibilityIcon)(({ theme }) => ({
  color: theme?.text?.primary,
  cursor: 'pointer',
  fontSize: '24px',
  margin: '0 5px'
}));
