import { cloneDeep } from 'lodash';
import styled from '@emotion/styled';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Container, Alert } from '@mui/material';
import { Service } from '../../service';
import CAM from '../../components/formFields/CAM/CAM';
import { saveFormData } from '../../redux/reducer/loanMaker';
// import PublicRouteHeader from '../../components/header/publicRouteHeader';
import Layout from '../../layout/publicDashboard';
import { CenterContainerStyled } from '../../components/styledComponents';

const ContainerStyled = styled(Container)(({ theme }) => ({
  boxShadow: `${theme?.boxShadow?.primary} 0px 2px 8px`,
  padding: '20px !important',
  marginTop: '20px',
  overflow: 'auto'
}));

const CamReport = () => {
  const [error, setError] = useState(null);
  const [colender, setColender] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { custAndAppNo } = useParams();

  const getLoanData = async (fullAPIURL) => {
    try {
      const { data } = await Service.get(fullAPIURL);
      return data;
    } catch (err) {
      console.log('Error', err);
      return null;
    }
  };

  const getCustomerData = async (custID) => {
    try {
      const { data } = await Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${custID}`);
      return data.data;
    } catch (err) {
      console.log('Error', err);
      setError('Something went wrong while fetching CAM details.');
      return null;
    }
  };

  const fetchInitialData = async (custID, appNo) => {
    let loanData = await getLoanData(`${process.env.REACT_APP_LOAN_LISTING}/${appNo}`);
    if (!loanData) {
      loanData = await getLoanData(`${process.env.REACT_APP_LOAN_LISTING}/${appNo}?old=1`);
    }
    if (loanData) {
      const custData = await getCustomerData(custID);
      if (custData) {
        setColender(loanData?.colender);
        const dataToSaveInRedux = cloneDeep(loanData);
        const customerFullDetails = cloneDeep(custData);
        dataToSaveInRedux.customerFullDetails = customerFullDetails;
        dispatch(saveFormData(dataToSaveInRedux));
      } else {
        setError('Something went wrong while fetching CAM details.');
      }
    } else {
      setError('Something went wrong while fetching CAM details.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const custID = custAndAppNo.split('-')[0];
    const appNo = custAndAppNo.split('-')[1];
    fetchInitialData(custID, appNo);
  }, []);

  return (
    <Layout colender={colender}>
      {/* <PublicRouteHeader colender={colender} /> */}
      <ContainerStyled>
        {isLoading ? (
          <CenterContainerStyled padding='40px'>
            <CircularProgress color='secondary' />
          </CenterContainerStyled>
        ) : null}
        {
            !isLoading && !error ? <CAM isAfterDisburse /> : null
        }
        {
         error ? (
           <CenterContainerStyled padding='40px'>
             <Alert severity='error'>{error}</Alert>
           </CenterContainerStyled>
         ) : null
        }
      </ContainerStyled>
    </Layout>
  );
};
export default CamReport;
