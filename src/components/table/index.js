/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { DataGridStyled } from '../styledComponents';

const CustomDiv = styled.div(({ padding }) => ({
  width: '100%',
  padding: padding || '20px'
}));

const index = (props) => {
  const {
    padding,
    rows,
    columns,
    checkboxAllowed,
    handleCellClick,
    loading,
    onPageSizeChange,
    onPageChange,
    rowCount,
    clientPaginationMode,
    hideFooterPagination,
    cursor,
    display,
    pageSizeNumber,
    rowsPerPageOptions,
    onSelectionModelChange,
    isLeadListing = false,
    rowClassNameHandler
  } = props;
  const [pageSize, setPageSize] = useState(pageSizeNumber ?? 10);

  return (
    <CustomDiv padding={padding}>
      <DataGridStyled
        display={display}
        cursor={cursor}
        onCellClick={(params) => handleCellClick && handleCellClick(params.field, params.row)}
        autoHeight
        // eslint-disable-next-line no-underscore-dangle
        getRowId={(row) => row?._id}
        loading={loading}
        rows={rows}
        paginationMode={clientPaginationMode ? 'client' : 'server'}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => {
          onPageSizeChange(newPageSize);
          setPageSize(newPageSize);
        }}
        onPageChange={(newPageNo) => (isLeadListing ? onPageChange(newPageNo) : onPageChange(newPageNo + 1))}
        rowsPerPageOptions={rowsPerPageOptions || [10, 15, 20, 50, 100]}
        pagination
        checkboxSelection={checkboxAllowed}
        disableSelectionOnClick
        disableColumnMenu
        rowCount={rowCount}
        hideFooterPagination={hideFooterPagination}
        onSelectionModelChange={onSelectionModelChange}
        getRowClassName={rowClassNameHandler}
      />
    </CustomDiv>
  );
};

export default React.memo(index, (prevProps, nextProps) => {
  if (prevProps.rows !== nextProps.rows
    || prevProps.loading !== nextProps.loading
  || prevProps.pageSizeNumber !== nextProps.pageSizeNumber
  || prevProps.rowCount !== nextProps.rowCount
  || prevProps.columns !== nextProps.columns
  ) { return false; }
  return true;
});
