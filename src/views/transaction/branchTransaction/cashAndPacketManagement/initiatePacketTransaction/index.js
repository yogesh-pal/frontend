/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Grid, Tab, Tabs, Box, DialogContentText
} from '@mui/material';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import TransactionTable from '../../../table';
import CashINandCashOut from '../initiateCashTransaction/cashINandCashOut';
import IBGTOut from './IBGTOut';
import { Service } from '../../../../../service';
import { useScreenSize } from '../../../../../customHooks';
import { throttleFunction } from '../../../../../utils/throttling';
import IBCTFlow from '../initiateCashTransaction/ibctFlow';
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
  initiatePacketTransactionNavigation, IBGTTransactionsTableColumn, IBGTStatusArray,
  transactionValidation, togglerGroup, IBGTStatus, IBGTMode
} from '../../../helper';
import { ROLE } from '../../../../../constants';
import { IBGTcategory, customIBGTStaus } from './constants';

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

const InitiatePacketTransaction = () => {
  const [status, setStatus] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [clickedRow, setClickedRow] = useState(null);
  const [totalRowCount, setTotalRowCount] = useState(0);
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
  const [isRoleRMorAbove, setIsRoleRMorAbove] = useState(false);
  const [isRoleZHorAbove, setIsRoleZHorAbove] = useState(false);
  const [isRoleGVorABMorBM, setIsRoleGVorABMorBM] = useState(false);
  const userInfo = getDecodedToken();
  const subRolesArray = userInfo?.subroles ? userInfo?.subroles.split(',') : [];

  const {
    register, handleSubmit, setValue, getValues, reset, formState: { errors }
  } = useForm();

  const formatDateToDDMMYYYY = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const currentDate = new Date();
  const endDate = formatDateToDDMMYYYY(currentDate);
  currentDate.setDate(currentDate.getDate() - 7);
  const startDate = formatDateToDDMMYYYY(currentDate);
  // console.log(startDate, ' dates ', endDate);

  const searchDetailsHandler = async (pageNumber, pageSize, params) => {
    console.log('params: ', params);
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: 'onFetchDetails' });
      let apiURL;
      apiURL = `${process.env.REACT_APP_CASH_SERVICE}/ibgt/list/all?page=${pageNumber}&pageSize=${pageSize}&startDate=${startDate}&endDate=${endDate}&selectedBranch=${selectedBranch}`;
      if (params?.status) {
        apiURL += `&status=${params?.status}`;
      }
      const { data } = await Service.get(apiURL);
      if (data.status === 200) {
        const tableDataArray = [];
        setTotalRowCount(data?.data.totalCount);
        data?.data.data.forEach((item, ind) => {
          tableDataArray.push({
            id: ind,
            type: item?.type,
            category: item?.category,
            packetFromBranch: item?.packet_from_branch,
            packetToBranch: item?.packet_to_branch,
            packetQty: numberFormat(item?.packet_qty),
            amount: item?.amount,
            requestRaisedBy: item?.maker_name || 'NA',
            transactionNumber: item?.transaction_id,
            mode: IBGTMode[item?.mode],
            status: IBGTStatus[item?.status],
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

  useEffect(() => {
    searchDetailsHandler(1, 15, {});

    if (userInfo.super_admin || userInfo.pan_india || (subRolesArray.includes(ROLE.BM)
    && subRolesArray.includes(ROLE.ABM) && userInfo.subroles.includes(ROLE.GV))) {
      setIsRoleAOMorAbove(true);
    }

    if (userInfo.super_admin || userInfo.pan_india || (subRolesArray.includes(ROLE.AOM)
      && subRolesArray.includes(ROLE.BM) && subRolesArray.includes(ROLE.ABM)
      && userInfo.subroles.includes(ROLE.GV))) {
      setIsRoleRMorAbove(true);
    }

    if (userInfo.super_admin || userInfo.pan_india || (subRolesArray.includes(ROLE.RM)
      && subRolesArray.includes(ROLE.AOM) && subRolesArray.includes(ROLE.BM)
      && subRolesArray.includes(ROLE.ABM) && userInfo.subroles.includes(ROLE.GV))) {
      setIsRoleZHorAbove(true);
    }

    if ([ROLE.GV, ROLE.BM, ROLE.ABM].includes(userInfo.role)) {
      setIsRoleGVorABMorBM(true);
    }
  }, []);

  const onSearchSubmit = () => {
    throttleFunction(
      {
        args1: [pageInfo.pageNumber, pageInfo.pageSize, { status, category: IBGTcategory }],
        function1: searchDetailsHandler
      },
      loaderRef,
      setIsSearchDisabled
    );
  };

  const onStatusChange = (value) => {
    setStatus(value);
    searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, { status: value, category: IBGTcategory });
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
      searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, { status, category: IBGTcategory });
    }
  };
  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    searchDetailsHandler(pageInfo.pageNumber, pageSize, { status, category: IBGTcategory });
  };

  const onPageChange = (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    searchDetailsHandler(pageNumber, pageInfo.pageSize, { status, category: IBGTcategory });
  };

  const viewDetailsHandler = async (field, row) => {
    if ((row.status === customIBGTStaus.PENDING && ((!isRoleAOMorAbove && row.amount <= 1000000) || row.packetFromBranch !== selectedBranch))
    || (row.status === customIBGTStaus.PENDING && ((!isRoleRMorAbove && (row.amount > 1000000 && row.amount <= 2500000)) || row.packetFromBranch !== selectedBranch))
    || (row.status === customIBGTStaus.PENDING && ((!isRoleZHorAbove && row.amount > 2500000)
    || row.packetFromBranch !== selectedBranch))
    || (row.status === customIBGTStaus.INTRANSIT && (isRoleAOMorAbove || row.packetToBranch !== selectedBranch))
    || ([customIBGTStaus.AUTOREJECTED].includes(row.status))) {
      return null;
    }
    setClickedRow(row);
    setAction(IBGTcategory);
    console.log('action:', action);
  };

  const rowClassNameHandler = ({ row }) => {
    if ((row.status === customIBGTStaus.PENDING && ((!isRoleAOMorAbove && row.amount <= 1000000) || row.packetFromBranch !== selectedBranch))
    || (row.status === customIBGTStaus.PENDING && ((!isRoleRMorAbove && (row.amount > 1000000 && row.amount <= 2500000)) || row.packetFromBranch !== selectedBranch))
    || (row.status === customIBGTStaus.PENDING && ((!isRoleZHorAbove && row.amount > 2500000)
    || row.packetFromBranch !== selectedBranch))
    || (row.status === customIBGTStaus.INTRANSIT && (isRoleAOMorAbove || row.packetToBranch !== selectedBranch))
    || ([customIBGTStaus.AUTOREJECTED].includes(row.status))) {
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
    searchDetailsHandler(1, 15, {});
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
          <MenuNavigation navigationDetails={initiatePacketTransactionNavigation} />
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
            Initiate Packet Transactions
          </HeadingMaster>
          <div style={{ display: 'flex', flexDirection: ['xs', 'sm'].includes(screen) ? 'row' : 'row', justifyContent: ['xs', 'sm'].includes(screen) ? 'right' : 'space-between' }}>
            <LoadingButtonPrimary disabled={branchCodes.length > 1} onClick={() => { setClickedRow(null); setAction(IBGTcategory); }}>Gold Packet Out</LoadingButtonPrimary>
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
          {/* {console.log('status: ', status)} */}
          <TextFieldStyled
            label='Status'
            select
            width={['xs', 'sm'].includes(screen) ? '100%' : '16%'}
            style={{ paddingBottom: '10px' }}
            value={status || null}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {
              IBGTStatusArray?.map((item) => (
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
            <Tabs
              value={0}
              TabIndicatorProps={{
                style: {
                  background: '#502A74',
                  padding: '5px !important'
                }
              }}
            >
              <StyledTab label='IBGT' id={0} />
            </Tabs>
          </Box>
          <CustomTabPanel value={0} index={0}>
            <TransactionTable
              rows={tableData}
              columns={IBGTTransactionsTableColumn}
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
        title='Packet Out'
        width='100%'
        handleClose={handleClose}
      >
        <CustomContainerStyled padding='0px !important'>
          {
           [IBGTcategory].includes(action) ? (
             <IBGTOut
               rowData={clickedRow}
               isRoleGVorABMorBM={isRoleGVorABMorBM}
               handleClose={onSuccessClose}
             />
           ) : null
}

        </CustomContainerStyled>
      </DialogBox>
      {/* <DialogBox
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
      </DialogBox> */}
    </>
  );
};
export default InitiatePacketTransaction;
