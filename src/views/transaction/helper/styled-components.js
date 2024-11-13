import styled from '@emotion/styled';
import {
  Table, TableHead, Typography, Container, TableCell, Grid
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { DataGrid } from '@mui/x-data-grid/DataGrid';

export const CustomForm = styled('form')(({ width }) => ({
  width: width || '500px',
  display: 'flex'
}));

export const CustomTable = styled(Table)(() => ({
  minWidth: '850px',
  tbody: {
    td: {
      padding: '5px 10px',
      borderLeft: '1px solid rgba(224, 224, 224, 1)'
    }
  }
}));

export const CustomTable2 = styled(Table)(() => ({
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

export const CustomTableHead = styled(TableHead)(() => ({
  tr: {
    th: {
      color: '#fff',
      background: '#502A74',
      borderRight: '1px solid #fff'
    }
  }
}));

export const CustomTableCell = styled(TableCell)`
 padding: 15px !important;
`;

export const PDFViewButton = styled(LoadingButton)(({ theme, margin }) => ({
  background: theme?.button?.primary,
  color: theme?.button?.ternary,
  margin: margin || '5px',
  padding: '5px 20px',
  borderRadius: '10px',
  minWidth: 'unset',
  textTransform: 'unset',
  '&.Mui-focused': {
    background: theme?.button?.primary,
  },
  '&:hover': {
    background: theme?.button?.primary
  },
  '&.Mui-disabled': {
    color: 'grey',
    background: '#f1eff3'
  }
}));

export const DeputationDataGridStyled = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-columnHeader:focus': {
    outline: 'none !important'
  },
  '.MuiDataGrid-cell:focus': {
    outline: 'none !important'
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme?.background?.primary,
    color: theme.text.ternary,
    fontSize: '15px'
  },
  '& .MuiTablePagination-selectIcon': {
    color: `${theme.background.primary}`
  },
  '& .activeStatus': {
    backgroundColor: '#fff !important',
    color: 'none !important',
    cursor: 'pointer'
  },
  '& .inactiveStatus': {
    backgroundColor: 'rgba(0, 0, 0, 0.06) !important',
    color: 'none !important',
    cursor: 'unset'
  }
}));
export const CustomText = styled(Typography)(() => ({
  padding: '5px 10px',
  fontSize: '18px',
  color: '#502A74',
  fontWeight: 700,
}));
export const CustomText1 = styled(Typography)(() => ({
  padding: '5px 20px',
  fontSize: '18px',
  color: '#502A74',
  fontWeight: 700,
}));
export const CustomText2 = styled(Typography)(() => ({
  padding: '5px 0px',
  fontSize: '18px',
  color: '#502A74',
  fontWeight: 700,
}));
export const HeadingMaster2 = styled(Typography)`
 font-size: 20px;
 color: #502A74;
 font-weight: 550;
`;

export const CustomDiv = styled.div`
 display: flex;
 align-items: center;
 justify-content: space-between;
 width : 100%
`;

export const ContainerStyled = styled(Container)(({ theme, padding, margin }) => ({
  boxShadow: `${theme?.boxShadow?.primary} 0px 2px 8px`,
  padding,
  margin
}));

export const imageBoxStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500
};

export const CustomGrid = styled(Grid)`
 display: flex;
 word-break: break-all;
`;
export const CustomFormContainer = styled('form')(({ width, flexDirection }) => ({
  width: width || '500px',
  display: 'flex',
  flexDirection
}));

export const TwoResponsiveButtonWrapper = styled(Container)(({ justifyContent, marginTop }) => ({
  display: 'flex',
  // eslint-disable-next-line object-shorthand
  justifyContent: justifyContent,
  marginTop
}));

export const ErrorMessageContainer = styled(Grid)(() => ({
  padding: '0 5px'
}));

export const CustomTextStyle = styled.div`
 padding: 5px 0px;
 font-size: 16px;
 color: #502A74;
`;

export const InputWrapper = styled(Container)(({
  justifyContent, marginTop, flexDirection, height, padding
}) => ({
  display: 'flex',
  justifyContent,
  marginTop,
  flexDirection,
  height,
  padding,
}));
