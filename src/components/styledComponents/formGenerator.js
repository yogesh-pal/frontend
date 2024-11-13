import FormControl from '@mui/material/FormControl';
import styled from '@emotion/styled';

const CustomFormControl = styled(FormControl)(({ theme, style }) => ({
  position: 'relative',
  width: '100%',
  height: '100% !important',
  [theme.breakpoints.only('xs')]: { ...style?.onlyxs },
  [theme.breakpoints.up('xs')]: { ...style?.xs },
  [theme.breakpoints.up('sm')]: { ...style?.sm },
  [theme.breakpoints.up('md')]: { ...style?.md },
  [theme.breakpoints.up('lg')]: { ...style?.lg },
  [theme.breakpoints.up('xl')]: { ...style?.xl },
}));

export {
  CustomFormControl
};
