import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

export const Delete = styled(DeleteIcon)(({ theme }) => ({
  color: theme?.text?.primary,
  cursor: 'pointer'
}));
