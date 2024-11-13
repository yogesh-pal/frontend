import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import PublicHeader from '../components/header/publicRouteHeader';
import Footer from '../components/footer';

const LayoutContainerStyled = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
}));

const LayoutContainer = styled(Box)(() => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'auto',
}));

const PublicLayout = ({ children, colender }) => (
  <LayoutContainerStyled>
    <PublicHeader colender={colender} />
    <LayoutContainer>
      {children}
    </LayoutContainer>
    <Footer />
  </LayoutContainerStyled>
);

export default PublicLayout;
