import React, { forwardRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import FormGenerator from '../formGenerator';
import Table from '../table/index';
import DialogBox from '../dialogBox';

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />);

const FormViewer = (props) => {
  const {
    rows,
    columns,
    checkboxSelection,
    handleCellClick,
    formDetails,
    setFormDetails,
    closeModelHandler,
    modalTitle,
    formMode,
    loading,
    alertShow,
    setAlertShow,
    formHandler,
    onPageChange,
    onPageSizeChange,
    rowCount,
    isLoading,
    clientPaginationMode,
    hideFooterPagination
  } = props;

  return (
    <>
      <DialogBox
        isOpen={formMode?.show}
        handleClose={closeModelHandler}
        title={modalTitle}
        padding='0px'
      >
        <FormGenerator
          isLoading={isLoading}
          formHandler={formHandler}
          formDetails={formDetails}
          alertShow={alertShow}
          setAlertShow={setAlertShow}
          setFormDetails={setFormDetails}
        />
      </DialogBox>
      { columns.length
        ? (
          <Table
            rows={rows}
            columns={columns}
            checkboxAllowed={checkboxSelection}
            handleCellClick={handleCellClick}
            loading={loading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            rowCount={rowCount}
            clientPaginationMode={clientPaginationMode}
            hideFooterPagination={hideFooterPagination}
          />
        )
        : null}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={alertShow?.open}
        autoHideDuration={3000}
        key='bottom center'
        onClose={() => setAlertShow({ ...alertShow, open: false })}
      >
        <Alert
          severity={alertShow?.alertType ?? 'success'}
          sx={{ width: '100%' }}
          onClose={() => setAlertShow({ ...alertShow, open: false })}
        >
          {alertShow?.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(FormViewer);
