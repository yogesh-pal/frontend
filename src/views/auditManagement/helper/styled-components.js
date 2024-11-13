import styled from '@emotion/styled';
import { Table, Typography } from '@mui/material';

export const CustomTable = styled(Table)(() => ({
  minWidth: '850px',
  thead: {
    background: '#502A74',
    th: {
      color: '#fff',
      borderRight: '1px solid #fff',
    }
  },
  tbody: {
    td: {
      padding: '5px 10px',
      border: '1px solid rgba(224, 224, 224, 1)'
    }
  }
}));

export const CustomText = styled(Typography)(() => ({
  padding: '5px 10px',
  fontSize: '18px',
  color: '#502A74',
  fontWeight: 700,
}));

export const CustomText2 = styled(Typography)(() => ({
  padding: '0px 10px',
  fontSize: '18px',
  color: '#502A74',
  fontWeight: 700,
}));

export const CustomDiv = styled.div`
 display: flex;
 align-items: center;
 justify-content: space-between;
`;

export const CustomPaddingDiv = styled.div`
 padding: 20px;
`;
