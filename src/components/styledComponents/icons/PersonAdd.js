import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { styled } from '@mui/material/styles';

export const PersonAdd = styled(PersonAddIcon)(({ theme, disabled }) => ({
  color: disabled ? '#502a7491' : theme?.text?.primary,
  cursor: 'pointer'
}));
