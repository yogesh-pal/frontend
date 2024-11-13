/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import moment from 'moment';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { Grid, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Service } from '../../../service';
import { VARIABLE } from '../../../constants';
import { errorMessageHandler } from '../../../utils';
import {
  columnFields, navigationDetails, formJsonDetails
} from './helper';
import {
  ToastMessage, MenuNavigation, TableComponent, FormGenerator, DialogBox,
} from '../../../components';
import {
  HeaderContainer, BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled, HeadingMaster,
  CenterContainerStyled, LoadingButtonSecondaryPrimary, ContainerStyled, CustomContainerStyled,
  TextFieldStyled
} from '../../../components/styledComponents';
import { formStepDocumentConfigInitial } from './helper/documentPreviewed';

const CustomerCreationQueue = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customerId, setCustomerId] = useState();
  const [formConfiguration, setFormConfiguration] = useState();
  const [loading, setLoading] = useState({ loader: false, name: '' });
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [endDate, setEndDate] = useState(moment().format('MM/DD/YYYY'));
  const [startDate, setStartDate] = useState(moment().subtract(2, 'days').format('MM/DD/YYYY'));
  const [searchDetails, setSearchDetails] = useState({
    data: [],
    rowCount: 0,
    pageNumber: 1,
    pageSize: 10
  });
  const formConfigRef = useRef(formConfiguration);
  const formStepDocumentConfigRef = useRef(formStepDocumentConfigInitial);

  const { userDetails } = useSelector((state) => state.user);

  const reasonHandler = (item) => {
    try {
      if (item.update_request_meta?.bank_details) {
        if (!item?.update_request_meta?.bank_details?.is_bank_verified) {
          return 'Bank account penny drop failed.';
        }
        return `Name mismatch score is low - ${item?.update_request_meta?.bank_details?.fuzzy_match_status}`;
      }

      if (!item?.is_bank_verified) {
        return 'Bank account penny drop failed.';
      }
      return `Name mismatch score is low - ${item?.fuzzy_match_status}`;
    } catch (e) {
      console.log('Error', e);
    }
  };

  const searchDetailsHandler = async (pageNumber, pageSize, params) => {
    try {
      setLoading({ loader: true, name: 'TABLE' });
      let url = `${process.env.REACT_APP_CUSTOMER_QUEUE}?page_size=${pageSize}&page=${pageNumber}`;
      if (userDetails?.selectedBranch !== VARIABLE.BRANCHALL) {
        url += `&branch_code=${userDetails?.selectedBranch}`;
      }
      if (params?.startDate && params?.endDate && moment(params.startDate, 'dd/mm/yyyy').isValid() && moment(params.endDate, 'dd/mm/yyyy').isValid()) {
        url += `&start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      const { data, status } = await Service.post(url);
      if (status === 200) {
        const userDetail = data.data.results.map((item, index) => ({
          _id: index + 1,
          checkerReason: reasonHandler(item),
          ...item
        }));
        setSearchDetails((pre) => ({
          ...pre,
          data: userDetail || [],
        }));
      }
    } catch (e) {
      console.log('Error', e);
      const error = errorMessageHandler(e.response.data.errors);
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: error || 'Customer queue listing API failed. Try again.',
          alertType: 'error'
        });
      }
      setSearchDetails({
        data: [], rowCount: 0, pageNumber: 1, pageSize: 10
      });
    } finally {
      setLoading({ loader: false, name: '' });
    }
  };

  const getListCount = async (params) => {
    try {
      let url = `${process.env.REACT_APP_CUSTOMER_QUEUE_COUNT}`;
      if (userDetails?.selectedBranch !== VARIABLE.BRANCHALL) {
        url += `?branch_code=${userDetails?.selectedBranch}`;
      }
      if (params?.startDate && params?.endDate && moment(params.startDate, 'dd/mm/yyyy').isValid() && moment(params.endDate, 'dd/mm/yyyy').isValid()) {
        url += `${url.includes('?') ? '&' : '?'}start_date=${params.startDate}&end_date=${params.endDate}`;
      }
      const { data, status } = await Service.post(url);
      if (status === 200) {
        setSearchDetails((pre) => ({
          ...pre,
          rowCount: data?.data,
        }));
      }
    } catch (err) {
      setAlertShow({ open: true, msg: 'Something went wrong while fetching list count.', alertType: 'error' });
    }
  };

  const setClickedDocumentPreviewedHandler = (event, targetInput) => {
    event.preventDefault();

    const { href } = event.currentTarget;

    try {
      const formStepDocumentMapper = cloneDeep(formStepDocumentConfigRef.current);

      Object.entries(formStepDocumentMapper).forEach(([formStep, formStepConfig]) => {
        Object.entries(formStepConfig).forEach(([document, documentConfig]) => {
          if (targetInput.name === document) {
            console.log(targetInput.name);
            if (documentConfig.hasOwnProperty('multiple')) {
              console.log(event.currentTarget.innerText);
              if (event.currentTarget.innerText.toLowerCase().includes('front')) {
                formStepDocumentMapper[formStep][document].multiple.front = { ...formStepDocumentMapper[formStep][document].multiple.front, isPreviewed: true };

                if (formStepDocumentMapper[formStep][document].multiple.back.isPreviewed) formStepDocumentMapper[formStep][document].isPreviewed = true;
              } else {
                formStepDocumentMapper[formStep][document].multiple.back = { ...formStepDocumentMapper[formStep][document].multiple.back, isPreviewed: true };

                if (formStepDocumentMapper[formStep][document].multiple.front.isPreviewed) formStepDocumentMapper[formStep][document].isPreviewed = true;
              }
            } else {
              formStepDocumentMapper[formStep][document] = { ...formStepDocumentMapper[formStep][document], isPreviewed: true };
            }
          }
        });
      });

      console.log(formStepDocumentMapper);

      formStepDocumentConfigRef.current = formStepDocumentMapper;

      window.open(href, '_blank');
    } catch (error) {
      console.error('Error during set clicked document previewed handler :', error);
      setAlertShow({ open: true, msg: 'Something went wrong while setting clicked document previewed.', alertType: 'error' });
    }
  };

  const useDetailsHandler = async (customerID) => {
    try {
      setIsOpen(true);
      const { status, data } = await Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${customerID}&branch_code=${userDetails?.selectedBranch}&page_size=10000`);
      if (status === 200 && data?.data) {
        const formConfigurationObject = cloneDeep(formJsonDetails(data.data, setClickedDocumentPreviewedHandler));
        setFormConfiguration(formConfigurationObject);
        formConfigRef.current = formConfigurationObject;
      }
    } catch (e) {
      console.log('Error', e);
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      }
    }
  };
  const onPageSizeChange = (pageSize) => {
    try {
      setSearchDetails((pre) => ({
        ...pre,
        pageSize
      }));
      searchDetailsHandler(searchDetails.pageNumber, pageSize, {
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
    } catch (e) {
      console.log(e);
    }
  };

  const onPageChange = (pageNumber) => {
    try {
      setSearchDetails((pre) => ({
        ...pre,
        pageNumber
      }));
      searchDetailsHandler(pageNumber, searchDetails.pageSize, {
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY')
      });
    } catch (e) {
      console.log(e);
    }
  };

  const onRecordClickHandler = (field, record) => {
    try {
      setCustomerId(record?.customer_id);
      useDetailsHandler(record?.customer_id);
      setIsOpen(true);
    } catch (e) {
      console.log(e);
    }
  };

  const handleClose = () => {
    try {
      setIsOpen(false);
      setFormConfiguration('');
      formStepDocumentConfigRef.current = formStepDocumentConfigInitial;
    } catch (e) {
      console.log('Error', e);
    }
  };

  const detailsHandler = async (value) => {
    try {
      let apiUrl = process.env.REACT_APP_CUSTOMER_CHECKER;
      if (userDetails?.selectedBranch !== VARIABLE.BRANCHALL) {
        apiUrl += `?branch=${userDetails?.selectedBranch}`;
      }
      const { status } = await Service.put(apiUrl, {
        customer_id: customerId,
        approval_status: value
      });
      if (status === 200) {
        setAlertShow({
          open: true,
          msg: `Customer details ${value.toLowerCase()} successfully.`,
          alertType: 'success'
        });
        handleClose();
        searchDetailsHandler(searchDetails?.pageNumber, searchDetails?.pageSize);
      }
    } catch (e) {
      const error = errorMessageHandler(e.response.data.errors);
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: error || 'Customer approval API failed. Try again.',
          alertType: 'error'
        });
      }
      console.log('Error', e);
    }
  };

  useEffect(() => {
    getListCount();
    searchDetailsHandler(searchDetails.pageNumber, searchDetails.pageSize);
  }, []);

  const handleEndDateChange = (newEndDate) => {
    if (startDate) {
      setEndDate(newEndDate);
      getListCount({
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(newEndDate).format('DD/MM/YYYY')
      });
      searchDetailsHandler(searchDetails.pageNumber, searchDetails.pageSize, {
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(newEndDate).format('DD/MM/YYYY')
      });
    } else {
      setAlertShow({ open: true, msg: 'Please select start date.', alertType: 'error' });
    }
  };

  const areAllDocumentsViewed = () => {
    try {
      let formStepDocsViewed = true;
      let allFormDocsViewed = true;
      Object.entries(formStepDocumentConfigRef.current).forEach(([formStep, formStepConfig]) => {
        Object.entries(formStepConfig).forEach(([document, documentConfig]) => {
          // Check if the current input has some value and check it should have been previewed if it has some value
          const customerCreationQueueForm = formConfigRef.current.form;

          let flag = 0;
          customerCreationQueueForm.forEach((fStepConfig, fStep) => {
            const index = customerCreationQueueForm[fStep].input.findIndex((item) => item.name === document);
            if (index !== -1) {
              const defaultVal = customerCreationQueueForm[fStep].input[index].defaultValue;

              if (!(defaultVal === null || defaultVal === undefined || defaultVal === '' || (Array.isArray(defaultVal) && defaultVal.length === 0)) && documentConfig.isPreviewed === false) {
                flag = 1;
              }
            }
          });

          if (flag) {
            formStepDocsViewed = false;
          }
        });
        if (!formStepDocsViewed) allFormDocsViewed = false;
      });

      if (!allFormDocsViewed) {
        setAlertShow({ open: true, msg: 'Please preview all KYC and Bank detail documents atleast once to be able to accept.', alertType: 'error' });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in areAllDocumentsViewed:', error);
      setAlertShow({ open: true, msg: 'An unexpected error occurred while checking if all documents are viewed.', alertType: 'error' });
      return false;
    }
  };

  const acceptDetailsHandler = () => {
    try {
      if (true || areAllDocumentsViewed()) {
        setLoading({ loader: true, name: 'Approved' });
        detailsHandler('Approved');
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const rejectDetailsHandler = () => {
    try {
      setLoading({ loader: true, name: 'Rejected' });
      detailsHandler('Rejected');
    } catch (e) {
      console.log('Error', e);
    }
  };

  const footerHandler = () => (
    <>
      <LoadingButtonSecondaryPrimary
        loading={loading?.loader && loading.name === 'Rejected'}
        variant='contained'
        disabled={loading?.loader}
        onClick={rejectDetailsHandler}
      >
        Reject
      </LoadingButtonSecondaryPrimary>
      <LoadingButtonSecondaryPrimary
        loading={loading?.loader && loading.name === 'Approved'}
        variant='contained'
        disabled={loading?.loader}
        onClick={acceptDetailsHandler}
      >
        Accept
      </LoadingButtonSecondaryPrimary>
    </>
  );

  const disableEndDates = (currentDate) => moment(currentDate).isAfter(moment(startDate).add(7, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Customer Creation Queue
          </HeadingMaster>
        </HeaderContainer>
        <Grid container padding='0 20px' display='flex' justifyContent='end'>
          <Grid item xs={12} sm={8} md={6} lg={4} xl={4} display='flex'>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='Start Date'
                value={startDate}
                disableHighlightToday
                inputFormat='dd/MM/yyyy'
                onChange={(newValue) => {
                  setStartDate(newValue);
                  setEndDate(null);
                }}
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
        </Grid>
        <DialogBox
          isOpen={isOpen}
          fullScreen
          title='Customer Details'
          width='100%'
          customeFooter={footerHandler}
          isFooter
          handleClose={handleClose}
        >
          <ContainerStyled>
            {
            formConfiguration ? (
              <FormGenerator
                formDetails={formConfiguration}
              />
            ) : (
              <CenterContainerStyled padding='40px'>
                <CircularProgress color='secondary' />
              </CenterContainerStyled>
            )
            }
          </ContainerStyled>
        </DialogBox>
        <Grid item xs={12} padding='0px 0px 10px 0px'>
          <TableComponent
            cursor='pointer'
            handleCellClick={onRecordClickHandler}
            rows={searchDetails?.data}
            columns={columnFields}
            checkboxAllowed={false}
            clientPaginationMode={false}
            loading={loading?.loader && loading?.name === 'TABLE'}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            rowCount={searchDetails?.rowCount}
          />
        </Grid>
      </CustomContainerStyled>
    </>
  );
};
export default CustomerCreationQueue;
