import React, { forwardRef } from 'react';
import { Snackbar, Alert } from '@mui/material';

const CutomAlert = forwardRef((props, ref) => <Alert elevation={6} ref={ref} variant='filled' {...props} />);

const CustomToaster = ({ setAlertShow, alertShow }) => (
  <Snackbar
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    open={alertShow?.open}
    autoHideDuration={4000}
    key='bottom center'
    onClose={() => setAlertShow({ ...alertShow, open: false })}
  >
    <CutomAlert
      severity={alertShow?.alertType ?? 'success'}
      sx={{ width: '100%' }}
      onClose={() => setAlertShow({ ...alertShow, open: false })}
    >
      {alertShow?.msg}
    </CutomAlert>
  </Snackbar>
);

export default React.memo(CustomToaster);
