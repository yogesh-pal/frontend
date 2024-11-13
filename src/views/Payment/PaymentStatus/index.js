/* eslint-disable max-len */
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PublicRouteHeader from '../../../components/header/publicRouteHeader';
import { CustomContainer, showKeyValuePair } from '../paymentInitiate/common';
import { HeaderContainer } from '../../../components/styledComponents/container';
import { HeadingMaster } from '../../../components/styledComponents/heading';

const SuccessIcon = styled(CheckCircleOutlineIcon)`
  color: green;
  font-size: 100px;
`;

const FailureIcon = styled(ErrorOutlineIcon)`
  color: red;
  font-size: 100px;
`;

const PendingIcon = styled(ErrorOutlineIcon)`
  color: #F29339;
  font-size: 100px;
`;

const CustomMsg = styled.p`
font-size: 20px;
text-align:center;
`;

const index = () => {
  const location = useLocation();
  const data = location.search.split('?data=')[1];
  const navigate = useNavigate();
  const decodedData = data && window.atob(data);
  const keyValuePairs = decodedData?.split('&');
  const paymentDetails = [];
  const transactionIcons = {
    TXN_SUCCESS: <SuccessIcon />,
    TXN_FAILURE: <FailureIcon />,
    PENDING: <PendingIcon />
  };
  const transactionHeading = {
    TXN_SUCCESS: 'Payment Success',
    TXN_FAILURE: 'Payment Failure',
    PENDING: 'Transaction Pending'
  };
  let paymentStatus = '';
  const orderedList = [{ key: 'lan', label: 'LOAN ACCOUNT NUMBER' }, { key: 'applicant_name', label: 'Customer Name' }, { key: 'amount', label: 'Amount' }, { key: 'order_id', label: 'Order ID' }, { key: 'transaction_id', label: 'Transaction ID' }, { key: 'status', label: 'Transaction Status' }];
  orderedList.forEach((k) => {
    keyValuePairs?.forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key === k.key) {
        paymentDetails.push({
          label: k.label,
          value
        });
        if (key === 'status') {
          paymentStatus = value;
        }
      }
    });
  });

  useEffect(() => {
    if (!data) {
      navigate('/');
    }
  }, []);
  return (
    <>
      <PublicRouteHeader />
      <CustomContainer>
        <HeaderContainer
          item
          xs={12}
          padding='10px 10px 20px 10px'
          flexDirection='column'
          justifyContent='center'
        >
          <div>
            {transactionIcons[paymentStatus]}
          </div>
          <HeaderContainer item xs={12} padding='10px 10px 20px 10px'>
            <HeadingMaster>
              {transactionHeading[paymentStatus]}
            </HeadingMaster>
          </HeaderContainer>
          {
            paymentStatus === 'PENDING' ? (
              <CustomMsg>
                We are fetching details about your transaction from respective bank. We request you to not attempt for multiple payments till the status is updated. In case of further assistance, please reach out to our relationship manager at nearest branch.
              </CustomMsg>
            ) : showKeyValuePair(paymentDetails, true)
          }
        </HeaderContainer>
      </CustomContainer>
    </>
  );
};
export default index;
