import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';

export const Edit = styled(EditIcon)(({ theme, disabled }) => ({
  color: disabled ? '#502a7491' : theme?.text?.primary,
  cursor: 'pointer',
  fontSize: '24px',
  margin: '0 5px'
}));
