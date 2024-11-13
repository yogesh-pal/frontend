import moment from 'moment';
import { format } from 'date-fns';
import { cloneDeep } from 'lodash';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import {
  useCallback,
  useEffect, useMemo, useRef, useState
} from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Grid, FormControlLabel, CircularProgress } from '@mui/material';
import Filter from './filter';
import { Service } from '../../service';
import { NAVIGATION } from '../../constants';
import { getDecodedToken } from '../../utils';
import { throttleFunction } from '../../utils/throttling';
import { FormViewer, MenuNavigation } from '../../components';
import { formConfig, businessTypeOptions, circularStaticColumns } from './constant';
import {
  ButtonPrimary, TextFieldStyled, IOSSwitch, CustomContainerStyled, LoadingButtonPrimary,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled, HeadingMaster
} from '../../components/styledComponents';
import { useScreenSize } from '../../customHooks';

const CustomForm = styled(({ isMobileView, ...other }) => <form {...other} />)`
  width: ${(props) => (props.isMobileView ? '100%' : '500px')};
  display: flex;
`;
const CustomDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CustomFormControlLabel = styled(FormControlLabel)`
 margin: 0px 0px 0px 20px !important;
`;

const Circulars = () => {
  const [searchValue, setSearchValue] = useState(null);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [unclaimedData, setUnclaimedData] = useState([]);
  const [formDetails, setFormDetails] = useState(formConfig);
  const [filterCategory, setFilterCategory] = useState(null);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [filterYearAndMonth, setFilterYearAndMonth] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [formMode, setFormMode] = useState({ mode: 'EDIT', show: false });
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 10 });
  const [isLoading, setIsLoading] = useState({ loader: false, id: null, name: null });

  const screen = useScreenSize();
  const theme = useTheme();
  const loaderRef = useRef();
  const { register, handleSubmit, setValue } = useForm();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const { email, allBranchSelected } = useSelector((state) => state.user.userDetails);
  const { super_admin: isSuperUser } = getDecodedToken();

  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Circular Master', url: NAVIGATION.circular }
  ], NAVIGATION);

  const editHandler = async ({ row }) => {
    try {
      setIsLoading({ loader: true, id: row.id, name: 'onUpdate' });
      const businesType = businessTypeOptions.filter(
        (option) => option.label === row.business_type
      )[0].value;
      const formData = new FormData();
      formData.append('user_id', email);
      formData.append('business_type', businesType);
      formData.append('subject', row.subject);
      formData.append('status', row.status === 'ACTIVE' ? 0 : 1);
      const { data } = await Service.put(`${process.env.REACT_APP_CIRCULAR_SERVICE}/${row.id}`, formData, {
        'Content-Type': 'multipart/form-data'
      });
      if (data?.success) {
        setAlertShow({ open: true, msg: 'Circular status updated successfully.', alertType: 'success' });
        const index = unclaimedData.findIndex((item) => item.id === row.id);
        unclaimedData[index].status = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      }
    } catch (err) {
      console.log('err', err);
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, id: null });
    }
  };

  const circularColumnFields = [
    ...circularStaticColumns,
    {
      field: 'action',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (cellValues) => (
        <>
          <a
            data-testid='previewLink'
            href={`/file-viewer?id=${btoa(cellValues.id)}`}
            target='_blank'
            rel='noreferrer'
            style={{ color: '#502A74' }}
          >
            Read
          </a>
          {
          isLoading.loader && cellValues.id === isLoading.id ? <CircularProgress color='secondary' />
            : (
              <CustomFormControlLabel
                control={<IOSSwitch sx={{ m: 1 }} disabled={!isSuperUser} checked={cellValues.row.status === 'ACTIVE'} onClick={() => !allBranchSelected && editHandler(cellValues)} />}
              />
            )
      }
        </>
      )
    }
  ];

  const fetchInitialCirculars = async (apiUrl) => {
    try {
      loaderRef.current = true;
      const { data } = await Service.get(apiUrl);
      if (data?.success) {
        setTotalRowCount(data.total);
        data?.data.forEach((item) => {
          item.business_type = businessTypeOptions.filter(
            (option) => option.value === item.business_type
          )[0].label;
          // eslint-disable-next-line no-underscore-dangle
          item._id = item.id;
          item.status = item.status ? 'ACTIVE' : 'INACTIVE';
          item.created_at = moment(item.created_at).format('DD/MM/YYYY');
        });
        setUnclaimedData(data?.data);
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong! Please try again.', alertType: 'error' });
      }
    } catch (err) {
      console.log('err', err);
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setIsLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    setIsLoading({ loader: true, name: 'TABLEDATA' });
    fetchInitialCirculars(`${process.env.REACT_APP_CIRCULAR_SERVICE}?status=0`);
  }, []);

  const closeModelHandler = () => setFormMode({ mode: 'NONE', show: false });

  const getApiUrl = (search, category, yearAndMonth) => {
    const params = {};
    setSearchValue(search);
    setFilterCategory(category);
    setFilterYearAndMonth(yearAndMonth);
    if (search) {
      params.subject = search;
    }
    if (category) {
      params.business_type = category;
    }
    if (yearAndMonth) {
      const timeFrame = format(new Date(yearAndMonth), 'yyy-MM');
      setFilterYearAndMonth(timeFrame);
      params.time_filter = timeFrame;
    }
    return params;
  };
  const hitApi = (params) => {
    let appendToApiUrl = '';
    Object.keys(params).forEach((item) => {
      appendToApiUrl += (`&${item}=${params[item]}`);
    });
    fetchInitialCirculars(`${process.env.REACT_APP_CIRCULAR_SERVICE}?status=0${appendToApiUrl}`);
  };
  const onSearchSubmit = ({ search }) => {
    if (search.trim().length) {
      const params = getApiUrl(search.trim(), filterCategory, filterYearAndMonth);
      setIsLoading({ loader: true, name: 'onSearch' });
      throttleFunction(
        {
          args1: [params],
          function1: hitApi
        },
        loaderRef,
        setIsSearchDisabled
      );
    } else {
      setAlertShow({ open: true, msg: 'Invalid search.', alertType: 'error' });
    }
  };

  const onFilterSubmit = useCallback(({ category, yearAndMonth }) => {
    if (category || yearAndMonth) {
      setIsFilterApplied(true);
      const params = getApiUrl(searchValue, category, yearAndMonth);
      setIsLoading({ loader: true, name: 'onFilter' });
      hitApi(params);
    }
  }, [searchValue]);

  const createCircularHandler = async (values) => {
    try {
    // create a form obj
      setIsLoading({ loader: true, name: 'onCreate' });
      const formData = new FormData();
      formData.append('user_id', email);
      formData.append('business_type', values.business_type);
      formData.append('subject', values.subject);
      formData.append('status', values.status === 'ACTIVE' ? 1 : 0);
      formData.append('files', values.files[0][3]);
      const { data } = await Service.postWithFile(
        process.env.REACT_APP_CIRCULAR_SERVICE,
        formData
      );
      if (data?.success) {
        setFormMode({ mode: 'NONE', show: false });
        setAlertShow({ open: true, msg: 'Circular added successfully.', alertType: 'success' });
        fetchInitialCirculars(`${process.env.REACT_APP_CIRCULAR_SERVICE}?status=0`);
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong! Please try again.', alertType: 'error' });
      }
    } catch (err) {
      console.log('err', err);
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  const onPageChange = (pageNumber) => {
    const params = getApiUrl(searchValue, filterCategory, filterYearAndMonth);
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    params.limit = pageInfo.pageSize;
    params.offset = ((pageNumber - 1) * pageInfo.pageSize);
    setIsLoading({ loader: true, name: 'onPageChange' });
    hitApi(params);
  };

  const onPageSizeChange = (pageSize) => {
    const params = getApiUrl(searchValue, filterCategory, filterYearAndMonth);
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    params.limit = pageSize;
    params.offset = ((pageInfo.pageNumber - 1) * pageSize);
    setIsLoading({ loader: true, name: 'onPageSizeChange' });
    hitApi(params);
  };

  const searchResetHandler = () => {
    setValue('search', null);
    const params = getApiUrl(null, filterCategory, filterYearAndMonth);
    setIsLoading({ loader: true, name: 'onSearchResetHandler' });
    hitApi(params);
  };

  const filterResetHandler = useCallback(() => {
    const params = getApiUrl(searchValue, null, null);
    setIsLoading({ loader: true, name: 'onFilterResetHandler' });
    hitApi(params);
  }, [searchValue]);

  const addNewCircular = () => {
    setFormDetails(cloneDeep(formConfig));
    setFormMode({ mode: 'NEW', show: true });
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <Grid
          container
          alignItems='center'
          justifyContent='center'
        >
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='20px 20px 0px 20px'>
            <HeadingMaster>Circular Master</HeadingMaster>
          </Grid>
          <Grid
            item
            xl={12}
            lg={12}
            md={12}
            sm={12}
            xs={12}
            display={matches ? 'flex' : 'block'}
            justifyContent='space-between'
            padding='20px 20px 0px 20px'
          >
            <CustomForm isMobileView={!matches} onSubmit={handleSubmit(onSearchSubmit)}>
              <TextFieldStyled
                id='outlined-basic'
                label='Subject'
                required
                variant='outlined'
                {...register('search', { required: true })}
              />
              <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'onSearch'} disabled={isSearchDisabled} type='submit'>
                Search
              </LoadingButtonPrimary>
              <ButtonPrimary onClick={() => searchResetHandler()}>
                Reset
              </ButtonPrimary>
            </CustomForm>
            <CustomDiv padding={['xs', 'sm'].includes(screen) ? '10px' : ''}>
              <Filter
                onFilterSubmit={onFilterSubmit}
                filterResetHandler={filterResetHandler}
                isFilterApplied={isFilterApplied}
                setIsFilterApplied={setIsFilterApplied}
              />
              <LoadingButtonPrimary onClick={addNewCircular} disabled={!isSuperUser}>
                Add New
              </LoadingButtonPrimary>
            </CustomDiv>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <FormViewer
              isLoading={isLoading.loader && isLoading.name === 'onCreate'}
              loading={isLoading.loader && isLoading.name !== 'onUpdate'}
              formMode={formMode}
              rows={isLoading.loader && isLoading.name !== 'onUpdate' ? [] : unclaimedData}
              columns={circularColumnFields}
              checkboxAllowed={false}
              formDetails={formDetails}
              setFormDetails={setFormDetails}
              formHandler={createCircularHandler}
              closeModelHandler={closeModelHandler}
              onPageSizeChange={onPageSizeChange}
              onPageChange={onPageChange}
              alertShow={alertShow}
              setAlertShow={setAlertShow}
              modalTitle='Add Circular'
              rowCount={totalRowCount}
            />
          </Grid>
        </Grid>
      </CustomContainerStyled>
    </>
  );
};
export default Circulars;
