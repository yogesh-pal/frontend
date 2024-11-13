import { Box, Typography, styled } from '@mui/material';

const TypographyStyled = styled(Typography)(() => ({
  // color: theme.input.primary,
  padding: '10px 8px',
  fontWeight: 900,
  color: '#606060'
}));

const HeaderComponent = (props) => {
  const {
    input
  } = props;

  return (
    <Box sx={{ width: '100%' }}>
      <TypographyStyled variant={input?.variant} gutterBottom>
        {input?.label}
      </TypographyStyled>
    </Box>
  );
};

export default HeaderComponent;
