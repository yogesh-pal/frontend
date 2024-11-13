import { Typography, Table, TableHead } from '@mui/material';
import styled from '@emotion/styled';

const CustomText = styled(Typography)(() => ({
  padding: '5px 10px',
  fontSize: '18px',
  color: '#502A74',
  fontWeight: 700,
}));

const CustomLi = styled.li`
  color: #502a74;
  &:hover{
    background-color: #502a741a !important;
  }
`;
const DivWithMargin = styled.div`
 margin-top: 10px;
`;

const CustomForm = styled.form`
  padding: 20px 0px;
`;

const HeadingMaster = styled(Typography)`
 font-size: 20px;
 color: #502A74;
 font-weight: 550;
`;

const CustomTable = styled(Table)(() => ({
  minWidth: '850px',
  tbody: {
    td: {
      padding: '5px 10px',
      borderLeft: '1px solid rgba(224, 224, 224, 1)'
    }
  }
}));

const CustomTableHead = styled(TableHead)(() => ({
  tr: {
    th: {
      color: '#fff',
      background: '#502A74',
      borderRight: '1px solid #fff',
      padding: '10px'
    }
  }
}));

const DownLoadButtonDiv = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '20px'
}));

export {
  CustomText, CustomLi, DivWithMargin, CustomForm,
  HeadingMaster, CustomTable, CustomTableHead, DownLoadButtonDiv
};
