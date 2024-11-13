import { useLocation } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Backdrop, CircularProgress, Alert } from '@mui/material';
import { Service } from '../../../../service';
import Layout from '../../../../layout/publicDashboard';
// import PublicRouteHeader from '../../../../components/header/publicRouteHeader';

const WrapperContainer = styled.div(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  padding: '20px'
}));

const DownloadDocument = () => {
  const [alert, setAlert] = useState({ type: null, msg: null });
  const location = useLocation();

  const fetchLoanDocument = async (delay = 30000) => {
    try {
      const token = location.search.split('?data=')[1];
      if (token) {
        const tokenData = jwtDecode(token);
        const { data } = await Service.get(`${process.env.REACT_APP_APPLICATION_LOS_CHECKER}/${tokenData.application_no}/documents/${tokenData.doc_type}`);
        if (data?.success) {
          setAlert({ type: 'success', msg: 'Document has been downloaded successfully!' });
          window.open(data?.data, '_self');
        }
      } else {
        setAlert({ type: 'error', msg: 'Invalid Request!' });
      }
    } catch (err) {
      console.log('err', err.response.data.data);
      if (err.response.status === 404) {
        if (delay > 600000) {
          setAlert({ type: 'error', msg: 'Timeout please try again after sometime!' });
        } else {
          setTimeout(() => fetchLoanDocument(delay + 30000), delay);
        }
      } else {
        setAlert({ type: 'error', msg: err?.response?.data?.data || 'Something went wrong. Please try again!' });
      }
    }
  };

  useEffect(() => {
    fetchLoanDocument();
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
export default React.memo(DownloadDocument);
