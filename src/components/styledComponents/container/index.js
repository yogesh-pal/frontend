import { Container, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import Webcam from 'react-webcam';

const ContainerPrimary = styled(Container)(({ margin, padding }) => ({
  margin,
  padding
}));

const ContainerStyled = styled(Container)(({ theme, margin }) => ({
  boxShadow: `${theme?.boxShadow?.primary} 0px 2px 8px`,
  padding: '0 !important',
  margin,
  overflow: 'auto'
}));

const CustomContainerStyled = styled(Container)(({
  theme, padding, flexDirection, overflow
}) => ({
  boxShadow: `${theme?.boxShadow?.primary} 0px 2px 8px`,
  padding,
  maxWidth: '96% !important',
  flexDirection,
  overflow,
}));

const BreadcrumbsWrapperContainerStyled = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  padding: '20px 20px 20px 0'
}));

const BreadcrumbsContainerStyled = styled('div')(() => ({
  width: '96%'
}));

const HeaderContainer = styled(Grid)(({
  display, justifyContent, justifyItems, padding, flexDirection, width
}) => ({
  display: display || 'flex',
  justifyContent: justifyContent || 'space-between',
  alignItems: justifyItems || 'center',
  padding: padding || '20px',
  flexDirection,
  width
}));

const CenterContainer = styled(Grid)(({ padding }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding
}));

const ErrorMessageContainer = styled(Grid)(({ padding }) => ({
  padding: padding || '0 20px'
}));

const HeaderSearchContainer = styled(Grid)(({ padding }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: padding || '30px 0 0 40px'
}));

const CenterContainerStyled = styled(Grid)(({ padding, flexDirection }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: flexDirection || 'column',
  padding
}));

const ContainerItemStyled = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column'
}));

const ContainerButtonStyled = styled('div')(({ margin, rowReverse }) => ({
  display: 'flex',
  flexDirection: rowReverse || 'unset',
  justifyContent: 'center',
  alignItems: 'center',
  margin
}));

const WebCamContainerStyled = styled('div')(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  maxWidth: '500px',
}));

const WebCamStyled = styled(Webcam)(() => ({
  width: '100%',
  height: '100%',
}));

export {
  ContainerPrimary,
  ContainerStyled,
  CustomContainerStyled,
  BreadcrumbsContainerStyled,
  BreadcrumbsWrapperContainerStyled,
  HeaderContainer,
  HeaderSearchContainer,
  CenterContainerStyled,
  ContainerItemStyled,
  ContainerButtonStyled,
  ErrorMessageContainer,
  CenterContainer,
  WebCamContainerStyled,
  WebCamStyled
};
