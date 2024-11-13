/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import moment from 'moment';
import styled from '@emotion/styled';
import { useState, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import Accordion from '@mui/material/Accordion';
import RemoveIcon from '@mui/icons-material/Remove';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Grid, CircularProgress, Typography, InputAdornment, DialogContentText
} from '@mui/material';
import { Service } from '../../../service';
import logo from '../../../assets/CGCL_logo.png';
import { useScreenSize } from '../../../customHooks';
import PageLoader from '../../../components/PageLoader';
import { throttleFunction } from '../../../utils/throttling';
import {
  ToastMessage, MenuNavigation, TableComponent,
  MultiToggleButton, ErrorText, DialogBox
} from '../../../components';
import {
  TextFieldStyled, CustomContainerStyled, LoadingButtonPrimary, BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled, HeadingMaster, HeaderContainer, ResetButton, ErrorMessageContainer,
  CenterContainerStyled, ContainerStyled, ButtonPrimary, LoadingButtonSecondaryPrimary
} from '../../../components/styledComponents';
import {
  columnFields, togglerGroup, navigationDetails, validation, repaymentFrequencyEnum
} from './helper';

const CustomForm = styled('form')(({ width }) => ({
  width: width || '500px',
  display: 'flex',
}));
export const CustomText = styled(Typography)(() => ({
  padding: '5px 20px',
  fontSize: '18px',
  color: '#502A74',
  fontWeight: 700,
}));
export const AccordianHeaderText = styled(Typography)(() => ({
  padding: '5px 10px',
  fontSize: '16px',
  color: '#502A74',
  fontWeight: 500,
}));
export const CustomText1 = styled(Typography)(() => ({
  padding: '5px 20px',
  fontSize: '10px',
  color: '#502A74',
  fontWeight: 500,
}));
export const AccordionContainer = styled('div')(() => ({
  padding: '5px 20px',
  fontSize: '10px',
  fontWeight: 500,
  width: '100%'
}));
export const CustomDiv = styled.div`
 display: flex;
 align-items: center;
 justify-content: space-between;
 width : 100%
`;
export const CustomText2 = styled(Typography)(() => ({
  padding: '5px',
  fontSize: '16px',
  color: '#502A74',
  fontWeight: 700,
}));

const amountFormat = Intl.NumberFormat('en-IN');

