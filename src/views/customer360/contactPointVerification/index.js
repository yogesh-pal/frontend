/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import {
  Grid, Container
} from '@mui/material';
import {
  AutoCompleteStyled,
  HeaderContainer, BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled, HeadingMaster,
  ContainerStyled, CustomContainerStyled,
  TextFieldStyled, LoadingButtonPrimary,
  ResetButton, ErrorMessageContainer
} from '../../../components/styledComponents';
import { useScreenSize } from '../../../customHooks';

import {
  navigationDetails,
} from './navigationDetails';
import {
  ToastMessage, MenuNavigation, TableComponent, DialogBox, ErrorText, MultiToggleButton
} from '../../../components';
import { VARIABLE } from '../../../constants';
import { Li } from '../../loanDisbursal/list/helper';
import { validation } from '../customerSearch/helper';
import { togglerGroup, columnFields, queryStringProvider } from './constants';
import { throttleFunction } from '../../../utils/throttling';
import CPVModal from './cpvModal';
import { Service } from '../../../service';

const CustomForm = styled('form')(({ width, flexDirection, justifyItems }) => ({
  width: width || '500px',
  display: 'flex',
  flexDirection,
  justifyItems
}));

export const InputWrapper = styled(Container)(({
  justifyContent, marginTop, flexDirection, height, padding
}) => ({
  display: 'flex',
  justifyContent,
  marginTop,
  flexDirection,
  height,
  padding,
}));

