import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterContainer = styled(Box)(() => ({
  width: '100%',
  height: '60px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0px -1px 4px -1px rgba(0, 0, 0, 0.1)',
  marginTop: 'auto',
  background: '#ffffff',
  zIndex: 3
}));

const TextStyled = styled(Typography)(() => ({
  color: 'red',
  fontSize: '16px',
  fontWeight: 700
}));

const FooterComponent = () => (
  <FooterContainer>
    <TextStyled>
      * Customer profile data updated as of yesterday,
      today&apos;s data will be reflected Post the EOD activity.
    </TextStyled>
  </FooterContainer>
);

export default FooterComponent;
