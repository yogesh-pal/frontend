import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import { styled } from '@mui/material/styles';

const ButtonPrimary = styled(Button)(({ theme, margin }) => ({
  background: theme?.button?.primary,
  color: theme?.button?.ternary,
  margin: margin || '5px',
  padding: '10px 20px',
  borderRadius: '25px',
  minWidth: 'unset',
  textTransform: 'unset',
  '&.Mui-focused': {
    background: theme?.button?.primary,
  },
  '&:hover': {
    background: theme?.button?.primary
  },
  '&.Mui-disabled': {
    color: 'grey',
    background: '#f1eff3'
  }
}));
const LoadingButtonPrimary = styled(LoadingButton)(({
  theme, width, loadercolor, minWidth, margin
}) => ({
  background: theme?.button?.primary,
  color: theme?.button?.ternary,
  margin: margin || '5px 5px 5px 24px',
  padding: '10px 20px',
  borderRadius: '25px',
  minWidth,
  textTransform: 'capitalize',
  width,
  '&.Mui-focused': {
    background: theme?.button?.primary,
  },
  '&:hover': {
    background: theme?.button?.primary
  },
  '& .MuiLoadingButton-loadingIndicator': {
    color: loadercolor || '#fff',
  },
  '&.Mui-disabled': {
    backgroundColor: '#502a741a !important',
    paddingLeft: loadercolor ? '35px' : '20px',
    color: loadercolor || 'rgba(0, 0, 0, 0.26)'
  }
}));

const ButtonSecondary = styled(Button)(({ theme }) => ({
  background: theme?.button?.ternary,
  color: theme?.button?.primary,
  margin: '5px',
  padding: '10px 20px',
  borderRadius: '25px',
  '&.Mui-focused': {
    background: theme?.background?.secondary,
  },
  '&:hover': {
    background: theme?.background?.secondary
  },
}));

const ButtonTernary = styled(Button)(({ theme }) => ({
  background: theme?.background?.secondary,
  color: theme?.button?.primary,
  margin: '5px',
  padding: '10px 20px',
  borderRadius: '25px',
  '&.Mui-focused': {
    background: theme?.background?.secondary,
  },
  '&:hover': {
    background: theme?.background?.secondary,
  },
}));

const FullSizeButton = styled(LoadingButton)(({
  theme, width, fontSize, margin
}) => ({
  background: theme?.background?.secondary,
  color: theme?.button?.primary,
  margin: margin || '0 0 0 20px',
  padding: '10px 20px',
  borderRadius: '20px',
  textTransform: 'unset',
  width,
  fontSize,
  '&.Mui-focused': {
    background: theme?.background?.secondary,
  },
  '&:hover': {
    background: theme?.background?.secondary,
  },
}));

const ButtonQuaternary = styled(Button)(({ theme }) => ({
  background: 'none',
  color: theme?.text?.ternary,
  margin: '0',
  padding: '0',
  borderRadius: '0',
  boxShadow: 'none',
  minWidth: '45px',
  height: '33px',
  '&.Mui-focused': {
    background: 'none',
    boxShadow: 'none',
  },
  '&:hover': {
    background: 'none',
    boxShadow: 'none',
  },
}));

const LoadingButtonSecondaryPrimary = styled(LoadingButton)(({ theme, margin }) => ({
  background: theme?.button?.primary,
  color: theme?.button?.ternary,
  margin,
  padding: '10px 20px',
  borderRadius: '25px',
  textTransform: 'capitalize',
  minWidth: 'unset',
  '&.Mui-focused': {
    background: theme?.button?.primary,
  },
  '&:hover': {
    background: theme?.button?.primary
  },
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  background: 'transparent',
  color: theme?.button?.primary,
  margin: '5px',
  padding: '10px 20px',
  borderRadius: '25px',
  minWidth: 'unset',
  textTransform: 'unset',
  fontWeight: 900,
  '&.Mui-focused': {
    background: theme?.background?.secondary,
  },
  '&:hover': {
    background: theme?.background?.secondary
  },
}));

const ResetButton = styled(Button)(({ theme }) => ({
  color: theme?.button?.primary,
  margin: '5px',
  padding: '10px 20px',
  borderRadius: '25px',
  minWidth: 'unset',
  textTransform: 'unset',
  fontWeight: 900,
  background: theme?.background?.secondary,
  '&.Mui-focused': {
    background: theme?.background?.secondary,
  },
  '&:hover': {
    background: theme?.background?.secondary
  },
}));

export {
  ButtonPrimary,
  ButtonSecondary,
  ButtonTernary,
  FullSizeButton,
  ButtonQuaternary,
  LoadingButtonPrimary,
  LogoutButton,
  LoadingButtonSecondaryPrimary,
  ResetButton
};
