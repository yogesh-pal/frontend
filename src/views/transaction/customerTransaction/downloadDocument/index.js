import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Backdrop, CircularProgress, Alert } from '@mui/material';
import { Service } from '../../../../service';
// import PublicRouteHeader from '../../../../components/header/publicRouteHeader';
import Layout from '../../../../layout/publicDashboard';

const WrapperContainer = styled.div(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  padding: '20px'
}));

const DownloadTransactionDocument = () => {
  const [alert, setAlert] = useState({ type: null, msg: null });
  const location = useLocation();

  const fetchReceiptDocument = async () => {
    try {
      const receiptId = location.search.split('?receiptId=')[1];
      if (receiptId) {
        const { data } = await Service.get(`${process.env.REACT_APP_RECEIPT_SERVICE}/${receiptId}/document`);
        if (data?.success) {
          setAlert({ type: 'success', msg: 'Document has been downloaded successfully!' });
          window.open(data?.data, '_self');
        }
      }
    } catch (err) {
      console.log('err', err);
      setAlert({ type: 'error', msg: 'Something went wrong. Please try again!' });
    }
  };

  const fetchCollateralDocument = async () => {
    try {
      const dataArray = (location.search.split('?lan=')[1]).split('&source_module=');
      if (dataArray.length) {
        const { data } = await Service.get(`${process.env.REACT_APP_COLLATERAL_SERVICE}/applications/${dataArray[0]}/documents?source_module=${dataArray[1]}`);
        if (data?.success) {
          setAlert({ type: 'success', msg: 'Document has been downloaded successfully!' });
          window.open(data?.data, '_self');
        }
      }
    } catch (err) {
      console.log('err', err);
      setAlert({ type: 'error', msg: 'Something went wrong. Please try again!' });
    }
  };

  useEffect(() => {
    if (location.search.includes('receiptId')) {
      fetchReceiptDocument();
    }
    if (location.search.includes('lan')) {
      fetchCollateralDocument();
    }
  }, []);

  return (
    <Layout>
      {/* <PublicRouteHeader /> */}
      <WrapperContainer>
        {alert.type ? (
          <Alert severity={alert.type}>{alert.msg}</Alert>
        ) : (
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open
          >
            <CircularProgress color='inherit' />
          </Backdrop>
        )}
      </WrapperContainer>
    </Layout>
  );
};
export default DownloadTransactionDocument;
