import React from 'react';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { styled } from '@mui/material/styles';

export const DataGridStyled = styled(DataGrid)(({ theme, loading }) => ({
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
  '& .Mui-selected': {
    backgroundColor: `${theme.background.secondary} !important`,
    color: '#502A74 !important',
    fontWeight: 900,
    '& .MuiCheckbox-root': {
      color: '#502a74 !important',
    }
  },
  '& .MuiDataGrid-row.enabledRow:hover': {
    color: `${theme.text.primary}`,
    cursor: 'pointer',
    fontWeight: 900,
    maxHeight: 'fit-content !important'
  },
  '& .MuiDataGrid-cell': {
    overflow: 'unset !important',
    whiteSpace: 'unset !important',
    wordBreak: 'break-word',
    maxHeight: 'fit-content !important',
    textAlign: 'center'
  },
  '& .MuiDataGrid-row.disabledRow:hover': {
    backgroundColor: '#fff',
    color: '#bdbdbd',
    cursor: 'unset'
  },
  '& .MuiDataGrid-row.enabledRow': {
    maxHeight: 'fit-content !important',
  },
  '& .MuiDataGrid-row.disabledRow': {
    maxHeight: 'fit-content !important',
    color: '#bdbdbd'
  },
  '& .MuiList-root': {
    '& .MuiMenuItem-root:hover': {
      backgroundColor: `${theme.background.secondary} !important`,
    }
  },
  '& .MuiTablePagination-selectIcon': {
    color: `${theme.background.primary}`
  },
  '& .MuiTablePagination-root': {
    pointerEvents: loading ? 'none' : '',
    button: {
      color: loading && 'rgba(0, 0, 0, 0.26)'
    }
  }
}));

const TransactionTable = (props) => {
  const {
    rows,
    columns,
    handleCellClick,
    checkboxAllowed,
    loading,
    onPageSizeChange,
    onPageChange,
    rowCount,
    clientPaginationMode,
    pageSizeNumber,
    onSelectionModelChange,
    selectionOnClick,
    rowClassNameHandler,
    selectedRowIDs,
    hideFooter
  } = props;

  return (
    <DataGridStyled
      autoHeight
        // eslint-disable-next-line no-underscore-dangle
      onCellClick={(params) => handleCellClick && handleCellClick(params.field, params.row)}
      loading={loading}
      rows={rows}
      paginationMode={clientPaginationMode ? 'client' : 'server'}
      columns={columns}
      pageSize={pageSizeNumber}
      onPageSizeChange={(newPageSize) => {
        onPageSizeChange(newPageSize);
      }}
      onPageChange={(newPageNo) => onPageChange(newPageNo + 1)}
      rowsPerPageOptions={[15, 30, 50, 100]}
      pagination
      showCellRightBorder
      showColumnRightBorder
      checkboxSelection={checkboxAllowed}
      disableSelectionOnClick={!selectionOnClick}
      disableColumnMenu
      rowCount={rowCount}
      onSelectionModelChange={onSelectionModelChange}
      selectionModel={selectedRowIDs}
      getRowClassName={rowClassNameHandler}
      hideFooter={hideFooter}
    />
  );
};

export default React.memo(TransactionTable, (prevProps, nextProps) => {
  if (prevProps.rows !== nextProps.rows
    || prevProps.loading !== nextProps.loading
  || prevProps.pageSizeNumber !== nextProps.pageSizeNumber
  || prevProps.rowCount !== nextProps.rowCount
  || prevProps.selectedRowIDs !== nextProps.selectedRowIDs
  || prevProps.columns !== nextProps.columns
  ) { return false; }
  return true;
});
