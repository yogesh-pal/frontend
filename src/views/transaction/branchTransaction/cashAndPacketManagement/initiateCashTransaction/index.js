import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Grid, Tab, Tabs, Box, DialogContentText
} from '@mui/material';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import TransactionTable from '../../../table';
import CashINandCashOut from './cashINandCashOut';
import { Service } from '../../../../../service';
import { useScreenSize } from '../../../../../customHooks';
import { throttleFunction } from '../../../../../utils/throttling';
import IBCTFlow from './ibctFlow';
import PageLoader from '../../../../../components/PageLoader';
import { getDecodedToken, numberFormat } from '../../../../../utils';
import {
  ToastMessage, MenuNavigation, MultiToggleButton, ErrorText, DialogBox
} from '../../../../../components';
import {
  CustomContainerStyled, BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled,
  HeaderContainer, HeadingMaster, TextFieldStyled, LoadingButtonPrimary, ResetButton,
  SelectMenuStyle, ErrorMessageContainer, CenterContainerStyled
} from '../../../../../components/styledComponents';
import {
  initiateCashTransactionNavigation, IBCTTransactionsTableColumn, IBCTStatusArray,
  transactionValidation, togglerGroup, IBCTStatus, IBCTMode, OtherCategoryStatusArray,
  transactionCategoryType
} from '../../../helper';
import { ROLE } from '../../../../../constants';

const CustomForm = styled('form')(({ width }) => ({
  width: width || '500px',
  display: 'flex'
}));

const StyledTab = styled((props) => (
  <Tab {...props} />
))(() => ({
  '&.Mui-selected': {
    color: '#502A74 !important',
    background: 'rgb(227 220 233)',
    borderRadius: '5px',
    padding: '0px',
  },
  '&.MuiButtonBase-root': {
    cursor: 'unset',
    padding: '0px 15px',
  }
}));

