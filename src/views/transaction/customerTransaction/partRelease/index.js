/* eslint-disable max-len */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import moment from 'moment';
import Decimal from 'decimal.js';
import { cloneDeep } from 'lodash';
import styled from '@emotion/styled';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Grid, FormHelperText, Skeleton } from '@mui/material';
import ReleaseOrnaments from './releaseOrnaments';
import store from '../../../../redux/store';
import { Service } from '../../../../service';
import { REGEX, VARIABLE } from '../../../../constants';
import { throttleFunction } from '../../../../utils/throttling';
import {
  ToastMessage, MenuNavigation, FormGenerator, DialogBox
} from '../../../../components';
import {
  HeaderContainer, HeadingMaster, LoadingButtonPrimary, TextFieldStyled, ButtonPrimary,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled, ResetButton, CustomContainerStyled,
} from '../../../../components/styledComponents';
import {
  partReleaseNavigation,
  HeadingMaster2, ContainerStyled, partReleaseReadOnlyFields
} from '../../helper';
import { isAllowedForRelease } from '../collateralRelease/collateralReleaseMaker';

const CustomForm = styled('form')(({ width }) => ({
  width: width || '500px'
}));

const PartRelease = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loanInfo, setLoanInfo] = useState(null);
  const [rpgPrice, setRPGPrice] = useState(null);
  const [allBranches, setAllBranches] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [formConfiguration, setFormConfiguration] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const {
    register, handleSubmit, formState: { errors }, reset, setValue
  } = useForm();
  const loaderRef = useRef();
  const state = store.getState();
  const { selectedBranch } = state.user.userDetails;

  const calculatePercentage = (percent, total) => Number(new Decimal((percent / 100) * total).toFixed(2));

  const searchDetailsHandler = async ({ lan }) => {
    try {
      setFormConfiguration(null);
      loaderRef.current = true;
      setLoading({ loader: true, name: 'onSearch' });
      setIsImageLoading(true);
      const { data } = await Service.get(`${process.env.REACT_APP_LOAN_ACCOUNT_DETAILS}/${lan}?is_parent=1`);
      if (data?.colender === 'KVB') {
        setFormConfiguration(null);
        setAlertShow({ open: true, msg: 'Part release not allowed for KVB Loan', alertType: 'error' });
        return;
      }
      if (data?.status === 'CLO') {
        setFormConfiguration(null);
        setAlertShow({ open: true, msg: 'LAN is closed.', alertType: 'error' });
        return;
      }
      if (!isAllowedForRelease(data?.maker_branch, data?.transfer_branch, selectedBranch)) {
        setFormConfiguration(null);
        setAlertShow({ open: true, msg: `This LAN ${lan} does not belong to your branch${selectedBranch === VARIABLE.BRANCHALL ? '' : ` ${selectedBranch}`}.`, alertType: 'error' });
        return;
      }
      if (moment(data.disbursed_on).isSame(moment(), 'day')) {
        setFormConfiguration(null);
        setAlertShow({ open: true, msg: 'Disbursement done today. Hence, Part Release not allowed.', alertType: 'error' });
        return;
      }
      if (data?.parent_account_no) {
        setFormConfiguration(null);
        setAlertShow({ open: true, msg: 'Part Release is not allowed for a Top Up LAN.', alertType: 'error' });
        return;
      }
      if (data?.status === 'DBD') {
        const customerInfo = await Service.get(`${process.env.REACT_APP_USER_VIEW}?fc=1&token=1&customer_id=${data.customer_id}&collateral=1`);
        const lanData = customerInfo?.data?.data?.loan_detail?.filter((item) => item.lan.trim() === lan.trim());
        if (lanData.length === 0) {
          setAlertShow({ open: true, msg: `LAN ${lan} does not exist in flexcube.`, alertType: 'error' });
          return;
        }
        if (lanData[0]?.total_outstanding_for_foreclosure <= 0) {
          setAlertShow({ open: true, msg: 'No Outstanding Loan Amount. Hence, Part Release not allowed.', alertType: 'error' });
          return;
        }
        const childLoans = customerInfo?.data?.data?.loan_detail?.filter((item) => item.parentAcctNo.trim() === lan.trim());
        const childLoansTotalDues = childLoans.reduce((acc, currentValue) => acc + currentValue.total_outstanding_for_foreclosure, 0);
        const childLoansTotalPOS = childLoans.reduce((acc, currentValue) => acc + currentValue.pos, 0);
        const childLoansTotalDisburseAmt = childLoans.reduce((acc, currentValue) => acc + currentValue.disburshment_amout, 0);
        const request1 = Service.get(
          `${process.env.REACT_APP_GET_S3_URL}/?module=GOLD&doc=${data?.customer_photo}`
        );
        const request2 = Service.get(
          `${process.env.REACT_APP_GET_S3_URL}/?module=GOLD&doc=${data?.items_pic}`
        );
        let customerPhoto;
        let collateralPhoto;
        await Promise.all([request1, request2]).then((response) => {
          [customerPhoto, collateralPhoto] = response;
        });
        const branchInfo = allBranches.filter((ele) => ele.branchCode === data?.maker_branch);
        const finalData = {
          customerId: data?.customer_id,
          customerNumber: data?.customer_mobile_number,
          customerName: `${data.first_name} ${data.middle_name} ${data.last_name}`,
          lan: data?.application_no,
          packetId: data?.gold_pouch_number,
          pos: lanData[0].pos + childLoansTotalPOS,
          totalDues: lanData[0].total_outstanding_for_foreclosure + childLoansTotalDues,
          tareWeight: data?.tare_weight_gold_pouch,
          totalWeight: data?.total_weight_gm,
          numberOfItems: data?.total_count,
          lastAppliedRPG: calculatePercentage(Number(data?.scheme_ltv), Number(data?.loan_rpg)),
          todayRPG: rpgPrice,
          appliedRPG: calculatePercentage(Number(data?.scheme_ltv), Number(data?.loan_rpg)),
          disbursedLoanAmount: data.requested_loan_amount + childLoansTotalDisburseAmt,
          eligibleValuation: data?.scheme_eligible_amount,
          branchCode: data?.maker_branch,
          branchName: branchInfo.length ? branchInfo[0]?.branchName : '',
          ornaments: data?.items,
          customerPhoto: customerPhoto.data?.data?.full_path,
          consolidatedCollateralPhoto: collateralPhoto.data?.data?.full_path,
          loan_account_no: data?.loan_account_no,
          loanToken: lanData[0]?.dt,
          colender: data?.colender
        };
        setLoanInfo(finalData);
        setFormConfiguration(cloneDeep(partReleaseReadOnlyFields(finalData)));
      } else {
        setFormConfiguration(null);
        setAlertShow({ open: true, msg: 'LAN is not in disbursed state.', alertType: 'error' });
      }
    } catch (err) {
      console.log('error', err);
      setFormConfiguration(null);
      if (err.response.data?.errors?.detail) {
        if (err.response.data.errors.detail === 'Not found.') {
          setAlertShow({ open: true, msg: 'No LAN found', alertType: 'error' });
        } else {
          setAlertShow({ open: true, msg: err.response.data.errors.detail, alertType: 'error' });
        }
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setLoading({ loader: false, name: null });
    }
  };

  const fetchInitialData = () => {
    try {
      const request1 = Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
      const request2 = Service.get(process.env.REACT_APP_SCHEME_RPA);
      Promise.all([request1, request2]).then((data) => {
        setAllBranches(data[0]?.data.branches);
        setRPGPrice(data[1]?.data.price);
      });
    } catch (err) {
      setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const onSearchSubmit = ({ lan }) => {
    throttleFunction(
      {
        args1: [{ lan }],
        function1: searchDetailsHandler,
      },
      loaderRef,
      setIsSearchDisabled
    );
  };

  const searchResetHandler = () => {
    reset({ lan: null });
    setFormConfiguration(null);
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  const handleClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsOpen(false);
  };

  const closeOnSuccess = () => {
    setFormConfiguration(null);
    reset({ lan: null });
    setIsOpen(false);
    setAlertShow({ open: true, msg: 'Part Release transaction is successful.', alertType: 'success' });
  };

  const handleImageLoad = () => setIsImageLoading(false);

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={partReleaseNavigation} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <ContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Part Release
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer
          item
          xs={12}
          sm={6}
          md={6}
          lg={6}
          xl={6}
          padding='0 20px'
          display='flex'
          justifyContent='center'
        >
          <CustomForm
            onSubmit={handleSubmit(onSearchSubmit)}
          >
            <TextFieldStyled
              label='LAN*'
              {...register('lan', {
                onChange: (e) => setValue('lan', e.target.value.trim(), { shouldValidate: true }),
                required: 'Please enter LAN',
                pattern: { value: REGEX.NUMBER, message: 'Please enter valid LAN' },
                maxLength: { value: 20, message: 'LAN should not be more than 20 digits' }
              })}
            />
            {renderError('lan')}
            <Grid item xs={12} sm={12} padding='10px 0px' display='flex' justifyContent='center'>
              <LoadingButtonPrimary
                variant='contained'
                loading={loading?.loader && loading?.name === 'onSearch'}
                disabled={isSearchDisabled}
                type='submit'
              >
                Search
              </LoadingButtonPrimary>
              <ResetButton onClick={() => searchResetHandler()}>
                Reset
              </ResetButton>
            </Grid>
          </CustomForm>
        </HeaderContainer>
        {
            formConfiguration ? (
              <>
                <FormGenerator formDetails={formConfiguration} />
                <Grid container padding='0px 40px 20px' display='flex' justifyContent='center'>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} display='flex' alignItems='center'>
                    <HeadingMaster2 padding='0 !important'>Customer Photo</HeadingMaster2>
                  </Grid>
                  { isImageLoading
                    ? (
                      <Grid item xs={12} sm={12} md={6} lg={3} xl={3} style={{ margin: '10px 0px' }}>
                        <Skeleton
                          sx={{ bgcolor: '#8f8f91' }}
                          variant='rectangular'
                          width='200px'
                          height='150px'
                        />
                      </Grid>
                    )
                    : null}
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} display={isImageLoading ? 'none' : 'block'}>
                    <img
                      src={loanInfo.customerPhoto}
                      onClick={() => window.open(loanInfo.customerPhoto)}
                      width='200px'
                      onLoad={handleImageLoad}
                      alt=''
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} display='flex' alignItems='center'>
                    <HeadingMaster2 padding='0 !important'>Consolidated Collateral Photo</HeadingMaster2>
                  </Grid>
                  { isImageLoading
                    ? (
                      <Grid item xs={12} sm={12} md={6} lg={3} xl={3} style={{ margin: '10px 0px' }}>
                        <Skeleton
                          sx={{ bgcolor: '#8f8f91' }}
                          variant='rectangular'
                          width='200px'
                          height='150px'
                        />
                      </Grid>
                    )
                    : null}
                  <Grid item xs={12} sm={12} md={6} lg={3} xl={3} display={isImageLoading ? 'none' : 'block'}>
                    <img
                      src={loanInfo.consolidatedCollateralPhoto}
                      onClick={() => window.open(loanInfo.consolidatedCollateralPhoto)}
                      width='200px'
                      alt=''
                    />
                  </Grid>
                </Grid>
                <Grid container padding='0px 20px 20px'>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} display='flex' justifyContent='center'>
                    <ButtonPrimary onClick={() => setIsOpen(true)}>Proceed for Part Release</ButtonPrimary>
                  </Grid>
                </Grid>
              </>
            ) : null
        }
      </ContainerStyled>
      <DialogBox
        isOpen={isOpen}
        fullScreen
        title=' '
        width='100%'
        handleClose={handleClose}
      >
        <CustomContainerStyled padding='0 !important'>
          <ReleaseOrnaments
            loanInfo={loanInfo}
            closeOnSuccess={closeOnSuccess}
          />
        </CustomContainerStyled>
      </DialogBox>
    </>
  );
};
export default PartRelease;
