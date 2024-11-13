/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import {
  useEffect, useRef, useState
} from 'react';
import { Box, CircularProgress } from '@mui/material';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useScreenSize } from '../../../../customHooks';
import {
  MenuNavigation, ToastMessage, DialogBox, MultiToggleButton,
  ErrorText
} from '../../../../components';
import {
  ButtonPrimary, HeaderContainer, CustomContainerStyled, LoadingButtonPrimary,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled,
  TextFieldStyled, HeadingMaster, ResetButton, ErrorMessageContainer
} from '../../../../components/styledComponents';
import { Service } from '../../../../service';
import { userColumnFields } from './constant';
import { throttleFunction } from '../../../../utils/throttling';
import {
  DeputationDataGridStyled, deputationTogglerGroup, deputationValidation,
  CustomForm, deputationNavigation
} from '../../helper';
import MakerUserDetail from './makerUserDetails';

const TableWrapperDiv = styled.div`
 padding: 0px 20px 10px;
`;

const Deputation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [allBranches, setAllBranches] = useState([]);
  const [searchTitle, setSearchTitle] = useState('Emp Code');
  const [paramsValue, setParamsValue] = useState('emp_code');
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 10 });
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [clickedRow, setClickedRow] = useState(null);
  const navigate = useNavigate();
  const {
    handleSubmit, formState: { errors }, register, setValue, reset, getValues
  } = useForm();
  const screen = useScreenSize();
  const loaderRef = useRef();

  const getAllBranches = async () => {
    try {
      setIsLoading({ loader: true, name: 'onLoad' });
      const { data } = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
      if (data?.branches.length) {
        setAllBranches(data.branches);
      }
    } catch (err) {
      setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    getAllBranches();
  }, []);

  const getUsers = async (pageNumber, pageSize) => {
    try {
      loaderRef.current = true;
      const { data } = await Service.get(`${process.env.REACT_APP_USER_SERVICE}/users/list?${paramsValue}=${getValues(paramsValue).trim()}&page=${pageNumber}&page_size=${pageSize}`);
      if (data?.results.length) {
        data.results.forEach((item, ind) => {
          // eslint-disable-next-line no-underscore-dangle
          item._id = ind;
          item.status = item.goldloan_status ? 'ACTIVE' : 'INACTIVE';
          if (!item.hrms_branch_code || item.hrms_branch_code === '') {
            item.hrms_branch_code = item.branch_code;
          }
          const branch = allBranches.filter((ele) => ele.branchCode === item.branch_code);
          if (branch.length) {
            item.branch_name = branch[0].branchName;
          }
        });
        data.results.sort((a, b) => ((a.status > b.status) ? 1 : ((b.status > a.status) ? -1 : 0)));
        setTableData(data.results);
        setIsTableVisible(true);
      } else {
        setAlertShow({ open: true, msg: 'No record found.', alertType: 'error' });
        setIsTableVisible(false);
      }
    } catch (err) {
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

  const getUsersCount = async () => {
    try {
      const { data } = await Service.get(`${process.env.REACT_APP_USER_SERVICE}/users/count?${paramsValue}=${getValues(paramsValue).trim()}`);
      if (data?.count) {
        setTotalRowCount(data.count);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
      }
    }
  };

  const onSearchSubmit = async () => {
    const searchValue = getValues(paramsValue).trim();
    if (searchValue.length) {
      if (paramsValue === 'branch_code') {
        const branch = allBranches.filter((item) => item.branchCode.toLowerCase() === searchValue.toLowerCase());
        if (!branch.length) {
          setAlertShow({ open: true, msg: 'Branch code does not exist.', alertType: 'error' });
          return;
        }
      }
      setIsLoading({ loader: true, name: 'onSearch' });
      throttleFunction(
        {
          args1: [],
          function1: getUsersCount,
          args2: [1, 10],
          function2: getUsers
        },
        loaderRef,
        setIsSearchDisabled
      );
    } else {
      setAlertShow({ open: true, msg: 'Invalid Search.', alertType: 'error' });
    }
  };
  const onPageChange = async (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    setIsLoading({ loader: true, name: 'onPageSizeChange' });
    await getUsers(pageNumber, pageInfo.pageSize);
  };
  const onPageSizeChange = async (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    setIsLoading({ loader: true, name: 'onPageChange' });
    await getUsers(pageInfo.pageNumber, pageSize);
  };

  const searchResetHandler = () => {
    reset({ [paramsValue]: null });
    setTableData([]);
  };

  const seletedValueHandler = (value) => {
    setParamsValue(value);
    const searchTemp = deputationTogglerGroup.values.find((item) => item.value === value);
    setSearchTitle(searchTemp?.name);
    reset({ [value]: null });
  };

  const handleClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsOpen(false);
  };

  const onSuccessClose = () => {
    setAlertShow({ open: true, msg: 'Deputation request raised successfully.', alertType: 'success' });
    setIsOpen(false);
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={deputationNavigation} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>Deputation</HeadingMaster>
          <ButtonPrimary onClick={() => navigate('/deputation-cases')}>
            Deputation Cases
          </ButtonPrimary>
        </HeaderContainer>
        {
          isLoading.loader && isLoading.name === 'onLoad' ? (
            <Box sx={{
              display: 'flex', height: '100px', justifyContent: 'center', alignItems: 'center'
            }}
            >
              <CircularProgress style={{ color: '#502A74' }} />
            </Box>
          ) : (
            <>
              <HeaderContainer
                item
                xs={12}
                padding='0px 20px 20px'
                flexDirection={['xs', 'sm'].includes(screen) ? 'column-reverse' : 'row'}
                justifyItems={['xs', 'sm'].includes(screen) ? 'flex-end' : ''}
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
                      pattern: (deputationValidation[paramsValue]?.validation?.pattern)
                        ? new RegExp(deputationValidation[paramsValue]?.validation?.pattern) : undefined,
                      minLength: (deputationValidation[paramsValue]?.validation?.minLength)
                        ? deputationValidation[paramsValue]?.validation?.minLength : undefined,
                      maxLength: (deputationValidation[paramsValue]?.validation?.maxLength)
                        ? deputationValidation[paramsValue]?.validation?.maxLength : undefined
                    })}
                    onChange={(e) => {
                      setValue(paramsValue, e.target.value, { shouldValidate: true });
                    }}
                  />
                  <LoadingButtonPrimary
                    variant='contained'
                    loading={isLoading?.loader && isLoading?.name === 'onSearch'}
                    disabled={isSearchDisabled}
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
                <ErrorText input={deputationValidation[paramsValue]} errors={errors} />
              </ErrorMessageContainer>
              <HeaderContainer padding='0px 20px 20px 20px'>
                <MultiToggleButton
                  orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
                  details={deputationTogglerGroup}
                  seletedValueHandler={seletedValueHandler}
                />
              </HeaderContainer>
            </>
          )
        }
        {
          isTableVisible && tableData.length
            ? (
              <TableWrapperDiv>
                <DeputationDataGridStyled
                  onCellClick={({ row }) => {
                    if (row.goldloan_status) {
                      setClickedRow(row);
                      setIsOpen(true);
                    }
                  }}
                  autoHeight
                // eslint-disable-next-line no-underscore-dangle
                  getRowId={(row) => row._id}
                  loading={isLoading.loader}
                  rows={tableData}
                  paginationMode='server'
                  pageSize={pageInfo.pageSize}
                  columns={userColumnFields}
                  onPageSizeChange={(newPageSize) => onPageSizeChange(newPageSize)}
                  onPageChange={(newPageNo) => onPageChange(newPageNo + 1)}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  pagination
                  disableSelectionOnClick
                  disableColumnMenu
                  rowCount={totalRowCount}
                  getRowClassName={({ row }) => (row.goldloan_status ? 'activeStatus' : 'inactiveStatus')}
                />
              </TableWrapperDiv>
            )
            : null
        }
        <DialogBox
          isOpen={isOpen}
          fullScreen
          title='User Details'
          width='100%'
          handleClose={handleClose}
        >
          <MakerUserDetail
            rowData={clickedRow}
            onSuccessClose={onSuccessClose}
          />
        </DialogBox>
      </CustomContainerStyled>
    </>
  );
};

export default Deputation;