const index = () => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [branchOption, setBranchOption] = useState([]);
  const [searchTitle, setSearchTitle] = useState('Customer ID');
  const [isOpen, setIsOpen] = useState(false);
  const [paramsValue, setParamsValue] = useState('customer_id');
  const [selectedData, setSelectedData] = useState();
  const [loading, setLoading] = useState({
    loader: false,
    name: ''
  });
  const [searchDetails, setSearchDetails] = useState({
    data: [],
    rowCount: 0,
    pageNumber: 1,
    pageSize: 15,
    payload: {}
  });

  const loaderRef = useRef();
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);

  const { branchCodes, selectedBranch } = useSelector((state) => state.user.userDetails);
  const [branch, setBranch] = useState(selectedBranch === VARIABLE.BRANCHALL ? []
    : [selectedBranch]);
  const screen = useScreenSize();
  const {
    register, handleSubmit, setValue, formState: { errors }, reset, getValues
  } = useForm();

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

  const fetchData = async (searchType, pageNumber, pageSize, payload) => {
    if (branch.length === 0) {
      setAlertShow({
        open: true,
        msg: 'Please select atleast one branch to search',
        alertType: 'error'
      });
      return;
    }
    try {
      setLoading({
        name: searchType,
        loader: true
      });
      loaderRef.current = true;
      const finalObj = {
        ...payload,
        page_size: pageSize,
        page: pageNumber
      };
      const queryParams = queryStringProvider(finalObj);
      const { data } = await Service.get(`${process.env.REACT_APP_GET_CPV_LISTING}?${queryParams}`);
      if (data.success) {
        setSearchDetails((pre) => ({
          ...pre,
          data: data.data.results,
        }));
      }
    } catch (err) {
      console.log('err', err);
      setAlertShow({
        msg: 'Something went wrong. Try Again.',
        alertType: 'error',
        open: true
      });
    } finally {
      setLoading({
        name: '',
        loader: false
      });
      loaderRef.current = false;
    }
  };

  const fetchCount = async (payload) => {
    try {
      if (branch.length === 0) {
        setAlertShow({
          open: true,
          msg: 'Please select atleast one branch to search',
          alertType: 'error'
        });
        return;
      }
      const queryString = queryStringProvider(payload);
      const { data } = await Service.get(`${process.env.REACT_APP_GET_CPV_LISTING_COUNT}?${queryString}`);
      if (data.success) {
        setSearchDetails((pre) => ({
          ...pre,
          rowCount: data.data,
        }));
      }
    } catch (err) {
      setAlertShow({ open: true, msg: 'Something went wrong while fetching list count.', alertType: 'error' });
    }
  };

  const searchResetHandler = () => {
    reset({
      [paramsValue]: null
    });
    if (branch.length === 0) {
      setAlertShow({
        open: true,
        msg: 'Please select atleast one branch to search',
        alertType: 'error'
      });
      return;
    }
    const payload = {
      branch: branch.join(',')
    };
    fetchData('NOTSEARCH', 1, searchDetails.pageSize, payload);
    fetchCount(payload);
    setSearchDetails({
      ...searchDetails,
      payload
    });
  };

  const onSearchSubmit = (val) => {
    if (branch.length === 0) {
      setAlertShow({
        open: true,
        msg: 'Please select atleast one branch to search',
        alertType: 'error'
      });
      return;
    }
    const payload = {
      [paramsValue]: val[paramsValue],
      branch: branch.join(',')
    };
    let searchType = '';
    if (val.primary_mobile_number) {
      searchType = 'SEARCHVIAMOBILE';
    } else {
      searchType = 'SEARCHVIACUSTOMER';
    }
    setSearchDetails({
      ...searchDetails, payload, pageNumber: 1
    });
    throttleFunction(
      {
        args1: [searchType, 1, searchDetails.pageSize, payload],
        function1: fetchData,
        args2: [payload],
        function2: fetchCount
      },
      loaderRef,
      setIsSearchDisabled
    );
  };

  const branchSelectHandler = (event, value) => {
    console.log('value got = ', value);
    if (value.length === 6) {
      setAlertShow({
        open: true,
        msg: 'Atmost 5 branches can be selected at once',
        alertType: 'error'
      });
      return;
    }
    setBranch(value);
  };

  const onPageSizeChange = (pageSize) => {
    try {
      fetchData('NOTSEARCH', searchDetails.pageNumber, pageSize, searchDetails.payload);
      setSearchDetails({
        ...searchDetails,
        pageSize,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const onPageChange = (pageNumber) => {
    try {
      fetchData('NOTSEARCH', pageNumber, searchDetails.pageSize, searchDetails.payload);
      setSearchDetails({
        ...searchDetails,
        pageNumber,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleCellClick = (a, b) => {
    setIsOpen(true);
    setSelectedData({
      mobile_no: b.primary_mobile_number,
      maker_branch_code: b.maker_branch_code,
      cpv_id: b._id
    });
  };

  useEffect(() => {
    const payload = {};
    if (branch.length === 0) {
      setAlertShow({
        open: true,
        msg: 'Please select atleast one branch to search',
        alertType: 'error'
      });
      setSearchDetails({
        ...searchDetails,
        rowCount: 0,
        data: []
      });
      return;
    }
    payload.branch = branch.join(',');
    if (getValues(paramsValue)) {
      payload[paramsValue] = getValues(paramsValue);
    } else {
      payload.cpv_status = 'Pending';
    }
    setSearchDetails({
      ...searchDetails, payload, pageNumber: 1
    });
    fetchData('NOTSEARCH', 1, searchDetails.pageSize, payload);
    fetchCount(payload);
  }, [branch]);
  useEffect(() => {
    if (branchCodes.length) {
      setBranchOption(branchCodes);
    }
  }, []);

  return (
    <>
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
            Contact Point Verification
          </HeadingMaster>
        </HeaderContainer>
        <Grid container flexDirection='column'>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AutoCompleteStyled
              sx={{ padding: '20px' }}
              disablePortal
              disableClearable
              multiple
              id='demo-simple-select-label'
              options={branchOption}
              value={branch}
              onChange={(event, value) => branchSelectHandler(event, value)}
              renderInput={(params) => (
                <TextField {...params} label='Branch ID' />
              )}
              renderOption={(props, option) => (
                <Li {...props}>{option}</Li>
              )}
            />
          </Grid>
          <Grid>
            <HeaderContainer
              item
              xs={12}
              padding='0 20px 0px 20px'
              flexDirection={['xs', 'sm'].includes(screen) ? 'column-reverse' : 'row'}
              justifyItems={['xs', 'sm'].includes(screen) ? 'flex-end' : ''}
            >
              <CustomForm
                onSubmit={handleSubmit(onSearchSubmit)}
                width={['xs', 'sm'].includes(screen) ? '100%' : 'auto'}
                flexDirection={['xs', 'sm'].includes(screen) ? 'column' : 'row'}
                justifyItems={['xs', 'sm'].includes(screen) ? 'space-between' : 'space-between'}
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
                    setValue(paramsValue, paramsValue === 'pan_no' ? e.target.value.toUpperCase() : e.target.value, {
                      shouldValidate: true
                    });
                  }}
                />
                <InputWrapper
                  justifyContent='center'
                  height='fit-content'
                  marginTop={['xs', 'sm'].includes(screen) ? '10px' : '0px'}
                  padding='0px !important'
                >
                  <LoadingButtonPrimary
                    variant='contained'
                    loading={loading?.loader && loading?.name === 'SEARCH'}
                    disabled={isSearchDisabled}
                    type='submit'
                  >
                    Search
                  </LoadingButtonPrimary>
                  <ResetButton onClick={() => searchResetHandler()}>
                    Reset
                  </ResetButton>
                </InputWrapper>
              </CustomForm>
            </HeaderContainer>
            <ErrorMessageContainer>
              <ErrorText input={validation[paramsValue]} errors={errors} />
            </ErrorMessageContainer>
            <HeaderContainer padding='20px 20px 0px 20px'>
              <MultiToggleButton
                orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
                details={togglerGroup}
                seletedValueHandler={seletedValueHandler}
              />
            </HeaderContainer>
          </Grid>
          <Grid item xs={12}>
            <TableComponent
              rows={searchDetails?.data}
              columns={columnFields()}
              checkboxAllowed={false}
            //   handleCellClick={viewDetailsHandler}
              clientPaginationMode={false}
              loading={loading.loader && (loading.name === 'SEARCH' || loading.name === 'NOTSEARCH')}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              rowCount={searchDetails?.rowCount}
              cursor='pointer'
              pageSizeNumber={searchDetails?.pageSize}
              handleCellClick={handleCellClick}
            />
          </Grid>
          <DialogBox
            isOpen={isOpen}
            fullScreen
            title='Contact Point Verification Survey'
            width='100%'
            handleClose={() => setIsOpen(false)}
          >
            <ContainerStyled padding='10px !important'>
              <CPVModal
                alertShow={alertShow}
                setAlertShow={setAlertShow}
                setIsOpen={setIsOpen}
                selectedData={selectedData}
                searchDetails={searchDetails}
                fetchData={fetchData}
                fetchCount={fetchCount}
              />
            </ContainerStyled>
          </DialogBox>
        </Grid>

      </CustomContainerStyled>

    </>
  );
};

export default index;
