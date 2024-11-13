import styled from '@emotion/styled';
import { Dialog } from '@mui/material';

const DownLoadButtonDiv = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '20px'
}));
const CustomDialog = styled(Dialog)(() => ({
  '.MuiDialog-paper': {
    minWidth: '200px',
    width: '500px'
  },
  '.MuiDialogContentText-root': {
    display: 'flex',
    justifyContent: 'center'
  }
}));

const Li = styled.li`
      color: #502a74;
      &:hover{
        background-color: #502a741a !important;
      }
    `;
const CustomDiv = styled.div(() => ({
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: 1.5,
  letterSpacing: '0.00938em',
  color: 'rgba(0, 0, 0, 0.6)'
}));

const CustomDiv2 = styled.div`
   padding: 10px;
   font-size: 18px;
  `;

const CustomDiv3 = styled.div`
   color: #502A74;
   padding: 0px;
   margin: 0px;
   text-decoration: underline;
   cursor: pointer;
  `;
const CustomDiv4 = styled.div`
   color: #502A74;
   font-size: 16px;
   text-decoration: underline;
   cursor: pointer;
`;

const CustomForm = styled('form')(({ width }) => ({
  width: width || '500px',
  display: 'flex',
}));

export {
  DownLoadButtonDiv, CustomDialog, Li, CustomDiv, CustomDiv2, CustomDiv3, CustomForm,
  CustomDiv4
};
