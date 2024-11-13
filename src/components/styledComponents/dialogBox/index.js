import {
  DialogActions, DialogTitle, Dialog, Button, DialogContent
} from '@mui/material';
import { styled } from '@mui/material/styles';

const DialogContentStyled = styled(DialogContent)(({ height, padding }) => ({
  padding: padding ?? '40px 0 !important',
  height
}));

const DialogStyled = styled(Dialog)(({ width }) => ({
  '.MuiDialog-paper': {
    width: width || '1100px',
    'max-width': 'unset'
  }
}));

const DialogClose = styled(Button)(({ theme }) => ({
  color: theme.text.primary,
  cursor: 'pointer',
  padding: '10px',
  '&.Mui-focused': {
    background: theme?.background?.secondary,
  },
  '&:hover': {
    background: theme?.background?.secondary,
  },
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  color: theme?.text?.primary,
  background: theme?.background?.secondary,
  fontWeight: '600',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const DialogActionsStyled = styled(DialogActions)(({ theme }) => ({
  color: theme?.text?.primary,
  background: theme?.background?.secondary,
  fontWeight: '600',
}));

export {
  DialogTitleStyled,
  DialogActionsStyled,
  DialogStyled,
  DialogClose,
  DialogContentStyled
};