const CustomerSummary = () => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [searchTitle, setSearchTitle] = useState('Customer ID');
  const [paramsValue, setParamsValue] = useState('customer_id');
  const [formDetails, setFormDetails] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [fee, setFee] = useState('');
  const [isPdfGenerationInProgress, setIsPdfGenerationInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState({
    loader: false,
    name: ''
  });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [dob, setDob] = useState('');
  const [parentLANDetail, setParentLANDetail] = useState(null);
  const [childLANDetail, setChildLANDetail] = useState(null);
  const [customerDetail, setCustomerDetail] = useState('');
  const { userDetails } = useSelector((state) => state.user);
  const loaderRef = useRef();
  const [searchDetails, setSearchDetails] = useState({
    data: [],
    rowCount: 0,
    pageNumber: 1,
    pageSize: 10
  });
  const [isDownloadPdfButtonDisabled, setIsDownloadPdfButtonDisabled] = useState(false);
  const {
    register, handleSubmit, setValue, formState: { errors }, reset
  } = useForm();
  const screen = useScreenSize();
  const [expanded, setExpanded] = useState(false);
  const [childExpanded, setChildExpanded] = useState(null);
  // eslint-disable-next-line max-len
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({ open: false, isChildLoan: false });
  const useStyles = makeStyles(() => ({
    accordionSummary: {
      flexDirection: 'row-reverse',
      '& .MuiAccordionSummary-content': {
        marginLeft: 0,
      },
    },
  }));
  const classes = useStyles();
  const pad = (num) => (`0${num}`).slice(-2);

  const getCustomerMtmDetails = async (customerId) => {
    try {
      const response = await Service.get(`${process.env.REACT_APP_MTM_DETAILS}?customer_id=${customerId}`);
      if (response?.data?.success) {
        const mtmRes = {};
        const dict = {};
        const mtmCount = response?.data?.data?.mtm_count;
        mtmRes.mtmCount = mtmCount;
        response?.data?.data?.mtm_loan_details.forEach((item) => {
          dict[item.loan_account_no] = item.mtm_demand;
        });
        mtmRes.mtmDetails = dict;
        return mtmRes;
      }
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  const getRebateDate = async (lan) => {
    try {
      const { data } = await Service.post(process.env.REACT_APP_LOAN_REBATE_INQ, {
        loan_account_no: lan,
        amount: 0
      });
      return data?.data?.interestSettledEndDate;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  const viewDetailsHandler = async (field, row) => {
    try {
      setIsOpen(true);
      const response1 = Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${row?.customer_id}&branch_code=${userDetails?.selectedBranch}&fc=1`);

      const mtmData = await getCustomerMtmDetails(row?.customer_id);
      const { status, data } = await response1;
      const loanMapping = mtmData?.mtmDetails;
      const mtmCount = mtmData?.mtmCount ? mtmData?.mtmCount : 'NA ';

      if (status === 200 && data?.data !== null && data?.data) {
        const loanDetails = [];
        data.data.mdm_count = mtmCount;
        data.data?.loan_detail.forEach((ele) => {
          if (ele?.parentAcctNo?.trim().length === 0) {
            const childLoans = data.data?.loan_detail.filter((item) => item?.parentAcctNo?.trim() === ele?.lan?.trim());
            ele.child_loans = childLoans;
            ele.mdm_demand = loanMapping?.[ele?.lan?.trim()] ? loanMapping?.[ele?.lan?.trim()] : 'NA';
            ele.interest_cleared_till = ' ';
            ele.next_slab_date = ' ';
            loanDetails.push(ele);
          }
        });
        setCustomerDetail({ ...data.data, loan_detail: loanDetails });
      } else {
        setAlertShow({
          open: true,
          msg: 'Customer 360 API failed. Try again.',
          alertType: 'error'
        });
      }
    } catch (err) {
      console.log('Error', err);
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: 'Customer 360 API failed. Try again.',
          alertType: 'error'
        });
      }
    }
  };

  const searchDetailsHandler = async (pageNumber, pageSize, value, name) => {
    try {
      setIsLoading({
        loader: true,
        name
      });
      setCustomerDetail(null);

      const { data, status } = await Service.get(`${process.env.REACT_APP_CUSTOMER_CREATION}/search?page=${pageNumber}&page_size=${pageSize}&${paramsValue}=${value?.toUpperCase()}`);
      if (pageNumber === 1) {
        const countRes = await Service.get(`${process.env.REACT_APP_CUSTOMER_COUNT}?${paramsValue}=${value?.toUpperCase()}`);
        if (countRes?.status === 200 && status === 200) {
          setSearchDetails((pre) => ({
            ...pre,
            rowCount: countRes?.data?.data,
          }));
        }
      }
      if (status === 200) {
        const userDetail = data.data.results.map((item, index) => ({
          _id: index + 1,
          ...item,
          dob: item?.dob && moment(item.dob, 'DD-MM-YYYY').format('DD/MM/YYYY')
        }));
        setSearchDetails((pre) => ({
          ...pre,
          data: userDetail || [],
        }));
        setIsLoading({
          loader: false,
          name: ''
        });
      }
    } catch (e) {
      const error = e.response?.data?.errors?.detail;
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: error || 'Customer detail API failed. Try again.',
          alertType: 'error'
        });
      }
      setSearchDetails({
        data: [],
        rowCount: 0,
        pageNumber: 1,
        pageSize: 10
      });
      setIsLoading({
        loader: false,
        name: ''
      });
      console.log('Error', e);
    }
  };

  const onSearchSubmit = async (value) => {
    try {
      setSearchDetails({
        data: [],
        rowCount: 0,
        pageNumber: 1,
        pageSize: 10
      });
      let val = '';
      if (value.hasOwnProperty('dob')) {
        val = moment(value.dob).format('DD-MM-YYYY');
      } else {
        val = value[paramsValue];
      }
      setFormDetails(val);
      searchDetailsHandler(1, searchDetails.pageSize, val, 'SEARCH');
    } catch (e) {
      console.log('Error', e);
    }
  };

  const onPageSizeChange = (pageSize) => {
    try {
      setSearchDetails((pre) => ({
        ...pre,
        pageSize
      }));
      searchDetailsHandler(searchDetails.pageNumber, pageSize, formDetails, 'TABLE');
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
      searchDetailsHandler(pageNumber, searchDetails.pageSize, formDetails, 'TABLE');
    } catch (e) {
      console.log(e);
    }
  };

  const searchResetHandler = () => {
    try {
      setDob(null);
      reset({
        [paramsValue]: null
      });
      setSearchDetails({
        data: [],
        rowCount: 0,
        pageNumber: 1,
        pageSize: 10
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const seletedValueHandler = (value) => {
    try {
      if (value) {
        setParamsValue(value);
        const searchTemp = togglerGroup.values.find((item) => item.value === value);
        setSearchTitle(searchTemp?.name);
        reset({
          [value]: null
        });
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const handleClose = () => {
    try {
      setIsOpen(false);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const checkInOldTable = async (isChildLoan, item, panelId) => {
    try {
      const { data, status } = await Service.get(`${process.env.REACT_APP_LOAN_ACCOUNT_DETAILS}/${panelId.trim()}?old=1`);
      if (status === 200) {
        isChildLoan ? setChildLANDetail({
          ...data,
          maturity_date: item?.maturity_date,
          account_status: item?.account_status,
          disburshment_amout: item?.disburshment_amout
        })
          : setParentLANDetail({
            ...data,
            maturity_date: item?.maturity_date,
            account_status: item?.account_status,
            disburshment_amout: item?.disburshment_amout
          });
        isChildLoan ? setChildExpanded(childExpanded === panelId ? -1 : panelId) : setExpanded(expanded === panelId ? -1 : panelId);
      }
    } catch (err) {
      console.log('err', err);
      isChildLoan ? setChildExpanded(-1) : setExpanded(-1);
      if (err?.response?.data?.errors?.detail && err?.response?.data?.errors?.detail.includes('Not found')) {
        setAlertShow({
          open: true,
          msg: 'LAN details not found',
          alertType: 'error'
        });
      } else {
        setAlertShow({
          open: true,
          msg: 'Something went wrong while fetching lan details',
          alertType: 'error'
        });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const slabChangeCalculation = (daysDiff, interestSettledLastDate) => {
    if (daysDiff === 0) {
      daysDiff = 1;
    }
    let slab = Math.ceil(daysDiff / 30) * 30;
    if (slab > 360) {
      slab = 360;
    }
    const newDate = moment(interestSettledLastDate).add(slab, 'days');
    const formattedNewDate = newDate.format('DD/MM/YYYY');
    return formattedNewDate;
  };

  const processNextSlabdate = (interestSettledLastDate, item, panelId, scheme_type) => {
    let settledDate;
    if (interestSettledLastDate && interestSettledLastDate === 19500101) {
      settledDate = moment(item?.disburshment_date, 'DDMMYYYY');
    } else {
      settledDate = moment(interestSettledLastDate.toString(), 'YYYYMMDD');
    }

    const currentDate = moment();
    const daysDiff = Math.abs(settledDate.diff(currentDate, 'days'));
    const calculatedNextSlabDate = slabChangeCalculation(daysDiff, settledDate);
    item.next_slab_date = scheme_type !== 'REB' ? 'NA' : calculatedNextSlabDate;
    item.interest_cleared_till = (scheme_type === 'RSU' && item.amount_paid_today > 0) ? 'NA' : settledDate.format('DD/MM/YYYY');
  };

  const saveLanData = async (isChildLoan, item, panelId) => {
    try {
      setLoading({ loader: true, name: 'onFetchLanDetails' });
      const loanAccountRes = Service.get(`${process.env.REACT_APP_LOAN_ACCOUNT_DETAILS}/${panelId.trim()}`);
      const interestSettledLastDate = await getRebateDate(panelId.trim());
      const { data, status } = await loanAccountRes;
      const schemeType = data?.scheme_type;
      if (interestSettledLastDate !== null) {
        processNextSlabdate(interestSettledLastDate, item, panelId, schemeType);
      }
      if (status === 200) {
        isChildLoan ? setChildLANDetail({
          ...data,
          maturity_date: item?.maturity_date,
          account_status: item?.account_status,
          disburshment_amout: item?.disburshment_amout
        })
          : setParentLANDetail({
            ...data,
            maturity_date: item?.maturity_date,
            account_status: item?.account_status,
            disburshment_amout: item?.disburshment_amout
          });
        isChildLoan ? setChildExpanded(childExpanded === panelId ? -1 : panelId) : setExpanded(expanded === panelId ? -1 : panelId);
      }
      setLoading({ loader: false, name: null });
    } catch (err) {
      console.log('err', err);
      if (item?.account_status === 'closed' && err?.response?.status === 404) {
        checkInOldTable(isChildLoan, item, panelId);
      } else {
        isChildLoan ? setChildExpanded(-1) : setExpanded(-1);
        if (err?.response?.data?.errors?.detail && err?.response?.data?.errors?.detail.includes('Not found')) {
          setAlertShow({
            open: true,
            msg: 'LAN details not found',
            alertType: 'error'
          });
        } else {
          setAlertShow({
            open: true,
            msg: 'Something went wrong while fetching lan details',
            alertType: 'error'
          });
        }
        setLoading({ loader: false, name: null });
      }
    }
  };

  const handleChange = async (panelId, item, isChildLoan = false) => {
    const selectedLAN = isChildLoan ? childLANDetail : parentLANDetail;
    const currentExpended = isChildLoan ? childExpanded : expanded;
    if (selectedLAN) {
      if (panelId.trim() !== (selectedLAN.loan_account_no).toString()) {
        isChildLoan ? setChildLANDetail(null) : setParentLANDetail(null);
        if (currentExpended !== panelId) {
          saveLanData(isChildLoan, item, panelId);
        }
      } else {
        isChildLoan ? setChildExpanded(childExpanded === panelId ? -1 : panelId) : setExpanded(expanded === panelId ? -1 : panelId);
      }
    } else if (currentExpended !== panelId) {
      saveLanData(isChildLoan, item, panelId);
    }
  };

  const generatePdf = async (isChildLoan, isChargable) => {
    try {
      setIsPdfGenerationInProgress(true);
      const selectedLAN = isChildLoan ? childLANDetail : parentLANDetail;
      const requestBodyAccountStatment = {
        accountId: selectedLAN?.loan_account_no,
        valueFromDate: 20200501,
        valueToDate: 20720601
      };
      const accountStatment = await Service.post(`${process.env.REACT_APP_LOAN_STATEMENT}`, requestBodyAccountStatment);
      const branchData = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
      const branchDetail = branchData?.data?.branches?.filter((item) => item.branchCode === selectedLAN.maker_branch);
      const pdfData = {
        headData: {
          'BRANCH CODE': selectedLAN?.maker_branch,
          'BRANCH NAME': branchDetail[0]?.branchName ?? 'NA',
          'BRANCH ADDRESS': branchDetail[0]?.address ?? 'NA',
          'CUSTOMER ID': selectedLAN?.customer_id,
          'CUSTOMER NAME': `${selectedLAN?.first_name} ${selectedLAN?.last_name}`,
          'CUSTOMER ADDRESS': `${customerDetail?.current_address_1} ${customerDetail?.current_address_2}`,
          LAN: selectedLAN?.loan_account_no,
          'DISBURSEMENT DATE': moment(selectedLAN?.disbursed_on, 'YYYYMMDD').format('DD/MM/YYYY'),
          'DISBURSEMENT AMOUNT': selectedLAN?.disburshment_amout ?? 'NA',
          'SCHEME NAME': selectedLAN?.scheme_name ?? 'NA',
          'RATE OF INTEREST': selectedLAN?.rate_of_interest ?? 'NA',
          TENURE: `${selectedLAN?.tenure} Months`,
          'REPAYMENT FREQUENCY': repaymentFrequencyEnum[selectedLAN?.repayment_frequency] ?? 'NA',
          'LOAN MATURITY DATE': selectedLAN?.maturity_date ?? 'NA',
          'LOAN STATUS': selectedLAN?.account_status?.toUpperCase(),
          'PRINCIPLE OUTSTANDING': 0,
          'INTEREST DUE DATE': 'NA'
        },
        bodyData: []
      };
      if (selectedLAN?.account_status?.toUpperCase() === 'ACTIVE') {
        const res = await Service.post(process.env.REACT_APP_LOAN_FORECLOSURE_INQUERY, {
          accountNo: selectedLAN?.loan_account_no,
          paneltyMethod: 3,
          settlementMode: 3
        });
        const foreclosureInfo = res?.data?.data;
        pdfData.headData['PRINCIPLE OUTSTANDING'] = foreclosureInfo?.principalBalance;
        pdfData.headData['INTEREST DUE DATE'] = moment(foreclosureInfo?.nextDueDate, 'YYYYMMDD').format('DD/MM/YYYY');
      }

      const headTableData = [];

      let temp = [];
      // eslint-disable-next-line no-restricted-syntax, no-undef
      Object.entries(pdfData?.headData).forEach(([key, value]) => {
        if ((temp.length < 6 && temp.length > 0) || temp.length === 0) {
          temp.push(key);
          temp.push(value);
          if (temp.length === 6) {
            headTableData.push(temp);
            temp = [];
          }
          if (temp.length === 4 && temp[0] === 'PRINCIPLE OUTSTANDING' && temp[2] === 'INTEREST DUE DATE') {
            headTableData.push(temp);
            temp = [];
          }
        }
      });
      // eslint-disable-next-line array-callback-return
      const accStatment = accountStatment?.data?.xfaceLoanAccountStatementDTO ?? [];
      // eslint-disable-next-line array-callback-return
      accStatment.map((item) => {
        let bodyTemp = [];
        bodyTemp.push(moment(item?.txnDate, 'YYYYMMDD').format('DD/MM/YYYY') ?? 'NA');
        bodyTemp.push(moment(item?.valueDate, 'YYYYMMDD').format('DD/MM/YYYY') ?? 'NA');
        bodyTemp.push(item?.description ?? 'NA');
        bodyTemp.push(item?.flgDrCr === 'D' ? item?.amount : 0);
        bodyTemp.push(item?.flgDrCr === 'C' ? item?.amount : 0);
        bodyTemp.push(item?.runningBalance ?? 'NA');
        pdfData.bodyData.push(bodyTemp);
        bodyTemp = [];
      });
      // const cashHandlingCharge = [['25/07/2024', '14/11/2025', 'GST TAX ADDL Cash Handling Charges', 9, 0, 27909],
      //   ['25/07/2024', '14/11/2025', 'GST TAX ADDL Cash Handling Charges', 0, 9, 28000],
      //   ['25/07/2024', '14/11/2025', 'Cash Handling Charges', 41, 0, 27909],
      //   ['25/07/2024', '14/11/2025', 'Cash Handling Charges', 0, 41, 27909]
      // ];
      // pdfData.bodyData = [...pdfData.bodyData, ...cashHandlingCharge];
      // eslint-disable-next-line new-cap
      const doc = new jsPDF();
      doc.autoTable({
        head: [['', '', '', '', '', '']],
        body: headTableData,
        // eslint-disable-next-line max-len
        startY: 55,
        theme: 'grid',
        margin: { top: 0 },
        headStyles: {
          fillColor: [80, 42, 116],
          lineColor: [80, 42, 116]
        },
        bodyStyle: {
          lineWidth: 0.01,
          lineColor: [255, 255, 255]
        },
        styles: {
          fontSize: 7,
          cellPadding: 2
        },
        didParseCell: (cell) => {
          if ((cell.column.index + 1) % 2 !== 0) {
            cell.cell.styles.fontStyle = 'bold';
          }
        },
        didDrawPage: () => {
          const date = new Date();
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('Capri Global Capital Ltd.', 15, 15);
          doc.text('Regd. Office: 502, Tower A, Peninsula Business Park,', 15, 20);
          doc.text('Senapati Bapat Marg,', 15, 25);
          doc.text('Lower Parel, Mumbai · 022 40888100, 43547200.', 15, 30);
          doc.setFontSize(12);
          doc.text('STATEMENT OF ACCOUNT', 70, 45,);
          doc.setFontSize(9);
          doc.text(`DATE: ${pad(day)}/${pad(month)}/${year}`, 82, 50);
          doc.setDrawColor(0, 0, 0, 0.54);
          doc.setLineWidth(0.1);
          doc.addImage(logo, 'PNG', 140, 9, 50, 20);
        },
        drawHeaderCell: (cell) => {
          console.log(cell);
        }
      });
      const head = ['Trans. Date', 'Value Date', 'Particulars', 'Debit', 'Credit', 'Balance'];
      doc.autoTable({
        head: [head],
        theme: 'grid',
        body: pdfData.bodyData,
        // eslint-disable-next-line max-len
        margin: { top: 40 },
        headStyles: {
          fillColor: [80, 42, 116],
        },
        bodyStyle: {
          lineWidth: 0.1,
          lineColor: [255, 255, 255]
        },
        styles: {
          fontSize: 7,
          cellPadding: 2
        },
        didParseCell: (cell) => {
          if (cell.column.index === 3 || cell.column.index === 4 || cell.column.index === 5) {
            cell.cell.styles.halign = 'right';
          }
        },
        didDrawPage: () => {
          const date = new Date();
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('Capri Global Capital Ltd.', 15, 15);
          doc.text('Regd. Office: 502, Tower A, Peninsula Business Park,', 15, 20);
          doc.text('Senapati Bapat Marg,', 15, 25);
          doc.text('Lower Parel, Mumbai · 022 40888100, 43547200.', 15, 30);
          // doc.setFontSize(12);
          // doc.text('STATEMENT OF ACCOUNT', 70, 45,);
          // doc.setFontSize(9);
          // doc.text(`DATE: ${pad(day)}/${pad(month)}/${year}`, 82, 50);
          doc.setDrawColor(0, 0, 0, 0.54);
          doc.setLineWidth(0.1);
          doc.addImage(logo, 'PNG', 140, 9, 50, 20);
          // doc.autoTable({
          //   head: [['', '', '', '', '', '']],
          //   body: headTableData,
          //   // eslint-disable-next-line max-len
          //   startY: 55,
          //   theme: 'grid',
          //   margin: { top: 0 },
          //   headStyles: {
          //     fillColor: [80, 42, 116],
          //     lineColor: [80, 42, 116]
          //   },
          //   bodyStyle: {
          //     lineWidth: 0.01,
          //     lineColor: [255, 255, 255]
          //   },
          //   styles: {
          //     fontSize: 7,
          //     cellPadding: 2
          //   },
          //   didParseCell: (cell) => {
          //     if ((cell.column.index + 1) % 2 !== 0) {
          //       cell.cell.styles.fontStyle = 'bold';
          //     }
          //   },
          //   drawHeaderCell: (cell) => {
          //     console.log(cell);
          //   }
          // });
        }
      });
      doc.setFontSize(10);
      for (let i = 1; i <= doc.getNumberOfPages(); i += 1) {
        doc.setFontSize(6);
        doc.setPage(i);
        doc.setTextColor(80, 42, 116);
        doc.text(`Page ${i} of ${doc.getNumberOfPages()}`, 20, doc.internal.pageSize.height - 10);
      }
      const reqPayload = {
        accountId: selectedLAN?.loan_account_no,
        scCode: 80030,
        billType: 'BO',
        dueAmount: fee,
        narrativeText: 'pdf Generation Charge',
        reverseBilling: false
      };
      if (isChargable) {
        const pdfGenerationCharge = await Service.post(`${process.env.REACT_APP_ADHOC_CHARGE}`, reqPayload);
        if (pdfGenerationCharge.data.transactionStatus.replyCode === 0) {
          doc.save(`${Date.now()}.pdf`);
        } else {
          setAlertShow({
            open: true,
            msg: 'No Account Statement Details Found.',
            alertType: 'error'
          });
        }
      } else {
        doc.save(`${Date.now()}.pdf`);
      }
      setLoading({ loader: false, name: 'Download' });
      loaderRef.current = false;
      setIsConfirmationOpen({ open: false, isChildLoan: false });
    } catch (err) {
      console.log('Error', err);
      setAlertShow({
        open: true,
        msg: 'No Account Statement Details Found.',
        alertType: 'error'
      });
      setIsPdfGenerationInProgress(false);
      setLoading({ loader: false, name: 'Download' });
      loaderRef.current = false;
      setIsConfirmationOpen({ open: false, isChildLoan: false });
    } finally {
      setIsPdfGenerationInProgress(false);
      setLoading({ loader: false, name: 'Download' });
      loaderRef.current = false;
      setIsConfirmationOpen({ open: false, isChildLoan: false });
    }
  };
  const checkCharge = async (isChildLoan) => {
    try {
      loaderRef.current = true;
      const selectedLoan = isChildLoan ? childLANDetail : parentLANDetail;
      setLoading({ loader: true, name: selectedLoan?.lan });
      const feeArray = selectedLoan?.fees?.filter((item) => item.name === 'SOA');
      if (feeArray.length > 0 && selectedLoan?.account_status.toUpperCase() === 'ACTIVE') {
        setIsConfirmationOpen({ open: true, isChildLoan });
        setFee(feeArray[0]?.amount?.amount);
      } else {
        generatePdf(isChildLoan, false);
      }
    } catch (err) {
      setAlertShow({
        open: true,
        msg: 'No Account Statement Details Found.',
        alertType: 'error'
      });
      setLoading({ loader: false, name: 'Download' });
      loaderRef.current = false;
      setIsConfirmationOpen({ open: false, isChildLoan: false });
    } finally {
      setLoading({ loader: false, name: 'Download' });
      loaderRef.current = false;
    }
  };

  const handleCamReportView = (isChildLoan = false) => {
    window.open(`/cam-report/${customerDetail.customer_id}-${isChildLoan ? childLANDetail.application_no : parentLANDetail.application_no}`, '_blank');
  };

  const colenderProvider = (val, isVisible) => {
    if (isVisible === false) return 'NA';
    if (!val || val === 'CAPRI') return 'NA';
    return val;
  };

  const activeLoans = customerDetail?.loan_detail?.filter((item) => item.account_status?.toUpperCase() === 'ACTIVE') ?? [];
  const closedLoans = customerDetail?.loan_detail?.filter((item) => item.account_status?.toUpperCase() === 'CLOSED') ?? [];
  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0px 0px 20px 0px !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Customer Summary
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer
          item
          xs={12}
          padding='0px 20px 0px 20px'
        >
          <CustomForm
            onSubmit={handleSubmit(onSearchSubmit)}
            width={screen === 'xs' ? '100%' : ''}
          >
            {
             paramsValue !== 'dob' ? (
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
                   setValue(paramsValue, paramsValue === 'pan_no' ? e.target.value?.toUpperCase() : e.target.value, {
                     shouldValidate: true
                   });
                 }}
               />
             )
               : (
                 <LocalizationProvider dateAdapter={AdapterDateFns}>
                   <DatePicker
                     className='date-picker'
                     label={`${searchTitle} *`}
                     inputFormat='dd/MM/yyyy'
                     value={dob}
                     renderInput={(params) => (
                       <TextFieldStyled
                         onKeyDown={(e) => {
                           e.preventDefault();
                         }}
                         variant='outlined'
                         {...params}
                       />
                     )}
                     {...register(paramsValue, {
                       required: true,
                     })}
                     onChange={(v) => {
                       setDob(v);
                       setValue(
                         paramsValue,
                         v,
                         { shouldValidate: true, shouldDirty: true }
                       );
                     }}
                     disableFuture
                   />
                 </LocalizationProvider>
               )
            }
            <LoadingButtonPrimary
              variant='contained'
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
        <DialogBox
          isOpen={isOpen}
          fullScreen
          title='Customer Summary'
          width='100%'
          handleClose={handleClose}
        >

          <ContainerStyled>
            {
            customerDetail ? (
              <>
                <Grid container display='flex' padding='20px 0px'>
                  <CustomDiv>
                    <CustomText padding='0px 20px 20px 20px !important'>Customer Summary</CustomText>
                  </CustomDiv>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='cust_id'
                      label='Customer Id'
                      defaultValue={customerDetail?.customer_id ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding={['xl', 'lg', 'md'].includes(screen) ? '10px 20px 0px' : '10px 20px 10px'}>
                    <TextFieldStyled
                      id='custmer_name'
                      label='Customer Name'
                      defaultValue={customerDetail?.first_name ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding={['xl', 'lg', 'md'].includes(screen) ? '10px 20px 0px' : '10px 20px 10px'}>
                    <TextFieldStyled
                      id='dob'
                      label='DOB'
                      defaultValue={customerDetail?.dob ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='cust_mobile_number'
                      label='Customer Mobile Number'
                      defaultValue={customerDetail?.primary_mobile_number ?? 'NA'}
                      disabled
                    />
                  </Grid>
                </Grid>
                <Grid container display='flex' padding='0px 0px 20px'>
                  <CustomDiv>
                    <CustomText padding='0px 20px 20px 20px !important'>Loan Summary</CustomText>
                  </CustomDiv>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='total_loans'
                      label='Total Loans'
                      defaultValue={customerDetail?.loan_summary?.total_loan ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='active'
                      label='Active'
                      defaultValue={customerDetail?.loan_summary?.active_loan ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='closed'
                      label='Closed'
                      defaultValue={customerDetail?.loan_summary?.closed_loan ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='total_pos'
                      label='Total POS'
                      defaultValue={amountFormat.format(customerDetail?.loan_summary?.total_pos) ?? 'NA'}
                      disabled
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='total_intrest_overdue'
                      label='Total Interest OverDue'
                      defaultValue={amountFormat.format(customerDetail?.loan_summary?.total_interest_overdue) ?? 'NA'}
                      disabled
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='max_dpd'
                      label='Max DPD'
                      defaultValue={customerDetail?.loan_summary?.max_dpd ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='npa_status'
                      label='NPA Status'
                      colorCode={customerDetail?.loan_summary?.npa_status?.toUpperCase() === 'SUSPENDED' ? '#ffb4b4' : ''}
                      defaultValue={customerDetail?.loan_summary?.npa_status?.toUpperCase() ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='count_of_default_account'
                      label='Count of accounts in default'
                      defaultValue={customerDetail?.loan_summary?.count_of_default_account ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='count_of_npa_account'
                      label='Count of accounts in NPA'
                      defaultValue={customerDetail?.loan_summary?.count_of_npa_account ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='count_of_auctioned_account'
                      label='Count of accounts Auctioned'
                      defaultValue={customerDetail?.loan_summary?.count_of_auctioned_account ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='count_of_spurious_account'
                      label='Count of Spurious accounts'
                      defaultValue={customerDetail?.loan_summary?.count_of_spurious_account ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='lien_status'
                      label='Lien Status'
                      defaultValue={customerDetail?.loan_summary?.lien_status === 'Y' ? 'Yes' : 'No'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='legal_status'
                      label='Legal Status'
                      defaultValue={customerDetail?.loan_summary?.legal_status === 'Y' ? 'Yes' : 'No'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='mtm-count'
                      label='MTM Account Count'
                      defaultValue={customerDetail?.mdm_count}
                      disabled
                    />
                  </Grid>
                  <DialogBox
                    isOpen={isConfirmationOpen.open}
                    title=''
                    width='auto'
                    padding='40px'
                  >
                    <DialogContentText>
                      {
                `Are you sure you want to download statement of account for Loan account number ${isConfirmationOpen.isChildLoan ? childLANDetail?.lan : parentLANDetail?.lan} for cost Rs.${fee}`
            }
                    </DialogContentText>
                    <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
                      <LoadingButtonSecondaryPrimary
                        onClick={() => generatePdf(isConfirmationOpen.isChildLoan, true)}
                        variant='contained'
                        loading={isPdfGenerationInProgress}
                      >
                        Yes
                      </LoadingButtonSecondaryPrimary>
                      <ButtonPrimary onClick={() => {
                        setIsConfirmationOpen({ open: false, isChildLoan: false });
                        setLoading({ loader: false, name: 'Download' });
                        loaderRef.current = false;
                      }}
                      >
                        No

                      </ButtonPrimary>
                    </CenterContainerStyled>
                  </DialogBox>
                  {
                    loading.loader && loading.name === 'onFetchLanDetails' ? <PageLoader /> : null
                  }
                  <>
                    <CustomDiv>
                      <CustomText>Active Loans</CustomText>
                    </CustomDiv>
                    <AccordionContainer>
                      {(activeLoans?.length ?? 0) > 0
                        ? activeLoans.map((item) => (
                          <Accordion
                            TransitionProps={{ unmountOnExit: true }}
                            expanded={expanded === item?.lan}
                            onChange={() => handleChange(item?.lan, item)}
                          >
                            <AccordionSummary
                              expandIcon={expanded === item?.lan ? <RemoveIcon /> : <AddIcon />}
                              aria-controls='panel1bh-content'
                              id='panel1bh-header'
                              className={classes.accordionSummary}
                            >
                              <CustomDiv>
                                <AccordianHeaderText>{item?.lan ?? 'NA'}</AccordianHeaderText>
                              </CustomDiv>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container display='flex' padding='20px 20px'>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='applicationNo'
                                    label='LAN'
                                    defaultValue={item?.lan ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <LoadingButtonPrimary
                                    loading={loading.loader && loading.name === item?.lan}
                                    disabled={isDownloadPdfButtonDisabled}
                                    onClick={() => {
                                      throttleFunction(
                                        {
                                          args1: [false],
                                          function1: checkCharge
                                        },
                                        loaderRef,
                                        setIsDownloadPdfButtonDisabled
                                      );
                                    }}
                                  >
                                    SOA Download
                                  </LoadingButtonPrimary>
                                  <LoadingButtonPrimary onClick={() => handleCamReportView(false)}>
                                    CAM
                                  </LoadingButtonPrimary>
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='disbursement_date'
                                    label='Disbursement Date'
                                    defaultValue={item?.disburshment_date ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='disbursement_amount'
                                    label='Disbursement Amount'
                                    defaultValue={amountFormat.format(item?.disburshment_amout) ?? 'NA'}
                                    disabled
                                    InputProps={{
                                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                    }}
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='scheme_name'
                                    label='Scheme Name'
                                    value={parentLANDetail?.scheme_name ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='pos'
                                    label='POS'
                                    defaultValue={amountFormat.format(item?.pos) ?? 'NA'}
                                    disabled
                                    InputProps={{
                                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                    }}
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='interest_overdue'
                                    label='Due Amount'
                                    defaultValue={amountFormat.format(item?.interest_overdue) ?? 'NA'}
                                    disabled
                                    InputProps={{
                                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                    }}
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='mature_date'
                                    label='Maturity Date'
                                    defaultValue={item?.maturity_date ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='intrest'
                                    label='Interest'
                                    defaultValue={amountFormat.format(item?.interest) ?? 'NA'}
                                    disabled
                                    InputProps={{
                                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                    }}
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='additional_intrest'
                                    label='Penal Charge'
                                    defaultValue={amountFormat.format(item?.additional_interest) ?? 'NA'}
                                    disabled
                                    InputProps={{
                                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                    }}
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='interest-cleared-till'
                                    label='Interest Cleared Till'
                                    defaultValue={item?.interest_cleared_till
                                      ?? ' '}
                                    disabled
                                  />
                                </Grid>

                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='next-slab-change'
                                    label='Next Slab Change'
                                    defaultValue={item?.next_slab_date
                                      ?? ' '}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='dpd'
                                    label='DPD'
                                    defaultValue={item?.dpd ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='account_status'
                                    label='Account Status'
                                    defaultValue={item?.account_status?.toUpperCase() ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='frequency_dpd'
                                    label='Frequency DPD'
                                    defaultValue={item?.frequency_dpd?.toUpperCase() ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='tenor_dpd'
                                    label='Tenor DPD'
                                    defaultValue={item?.tenor_dpd?.toUpperCase() ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='spurious_status'
                                    label='Spurious Status'
                                    defaultValue={item?.spurious_status?.toUpperCase() ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='lien_status'
                                    label='Lien Status'
                                    defaultValue={item?.lien_status === 'Y' ? 'Yes' : 'No'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='next_due_date'
                                    label='Next Due Date'
                                    defaultValue={item?.next_due_date ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='colender'
                                    label='Partner Bank'
                                    defaultValue={colenderProvider(parentLANDetail?.colender, parentLANDetail?.colender_is_visible)}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='mtm-demand'
                                    label='MTM Demand'
                                    defaultValue={item?.mdm_demand}
                                    disabled
                                  />
                                </Grid>
                              </Grid>
                              {item?.child_loans?.length > 0 ? <CustomText2 padding='5px 10px'>Top Up Loans</CustomText2> : null}
                              {
                                item?.child_loans?.map((childLoan) => (
                                  <Accordion
                                    TransitionProps={{ unmountOnExit: true }}
                                    expanded={childExpanded === childLoan?.lan}
                                    onChange={() => handleChange(childLoan?.lan, childLoan, true)}
                                  >
                                    <AccordionSummary
                                      expandIcon={childExpanded === childLoan?.lan ? <RemoveIcon /> : <AddIcon />}
                                      aria-controls='panel1bh-content'
                                      id='panel1bh-header'
                                      className={classes.accordionSummary}
                                    >
                                      <CustomDiv>
                                        <AccordianHeaderText>{childLoan?.lan ?? 'NA'}</AccordianHeaderText>
                                      </CustomDiv>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Grid container display='flex' padding='20px 20px'>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='applicationNo'
                                            label='LAN'
                                            defaultValue={childLoan?.lan ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <LoadingButtonPrimary
                                            loading={loading.loader && loading.name === childLoan?.lan}
                                            disabled={isDownloadPdfButtonDisabled}
                                            onClick={() => {
                                              throttleFunction(
                                                {
                                                  args1: [true],
                                                  function1: checkCharge
                                                },
                                                loaderRef,
                                                setIsDownloadPdfButtonDisabled
                                              );
                                            }}
                                          >
                                            SOA Download
                                          </LoadingButtonPrimary>
                                          <LoadingButtonPrimary onClick={() => handleCamReportView(true)}>
                                            CAM
                                          </LoadingButtonPrimary>
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='disbursement_date'
                                            label='Disbursement Date'
                                            defaultValue={childLoan?.disburshment_date ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='disbursement_amount'
                                            label='Disbursement Amount'
                                            defaultValue={amountFormat.format(childLoan?.disburshment_amout) ?? 'NA'}
                                            disabled
                                            InputProps={{
                                              startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='scheme_name'
                                            label='Scheme Name'
                                            value={parentLANDetail?.scheme_name ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='pos'
                                            label='POS'
                                            defaultValue={amountFormat.format(childLoan?.pos) ?? 'NA'}
                                            disabled
                                            InputProps={{
                                              startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='interest_overdue'
                                            label='Due Amount'
                                            defaultValue={amountFormat.format(childLoan?.interest_overdue) ?? 'NA'}
                                            disabled
                                            InputProps={{
                                              startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='mature_date'
                                            label='Maturity Date'
                                            defaultValue={childLoan?.maturity_date ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='intrest'
                                            label='Interest'
                                            defaultValue={amountFormat.format(childLoan?.interest) ?? 'NA'}
                                            disabled
                                            InputProps={{
                                              startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='additional_intrest'
                                            label='Penal Charge'
                                            defaultValue={amountFormat.format(childLoan?.additional_interest) ?? 'NA'}
                                            disabled
                                            InputProps={{
                                              startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='interest-cleared-till'
                                            label='Interest Cleared Till'
                                            defaultValue={childLoan.interest_cleared_till ? childLoan.interest_cleared_till : ' '}
                                            disabled
                                          />
                                        </Grid>

                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='next-slab-change'
                                            label='Next Slab Change'
                                            defaultValue={childLoan.next_slab_date ? childLoan.next_slab_date : ' '}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='dpd'
                                            label='DPD'
                                            defaultValue={childLoan?.dpd ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='account_status'
                                            label='Account Status'
                                            defaultValue={childLoan?.account_status?.toUpperCase() ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='frequency_dpd'
                                            label='Frequency DPD'
                                            defaultValue={childLoan?.frequency_dpd?.toUpperCase() ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='tenor_dpd'
                                            label='Tenor DPD'
                                            defaultValue={childLoan?.tenor_dpd?.toUpperCase() ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='spurious_status'
                                            label='Spurious Status'
                                            defaultValue={childLoan?.spurious_status?.toUpperCase() ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='lien_status'
                                            label='Lien Status'
                                            defaultValue={childLoan?.lien_status === 'Y' ? 'Yes' : 'No'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='next_due_date'
                                            label='Next Due Date'
                                            defaultValue={item?.next_due_date ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='colender'
                                            label='Partner Bank'
                                            defaultValue={colenderProvider(childLANDetail?.colender, childLANDetail?.colender_is_visible)}
                                            disabled
                                          />
                                        </Grid>
                                      </Grid>
                                    </AccordionDetails>
                                  </Accordion>
                                ))
                          }
                            </AccordionDetails>
                          </Accordion>
                        )) : <CustomText1>No Active Loans</CustomText1>}
                    </AccordionContainer>
                  </>
                  <>
                    <CustomDiv>
                      <CustomText>Closed Loans</CustomText>
                    </CustomDiv>
                    <AccordionContainer>
                      {(closedLoans?.length ?? 0) > 0
                        ? closedLoans.map((item) => (
                          <Accordion
                            TransitionProps={{ unmountOnExit: true }}
                            expanded={expanded === item?.lan}
                            onChange={() => handleChange(item?.lan, item)}
                          >
                            <AccordionSummary
                              expandIcon={expanded === item?.lan ? <RemoveIcon /> : <AddIcon />}
                              aria-controls='panel1bh-content'
                              id='panel1bh-header'
                              className={classes.accordionSummary}
                              disableGutters
                            >
                              <CustomDiv>
                                <AccordianHeaderText>{item?.lan ?? 'NA'}</AccordianHeaderText>
                              </CustomDiv>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container display='flex' padding='20px 20px'>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='applicationNo'
                                    label='LAN'
                                    defaultValue={item?.lan ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <LoadingButtonPrimary
                                    loading={loading.loader && loading.name === item?.lan}
                                    disabled={isDownloadPdfButtonDisabled}
                                    onClick={() => {
                                      throttleFunction(
                                        {
                                          args1: [false],
                                          function1: checkCharge
                                        },
                                        loaderRef,
                                        setIsDownloadPdfButtonDisabled
                                      );
                                    }}
                                  >
                                    SOA Download
                                  </LoadingButtonPrimary>
                                  <LoadingButtonPrimary onClick={() => handleCamReportView(false)}>
                                    CAM
                                  </LoadingButtonPrimary>
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='disbursement_date'
                                    label='Disbursement Date'
                                    defaultValue={item?.disburshment_date ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='disbursement_amount'
                                    label='Disbursement Amount'
                                    defaultValue={amountFormat.format(item?.disburshment_amout) ?? 'NA'}
                                    disabled
                                    InputProps={{
                                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                    }}
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='scheme_name'
                                    label='Scheme Name'
                                    defaultValue={parentLANDetail?.scheme_name?.toUpperCase() ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='pos'
                                    label='POS'
                                    defaultValue={amountFormat.format(item?.pos) ?? 'NA'}
                                    disabled
                                    InputProps={{
                                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                    }}
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='interest_overdue'
                                    label='Due Amount'
                                    defaultValue={amountFormat.format(item?.interest_overdue) ?? 'NA'}
                                    disabled
                                    InputProps={{
                                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                    }}
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='mature_date'
                                    label='Maturity Date'
                                    defaultValue={item?.maturity_date ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='intrest'
                                    label='Interest'
                                    defaultValue={amountFormat.format(item?.interest) ?? 'NA'}
                                    disabled
                                    InputProps={{
                                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                    }}
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='additional_intrest'
                                    label='Penal Charge'
                                    defaultValue={amountFormat.format(item?.additional_interest) ?? 'NA'}
                                    disabled
                                    InputProps={{
                                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                    }}
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='dpd'
                                    label='DPD'
                                    defaultValue={item?.dpd ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='account_status'
                                    label='Account Status'
                                    defaultValue={item?.account_status?.toUpperCase() ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='next_due_date'
                                    label='Next Due Date'
                                    defaultValue={item?.next_due_date ?? 'NA'}
                                    disabled
                                  />
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                  <TextFieldStyled
                                    id='colender'
                                    label='Partner Bank'
                                    defaultValue={colenderProvider(parentLANDetail?.colender, parentLANDetail?.colender_is_visible)}
                                    disabled
                                  />
                                </Grid>
                              </Grid>
                              {item?.child_loans?.length > 0 ? <CustomText2 padding='5px 10px'>Top Up Loans</CustomText2> : null}
                              {
                                item?.child_loans?.map((childLoan) => (
                                  <Accordion
                                    TransitionProps={{ unmountOnExit: true }}
                                    expanded={childExpanded === childLoan?.lan}
                                    onChange={() => handleChange(childLoan?.lan, childLoan, true)}
                                  >
                                    <AccordionSummary
                                      expandIcon={childExpanded === childLoan?.lan ? <RemoveIcon /> : <AddIcon />}
                                      aria-controls='panel1bh-content'
                                      id='panel1bh-header'
                                      className={classes.accordionSummary}
                                      disableGutters
                                    >
                                      <CustomDiv>
                                        <AccordianHeaderText>{childLoan?.lan ?? 'NA'}</AccordianHeaderText>
                                      </CustomDiv>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Grid container display='flex' padding='20px 20px'>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='applicationNo'
                                            label='LAN'
                                            defaultValue={childLoan?.lan ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <LoadingButtonPrimary
                                            loading={loading.loader && loading.name === childLoan?.lan}
                                            disabled={isDownloadPdfButtonDisabled}
                                            onClick={() => {
                                              throttleFunction(
                                                {
                                                  args1: [true],
                                                  function1: checkCharge
                                                },
                                                loaderRef,
                                                setIsDownloadPdfButtonDisabled
                                              );
                                            }}
                                          >
                                            SOA Download
                                          </LoadingButtonPrimary>
                                          <LoadingButtonPrimary onClick={() => handleCamReportView(true)}>
                                            CAM
                                          </LoadingButtonPrimary>
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='disbursement_date'
                                            label='Disbursement Date'
                                            defaultValue={childLoan?.disburshment_date ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='disbursement_amount'
                                            label='Disbursement Amount'
                                            defaultValue={amountFormat.format(childLoan?.disburshment_amout) ?? 'NA'}
                                            disabled
                                            InputProps={{
                                              startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='scheme_name'
                                            label='Scheme Name'
                                            defaultValue={parentLANDetail?.scheme_name?.toUpperCase() ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='pos'
                                            label='POS'
                                            defaultValue={amountFormat.format(childLoan?.pos) ?? 'NA'}
                                            disabled
                                            InputProps={{
                                              startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='interest_overdue'
                                            label='Due Amount'
                                            defaultValue={amountFormat.format(childLoan?.interest_overdue) ?? 'NA'}
                                            disabled
                                            InputProps={{
                                              startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='mature_date'
                                            label='Maturity Date'
                                            defaultValue={childLoan?.maturity_date ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='intrest'
                                            label='Interest'
                                            defaultValue={amountFormat.format(childLoan?.interest) ?? 'NA'}
                                            disabled
                                            InputProps={{
                                              startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='additional_intrest'
                                            label='Penal Charge'
                                            defaultValue={amountFormat.format(childLoan?.additional_interest) ?? 'NA'}
                                            disabled
                                            InputProps={{
                                              startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='dpd'
                                            label='DPD'
                                            defaultValue={childLoan?.dpd ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='account_status'
                                            label='Account Status'
                                            defaultValue={childLoan?.account_status?.toUpperCase() ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='next_due_date'
                                            label='Next Due Date'
                                            defaultValue={item?.next_due_date ?? 'NA'}
                                            disabled
                                          />
                                        </Grid>
                                        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                                          <TextFieldStyled
                                            id='colender'
                                            label='Partner Bank'
                                            defaultValue={colenderProvider(childLANDetail?.colender, childLANDetail?.colender_is_visible)}
                                            disabled
                                          />
                                        </Grid>
                                      </Grid>
                                    </AccordionDetails>
                                  </Accordion>
                                ))
                              }
                            </AccordionDetails>
                          </Accordion>
                        )) : <CustomText1>No Closed Loans</CustomText1>}
                    </AccordionContainer>
                  </>
                </Grid>
                <Grid container display='flex' padding='0px 0px 20px'>
                  <CustomDiv>
                    <CustomText padding='0px 20px 20px 20px !important'>MSME Loan Summary</CustomText>
                  </CustomDiv>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='total_loans'
                      label='Total Loans'
                      defaultValue={customerDetail?.other_loans?.loan_summary?.total_loan ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='total_pos'
                      label='Total POS'
                      defaultValue={amountFormat.format(customerDetail?.other_loans?.loan_summary?.total_pos) ?? 'NA'}
                      disabled
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='active'
                      label='Active'
                      defaultValue={customerDetail?.other_loans?.loan_summary?.active_loan ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='max_dpd'
                      label='Max DPD'
                      defaultValue={customerDetail?.other_loans?.loan_summary?.max_dpd ?? 'NA'}
                      disabled
                    />
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                    <TextFieldStyled
                      id='npa_status'
                      label='NPA Status'
                      defaultValue={customerDetail?.other_loans?.loan_summary?.npa_status?.toUpperCase() ?? 'NA'}
                      disabled
                    />
                  </Grid>
                </Grid>
              </>

            ) : (
              <CenterContainerStyled padding='40px'>
                <CircularProgress color='secondary' />
              </CenterContainerStyled>
            )
            }
          </ContainerStyled>
        </DialogBox>
        {
          searchDetails?.data?.length ? (
            <Grid item xs={12}>
              <TableComponent
                rows={searchDetails?.data}
                columns={columnFields}
                checkboxAllowed={false}
                handleCellClick={viewDetailsHandler}
                clientPaginationMode={false}
                loading={isLoading?.loader && isLoading?.name === 'TABLE'}
                cursor='pointer'
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                rowCount={searchDetails?.rowCount}
              />
            </Grid>
          ) : null
        }
      </CustomContainerStyled>
    </>
  );
};
export default CustomerSummary;
