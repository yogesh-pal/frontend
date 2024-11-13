import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const UPIContainerStyled = styled(Box)(() => ({
  display: 'flex'
}));

const CenterContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '50px 40px',
  flexDirection: 'column'
}));

const UPIModelTextStyled = styled('p')(() => ({
  fontWeight: 500,
  textAlign: 'center',
  color: '#4d5965',
  paddingBottom: '20px'
}));

const UPILogoImageStyled = styled('img')(({ theme, disabled }) => ({
  height: '30px',
  padding: '0 20px',
  opacity: disabled ? 0.4 : 1,
  [theme.breakpoints.only('sm')]: {
    padding: '0 10px',
    height: '20px',
  }
}));

const UPITypographyStyled = styled(Typography)(({ theme, disabled }) => ({
  fontWeight: 900,
  color: disabled ? '#cbcbcb' : '#3e3e3e',
  [theme.breakpoints.only('sm')]: {
    fontSize: '15px'
  }
}));

const UPITextStyled = styled('p')(({ theme, disabled }) => ({
  fontSize: '16px',
  padding: '20px 0',
  color: disabled ? '#b7b7b7' : '#878686',
  fontWeight: 500,
  [theme.breakpoints.only('sm')]: {
    fontSize: '12px',
  }
}));

const UPITagContainerStyled = styled('p')(({ theme, disabled }) => ({
  background: disabled ? '#066d067a' : '#047b04',
  color: '#ffffff',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '14px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  [theme.breakpoints.only('sm')]: {
    fontSize: '12px',
  }
}));

const parentOption = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '20px',
  borderRadius: '20px',
  flexDirection: 'column',
  cursor: 'pointer',
};

const radioRawParentOptionsStyle = {
  ...parentOption,
  border: '2px solid #502a7412',
};

const radioRawParentOptionsDisabledStyle = {
  ...parentOption,
  border: '1px solid #d9d9d94a'
};

const radioRawParentOptionsCss = {
  active: {
    onlyxs: {
      ...radioRawParentOptionsStyle,
      width: '100%',
      margin: '20px 0',
    },
    xs: {
      ...radioRawParentOptionsStyle,
      width: '100%',
      margin: '20px 0'
    },
    sm: {
      ...radioRawParentOptionsStyle,
      width: '49%',
      margin: '20px 0'
    },
    md: {
      ...radioRawParentOptionsStyle,
      width: '45%',
    },
    lg: {
      ...radioRawParentOptionsStyle,
      width: '40%',
    },
    xl: {
      ...radioRawParentOptionsStyle,
      width: '40%',
    }
  },
  disabled: {
    onlyxs: {
      ...radioRawParentOptionsDisabledStyle,
      width: '100%',
      margin: '20px 0',
    },
    xs: {
      ...radioRawParentOptionsDisabledStyle,
      width: '100%',
      margin: '20px 0'
    },
    sm: {
      ...radioRawParentOptionsDisabledStyle,
      width: '49%',
      margin: '20px 0'
    },
    md: {
      ...radioRawParentOptionsDisabledStyle,
      width: '45%',
    },
    lg: {
      ...radioRawParentOptionsDisabledStyle,
      width: '40%',
    },
    xl: {
      ...radioRawParentOptionsDisabledStyle,
      width: '40%',
    }
  }
};

const radioRawTopAlignCssStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
};

const radioRawTopAlignCss = {
  onlyxs: radioRawTopAlignCssStyle,
  xs: radioRawTopAlignCssStyle,
  sm: radioRawTopAlignCssStyle,
  md: radioRawTopAlignCssStyle,
  lg: radioRawTopAlignCssStyle,
  xl: radioRawTopAlignCssStyle
};

const radioGroupRawCssStyle = {
  justifyContent: 'space-between',
  flexwrap: 'wrap'
};

const radioGroupRawCss = {
  onlyxs: {
    ...radioGroupRawCssStyle,
    flexDirection: 'row',
  },
  xs: {
    ...radioGroupRawCssStyle,
    flexDirection: 'row',
  },
  sm: {
    ...radioGroupRawCssStyle,
    flexDirection: 'row',
  },
  md: {
    ...radioGroupRawCssStyle,
    flexDirection: 'row',
  },
  lg: {
    ...radioGroupRawCssStyle,
    flexDirection: 'row',
  },
  xl: {
    ...radioGroupRawCssStyle,
    flexDirection: 'row',
  }
};

export {
  UPIContainerStyled,
  UPILogoImageStyled,
  UPITypographyStyled,
  UPITextStyled,
  UPITagContainerStyled,
  radioRawTopAlignCss,
  radioRawParentOptionsCss,
  radioGroupRawCss,
  CenterContainer,
  UPIModelTextStyled
};
