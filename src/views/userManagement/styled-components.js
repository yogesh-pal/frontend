import styled from '@emotion/styled';
import { Typography } from '@mui/material';

export const CustomDiv = styled.div(({
  padding
}) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  paddingLeft: '10px',
  padding,
}));

export const HeadingMaster2 = styled(Typography)`
 font-size: 20px;
 color: #502A74;
 font-weight: 700;
 padding-bottom: 20px;
`;

export const HeadingMaster3 = styled(Typography)`
 font-size: 15px;
 color: #502A74;
 font-weight: 600;
`;
