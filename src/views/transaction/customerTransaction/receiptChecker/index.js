/* eslint-disable max-len */
import {
  useState, useRef, useEffect, useMemo
} from 'react';
import { useForm } from 'react-hook-form';
import { Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import {
  ToastMessage, MultiToggleButton, ErrorText, DialogBox
} from '../../../../components';
import {
  CustomContainerStyled, LoadingButtonPrimary, ResetButton, ErrorMessageContainer,
  HeaderContainer, TextFieldStyled
} from '../../../../components/styledComponents';
import {
  receiptCheckerValidation, receiptCheckerTogglerGroup, receiptCheckerTableColumn,
  CustomForm, receiptStatus
} from '../../helper';
import { useScreenSize } from '../../../../customHooks';
import TransactionTable from '../../table';
import CheckerPage from './checkerPage';
import { Service } from '../../../../service';
import { throttleFunction } from '../../../../utils/throttling';

const amountFormat = Intl.NumberFormat('en-IN');

const ReceiptChecker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [clickedRow, setClickedRow] = useState(null);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [searchTitle, setSearchTitle] = useState('Receipt No');
  const [paramsValue, setParamsValue] = useState('receipt_no');
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 15 });
  const selectedBranch = useSelector((state) => state.user.submitFormValues.branch);

  const loaderRef = useRef();
  const {
    register, handleSubmit, formState: { errors }, reset, setValue, getValues
  } = useForm();

  const screen = useScreenSize();

  const getParams = (url, params) => {
    if (params?.branch_code) {
      url += `?branch_code=${params.branch_code}`;
      if (params?.receipt_no) {
        url += `&receipt_no=${params.receipt_no}`;
      }
      if (params?.customer_id) {
        url += `&customer_id=${params.customer_id}`;
      }
      if (params?.primary_mobile_number) {
        url += `&customer_mobile=${params.primary_mobile_number}`;
      }
    } else {
      if (params?.receipt_no) {
        url += `?receipt_no=${params.receipt_no}`;
      }
      if (params?.customer_id) {
        url += `?customer_id=${params.customer_id}`;
      }
      if (params?.primary_mobile_number) {
        url += `?customer_mobile=${params.primary_mobile_number}`;
      }
    }
    return url;
  };

  const searchDetailsHandler = async (pageNumber, pageSize, params) => {
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: 'receiptCheckerListing' });
      let url = `${process.env.REACT_APP_RECEIPT_SERVICE}/view`;
      const updatedUrl = getParams(url, params);
      if (url === updatedUrl) {
        url += `?page=${pageNumber}&page_size=${pageSize}`;
      } else {
        url = `${updatedUrl}&page=${pageNumber}&page_size=${pageSize}`;
      }
      const { data, status } = await Service.get(url);
      if (status === 200 && data?.result && data?.result.length) {
        const tableDataArray = [];
        data.result.forEach((item, ind) => {
          tableDataArray.push({
            id: ind,
            customerId: item?.customer_id,
            customerName: item?.customer_name,
            receiptNo: item?.receipt_no,
            totalAmount: amountFormat.format(item?.total_amount),
            status: receiptStatus[item?.receipt_status],
            loanItems: item?.loan_items,
            makerRemark: item?.maker_remarks,
            paymentMode: item?.payment_mode,
            utrNumber: item?.utr_no,
            createdBy: item?.created_by,
            isDocGenerated: item?.is_doc_generated
          });
        });
        if (tableDataArray.length) {
          setTableData(tableDataArray);
        } else {
          setAlertShow({ open: true, msg: 'No data found.', alertType: 'error' });
          setTableData([]);
        }
      } else {
        setAlertShow({ open: true, msg: 'No data found.', alertType: 'error' });
        setTableData([]);
      }
    } catch (err) {
      console.log('error', err);
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setLoading({ loader: false, name: null });
    }
  };

  const getSearchCount = async (params) => {
    try {
      let url = `${process.env.REACT_APP_RECEIPT_SERVICE}/view-count`;
      url = getParams(url, params);
      const { data, status } = await Service.get(url);
      if (status === 200 && data?.count) {
        setTotalRowCount(data.count);
      } else {
        setTotalRowCount(0);
      }
    } catch (err) {
      console.log('error', err);
    }
  };

  const initialDataHandler = async () => {
    if (selectedBranch === 'All Branches') {
      getSearchCount({ branch_code: null });
      searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, {});
    } else {
      getSearchCount({ branch_code: selectedBranch });
      searchDetailsHandler(pageInfo.pageNumber, pageInfo.pageSize, { branch_code: selectedBranch });
    }
  };

  useEffect(() => {
    initialDataHandler();
  }, []);

  const onSearchSubmit = () => {
    setLoading({ loader: true, name: 'onSearch' });
    throttleFunction(
      {
        args1: [{
          [paramsValue]: getValues(paramsValue),
          branch_code: selectedBranch !== 'All Branches' ? selectedBranch : null
        }],
        function1: getSearchCount,
        args2: [pageInfo.pageNumber, pageInfo.pageSize, {
          [paramsValue]: getValues(paramsValue),
          branch_code: selectedBranch !== 'All Branches' ? selectedBranch : null
        }],
        function2: searchDetailsHandler,
      },
      loaderRef,
      setIsSearchDisabled
    );
  };

  const searchResetHandler = () => {
    if (getValues(paramsValue)) {
      initialDataHandler();
    }
    reset({ [paramsValue]: null });
  };

  const fetchListingAfterApproveOrReject = async () => {
    await searchDetailsHandler(
      pageInfo.pageNumber,
      pageInfo.pageSize,
      { branch_code: selectedBranch !== 'All Branches' ? selectedBranch : null }
    );
  };

  const downloadFile = async (receiptId) => {
    try {
      setLoading({ loader: true, name: receiptId });
      const { data } = await Service.get(`${process.env.REACT_APP_RECEIPT_SERVICE}/${receiptId}/document`);
      if (data.success) {
        window.open(data?.data, '_self');
      }
    } catch (err) {
      console.log('err', err);
      setAlertShow({ open: true, msg: 'Please try after 30 seconds.', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const seletedValueHandler = (value) => {
    setParamsValue(value);
    const searchTemp = receiptCheckerTogglerGroup.values.find((item) => item.value === value);
    setSearchTitle(searchTemp?.name);
    reset({ [value]: null });
  };

  const viewDetailsHandler = async (field, row) => {
    if (field !== 'receiptPDF' && row?.status === 'Pending') {
      setClickedRow(row);
      setIsOpen(true);
    }
  };

  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    searchDetailsHandler(pageInfo.pageNumber, pageSize, {
      [paramsValue]: getValues(paramsValue),
      branch_code: selectedBranch !== 'All Branches' ? selectedBranch : null
    });
  };

  const onPageChange = (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    searchDetailsHandler(pageNumber, pageInfo.pageSize, {
      [paramsValue]: getValues(paramsValue),
      branch_code: selectedBranch !== 'All Branches' ? selectedBranch : null
    });
  };

  const handleClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsOpen(false);
  };

  const rowClassNameHandler = ({ row }) => {
    if (row?.status === 'Pending') {
      return 'enabledRow';
    }
    return 'disabledRow';
  };
  const receiptCheckerColumns = useMemo(() => receiptCheckerTableColumn(downloadFile, loading), [loading]);

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <HeaderContainer
        item
        xs={12}
        padding='0px 20px 3px'
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
              pattern: (receiptCheckerValidation[paramsValue]?.validation?.pattern)
                ? new RegExp(receiptCheckerValidation[paramsValue]?.validation?.pattern) : undefined,
              maxLength: (receiptCheckerValidation[paramsValue]?.validation?.maxLength)
                ? receiptCheckerValidation[paramsValue]?.validation?.maxLength : undefined,
              minLength: (receiptCheckerValidation[paramsValue]?.validation?.minLength)
                ? receiptCheckerValidation[paramsValue]?.validation?.minLength : undefined,
            })}
            onChange={(e) => {
              setValue(paramsValue, e.target.value.trim(), { shouldValidate: true });
            }}
          />
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
        </CustomForm>
      </HeaderContainer>
      <ErrorMessageContainer>
        <ErrorText input={receiptCheckerValidation[paramsValue]} errors={errors} />
      </ErrorMessageContainer>
      <HeaderContainer padding='20px'>
        <MultiToggleButton
          orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
          details={receiptCheckerTogglerGroup}
          seletedValueHandler={seletedValueHandler}
        />
      </HeaderContainer>
      <Grid container padding='0px 20px 20px'>
        <Grid item xs={12}>
          <TransactionTable
            rows={tableData}
            columns={receiptCheckerColumns}
            checkboxAllowed={false}
            handleCellClick={viewDetailsHandler}
            clientPaginationMode={false}
            loading={loading.loader && loading.name === 'receiptCheckerListing'}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            rowCount={totalRowCount}
            pageSizeNumber={pageInfo.pageSize}
            rowClassNameHandler={rowClassNameHandler}
          />
        </Grid>
      </Grid>
      <DialogBox
        isOpen={isOpen}
        fullScreen
        title='Receipt Checker'
        width='100%'
        handleClose={handleClose}
      >
        <CustomContainerStyled padding='0 !important'>
          <CheckerPage
            rowData={clickedRow}
            setAlertShow={setAlertShow}
            fetchListingAfterApproveOrReject={fetchListingAfterApproveOrReject}
            setIsOpen={setIsOpen}
          />
        </CustomContainerStyled>
      </DialogBox>
      {/* </CustomContainerStyled> */}
    </>
  );
};
export default ReceiptChecker;
