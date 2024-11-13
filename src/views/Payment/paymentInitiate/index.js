import React, { useState, useRef, useEffect } from 'react';
import { Grid } from '@mui/material';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import PublicRouteHeader from '../../../components/header/publicRouteHeader';
import { HeaderContainer } from '../../../components/styledComponents/container';
import { HeadingMaster } from '../../../components/styledComponents/heading';
import { ErrorText } from '../../../components';
import { useScreenSize } from '../../../customHooks';
import { TextFieldStyled } from '../../../components/styledComponents';
import { LoadingButtonPrimary } from '../../../components/styledComponents/button';
import EnterAmount from './amountEnter';
import {
  CustomContainer, CustomForm, CustomGrid,
} from './common';
import { Service } from '../../../service';
import { throttleFunction } from '../../../utils/throttling';
import CustomToaster from '../../../components/mesaageToaster';
import { REGEX } from '../../../constants/formGenerator/regex';
import PageLoader from '../../../components/PageLoader';

const CustomMessage = styled.h1`
  position: absolute;
  top: 54%;
  left: calc(50% - 85px);
  color: rgb(80, 42, 116);
  z-index: 1000;
`;
const index = () => {
  const {
    register, handleSubmit, setValue, formState: { errors }, getValues
  } = useForm();
  const [loaderState, setLoaderState] = useState({
    search: false
  });
  const [searchParams] = useSearchParams();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const scriptRef = useRef();
  const lanPrefilled = searchParams.get('lan');
  const dashboardPaymentToken = searchParams.get('token');
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [isLanDisabled, setIsLanDisabled] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const searchRef = useRef();
  const [lan, setLan] = useState('');
  const [customerData, setCustomerData] = useState([]);
  const [customerBranch, setCustomerBranch] = useState('');
  const [errorState, setErrorState] = useState({
    open: false,
    msg: '',
    alertType: ''
  });
  const [system, setSystem] = useState('');
  const screen = useScreenSize();

  const lanInput = {
    name: 'lan',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter LOAN ACCOUNT NUMBER.',
      maxLength: 50,
      maxLenMsg: 'LOAN ACCOUNT NUMBER should not be more than 50 characters.',
      minLength: 10,
      minLenMsg: 'LOAN ACCOUNT NUMBER should have at least 10 characters.',
      pattern: REGEX.ALPHANUMERIC,
      patternMsg: 'Only alphanumeric characters are allowed.'
    }
  };

  const handleReset = (info = null) => {
    setIsLanDisabled(false);
    setValue('lan', lanPrefilled ?? '');
    setLan('');
    scriptRef.current = false;
    if (info && info.message) {
      setErrorState({
        open: true,
        msg: info.message,
        alertType: info.alertType
      });
    }
  };

  const hitApi = async (values) => {
    try {
      setLoaderState({
        ...loaderState, search: true
      });
      searchRef.current = true;
      const payload = {
        lan: values.lan.trim()
      };
      const { data } = await Service.postLogin(process.env.REACT_APP_IS_LAN_ACTIVE, payload);
      if (data.success) {
        const info = data.data[0];
        setLan(info.lan);
        setIsLanDisabled(true);
        setCustomerData([{
          label: 'Customer Name',
          value: info.applicant_name
        }]);
      }
    } catch (err) {
      console.log(err);
      handleReset();
      if (err?.response && err?.response?.data?.message) {
        const errorMessage = err.response.data.message;
        setErrorState({
          open: true,
          msg: errorMessage,
          alertType: 'error'
        });
      } else {
        setErrorState({
          open: true,
          msg: 'Something went wrong. Please try again.',
          alertType: 'error'
        });
      }
    } finally {
      setLoaderState({
        ...loaderState, search: false
      });
      searchRef.current = false;
    }
  };

  const hitFlexCube = async (values) => {
    try {
      setLoaderState({
        ...loaderState, search: true
      });
      searchRef.current = true;
      const { data } = await Service.getAPI(`${process.env.REACT_APP_FLEXCUBE_IS_LAN_ACTIVE}${values.lan.trim()}/customer_details?is_payment=1`);
      const applicantName = `${data.first_name} ${data.middle_name} ${data.last_name}`;
      setLan(values.lan.trim());
      setIsLanDisabled(true);
      setCustomerData([{
        label: 'Customer Name',
        value: applicantName
      }]);
      setCustomerBranch(data.maker_branch);
    } catch (err) {
      console.log(err);
      handleReset();
      let errorMessage = 'Something went wrong. Please try again.';
      if (err?.response?.data) {
        if (err.response.data?.status_code === 404) {
          errorMessage = 'Account No. not found.';
        }
        if (err.response.data?.status_code !== 404 && err.response.data?.errors?.detail) {
          errorMessage = err.response.data.errors.detail;
        }
      }
      setErrorState({
        open: true,
        msg: errorMessage,
        alertType: 'error'
      });
    } finally {
      setLoaderState({
        ...loaderState, search: false
      });
      searchRef.current = false;
    }
  };

  const systemFunc = {
    veefin: hitApi,
    flexcube: hitFlexCube
  };

  const onLanSubmit = async (values) => {
    if (values.lan.trim().length) {
      const value = values.lan.trim();
      let temp;
      if (value.substr(0, 2) === 'GL') {
        temp = 'veefin';
      } else if (value.substr(0, 3) === '301') {
        temp = 'flexcube';
      } else {
        setErrorState({ open: true, msg: 'Invalid Loan Account Number.', alertType: 'error' });
        return;
      }
      throttleFunction(
        {
          args1: [values],
          function1: systemFunc[temp]
        },
        searchRef,
        setIsSearchDisabled
      );
      setSystem(temp);
    } else {
      setErrorState({ open: true, msg: 'Invalid search.', alertType: 'error' });
    }
  };

  useEffect(() => {
    setValue('lan', lanPrefilled ?? '');
  }, []);

  return (
    <>
      <CustomToaster alertShow={errorState} setAlertShow={setErrorState} />
      {isPageLoading && (
      <div>
        <PageLoader message='Processing' />
        <CustomMessage>
          Processing...
        </CustomMessage>
      </div>
      )}
      <PublicRouteHeader />
      <CustomContainer>
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Gold Loan - Repayment
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer
          item
          xs={12}
          padding='0 20px 0 20px'
          flexDirection='row'
          justifyContent='center'
        >
          <CustomForm
            onSubmit={handleSubmit(onLanSubmit)}
            width={['xs', 'sm'].includes(screen) ? '100%' : ''}
          >
            <TextFieldStyled
              id='lan'
              label='*LOAN ACCOUNT NUMBER'
              variant='outlined'
              value={getValues('lan')}
              disabled={isLanDisabled || lanPrefilled}
              {...register('lan', {
                onChange: (e) => {
                  setValue('lan', e.target.value.toUpperCase().replace(/\s/g, ''), { shouldValidate: true });
                },
                required: true,
                maxLength: (lanInput.validation.maxLength),
                minLength: (lanInput.validation.minLength),
                pattern: REGEX.ALPHANUMERIC
              })}
            />
            <CustomGrid>
              <ErrorText input={lanInput} errors={errors} />
            </CustomGrid>
            <Grid>
              <LoadingButtonPrimary
                variant='contained'
                type='submit'
                loading={loaderState.search}
                disabled={isSearchDisabled || isLanDisabled}
              >
                Search
              </LoadingButtonPrimary>
              <LoadingButtonPrimary
                variant='contained'
                onClick={() => handleReset()}
                disabled={!isLanDisabled || isPaymentProcessing}
              >
                Reset
              </LoadingButtonPrimary>
            </Grid>
          </CustomForm>
        </HeaderContainer>
      </CustomContainer>
      {lan && (
      <EnterAmount
        system={system}
        customerData={customerData}
        customerLan={lan}
        customerBranch={customerBranch}
        handleReset={handleReset}
        setIsPaymentProcessing={setIsPaymentProcessing}
        scriptRef={scriptRef}
        setIsPageLoading={setIsPageLoading}
        paymentViaDashboardToken={dashboardPaymentToken}
      />
      )}
    </>

  );
};

export default index;
