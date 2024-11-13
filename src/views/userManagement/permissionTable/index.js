import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

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
  '.MuiDataGrid-row:not(.MuiDataGrid-row--dynamicHeight)>.MuiDataGrid-cell': {
    whiteSpace: 'normal !important',
    textAlign: 'center'
  }
}));

const PermissionsTable = (props) => {
  const { rows, columns } = props;
  const [pageSize, setPageSize] = useState(10);

  return (
    <DataGridStyled
      autoHeight
      rows={rows}
      style={{ minWidth: '1100px' }}
      columns={columns}
      disableColumnMenu
      disableSelectionOnClick
      showCellRightBorder
      showColumnRightBorder
      checkboxSelection={false}
      pageSize={pageSize}
      paginationMode='client'
      rowsPerPageOptions={[10, 15, 20]}
      onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      pagination
    />
  );
};
export default PermissionsTable;