const CustomTabPanel = (props) => {
  const {
    children, value, index, ...other
  } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ padding: '20px 0px' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const InitiateCashTransaction = () => {
  const [status, setStatus] = useState('all');
  const [tableData, setTableData] = useState([]);
  const [clickedRow, setClickedRow] = useState(null);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [searchTitle, setSearchTitle] = useState('Branch ID');
  const [paramsValue, setParamsValue] = useState('branch_code');
  const [action, setAction] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 15 });
  const [openApproveRejectModal, setOpenApproveRejectModal] = useState(false);
  const screen = useScreenSize();
  const loaderRef = useRef();
  const { branchCodes, selectedBranch } = useSelector((state) => state.user.userDetails);
  const [isRoleAOMorAbove, setIsRoleAOMorAbove] = useState(false);
  const [isRoleGVorABMorBM, setIsRoleGVorABMorBM] = useState(false);
  const userInfo = getDecodedToken();
  const subRolesArray = userInfo?.subroles ? userInfo?.subroles.split(',') : [];

  const {
    register, handleSubmit, setValue, getValues, reset, formState: { errors }
  } = useForm();

  const searchDetailsHandler = async (pageNumber, pageSize, params) => {
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: 'onFetchDetails' });
      let apiURL;
      if (params.category === 'OTHERS') {
        apiURL = `${process.env.REACT_APP_CASH_SERVICE}/cash/list?page=${pageNumber}&page_size=${pageSize}`;
      } else {
        apiURL = `${process.env.REACT_APP_CASH_SERVICE}/ibct/list?page=${pageNumber}&page_size=${pageSize}`;
      }
      if (getValues(paramsValue)) {
        apiURL += `&${paramsValue}=${getValues(paramsValue)}`;
      }
      if (params?.status && params?.status !== 'all') {
        apiURL += `&status=${params?.status}`;
      }
      const { data } = await Service.get(apiURL);
      if (data.status === 200) {
        const tableDataArray = [];
        data?.data.forEach((item, ind) => {
          tableDataArray.push({
            id: ind,
            type: item.activity === 'IN' ? 'Cash-IN' : 'Cash-OUT',
            category: params.category === 'OTHERS' ? transactionCategoryType[item.category] : 'IBCT',
            cashFromBranch: params.category === 'OTHERS' ? 'NA' : item?.request_branch_code,
            cashToBranch: item?.maker_branch,
            cashAmount: numberFormat(item?.amount),
            requestRaisedBy: item?.maker_name || 'NA',
            transactionNumber: item?.transaction_id,
            mode: params.category === 'OTHERS' ? 'NA' : IBCTMode[item?.mode],
            status: IBCTStatus[item?.status],
            transferingPersonEmpId: item?.handler_emp_code,
            transferingPersonName: item?.handler_name,
            makerRemarks: item?.maker_remarks,
            makerEmpCode: item?.maker_emp_code,
            approverRemarks: item?.checkers?.length ? item.checkers[0].checker_remarks : 'NA',
            approverName: item?.checkers?.length ? item.checkers[0].checker_name : 'NA',
            handoverBranchRemarks: item?.checkers?.length >= 2 ? item.checkers[1].checker_remarks : 'NA',
            makerRole: item?.maker_role,
            currentCheckerRole: item?.current_checker_role,
            subroles: subRolesArray,
          });
        });
        setTableData(tableDataArray);
      }
    } catch (err) {
      console.log('err', err);
      if (err?.response?.data?.message) {
        setAlertShow({ open: true, msg: err.response.data.message, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setLoading({ loader: false, name: null });
    }
  };

  const getRowCount = async (params) => {
    try {
      let apiURL;
      if (params.category === 'OTHERS') {
        apiURL = `${process.env.REACT_APP_CASH_SERVICE}/cash/list?is_count=1`;
      } else {
        apiURL = `${process.env.REACT_APP_CASH_SERVICE}/ibct/list?is_count=1`;
      }
      if (getValues(paramsValue)) {
        apiURL += `&${paramsValue}=${getValues(paramsValue)}`;
      }
      if (params?.status && params?.status !== 'all') {
        apiURL += `&status=${params?.status}`;
      }
      const { data } = await Service.get(apiURL);
      if (data?.status === 200) {
        setTotalRowCount(data?.data?.count);
      }
    } catch (err) {
      console.log('err', err);
      if (err?.response?.data?.message) {
        setAlertShow({ open: true, msg: err.response.data.message, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    }
  };

  useEffect(() => {
    getRowCount({});
    searchDetailsHandler(1, 15, {});
    console.log('user_info', userInfo);

    if (userInfo.super_admin || userInfo.pan_india || (subRolesArray.includes(ROLE.BM)
    && subRolesArray.includes(ROLE.ABM) && userInfo.subroles.includes(ROLE.GV))) {
      setIsRoleAOMorAbove(true);
    }

    if ([ROLE.GV, ROLE.BM, ROLE.ABM].includes(userInfo.role)) {
      setIsRoleGVorABMorBM(true);
    }
  }, []);

  const onSearchSubmit = () => {
    throttleFunction(
      {
        args1: [{ status, category: activeTabIndex ? 'OTHERS' : 'IBCT' }],
        function1: getRowCount,
        args2: [pageInfo.pageNumber, pageInfo.pageSize, { status, category: activeTabIndex ? 'OTHERS' : 'IBCT' }],
        function2: searchDetailsHandler
      },
      loaderRef,
      setIsSearchDisabled
    );
  };

  const onStatusChange = (value) => {
    setStatus(value);
    getRowCount({ status: value, category: activeTabIndex ? 'OTHERS' : 'IBCT' });
    searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, { status: value, category: activeTabIndex ? 'OTHERS' : 'IBCT' });
  };

  const seletedValueHandler = (value) => {
    setParamsValue(value);
    const searchTemp = togglerGroup.values.find((item) => item.value === value);
    setSearchTitle(searchTemp?.name);
    reset({ [value]: null });
  };

  const searchResetHandler = () => {
    if (getValues(paramsValue)) {
      reset({ [paramsValue]: null });
      getRowCount({ status, category: activeTabIndex ? 'OTHERS' : 'IBCT' });
      searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, { status, category: activeTabIndex ? 'OTHERS' : 'IBCT' });
    }
  };
  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    searchDetailsHandler(pageInfo.pageNumber, pageSize, { status, category: activeTabIndex ? 'OTHERS' : 'IBCT' });
  };

  const onPageChange = (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    searchDetailsHandler(pageNumber, pageInfo.pageSize, { status, category: activeTabIndex ? 'OTHERS' : 'IBCT' });
  };

  const viewDetailsHandler = async (field, row) => {
    if (activeTabIndex) {
      if (row.status === 'Pending' && subRolesArray.includes(row.makerRole)) {
        setClickedRow(row);
        setOpenApproveRejectModal(true);
      }
      return null;
    }
    if ((row.status === 'Pending' && (!isRoleAOMorAbove || row.cashToBranch !== selectedBranch))
    || (row.status === 'Request Approved' && row.cashFromBranch !== selectedBranch)
    || (row.status === 'In-transit' && (isRoleAOMorAbove || row.cashToBranch !== selectedBranch))
    || (['Request Rejected', 'Handover Rejected', 'Acknowledge Rejected', 'Acknowledge Approved'].includes(row.status))) {
      return null;
    }
    setClickedRow(row);
    setAction('IBCT');
  };

  const rowClassNameHandler = ({ row }) => {
    if (activeTabIndex) {
      if (row.status === 'Pending' && subRolesArray.includes(row.makerRole)) {
        return 'enabledRow';
      }
      return 'disabledRow';
    }
    if ((row.status === 'Pending' && (!isRoleAOMorAbove || row.cashToBranch !== selectedBranch))
    || (row.status === 'Request Approved' && row.cashFromBranch !== selectedBranch)
    || (row.status === 'In-transit' && (isRoleAOMorAbove || row.cashToBranch !== selectedBranch))
    || (['Request Rejected', 'Handover Rejected', 'Acknowledge Rejected', 'Acknowledge Approved'].includes(row.status))) {
      return 'disabledRow';
    }
    return 'enabledRow';
  };

  const handleClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setAction(null);
  };

  const onSuccessClose = () => {
    setAction(null);
    getRowCount({});
    searchDetailsHandler(1, 15, {});
  };

  const handleTabChange = (event, newValue) => {
    setPageInfo({ pageNumber: 1, pageSize: 15 });
    reset({ [paramsValue]: null });
    setStatus('all');
    setActiveTabIndex(newValue);
    if (newValue) {
      getRowCount({ category: 'OTHERS' });
      searchDetailsHandler(1, 15, { category: 'OTHERS' });
    } else {
      getRowCount({ category: 'IBCT' });
      searchDetailsHandler(1, 15, { category: 'IBCT' });
    }
  };

  const handleApproveReject = async (statusToSend) => {
    try {
      setOpenApproveRejectModal(false);
      setLoading({ loader: true, name: 'onApproveReject' });
      await Service.patch(`${process.env.REACT_APP_CASH_SERVICE}/cash/update`, {
        transaction_id: clickedRow.transactionNumber,
        status: statusToSend
      });
      setStatus('all');
      searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, { status: 'all', category: 'OTHERS' });
      setAlertShow({ open: true, msg: `Successfully ${statusToSend === 'APPROVED' ? 'Approved' : 'Rejected'}`, alertType: 'success' });
    } catch (err) {
      console.log('Error', err);
      if (err?.response?.data?.message) {
        setAlertShow({ open: true, msg: err.response.data.message, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={initiateCashTransactionNavigation} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      { loading.loader && loading.name === 'onApproveReject' ? <PageLoader /> : null }
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <CustomContainerStyled padding='0px 0px 20px !important'>
        <HeaderContainer
          item
          xs={12}
          width={['xs', 'sm'].includes(screen) ? '100%' : 'auto'}
          flexDirection={['xs', 'sm'].includes(screen) ? 'column' : 'row'}
          justifyItems={['xs', 'sm'].includes(screen) ? 'space-between' : 'space-between'}
        >
          <HeadingMaster>
            Initiate Cash Transactions
          </HeadingMaster>
          <div style={{ display: 'flex', flexDirection: ['xs', 'sm'].includes(screen) ? 'row' : 'row', justifyContent: ['xs', 'sm'].includes(screen) ? 'space-between' : 'space-between' }}>
            <LoadingButtonPrimary margin='5px 5px 5px 0px' disabled={branchCodes.length > 1} onClick={() => setAction('CashIn')}>Cash In</LoadingButtonPrimary>
            <LoadingButtonPrimary disabled={branchCodes.length > 1} onClick={() => setAction('CashOut')}>Cash Out</LoadingButtonPrimary>
          </div>
        </HeaderContainer>
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
                pattern: (transactionValidation[paramsValue]?.validation?.pattern)
                  ? new RegExp(transactionValidation[paramsValue]?.validation?.pattern) : undefined,
                maxLength: (transactionValidation[paramsValue]?.validation?.maxLength)
                  ? transactionValidation[paramsValue]?.validation?.maxLength : undefined,
                minLength: (transactionValidation[paramsValue]?.validation?.minLength)
                  ? transactionValidation[paramsValue]?.validation?.minLength : undefined,
              })}
              onChange={(e) => {
                setValue(paramsValue, e.target.value.trim(), { shouldValidate: true });
              }}
            />
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
          </CustomForm>
          <TextFieldStyled
            label='Status'
            select
            width={['xs', 'sm'].includes(screen) ? '100%' : '16%'}
            style={{ paddingBottom: '10px' }}
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {
              activeTabIndex ? OtherCategoryStatusArray?.map((item) => (
                <SelectMenuStyle value={item.value}>{item.label}</SelectMenuStyle>
              ))
                : IBCTStatusArray?.map((item) => (
                  <SelectMenuStyle value={item.value}>{item.label}</SelectMenuStyle>
                ))
            }
          </TextFieldStyled>
        </HeaderContainer>
        <ErrorMessageContainer>
          <ErrorText input={transactionValidation[paramsValue]} errors={errors} />
        </ErrorMessageContainer>
        <HeaderContainer padding='0px 0px 20px 20px'>
          <MultiToggleButton
            orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
            details={togglerGroup}
            seletedValueHandler={seletedValueHandler}
          />
        </HeaderContainer>
        <Box sx={{ width: '100%', padding: '0px 20px' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTabIndex} onChange={handleTabChange} TabIndicatorProps={{ style: { background: '#502A74', padding: '5px !important' } }}>
              <StyledTab label='IBCT' id={0} />
              <StyledTab label='Other Transactions' id={1} />
            </Tabs>
          </Box>
          <CustomTabPanel value={activeTabIndex} index={0}>
            <TransactionTable
              rows={tableData}
              columns={IBCTTransactionsTableColumn}
              clientPaginationMode={false}
              handleCellClick={viewDetailsHandler}
              loading={loading.loader && loading.name === 'onFetchDetails'}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              rowCount={totalRowCount}
              pageSizeNumber={pageInfo.pageSize}
              rowClassNameHandler={rowClassNameHandler}
            />
          </CustomTabPanel>
          <CustomTabPanel value={activeTabIndex} index={1}>
            <TransactionTable
              rows={tableData}
              columns={IBCTTransactionsTableColumn}
              clientPaginationMode={false}
              handleCellClick={viewDetailsHandler}
              loading={loading.loader && loading.name === 'onFetchDetails'}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              rowCount={totalRowCount}
              pageSizeNumber={pageInfo.pageSize}
              rowClassNameHandler={rowClassNameHandler}
            />
          </CustomTabPanel>
        </Box>
        <Grid item xs={12} padding='0px 20px' />
      </CustomContainerStyled>
      <DialogBox
        isOpen={action}
        fullScreen
        title={action === 'CashIn' || action === 'IBCT' ? 'Cash In' : 'Cash Out'}
        width='100%'
        handleClose={handleClose}
      >
        <CustomContainerStyled padding='0px !important'>
          { ['CashIn', 'CashOut'].includes(action)
            ? (
              <CashINandCashOut
                type={action}
                setAction={setAction}
                onSuccessClose={onSuccessClose}
                isRoleGVorABMorBM={isRoleGVorABMorBM}
              />
            ) : null}
          { ['IBCT'].includes(action) ? <IBCTFlow rowData={clickedRow} onSuccessClose={onSuccessClose} /> : null}
        </CustomContainerStyled>
      </DialogBox>
      <DialogBox
        isOpen={openApproveRejectModal}
        title=''
        handleClose={() => setOpenApproveRejectModal(false)}
        width='460px'
        padding='30px'
      >
        <DialogContentText style={{ textAlign: 'center' }}>
          Do you want to Approve/Reject the transaction?
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <LoadingButtonPrimary onClick={() => handleApproveReject('REJECTED')}>Reject</LoadingButtonPrimary>
          <LoadingButtonPrimary onClick={() => handleApproveReject('APPROVED')}>Approve</LoadingButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};
export default InitiateCashTransaction;
