import { forwardRef } from 'react';
import { Snackbar, Alert } from '@mui/material';
import PageLoader from '../PageLoader';

const CutomAlert = forwardRef((props, ref) => <Alert elevation={6} ref={ref} variant='filled' {...props} />);

const NoInternetPage = () => (
  <>
    <PageLoader />
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open
      key='1'
    >
      <CutomAlert
        severity='error'
        sx={{ width: '100%' }}
      >
        There seems to be a problem with your Network Connection!
      </CutomAlert>
    </Snackbar>
  </>
);
export default NoInternetPage;
