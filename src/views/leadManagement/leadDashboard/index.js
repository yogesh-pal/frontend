/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import moment from 'moment';

import { useForm } from 'react-hook-form';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useScreenSize } from '../../../customHooks';
import {
  BreadcrumbsContainerStyled,
  BreadcrumbsWrapperContainerStyled, CustomContainerStyled, HeaderContainer, HeadingMaster,
  LoadingButtonPrimary,
  TextFieldStyled, ResetButton
} from '../../../components/styledComponents';
import {
  MenuNavigation, ToastMessage,
  TableComponent,
  MultiToggleButton,
  ErrorText
} from '../../../components';
import { navigationDetails } from './navigationDetail';
import PageLoader from '../../../components/PageLoader';
import {
  CustomForm,
} from '../../loanDisbursal/list/helper';
import { leadListingSearchValidation, togglerGroup, columnFields } from './constant';
import { Service } from '../../../service';
import { SERVICEURL } from '../../../constants';

const LeadDashboard = () => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [pageLoading, setPageLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState('Lead Id');
  const [paramsValue, setParamsValue] = useState('lead_id');
  const [startDate, setStartDate] = useState(moment().subtract(30, 'days').format('MM/DD/YYYY'));
  const [isLoading, setIsLoading] = useState(false);
  const [endDate, setEndDate] = useState(moment().format('MM/DD/YYYY'));
  const [filterType, setFilterType] = useState({
    leadId: '',
    customerName: '',
    mobileNo: ''
  });
  const [searchDetails, setSearchDetails] = useState({
    data: [],
    rowCount: 0,
    pageNumber: 1,
    pageSize: 15
  });

  console.log(setPageLoading, setSearchTitle, setParamsValue, isLoading);
  const screen = useScreenSize();
  const {
    register, handleSubmit, setValue, formState: { errors },
    reset,
    // getValues
  } = useForm();

  const onSearchSubmit = async (value, refresh) => {
    try {
      setIsLoading(true);
      const reqBody = {};
      if (value) {
        if (value?.customer_name) {
          reqBody.fullName = value?.customer_name;
          setFilterType((prev) => ({
            ...prev,
            customerName: value?.customer_name
          }));
        }
        if (value?.lead_id) {
          reqBody.id = value?.lead_id;
          setFilterType((prev) => ({
            ...prev,
            leadId: value?.lead_id
          }));
        }
        if (value?.customer_mobile_number) {
          reqBody.phoneNumber = value?.customer_mobile_number;
          setFilterType((prev) => ({
            ...prev,
            mobileNo: value?.customer_mobile_number
          }));
        }
      } else if (refresh !== 'reset') {
        if (filterType?.customerName) {
          reqBody.fullName = filterType?.customerName;
        }
        if (filterType?.leadId) {
          reqBody.id = filterType?.leadId;
        }
        if (filterType?.mobileNo) {
          reqBody.phoneNumber = filterType?.mobileNo;
        }
      }

      reqBody.startDate = moment(startDate).format('YYYY-MM-DD');
      reqBody.endDate = moment(endDate).format('YYYY-MM-DD');

      const { data } = await Service.post(SERVICEURL.CIRCULAR.LEAD_DASHBOARD, reqBody);

      if (data?.status !== 200) {
        setAlertShow({
          open: true,
          msg: data?.message || 'Something went wrong',
          alertType: 'error'
        });
        setSearchDetails((prev) => ({
          ...prev,
          data: [],
        }));
        return;
      }
      if (data?.result?.length === 0) {
        setAlertShow({
          open: true,
          msg: 'No Record Found',
          alertType: 'error'
        });
      }
      const userDetails = data?.result?.map((item, index) => ({
        ...item,
        phoneNumberMasked: item?.phoneNumber ? `XXXXXX${item?.phoneNumber.substring(6,)}` : '',
        _id: index + 1,
      }));
      setSearchDetails((prev) => ({
        ...prev,
        data: userDetails,
      }));
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: e?.response?.data?.message || 'Something went wrong',
        alertType: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const seletedValueHandler = (value) => {
    try {
      if (value) {
        setParamsValue(value);
        const searchTemp = togglerGroup.values.find((item) => item.value === value);
        setSearchTitle(searchTemp?.name);
        reset({ [value]: null });
      }
    } catch (e) {
      console.log('Error', e);
    }
  };
  const searchResetHandler = () => {
    setValue(paramsValue, '');
    setSearchDetails((pre) => ({
      ...pre,
      data: [],
    }));
    setFilterType((prev) => ({
      ...prev,
      customerName: '',
      leadId: '',
      mobileNo: ''
    }));
    onSearchSubmit(null, 'reset');
  };
  const handleEndDateChange = (newEndDate) => {
    if (startDate) {
      setEndDate(newEndDate);
    } else {
      setAlertShow({ open: true, msg: 'Please select start date.', alertType: 'error' });
    }
  };
  const handleStartDateChange = (newEndDate) => {
    setStartDate(newEndDate);
  };
  const onPageSizeChange = () => {
    console.log('page size change');
  };

  const onPageChange = () => {
    console.log('page change');
  };
  const disableEndDates = (currentDate) => moment(currentDate).isAfter(moment(startDate).add(90, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');
  useEffect(() => {
    onSearchSubmit();
  }, [startDate, endDate]);
  return (
    <>
      {pageLoading ? <PageLoader /> : null}

      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='10px !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Lead Dashboard
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer item xs={12} display={['xs', 'sm'].includes(screen) ? 'block' : 'flex'} justifyContent='space-between'>
          <div>
            <CustomForm
              onSubmit={handleSubmit(onSearchSubmit)}
              width={['xs', 'sm'].includes(screen) ? '100%' : ''}
            >
              <TextFieldStyled
                id='outlined-basic'
                label={`${searchTitle} *`}
                variant='outlined'
                defaultValue=''
                {...register(paramsValue, {
                  required: true,
                  pattern: (leadListingSearchValidation[paramsValue]?.validation?.pattern)
                    ? new RegExp(leadListingSearchValidation[paramsValue]?.validation?.pattern) : undefined,
                  maxLength: (leadListingSearchValidation[paramsValue]?.validation?.maxLength)
                    ? leadListingSearchValidation[paramsValue]?.validation?.maxLength : undefined,
                  minLength: (leadListingSearchValidation[paramsValue]?.validation?.minLength)
                    ? leadListingSearchValidation[paramsValue]?.validation?.minLength : undefined,
                })}
                onChange={(e) => setValue(paramsValue, e.target.value, { shouldValidate: true })}
              />
              <LoadingButtonPrimary
                variant='contained'
                disabled={isLoading}
                loading={isLoading?.loader && isLoading?.name === 'SEARCH'}
                type='submit'
                margin='5px 5px 5px 24px !important'
              >
                Search
              </LoadingButtonPrimary>
              <ResetButton onClick={() => searchResetHandler()}>
                Reset
              </ResetButton>
            </CustomForm>
            <ErrorText input={leadListingSearchValidation[paramsValue]} errors={errors} />
            <HeaderContainer padding='10px 0px'>
              <MultiToggleButton
                orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
                details={togglerGroup}
                seletedValueHandler={seletedValueHandler}
              />
            </HeaderContainer>
          </div>
          <Grid item display='flex'>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='Start Date'
                value={startDate}
                disableHighlightToday
                inputFormat='dd/MM/yyyy'
                onChange={(newValue) => handleStartDateChange(newValue)}
                disableFuture
                renderInput={(params) => (
                  <TextFieldStyled
                    {...params}
                    error={false}
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                  />
                )}
              />
            </LocalizationProvider>
            <div style={{ width: '100%', paddingLeft: '10px' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label='End Date'
                  value={endDate}
                  disableHighlightToday
                  inputFormat='dd/MM/yyyy'
                  onChange={(newValue) => handleEndDateChange(newValue)}
                  shouldDisableDate={disableEndDates}
                  disableFuture
                  renderInput={(params) => (
                    <TextFieldStyled
                      {...params}
                      error={false}
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </div>
          </Grid>
        </HeaderContainer>
        <Grid item xs={12}>
          <TableComponent
            cursor='pointer'
            clientPaginationMode
            rows={searchDetails?.data || []}
            columns={columnFields()}
            checkboxAllowed={false}
            loading={isLoading}
            rowCount={searchDetails?.data?.length}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </Grid>
      </CustomContainerStyled>
    </>
  );
};

export default LeadDashboard;
