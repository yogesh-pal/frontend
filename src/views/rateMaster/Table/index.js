import React from 'react';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { styled } from '@mui/material/styles';

const DataGridStyled = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-columnHeader:focus': {
    outline: 'none !important'
  },
  '.MuiDataGrid-cell:focus': {
    outline: 'none !important'
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme?.background?.primary,
    color: theme.text.ternary,
    fontSize: '15px',
    '& .MuiCheckbox-root': {
      color: `${theme.text.ternary} !important`,
    },
    '& .MuiIconButton-root': {
      color: `${theme.text.ternary} !important`,
    }
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: '#fff !important',
  },
  '& .editing14': {
    '& .MuiDataGrid-cell--editable': {
      background: '#502a741a!important',
      border: '1px solid #502A74',
      borderRight: '2px solid #502A74'
    }
  },
  '& .editing15': {
    '& .MuiDataGrid-cell--editable': {
      background: '#502a741a!important',
      borderLeft: '1px solid #502A74',
      borderRight: '2px solid #502A74',
      borderBottom: '1px solid #502A74'
    }
  },
  '& .MuiDataGrid-cell--editing:focus-within': {
    outline: 'none !important'
  }
}));

const RateMasterTable = (props) => {
  const {
    rows, columns
  } = props;

  return (
    <DataGridStyled
      autoHeight
      rows={rows}
      columns={columns}
      disableColumnMenu
      disableSelectionOnClick
      showCellRightBorder
      showColumnRightBorder
      hideFooter
      hideFooterPagination
      checkboxSelection={false}
      rowsPerPageOptions={[]}
      // eslint-disable-next-line max-len
      isCellEditable={({ row }) => row.id === 14 || row.id === 15}
      getRowClassName={({ row }) => `editing${row.id}`}
    />
  );
};
export default React.memo(RateMasterTable, (prevProps, nextProps) => {
  if (prevProps.rows !== nextProps.rows || prevProps.columns !== nextProps.columns) {
    return false;
  }
  return true;
});
