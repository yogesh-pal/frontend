/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
import { useState, useEffect, useMemo } from 'react';
import { Grid, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import {
  ToastMessage,
  MenuNavigation,
  TableComponent,
  MultiToggleButton,
  ErrorText,
  DialogBox,
  FormGenerator
} from '../../../../components';
import {
  TextFieldStyled,
  CustomContainerStyled,
  LoadingButtonPrimary,
  BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled,
  HeadingMaster,
  HeaderContainer,
  ResetButton,
  ErrorMessageContainer,
  CenterContainerStyled,
  ContainerStyled,
  LoadingButtonSecondaryPrimary,
  ButtonPrimary
} from '../../../../components/styledComponents';
import {
  columnFields, togglerGroup, navigationDetails, validation, formJsonDetails
} from './helper';
import { Service } from '../../../../service';
import { useScreenSize } from '../../../../customHooks';
import AutocompleteComponent from '../autoComplete';
import { errorMessageHandler } from '../../../../utils';

const CustomForm = styled('form')(({ width }) => ({
  width: width || '500px',
  display: 'flex'
}));

const VendorUser = () => {
  const PAGESIZE = 10;
  const { userPermission } = useSelector((state) => state?.user?.userDetails);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [searchTitle, setSearchTitle] = useState('User ID');
  const [paramsValue, setParamsValue] = useState('emp_code');
  const [selectedRow, setSelectedRow] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [searchParameters, setSearchParameters] = useState({});
  const [vendorList, setVendorList] = useState([]);
  const [resetCount, setResetCount] = useState(0);
  const [confirmationModel, setConfirmationModel] = useState('CLOSE');
  const [formDetails, setFormDetails] = useState();
  const [loading, setLoading] = useState({
    loader: true,
    name: ''
  });
  const [formConfiguration, setFormConfiguration] = useState();
  const [searchDetails, setSearchDetails] = useState({
    data: [],
    rowCount: 0,
    pageNumber: 1,
    pageSize: PAGESIZE
  });
  const message = {
    SUBMIT: 'Are you sure you want to update Vendor User?',
    CANCEL: 'Are you sure you want to cancel the user updation?',
  };

  const screen = useScreenSize();

  const {
    register, handleSubmit, setValue, formState: { errors }, reset
  } = useForm();

  const vendorListHandler = async () => {
    try {
      const { data, status } = await Service.get(process.env.REACT_APP_VENDOR_MASTER_LIST);
      if (status === 200) {
        const sortedData = data.data.sort((a, b) => ((a.vendor_name.toLowerCase() > b.vendor_name.toLowerCase()) ? 1 : ((b.vendor_name.toLowerCase() > a.vendor_name.toLowerCase()) ? -1 : 0)));
        setVendorList(sortedData || []);
      }
    } catch (e) {
      const { data, status } = e.response;
      let msg = '';
      if (status === 403) {
        msg = errorMessageHandler(data.error);
      } else {
        msg = errorMessageHandler(data.errors);
      }
      setAlertShow({
        open: true,
        msg: msg || 'User detail API failed. Try again.',
        alertType: 'error'
      });
      console.log(e);
    }
  };

  const generateURL = (obj) => {
    try {
      const parmasValue = Object.keys(obj);
      let url = process.env.REACT_APP_VENDOR_USER_LIST;
      if (parmasValue.length) {
        let tempUrl = '?';
        parmasValue.forEach((item, index) => {
          if (index > 0) {
            tempUrl = `${tempUrl}&${item}=${obj[item]}`;
          } else {
            tempUrl = `${tempUrl}${item}=${obj[item]}`;
          }
        });
        url = `${url}${tempUrl}`;
      }
      return url;
    } catch (e) {
      console.log('Error', e);
    }
  };

  const searchDetailsHandler = async (pageNumber, pageSize, url) => {
    try {
      setLoading({
        loader: true,
        name: 'SEARCH'
      });
      const { data, status } = await Service.get(`${url}&page=${pageNumber}&page_size=${pageSize}`);
      if (status === 200) {
        const tempData = data.data.results.map((item, index) => ({ _id: index + 1, ...item }));
        setSearchDetails({
          data: tempData || [],
          rowCount: data?.data?.count || 0,
          pageNumber,
          pageSize
        });
        if (tempData?.length === 0) {
          setAlertShow({
            open: true,
            msg: 'No record found.',
            alertType: 'error'
          });
        }
      }
      setTimeout(() => {
        setLoading({
          loader: false,
          name: ''
        });
      }, 1000);
    } catch (e) {
      const { data, status } = e.response;
      let msg = '';
      if (status === 403) {
        msg = errorMessageHandler(data.error);
      } else {
        msg = errorMessageHandler(data.errors);
      }
      setAlertShow({
        open: true,
        msg: msg || 'Vendor user search API failed. Try again.',
        alertType: 'error'
      });
      setLoading({
        loader: false,
        name: ''
      });
      console.log('Error', e);
    }
  };

  const onSearchSubmit = async (value) => {
    try {
      setResetCount(0);
      setSearchParameters((prev) => ({
        ...prev,
        [paramsValue]: value[paramsValue]
      }));
      const parmatersTemp = searchParameters;
      const searchObj = {
        [paramsValue]: value[paramsValue],
      };
      let url = '';
      if (parmatersTemp?.hasOwnProperty('vendor_code') && parmatersTemp?.vendor_code?.length) {
        searchObj.vendor_code = parmatersTemp?.vendor_code;
        url = generateURL(searchObj);
      } else {
        url = generateURL(searchObj);
      }
      searchDetailsHandler(1, searchDetails.pageSize, url);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const updateCustomerDetailsHandler = (formValues) => {
    try {
      const goldStatus = formValues?.goldloan_status === 'Active';
      let isChanged = false;
      if (selectedRow?.mobile !== formValues?.mobile
        || selectedRow?.email !== formValues?.email
        || selectedRow?.goldloan_status !== goldStatus) {
        isChanged = true;
      }

      if (!isChanged) {
        setLoading({
          loader: false,
          name: ''
        });
        setAlertShow({
          open: true,
          msg: 'Please change vendor details before submit details.',
          alertType: 'error'
        });
        return;
      }
      const obj = {
        emp_code: selectedRow?.emp_code,
        mobile: formValues?.mobile,
        email: formValues?.email,
        goldloan_status: goldStatus
      };
      setFormDetails(obj);
      setConfirmationModel('SUBMIT');
    } catch (e) {
      console.log('Error', e);
    }
  };

  const formConfirmationHandler = async () => {
    try {
      if (confirmationModel === 'CANCEL') {
        setIsOpen(false);
        setConfirmationModel('CLOSE');
        return;
      }
      setLoading({
        loader: true,
        name: 'SUBMIT'
      });
      const { status } = await Service.put(process.env.REACT_APP_VENDOR_EDIT_USER, formDetails);
      if (status === 200) {
        setAlertShow({
          open: true,
          msg: 'Vendor user details updated successfully.',
          alertType: 'success'
        });
        setConfirmationModel('CLOSE');
        setLoading({
          loader: false,
          name: ''
        });
        if (searchParameters?.hasOwnProperty('vendor_code')
          || searchParameters?.hasOwnProperty(paramsValue)) {
          const searchObj = {};
          if (searchParameters?.vendor_code) {
            searchObj.vendor_code = searchParameters.vendor_code;
          }
          if (searchParameters[paramsValue]) {
            searchObj[paramsValue] = searchParameters[paramsValue];
          }
          const url = generateURL(searchObj);
          searchDetailsHandler(searchDetails.pageNumber, searchDetails.pageSize, url);
        }
        setIsOpen(false);
      }
    } catch (e) {
      console.log('Error', e);
      const { data, status } = e.response;
      let msg = '';
      if (status === 403) {
        msg = errorMessageHandler(data.error);
      } else {
        msg = errorMessageHandler(data.errors);
      }
      setAlertShow({
        open: true,
        msg: msg || 'Vendor user creation API failed. Try again.',
        alertType: 'error'
      });
      setConfirmationModel('CLOSE');
      setLoading({
        loader: false,
        name: ''
      });
    }
  };

  const onPageSizeChange = (pageSize) => {
    try {
      if (searchParameters?.hasOwnProperty('vendor_code')
          || searchParameters?.hasOwnProperty(paramsValue)) {
        const searchObj = {};
        if (searchParameters?.vendor_code) {
          searchObj.vendor_code = searchParameters.vendor_code;
        }
        if (searchParameters[paramsValue]) {
          searchObj[paramsValue] = searchParameters[paramsValue];
        }
        const url = generateURL(searchObj);
        searchDetailsHandler(1, pageSize, url);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onPageChange = (pageNumber) => {
    try {
      if (searchParameters?.hasOwnProperty('vendor_code')
          || searchParameters?.hasOwnProperty(paramsValue)) {
        const searchObj = {};
        if (searchParameters?.vendor_code) {
          searchObj.vendor_code = searchParameters.vendor_code;
        }
        if (searchParameters[paramsValue]) {
          searchObj[paramsValue] = searchParameters[paramsValue];
        }
        const url = generateURL(searchObj);
        searchDetailsHandler(pageNumber, searchDetails.pageSize, url);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const searchResetHandler = () => {
    try {
      reset({
        [paramsValue]: ''
      });
      setFormConfiguration('');
      setSearchParameters({
        vendor_code: searchParameters?.vendor_code
      });
      const parmatersTemp = searchParameters;
      if (parmatersTemp?.hasOwnProperty('vendor_code') && searchParameters?.vendor_code && resetCount === 0) {
        const searchObj = {
          vendor_code: parmatersTemp?.vendor_code
        };
        const url = generateURL(searchObj);
        searchDetailsHandler(1, searchDetails.pageSize, url);
        setResetCount(1);
      }

      if (!parmatersTemp?.vendor_code && !parmatersTemp?.vendor_code) {
        setSearchDetails({
          data: [],
          rowCount: 0,
          pageNumber: 1,
          pageSize: PAGESIZE
        });
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const seletedValueHandler = (value) => {
    try {
      setParamsValue(value);
      const searchTemp = togglerGroup.values.find((item) => item.value === value);
      setSearchTitle(searchTemp?.name);
      reset({
        [value]: null
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const selectValueHandler = async (value, val) => {
    try {
      setSearchParameters((prev) => ({
        ...prev,
        vendor_code: val?.vendor_code
      }));
      const parmatersTemp = searchParameters;
      const searchObj = {
        vendor_code: val?.vendor_code
      };
      if (val?.vendor_code) {
        if (paramsValue && parmatersTemp[paramsValue]) {
          searchObj[paramsValue] = parmatersTemp[paramsValue];
        }
        const url = generateURL(searchObj);
        searchDetailsHandler(1, searchDetails.pageSize, url);
        return;
      }
      if (paramsValue && parmatersTemp[paramsValue]) {
        const url = generateURL({
          [paramsValue]: parmatersTemp[paramsValue]
        });
        searchDetailsHandler(1, searchDetails.pageSize, url);
        return;
      }
      setSearchDetails({
        data: [],
        rowCount: 0,
        pageNumber: 1,
        pageSize: PAGESIZE
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const handleClose = () => {
    try {
      setIsOpen(false);
      setFormConfiguration('');
    } catch (e) {
      console.log('Error', e);
    }
  };

  const onCancelHandler = () => {
    try {
      setConfirmationModel('CANCEL');
    } catch (e) {
      console.log('Error', e);
    }
  };

  const viewVendorDetailsHandler = async (cellValues) => {
    try {
      const { row } = cellValues;
      setIsOpen(true);
      const { data, status } = await Service.get(`${process.env.REACT_APP_GET_USER_DETAILS}/${row?.emp_code}`);
      if (status === 200 && data) {
        setSelectedRow(data);
        setFormConfiguration(formJsonDetails({ onCancelHandler, userDetails: data }));
      }
    } catch (e) {
      const { data, status } = e.response;
      let msg = '';
      if (status === 403) {
        msg = errorMessageHandler(data.error);
      } else {
        msg = errorMessageHandler(data.errors);
      }
      setAlertShow({
        open: true,
        msg: msg || 'User detail API failed. Try again.',
        alertType: 'error'
      });
      console.log('Error', e);
    }
  };

  useEffect(() => {
    vendorListHandler();
  }, []);

  const vendorUserColumns = useMemo(() => columnFields({
    viewVendorDetailsHandler,
    userPermission
  }), [userPermission]);

  return (
    <>
      <DialogBox
        isOpen={confirmationModel !== 'CLOSE'}
        title=''
        handleClose={() => setConfirmationModel('CLOSE')}
        width='auto'
        padding='40px'
      >
        {
          message[confirmationModel]
        }

        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <LoadingButtonSecondaryPrimary
            variant='contained'
            onClick={formConfirmationHandler}
            loading={loading?.loader === true && loading?.name === 'SUBMIT'}
          >
            Yes
          </LoadingButtonSecondaryPrimary>
          <ButtonPrimary disabled={loading?.loader === true && loading?.name === 'SUBMIT'} onClick={() => setConfirmationModel('CLOSE')}>No</ButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
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
            Vendor User
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer
          item
          xs={12}
          padding='0 20px 20px 20px'
        >
          <CustomForm
            width={['xs'].includes(screen) ? '100%' : ''}
          >
            <AutocompleteComponent
              options={vendorList || []}
              label='Vendor Name'
              selectValueHandler={selectValueHandler}
            />
          </CustomForm>
        </HeaderContainer>
        <HeaderContainer
          item
          xs={12}
          padding='0 20px 20px 20px'
        >
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
                pattern: (validation[paramsValue]?.validation?.pattern)
                  ? new RegExp(validation[paramsValue]?.validation?.pattern) : undefined,
                min: (validation[paramsValue]?.validation?.min)
                  ? validation[paramsValue]?.validation?.min : undefined,
                max: (validation[paramsValue]?.validation?.max)
                  ? validation[paramsValue]?.validation?.max : undefined,
                maxLength: (validation[paramsValue]?.validation?.maxLength)
                  ? validation[paramsValue]?.validation?.maxLength : undefined,
                minLength: (validation[paramsValue]?.validation?.minLength)
                  ? validation[paramsValue]?.validation?.minLength : undefined,
              })}
              onChange={(e) => {
                setValue(paramsValue, e.target.value, {
                  shouldValidate: true
                });
              }}
            />
            <LoadingButtonPrimary
              variant='contained'
              loading={loading?.loader && loading?.name === 'SEARCH'}
              type='submit'
            >
              Search
            </LoadingButtonPrimary>
            <ResetButton onClick={() => searchResetHandler()}>
              Reset
            </ResetButton>
          </CustomForm>
        </HeaderContainer>
        <ErrorMessageContainer>
          <ErrorText input={validation[paramsValue]} errors={errors} />
        </ErrorMessageContainer>
        <HeaderContainer>
          <MultiToggleButton
            orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
            details={togglerGroup}
            seletedValueHandler={seletedValueHandler}
          />
        </HeaderContainer>
        {
          searchDetails?.data?.length ? (
            <>
              <DialogBox
                isOpen={isOpen}
                fullScreen
                title='Edit Vendor User'
                width='100%'
                handleClose={handleClose}
              >
                <ContainerStyled>

                  {
                  formConfiguration ? (
                    <FormGenerator
                      formDetails={formConfiguration}
                      formHandler={updateCustomerDetailsHandler}
                      isLoading={loading?.loader === true && loading?.name === 'SUBMIT'}
                    />
                  ) : (
                    <CenterContainerStyled padding='40px'>
                      <CircularProgress color='secondary' />
                    </CenterContainerStyled>
                  )
                  }
                </ContainerStyled>
              </DialogBox>
              <Grid item xs={12}>
                <TableComponent
                  rows={searchDetails?.data}
                  columns={vendorUserColumns}
                  checkboxAllowed={false}
                  clientPaginationMode={false}
                  onPageChange={onPageChange}
                  onPageSizeChange={onPageSizeChange}
                  rowCount={searchDetails?.rowCount}
                />
              </Grid>
            </>
          ) : null
        }
      </CustomContainerStyled>
    </>
  );
};
export default VendorUser;
