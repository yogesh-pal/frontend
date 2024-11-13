import Typography from '@mui/material/Typography';

import styled from '@emotion/styled';

const TypographyStyled = styled(Typography)(() => ({
  fontSize: '16px'
}));

const keyValue = (arrDetails) => {
  const arr = arrDetails.split('_');
  let val = '';
  arr.forEach((item) => {
    val = `${val} ${item.charAt(0).toUpperCase()}${item.slice(1).toLowerCase()}`;
  });
  return val;
};

export const errorMessageHandler = (message, renderAsDiv = false) => {
  try {
    let msg = '';
    if (typeof (message) === 'object') {
      Object.keys(message).forEach((item) => {
        msg += `${keyValue(item)} - ${Array.isArray(message[item]) ? message[item][0] : message[item]} \n`;
      });
    } else {
      msg = message;
    }
    if (msg && msg.length) {
      return <TypographyStyled variant='h6' component={renderAsDiv ? 'div' : 'pre'} style={{ whiteSpace: renderAsDiv ? 'pre-line' : 'normal' }}>{msg}</TypographyStyled>;
    }
    return null;
  } catch (e) {
    console.log('Error', e);
  }
};
