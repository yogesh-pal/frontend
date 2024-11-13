/* eslint-disable max-len */
import { useEffect, useState } from 'react';
import {
  TableBody, TableCell, TableHead, TableRow, Typography, Grid, InputAdornment,
  DialogContentText, Tooltip, tooltipClasses, FormHelperText
} from '@mui/material';
import { useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import InfoIcon from '@mui/icons-material/Info';
import {
  LoadingButtonPrimary, CenterContainerStyled, LoadingButtonSecondaryPrimary,
  ButtonPrimary, TextFieldStyled, SelectMenuStyle, CenterContainer
} from '../../../../components/styledComponents';
import { ToastMessage, DialogBox } from '../../../../components';
import {
  CustomTable, CustomText, purityOptionArray, CustomText2,
  spuriousReadOnlyFormFields, nonSpuriousReadOnlyFormFields, handleConfirmationonSubmit, unacceptableReadOnlyFormFields, acceptableReadOnlyFormFields
} from '../../helper';
import SpuriousModal from './spuriousModal';
import UnacceptableModal from './unacceptableModal';
import DetailsCorrectModal from './detailsCorrectModal';
import { Service } from '../../../../service';
import { useScreenSize } from '../../../../customHooks';
import { REGEX } from '../../../../constants';

const TableWrapper = styled('div')(({ width, screen }) => ({
  padding: ['xs', 'sm'].includes(screen) ? '0px 0px 20px 0px' : '0px 20px 20px',
  margin: ['xs', 'sm'].includes(screen) ? '0px 20px 0px 20px' : '0px',
  overflow: 'auto',
  width
}));
const CustomInfoIcon = styled(InfoIcon)`
  color: #502A74;
  margin-left: 10px;
 `;

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

const AuditorPage = ({ rowData, onDailogclose }) => {
  const [tableData, setTableData] = useState([]);
  const [spuriousItems, setSpuriousItems] = useState([1]);
  const [modalDataIndex, setModalDataIndex] = useState(null);
  const [nonSpuriousItems, setNonSpuriousItems] = useState([1]);
  const [acceptableItems, setAcceptableItems] = useState([1]);
  const [unacceptableItems, setUnacceptableItems] = useState([1]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [spuriousReadOnlyData, setSpuriousReadOnlyData] = useState([]);
  const [nonSpuriousReadOnlyData, setNonSpuriousReadOnlyData] = useState([]);
  const [unacceptableReadOnlyData, setUnacceptableReadOnlyData] = useState([]);
  const [acceptableReadOnlyData, setAcceptableReadOnlyData] = useState([]);
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [isModalOpen, setIsModalOpen] = useState({ spurious: false, detailsCorrect: false, unacceptable: false });
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({ onSubmit: false, onCancel: false });
  const [additionalFieldInfo, setAdditionalFieldInfo] = useState({
    isTareWeightCorrect: true,
    isGoldPouchNoCorrect: true,
    isReAudited: false,
  });
  const [toolTipCount, setToolTipCount] = useState(null);
  // const [toolTipWeight, setToolTipWeight] = useState(null);
  const [formData, setFormData] = useState(null);
  const [minRequiredTareWeight, setMinRequiredTareWeight] = useState(0);
  const screen = useScreenSize();
  const isGoldVerification = rowData?.auditType === 'Gold Verification';

  const {
    register, handleSubmit, formState: { errors }, setValue, getValues, setError, trigger
  } = useForm();

  const formHandler = async (values) => {
    if (rowData.auditType === 'TARE Weight Audit') {
      setFormData(values);
      setIsConfirmationOpen({ onSubmit: true, onCancel: false });
    } else if (rowData.auditType === 'Gold Verification') {
      let isShowConfirmation = true;
      const updatedTableData = [...tableData];
      updatedTableData.forEach((item, index) => {
        const remarks = getValues(`remarks_${index}`);
        if (!remarks) {
          setError(`remarks_${index}`, { type: 'custom' }, { shouldFocus: true });
          isShowConfirmation = false;
        } else {
          updatedTableData[index].remarks = remarks;
        }
      });
      const goldPouchNo = getValues('gold_pouch_number');
      const newGoldPouchNo = getValues('new_gold_pouch_number');
      if (goldPouchNo && goldPouchNo === rowData?.goldPouchNumber) {
        setError('gold_pouch_number', { type: 'custom', message: 'Gold Pouch Number already exist' }, { shouldFocus: true });
        isShowConfirmation = false;
      }
      if (newGoldPouchNo && (newGoldPouchNo === rowData?.goldPouchNumber || newGoldPouchNo === goldPouchNo)) {
        setError('new_gold_pouch_number', { type: 'custom', message: 'New Gold Pouch Number already exist' }, { shouldFocus: true });
        isShowConfirmation = false;
      }
      setTableData(updatedTableData);
      if (isShowConfirmation) {
        setFormData(values);
        setIsConfirmationOpen({ onSubmit: true, onCancel: false });
      }
    } else {
      let isShowConfirmation = true;
      const updatedTableData = [...tableData];
      updatedTableData.forEach((item, index) => {
        if (!item.is_spurious) {
          const stoneWeight = getValues(`stone_weight_gm_${index}`);
          const purity = getValues(`purity_${index}`);
          const remarks = getValues(`remarks_${index}`);
          if (!stoneWeight) {
            setError(`stone_weight_gm_${index}`, { type: 'custom' }, { shouldFocus: true });
            isShowConfirmation = false;
          } else {
            const valueArray = stoneWeight.split('.');
            if (valueArray.length > 1 && !valueArray[1].length) {
              setError(`stone_weight_gm_${index}`, { type: 'custom' }, { shouldFocus: true });
              isShowConfirmation = false;
            } else {
              updatedTableData[index].stone_weight_gm = Number(stoneWeight);
            }
          }
          if (!purity) {
            setError(`purity_${index}`, { type: 'custom' }, { shouldFocus: true });
            isShowConfirmation = false;
          } else {
            updatedTableData[index].purity = Number(purity);
          }
          if (!remarks) {
            setError(`remarks_${index}`, { type: 'custom' }, { shouldFocus: true });
            isShowConfirmation = false;
          } else {
            updatedTableData[index].remarks = remarks;
          }
        }
      });
      const goldPouchNo = getValues('gold_pouch_number');
      const newGoldPouchNo = getValues('new_gold_pouch_number');
      if (goldPouchNo && goldPouchNo === rowData?.goldPouchNumber) {
        setError('gold_pouch_number', { type: 'custom', message: 'Gold Pouch Number already exist' }, { shouldFocus: true });
        isShowConfirmation = false;
      }
      if (newGoldPouchNo && (newGoldPouchNo === rowData?.goldPouchNumber || newGoldPouchNo === goldPouchNo)) {
        setError('new_gold_pouch_number', { type: 'custom', message: 'New Gold Pouch Number already exist' }, { shouldFocus: true });
        isShowConfirmation = false;
      }
      setTableData(updatedTableData);
      if (isShowConfirmation) {
        setFormData(values);
        setIsConfirmationOpen({ onSubmit: true, onCancel: false });
      }
    }
  };

  useEffect(() => {
    rowData.itemArray.forEach((item) => {
      item.purity = 0;
      item.remarks = null;
      item.stone_weight_gm = 0;
      item.is_spurious = false;
      item.spurious_findings = [];
      item.nonspurious_findings = [];
      item.is_unacceptable = false;
      item.acceptable_findings = [];
      item.unacceptable_findings = [];
    });
    setTableData(rowData.itemArray);
  }, []);

  useEffect(() => {
    let minTareWeight = 0;
    tableData.forEach((item) => {
      if (item?.auditor_findings?.total_weight_gm) {
        minTareWeight += item.auditor_findings.total_weight_gm;
      } else {
        minTareWeight += item.total_weight_gm;
      }
    });
    setMinRequiredTareWeight(Number(minTareWeight.toFixed(2)));
    if (rowData.auditType !== 'TARE Weight Audit') {
      setTimeout(() => {
        trigger('tare_weight', { shouldFocus: true });
        trigger('new_tare_weight', { shouldFocus: true });
      }, 1000);
    }
  }, [tableData]);

  const areDetailsSubmitHandler = (values) => {
    let isConfirm = false;
    if ((values?.count > tableData[modalDataIndex].item_count) && (values?.totalWeight > tableData[modalDataIndex].total_weight_gm)) {
      isConfirm = window.confirm('You have put Count and Total Weight more than the original Count and Total Weight.\nAre you sure you want to submit revised collateral details?');
    } else if (values?.count > tableData[modalDataIndex].item_count) {
      isConfirm = window.confirm('You have put Count more than the original Count.\nAre you sure you want to submit revised collateral details?');
    } else if (values?.totalWeight > tableData[modalDataIndex].total_weight_gm) {
      isConfirm = window.confirm('You have put Total Weight more than the original Total Weight.\nAre you sure you want to submit revised collateral details?');
    } else {
      isConfirm = window.confirm('Are you sure you want to submit revised collateral details?');
    }
    if (!isConfirm) {
      return;
    }
    if (tableData[modalDataIndex].item_count === Number(values?.count) && tableData[modalDataIndex].total_weight_gm === Number(values?.totalWeight)) {
      setIsModalOpen({ spurious: false, detailsCorrect: false, unacceptable: false });
      return;
    }
    const updatedTableData = [...tableData];
    updatedTableData[modalDataIndex].are_details_incorrect = true;
    updatedTableData[modalDataIndex].auditor_findings.item_count = Number(values?.count);
    updatedTableData[modalDataIndex].auditor_findings.total_weight_gm = Number(values?.totalWeight);
    setTableData(updatedTableData);
    setIsModalOpen({ spurious: false, detailsCorrect: false, unacceptable: false });
  };

  const spuriousSubmitHandler = (values) => {
    const spuriousArray = [];
    const nonSpuriousArray = [];
    spuriousItems.forEach((itemNumber) => {
      spuriousArray.push({
        item_count: Number(values[`spurious_count_${itemNumber}`]),
        total_weight_gm: Number(values[`spurious_totalWeight_${itemNumber}`]),
        remarks: values[`spurious_remarks_${itemNumber}`],
        bentex: values[`bentex_${itemNumber}`],
      });
    });
    nonSpuriousItems.forEach((itemNumber) => {
      nonSpuriousArray.push({
        item_count: Number(values[`nonSpurious_count_${itemNumber}`]),
        total_weight_gm: Number(values[`nonSpurious_totalWeight_${itemNumber}`]),
        stone_weight_gm: Number(values[`nonSpurious_beads_stone_weight_${itemNumber}`]),
        purity: Number(values[`nonSpurious_purity_${itemNumber}`]),
        remarks: values[`nonSpurious_remarks_${itemNumber}`],
      });
    });
    const isConfirm = handleConfirmationonSubmit(tableData[modalDataIndex], spuriousArray, nonSpuriousArray);
    if (!isConfirm) {
      return;
    }
    const updatedTableData = [...tableData];
    updatedTableData[modalDataIndex].is_spurious = true;
    updatedTableData[modalDataIndex].spurious_findings = spuriousArray;
    updatedTableData[modalDataIndex].nonspurious_findings = nonSpuriousArray;
    setTableData(updatedTableData);
    setSpuriousItems([1]);
    setNonSpuriousItems([1]);
    setIsModalOpen({ spurious: false, detailsCorrect: false, unacceptable: false });
  };

  const unacceptableSubmitHandler = (values) => {
    const unacceptableArray = [];
    const acceptableArray = [];
    unacceptableItems.forEach((itemNumber) => {
      unacceptableArray.push({
        item_count: Number(values[`unacceptable_count_${itemNumber}`]),
        total_weight_gm: Number(values[`unacceptable_totalWeight_${itemNumber}`]),
        remarks: values[`unacceptable_remarks_${itemNumber}`],
      });
    });
    acceptableItems.forEach((itemNumber) => {
      acceptableArray.push({
        item_count: Number(values[`acceptable_count_${itemNumber}`]),
        total_weight_gm: Number(values[`acceptable_totalWeight_${itemNumber}`]),
        stone_weight_gm: Number(values[`acceptable_beads_stone_weight_${itemNumber}`]),
        purity: Number(values[`acceptable_purity_${itemNumber}`]),
        remarks: values[`acceptable_remarks_${itemNumber}`]
      });
    });
    const isConfirm = handleConfirmationonSubmit(tableData[modalDataIndex], unacceptableArray, acceptableArray);
    if (!isConfirm) {
      return;
    }
    const updatedTableData = [...tableData];
    updatedTableData[modalDataIndex].is_unacceptable = true;
    updatedTableData[modalDataIndex].unacceptable_findings = unacceptableArray;
    updatedTableData[modalDataIndex].acceptable_findings = acceptableArray;
    setTableData(updatedTableData);
    setUnacceptableItems([1]);
    setAcceptableItems([1]);
    setIsModalOpen({ spurious: false, detailsCorrect: false, unacceptable: false });
  };

  const finalSubmitHandler = async () => {
    try {
      setIsConfirmationOpen(false);
      if (isConfirmationOpen.onSubmit) {
        setIsLoading({ loader: true, name: 'onSubmit' });
        if (rowData.auditType === 'TARE Weight Audit') {
          const payload = {
            application_no: rowData.applicationNo,
            last_audit_tare_weight: rowData.last_audit_tare_weight,
            last_audit_gold_pouch_number: rowData.last_audit_gold_pouch_number,
            is_gold_pouch_number_correct: formData.is_gold_pouch_number_correct === 'yes',
            assigned_audit_type: 'TARE',
            consolidated_remarks: formData.remarks
          };
          if (formData.is_gold_pouch_number_correct === 'yes') {
            payload.tare_weight = Number(formData.tare_weight);
            payload.is_tare_weight_correct = false;
          } else {
            payload.is_tare_weight_correct = true;
          }
          const { data } = await Service.put(`${process.env.REACT_APP_AUDIT_SERVICE}/update/audit`, payload);
          if (data.success) {
            onDailogclose(data.msg);
          }
        } else if (rowData.auditType === 'Gold Verification') {
          const itemsArray = [...tableData];
          let tareWeight = 0;
          let goldPouchNumber = '';
          let newGoldPouchNumber = '';
          let newTareWeight = 0;
          if (formData.is_tare_weight_correct === 'no') {
            tareWeight = Number(formData.tare_weight);
          }
          if (formData.is_gold_pouch_number_correct === 'no') {
            goldPouchNumber = formData.gold_pouch_number;
          }
          if (formData.new_gold_pouch_number_after_reaudit === 'yes') {
            newGoldPouchNumber = formData.new_gold_pouch_number;
            newTareWeight = Number(formData.new_tare_weight);
          }
          const requestBody = {
            application_no: rowData.applicationNo,
            consolidated_remarks: formData.consolidated_remarks,
            is_tare_weight_correct: formData.is_tare_weight_correct === 'yes',
            tare_weight: tareWeight,
            is_gold_pouch_number_correct: formData.is_gold_pouch_number_correct === 'yes',
            gold_pouch_number: goldPouchNumber,
            is_new_gold_pouch_number_after_new_audit: formData.new_gold_pouch_number_after_reaudit === 'yes',
            new_gold_pouch_number: newGoldPouchNumber,
            new_tare_weight: newTareWeight,
            items: itemsArray,
            assigned_audit_type: 'GOLD_VERIFICATION',
            colender: rowData.colender,
            last_audit_gold_pouch_number: rowData?.last_audit_gold_pouch_number,
            last_audit_tare_weight: rowData?.last_audit_tare_weight
          };
          const { data } = await Service.put(`${process.env.REACT_APP_AUDIT_SERVICE}/update/audit`, requestBody);
          if (data.success) {
            onDailogclose(data.msg);
          }
        } else {
          const itemsArray = [...tableData];
          let tareWeight = 0;
          let goldPouchNumber = '';
          let newGoldPouchNumber = '';
          let newTareWeight = 0;
          if (formData.is_tare_weight_correct === 'no') {
            tareWeight = Number(formData.tare_weight);
          }
          if (formData.is_gold_pouch_number_correct === 'no') {
            goldPouchNumber = formData.gold_pouch_number;
          }
          if (formData.new_gold_pouch_number_after_reaudit === 'yes') {
            newGoldPouchNumber = formData.new_gold_pouch_number;
            newTareWeight = Number(formData.new_tare_weight);
          }
          const requestBody = {
            application_no: rowData.applicationNo,
            consolidated_remarks: formData.consolidated_remarks,
            is_tare_weight_correct: formData.is_tare_weight_correct === 'yes',
            tare_weight: tareWeight,
            is_gold_pouch_number_correct: formData.is_gold_pouch_number_correct === 'yes',
            gold_pouch_number: goldPouchNumber,
            is_new_gold_pouch_number_after_new_audit: formData.new_gold_pouch_number_after_reaudit === 'yes',
            new_gold_pouch_number: newGoldPouchNumber,
            new_tare_weight: newTareWeight,
            items: itemsArray,
            assigned_audit_type: 'FULL',
            colender: rowData.colender,
            last_audit_gold_pouch_number: rowData?.last_audit_gold_pouch_number,
            last_audit_tare_weight: rowData?.last_audit_tare_weight
          };
          const { data } = await Service.put(`${process.env.REACT_APP_AUDIT_SERVICE}/update/audit`, requestBody);
          if (data.success) {
            onDailogclose(data.msg);
          }
        }
      } else {
        onDailogclose();
      }
    } catch (err) {
      console.log('error', err);
      if (err?.response?.data?.errors?.detail) {
        setAlertShow({ open: true, msg: err.response.data.errors.detail, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again!', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  const handleConfirmationClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setIsConfirmationOpen(false);
  };

  const handleModalClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setSpuriousItems([1]);
    setNonSpuriousItems([1]);
    setSpuriousReadOnlyData([]);
    setNonSpuriousReadOnlyData([]);
    setAcceptableItems([1]);
    setUnacceptableItems([1]);
    setAcceptableReadOnlyData([]);
    setUnacceptableReadOnlyData([]);
    setIsModalOpen({ spurious: false, detailsCorrect: false, unacceptable: false });
  };

  const handleUnacceptableChange = (value, index) => {
    if (isGoldVerification) {
      const updatedTableData = [...tableData];
      updatedTableData[index].is_unacceptable = value === 'Yes';
      updatedTableData[index].acceptable_findings = [];
      updatedTableData[index].unacceptable_findings = [];
      setTableData(updatedTableData);
    } else if (value === 'Yes') {
      setModalDataIndex(index);
      setIsModalOpen({ spurious: false, detailsCorrect: false, unacceptable: true });
    } else {
      const updatedTableData = [...tableData];
      updatedTableData[index].is_unacceptable = false;
      updatedTableData[index].acceptable_findings = [];
      updatedTableData[index].unacceptable_findings = [];
      setTableData(updatedTableData);
    }
  };

  const handleSpuriousChange = (value, index) => {
    if (isGoldVerification) {
      const updatedTableData = [...tableData];
      updatedTableData[index].is_spurious = value === 'Yes';
      updatedTableData[index].spurious_findings = [];
      updatedTableData[index].nonspurious_findings = [];
      setTableData(updatedTableData);
    } else if (value === 'Yes') {
      setModalDataIndex(index);
      setIsModalOpen({ spurious: true, detailsCorrect: false, unacceptable: false });
    } else {
      const updatedTableData = [...tableData];
      updatedTableData[index].is_spurious = false;
      updatedTableData[index].spurious_findings = [];
      updatedTableData[index].nonspurious_findings = [];
      setTableData(updatedTableData);
    }
  };

  const handleDetailsCorrectChange = (value, index) => {
    setValue(`stone_weight_gm_${index}`, null);
    if (value === 'No') {
      setModalDataIndex(index);
      setIsModalOpen({ spurious: false, detailsCorrect: true, unacceptable: false });
    } else {
      const updatedTableData = [...tableData];
      updatedTableData[index].are_details_incorrect = false;
      updatedTableData[index].auditor_findings = {};
      setTableData(updatedTableData);
    }
  };

  const handleSpuriousDetailView = (data) => {
    const spuriousData = [];
    data.spurious_findings.map((item) => spuriousData.push({
      name: data.name,
      item_count: item.item_count,
      total_weight_gm: item.total_weight_gm,
      remarks: item.remarks,
      bentex: item?.bentex
    }));
    const nonSpuriousData = [];
    data.nonspurious_findings.map((item) => nonSpuriousData.push({
      name: data.name,
      item_count: item.item_count,
      total_weight_gm: item.total_weight_gm,
      stone_weight_gm: item.stone_weight_gm,
      purity: item.purity,
      remarks: item.remarks,
    }));
    setNonSpuriousReadOnlyData(nonSpuriousData);
    setSpuriousReadOnlyData(spuriousData);
  };

  const handleUnacceptableDetailView = (data) => {
    const unacceptableData = [];
    data.unacceptable_findings.map((item) => unacceptableData.push({
      name: data.name,
      item_count: item.item_count,
      total_weight_gm: item.total_weight_gm,
      remarks: item.remarks
    }));
    const acceptableData = [];
    data.acceptable_findings.map((item) => acceptableData.push({
      name: data.name,
      item_count: item.item_count,
      total_weight_gm: item.total_weight_gm,
      stone_weight_gm: item.stone_weight_gm,
      purity: item.purity,
      remarks: item.remarks
    }));
    setAcceptableReadOnlyData(acceptableData);
    setUnacceptableReadOnlyData(unacceptableData);
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  const modalComponentHandler = (modalState) => {
    if (modalState.detailsCorrect) {
      return (
        <DetailsCorrectModal
          areDetailsSubmitHandler={areDetailsSubmitHandler}
          data={tableData[modalDataIndex]}
          source={rowData?.source}
        />
      );
    }

    if (modalState.spurious) {
      return (
        <SpuriousModal
          spuriousItems={spuriousItems}
          setSpuriousItems={setSpuriousItems}
          nonSpuriousItems={nonSpuriousItems}
          setNonSpuriousItems={setNonSpuriousItems}
          data={tableData[modalDataIndex]}
          spuriousSubmitHandler={spuriousSubmitHandler}
        />
      );
    }

    if (modalState.unacceptable) {
      return (
        <UnacceptableModal
          acceptableItems={acceptableItems}
          setAcceptableItems={setAcceptableItems}
          unacceptableItems={unacceptableItems}
          setUnacceptableItems={setUnacceptableItems}
          data={tableData[modalDataIndex]}
          unacceptableSubmitHandler={unacceptableSubmitHandler}
        />
      );
    }
  };

  const modalTitleHandler = (modalState) => {
    if (modalState.detailsCorrect) {
      return (
        'Are details correct?'
      );
    }

    if (modalState.spurious) {
      return 'Spurious (Below 18K)?';
    }

    if (modalState.unacceptable) {
      return 'Unacceptable Items ?';
    }
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <Grid container display='flex' padding='10px 0px'>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='customerId'
            label='Customer ID'
            value={rowData?.customerId}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='applicationNo'
            label='LAN'
            value={rowData?.applicationNo}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='firstName'
            label='First Name'
            value={rowData?.firstName}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='lastName'
            label='Last Name'
            value={rowData?.lastName}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='branchId'
            label='Branch ID'
            value={rowData?.branchId}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='goldPouchNumber'
            label='Gold Pouch Number'
            value={rowData?.goldPouchNumber}
            disabled
          />
        </Grid>
        { rowData?.auditType === 'Full Audit'
          ? (
            <>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='tareWeight'
                  label='Branch Tare Weight'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  value={rowData?.tareWeight}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='lastaudittareWeight'
                  label='Last Audit Tare Weight'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  value={rowData?.last_audit_tare_weight ? rowData.last_audit_tare_weight : rowData?.tareWeight}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='lastauditgoldPouch'
                  label='Last Audit Gold Pouch Number'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  value={rowData?.last_audit_gold_pouch_number ? rowData.last_audit_gold_pouch_number : rowData?.goldPouchNumber}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='twDiff_audit_current'
                  label='Difference in Current Audit Tare Weight and Branch Tare Weight'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                  defaultValue=''
                  {...register('twDiff_audit_current', {
                  })}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='twDiff_branch_current'
                  label='Difference in Current Audit Tare Weight and Last Audit Tare Weight'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                  defaultValue=''
                  {...register('twDiff_branch_current', {
                  })}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} display='flex' alignItems='center' padding='10px'>
                <CustomText>Consolidated Collateral Photo</CustomText>
                <a
                  href={`/file-viewer?path=${btoa(rowData?.consolidated_collateral_pic)}&source=${btoa(rowData.source)}`}
                  target='_blank'
                  rel='noreferrer'
                  style={{ color: '#502A74' }}
                >
                  View
                </a>
              </Grid>
            </>
          )
          : null}
        { rowData?.auditType === 'Gold Verification'
          ? (
            <>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='tareWeight'
                  label='Branch Tare Weight'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  value={rowData?.tareWeight}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='lastaudittareWeight'
                  label='Last Audit Tare Weight'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  value={rowData?.last_audit_tare_weight ? rowData.last_audit_tare_weight : rowData?.tareWeight}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='lastauditgoldPouch'
                  label='Last Audit Gold Pouch Number'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  value={rowData?.last_audit_gold_pouch_number ? rowData.last_audit_gold_pouch_number : rowData?.goldPouchNumber}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='twDiff_audit_current'
                  label='Difference in Current Audit Tare Weight and Branch Tare Weight'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                  defaultValue=''
                  {...register('twDiff_audit_current', {
                  })}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='twDiff_branch_current'
                  label='Difference in Current Audit Tare Weight and Last Audit Tare Weight'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                  defaultValue=''
                  {...register('twDiff_branch_current', {
                  })}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} display='flex' alignItems='center' padding='10px'>
                <CustomText>Consolidated Collateral Photo</CustomText>
                <a
                  href={`/file-viewer?path=${btoa(rowData?.consolidated_collateral_pic)}&source=${btoa(rowData.source)}`}
                  target='_blank'
                  rel='noreferrer'
                  style={{ color: '#502A74' }}
                >
                  View
                </a>
              </Grid>
            </>
          )
          : null}
      </Grid>
      <form onSubmit={handleSubmit(formHandler)}>
        {
          rowData?.auditType === 'TARE Weight Audit' ? (
            <Grid container>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='lastaudittareWeight'
                  label='Last Audit Tare Weight'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  value={rowData?.last_audit_tare_weight ? rowData.last_audit_tare_weight : rowData?.tareWeight}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='lastauditgoldPouch'
                  label='Last Audit Gold Pouch Number'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  value={rowData?.last_audit_gold_pouch_number ? rowData.last_audit_gold_pouch_number : rowData?.goldPouchNumber}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id='twDiff_audit_current'
                  label='Tare Weight Difference b/w Last audited and Current Value'
                  InputLabelProps={{
                    shrink: true
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  defaultValue=''
                  {...register('twDiff_audit_current', {
                  })}
                  disabled
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  label='Remarks*'
                  multiline
                  maxRows={3}
                  {...register('remarks', {
                    onChange: (e) => {
                      if (e.target.value.trim().length) {
                        setValue('remarks', e.target.value, { shouldValidate: true });
                      } else {
                        setValue('remarks', null, { shouldValidate: true });
                      }
                    },
                    required: 'Please enter Remarks',
                    maxLength: { value: 50, message: 'Maximum 50 characters allowed' }
                  })}
                />
                {renderError('remarks')}
              </Grid>
              <Grid item xs={12} sm={5} md={4} lg={3} xl={3} padding='0px 20px 20px 20px'>
                <TextFieldStyled
                  label='Is Gold Pouch Number Correct?'
                  select
                  {...register('is_gold_pouch_number_correct', {
                    onChange: (e) => {
                      setAdditionalFieldInfo({
                        ...additionalFieldInfo,
                        isGoldPouchNoCorrect: e.target.value === 'yes'
                      });
                      setValue('is_gold_pouch_number_correct', e.target.value, { shouldValidate: true });
                      setValue('gold_pouch_number', null);
                    },
                    required: 'Please select Is Gold Pouch Number Correct?'
                  })}
                >
                  <SelectMenuStyle key='yes' value='yes'>Yes</SelectMenuStyle>
                  <SelectMenuStyle key='no' value='no'>No</SelectMenuStyle>
                </TextFieldStyled>
                {renderError('is_gold_pouch_number_correct')}
              </Grid>
              {
                getValues('is_gold_pouch_number_correct') === 'yes'
                  ? (
                    <Grid item xl={4} lg={4} md={4} sm={12} xs={12} padding='0px 20px 20px 20px'>
                      <TextFieldStyled
                        placeholder='TARE Weight'
                        label='Tare Weight'
                        InputProps={{
                          endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                        }}
                        {...register('tare_weight', {
                          onChange: (e) => {
                            const lastAuditValue = rowData?.last_audit_tare_weight ? rowData.last_audit_tare_weight : rowData?.tareWeight;
                            const isValid = REGEX.TWODIGITDECIMAL.test(e.target.value);
                            let updatedValue = '';
                            if (isValid) {
                              updatedValue = parseFloat(e.target.value) - lastAuditValue;
                              updatedValue = parseFloat(updatedValue).toFixed(2);
                            }
                            setValue('twDiff_audit_current', updatedValue);
                            setValue('tare_weight', e.target.value, { shouldValidate: true });
                          },
                          required: 'Please enter TARE Weight',
                          min: { value: minRequiredTareWeight + 0.00000000001, message: `TARE Weight should be greater than ${minRequiredTareWeight}` },
                          pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' }
                        })}
                      />
                      {renderError('tare_weight')}
                    </Grid>
                  ) : null
              }
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} display='flex' alignItems='center' padding='0px 20px 20px 20px'>
                <CustomText2>Consolidated Collateral Photo</CustomText2>
                <a
                  href={`/file-viewer?path=${btoa(rowData?.consolidated_collateral_pic)}&source=${btoa(rowData.source)}`}
                  target='_blank'
                  rel='noreferrer'
                  style={{ color: '#502A74' }}
                >
                  View
                </a>
              </Grid>
            </Grid>
          ) : null
        }
        {
          (rowData?.auditType === 'Full Audit' || rowData?.auditType === 'Gold Verification' || (rowData?.auditType === 'TARE Weight Audit' && !additionalFieldInfo.isTareWeightCorrect)) && (
            <Grid continer display='flex' xs={12}>
              <TableWrapper width={['xs', 'sm'].includes(screen) ? '95%' : '100%'} screen={screen}>
                <CustomTable>
                  <TableHead>
                    <TableRow>
                      <TableCell width='5%'>Sr. No.</TableCell>
                      <TableCell width='15%' align='center'>Item Name</TableCell>
                      <TableCell width='6%' align='center'>Count</TableCell>
                      <TableCell width='8%' align='center'>Collateral Photo</TableCell>
                      <TableCell width='10%' align='center'>Branch Total Weight (in gm)</TableCell>
                      <TableCell width='10%' align='center'>Auditor Total Weight (in gm)</TableCell>
                      <TableCell width='8%' align='center'>Are details correct?</TableCell>
                      <TableCell width='8%' align='center'>Low Purity</TableCell>
                      {
                        !isGoldVerification ? <TableCell width='8%' align='center'>Unacceptable Items?</TableCell> : null
                      }
                      {
                        // eslint-disable-next-line no-nested-ternary
                        isGoldVerification ? (
                          <TableCell width='18%' align='center'>Remarks*</TableCell>
                        ) : (!tableData.every((item) => item.is_spurious)
                          ? (
                            <>
                              <TableCell width='12%' align='center'>Beads/Stone Weight*</TableCell>
                              <TableCell width='10%' align='center'>Purity*</TableCell>
                              <TableCell width='18%' align='center'>Remarks*</TableCell>
                            </>
                          ) : null
                        )
                      }
                      {
                        tableData.some((item) => item.is_spurious) && !isGoldVerification
                          ? <TableCell width='8%' align='center'>Spurious Details</TableCell> : null
                      }
                      {
                        tableData.some((item) => item.is_unacceptable) && !isGoldVerification
                          ? <TableCell width='8%' align='center'>Unacceptable Details</TableCell> : null
                      }
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((item, index) => (
                      <TableRow>
                        <TableCell align='center'>{index + 1}</TableCell>
                        <TableCell align='center'>{item?.name}</TableCell>
                        <TableCell align='center'>
                          <CenterContainer>
                            { item?.are_details_incorrect ? item?.auditor_findings?.item_count : item?.item_count}
                            {
                              item?.are_details_incorrect ? (
                                <HtmlTooltip
                                  title={(
                                    <Typography color='inherit'>
                                      Original Count :
                                      {' '}
                                      {item?.item_count}
                                    </Typography>
                                  )}
                                  open={index === toolTipCount}
                                >
                                  <CustomInfoIcon
                                    onClick={() => setToolTipCount(index)}
                                    onMouseOver={() => setToolTipCount(index)}
                                    onMouseOut={() => setToolTipCount(null)}
                                  />
                                </HtmlTooltip>
                              ) : null
                            }
                          </CenterContainer>
                        </TableCell>
                        <TableCell align='center'>
                          {
                            item?.item_pic ? (
                              <a
                                href={`/file-viewer?path=${btoa(item?.item_pic)}&source=${btoa(rowData.source)}`}
                                target='_blank'
                                rel='noreferrer'
                                style={{ color: '#502A74' }}
                              >
                                View
                              </a>
                            ) : 'NA'
                          }
                        </TableCell>
                        <TableCell align='center'>
                          <CenterContainer>
                            {/* {item?.are_details_incorrect ? item?.auditor_findings?.total_weight_gm : item?.total_weight_gm} */}
                            {item.total_weight_gm}
                            {/* {
                              item?.are_details_incorrect ? (
                                <HtmlTooltip
                                  title={(
                                    <Typography color='inherit'>
                                      Original Total Weight :
                                      {' '}
                                      {item?.total_weight_gm}
                                    </Typography>
                                  )}
                                  open={index === toolTipWeight}
                                >
                                  <CustomInfoIcon
                                    onClick={() => setToolTipWeight(index)}
                                    onMouseOver={() => setToolTipWeight(index)}
                                    onMouseOut={() => setToolTipWeight(null)}
                                  />
                                </HtmlTooltip>
                              ) : null
                            } */}
                          </CenterContainer>
                        </TableCell>
                        <TableCell align='center'>
                          <CenterContainer>
                            {item?.are_details_incorrect ? item?.auditor_findings?.total_weight_gm : item?.total_weight_gm}
                            {/* {
                              item?.are_details_incorrect ? (
                                <HtmlTooltip
                                  title={(
                                    <Typography color='inherit'>
                                      Original Total Weight :
                                      {' '}
                                      {item?.total_weight_gm}
                                    </Typography>
                                  )}
                                  open={index === toolTipWeight}
                                >
                                  <CustomInfoIcon
                                    onClick={() => setToolTipWeight(index)}
                                    onMouseOver={() => setToolTipWeight(index)}
                                    onMouseOut={() => setToolTipWeight(null)}
                                  />
                                </HtmlTooltip>
                              ) : null
                            } */}
                          </CenterContainer>
                        </TableCell>
                        <TableCell>
                          <TextFieldStyled
                            value={item?.are_details_incorrect ? 'No' : 'Yes'}
                            select
                          >
                            <SelectMenuStyle key='Yes' value='Yes' onClick={() => handleDetailsCorrectChange('Yes', index)}>Yes</SelectMenuStyle>
                            <SelectMenuStyle key='No' value='No' onClick={() => handleDetailsCorrectChange('No', index)}>No</SelectMenuStyle>
                          </TextFieldStyled>
                        </TableCell>
                        <TableCell>
                          <TextFieldStyled
                            value={item?.is_spurious ? 'Yes' : 'No'}
                            select
                          >
                            <SelectMenuStyle key='Yes' value='Yes' onClick={() => handleSpuriousChange('Yes', index)}>Yes</SelectMenuStyle>
                            <SelectMenuStyle key='No' value='No' onClick={() => handleSpuriousChange('No', index)}>No</SelectMenuStyle>
                          </TextFieldStyled>
                        </TableCell>
                        {
                          !isGoldVerification ? (
                            <TableCell>
                              <TextFieldStyled
                                value={item?.is_unacceptable ? 'Yes' : 'No'}
                                select
                                onChange={(e) => handleUnacceptableChange(e.target.value, index)}
                              >
                                <SelectMenuStyle key='Yes' value='Yes' onClick={() => handleUnacceptableChange('Yes', index)}>Yes</SelectMenuStyle>
                                <SelectMenuStyle key='No' value='No' onClick={() => handleUnacceptableChange('No', index)}>No</SelectMenuStyle>
                              </TextFieldStyled>
                            </TableCell>
                          ) : null
                        }

                        {
                          !tableData.every((ele) => ele.is_spurious) || isGoldVerification ? (
                            <>

                              {
                                !isGoldVerification ? (
                                  <TableCell>
                                    <TextFieldStyled
                                      placeholder='Beads/Stone Weight'
                                      disabled={item.is_spurious}
                                      InputProps={{
                                        endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                                      }}
                                      {...register(`stone_weight_gm_${index}`, {
                                        onChange: (e) => {
                                          let { value } = e.target;
                                          value = value.replace(/[^0-9."]/g, '');
                                          const valueArray = value.split('.');
                                          if (valueArray.length > 1 && valueArray[1].length) {
                                            value = `${valueArray[0]}.${valueArray[1].substring(0, 2)}`;
                                          }
                                          if (item?.are_details_incorrect) {
                                            if (value >= item?.auditor_findings?.total_weight_gm) {
                                              setValue(`stone_weight_gm_${index}`, value.substring(0, value.length - 1), { shouldValidate: true });
                                              alert('Beads/Stone weight can not be greater than or equal to total weight.');
                                              return;
                                            }
                                            setValue(`stone_weight_gm_${index}`, value, { shouldValidate: true });
                                            return;
                                          }
                                          if (value >= item?.total_weight_gm) {
                                            setValue(`stone_weight_gm_${index}`, value.substring(0, value.length - 1), { shouldValidate: true });
                                            alert('Beads/Stone weight can not be greater than or equal to total weight.');
                                            return;
                                          }
                                          setValue(`stone_weight_gm_${index}`, value, { shouldValidate: true });
                                        },
                                        required: !item?.is_spurious,
                                        pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' }
                                      })}
                                      error={!item?.is_spurious && errors?.[`stone_weight_gm_${index}`]}
                                    />
                                  </TableCell>
                                ) : null
                              }
                              {
                                !isGoldVerification ? (
                                  <TableCell>
                                    <TextFieldStyled
                                      label='Select'
                                      disabled={item?.is_spurious}
                                      isDisabled={item?.is_spurious}
                                      {...register(`purity_${index}`, {
                                        onChange: (e) => setValue(`purity_${index}`, e.target.value, { shouldValidate: true }),
                                        required: !item?.is_spurious
                                      })}
                                      error={!item?.is_spurious && errors?.[`purity_${index}`]}
                                      width={['xs', 'sm'].includes(screen) ? '100px' : ''}
                                      select
                                    >
                                      {purityOptionArray.map((option) => (
                                        <SelectMenuStyle
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </SelectMenuStyle>
                                      ))}
                                    </TextFieldStyled>
                                  </TableCell>
                                ) : null
                              }
                              <TableCell>
                                <TextFieldStyled
                                  placeholder='Remark'
                                  multiline
                                  maxRows={3}
                                  disabled={item?.is_spurious && !isGoldVerification}
                                  {...register(`remarks_${index}`, {
                                    onChange: (e) => {
                                      if (e.target.value.trim().length) {
                                        setValue(`remarks_${index}`, e.target.value, { shouldValidate: true });
                                      } else {
                                        setValue(`remarks_${index}`, null, { shouldValidate: true });
                                      }
                                    },
                                    required: !item?.is_spurious
                                  })}
                                  error={!item?.is_spurious && errors?.[`remarks_${index}`]}
                                />
                              </TableCell>
                            </>
                          ) : null
                        }
                        {
                        tableData.some((ele) => ele?.is_spurious) && !isGoldVerification
                          ? (
                            <TableCell align='center'>
                              {
                            item.is_spurious ? <ButtonPrimary onClick={() => handleSpuriousDetailView(item)}>View</ButtonPrimary> : 'NA'
                          }
                            </TableCell>
                          ) : null
                      }
                        {
                        tableData.some((ele) => ele?.is_unacceptable) && !isGoldVerification
                          ? (
                            <TableCell align='center'>
                              {
                            item.is_unacceptable ? <ButtonPrimary onClick={() => handleUnacceptableDetailView(item)}>View</ButtonPrimary> : 'NA'
                          }
                            </TableCell>
                          ) : null
                      }
                      </TableRow>
                    ))}
                  </TableBody>
                </CustomTable>
              </TableWrapper>
            </Grid>
          )
        }
        <Grid container>
          {
            rowData?.auditType === 'Full Audit' || rowData?.auditType === 'Gold Verification' ? (
              <>
                <Grid item xs={12} sm={5} md={4} lg={3} xl={3} padding='10px 20px'>
                  <TextFieldStyled
                    label='Is TARE Weight Correct?'
                    select
                    {...register('is_tare_weight_correct', {
                      onChange: (e) => {
                        setAdditionalFieldInfo({
                          ...additionalFieldInfo,
                          isTareWeightCorrect: e.target.value === 'yes'
                        });
                        setValue('is_tare_weight_correct', e.target.value, { shouldValidate: true });
                        setValue('tare_weight', null);
                      },
                      required: 'Please select Is TARE Weight Correct?'
                    })}
                  >
                    <SelectMenuStyle key='yes' value='yes'>Yes</SelectMenuStyle>
                    <SelectMenuStyle key='no' value='no'>No</SelectMenuStyle>
                  </TextFieldStyled>
                  {renderError('is_tare_weight_correct')}
                </Grid>
                {
                !additionalFieldInfo.isTareWeightCorrect && (
                <Grid item xs={12} sm={5} md={4} lg={2} xl={2} padding='10px 20px'>
                  <TextFieldStyled
                    placeholder='Current Tare Weight'
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                    }}
                    {...register('tare_weight', {
                      onChange: (e) => {
                        const isValid = REGEX.TWODIGITDECIMAL.test(e.target.value);
                        let branchWeightDiff = '';
                        let lastAuditWeightDiff = '';

                        if (isValid) {
                          branchWeightDiff = parseFloat(e.target.value) - rowData.tareWeight;
                          branchWeightDiff = parseFloat(branchWeightDiff).toFixed(2);
                          if (rowData.last_audit_tare_weight) {
                            lastAuditWeightDiff = parseFloat(e.target.value) - rowData.last_audit_tare_weight;
                            lastAuditWeightDiff = parseFloat(lastAuditWeightDiff).toFixed(2);
                          } else {
                            lastAuditWeightDiff = branchWeightDiff;
                          }
                        }
                        setValue('twDiff_audit_current', branchWeightDiff);
                        setValue('twDiff_branch_current', lastAuditWeightDiff);
                        setValue('tare_weight', e.target.value, { shouldValidate: true });
                      },
                      required: 'Please enter Current Tare Weight',
                      min: { value: minRequiredTareWeight + 0.00000000001, message: `TARE Weight should be greater than ${minRequiredTareWeight}` },
                      pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' }
                    })}
                  />
                    {renderError('tare_weight')}
                </Grid>
                )
              }
              </>
            ) : null
          }
          {
            (rowData?.auditType === 'Full Audit' || rowData?.auditType === 'Gold Verification' || (rowData?.auditType === 'TARE Weight Audit' && !additionalFieldInfo.isTareWeightCorrect)) && (
            <>
              <Grid item xs={12} sm={5} md={4} lg={3} xl={3} padding='10px 20px'>
                <TextFieldStyled
                  label='Is Gold Pouch Number Correct?'
                  select
                  {...register('is_gold_pouch_number_correct', {
                    onChange: (e) => {
                      setAdditionalFieldInfo({
                        ...additionalFieldInfo,
                        isGoldPouchNoCorrect: e.target.value === 'yes'
                      });
                      setValue('is_gold_pouch_number_correct', e.target.value, { shouldValidate: true });
                      setValue('gold_pouch_number', null);
                    },
                    required: 'Please select Is Gold Pouch Number Correct?'
                  })}
                >
                  <SelectMenuStyle key='yes' value='yes'>Yes</SelectMenuStyle>
                  <SelectMenuStyle key='no' value='no'>No</SelectMenuStyle>
                </TextFieldStyled>
                {renderError('is_gold_pouch_number_correct')}
              </Grid>
              {
                !additionalFieldInfo.isGoldPouchNoCorrect && (
                <Grid item xs={12} sm={5} md={4} lg={2} xl={2} padding='10px 20px'>
                  <TextFieldStyled
                    placeholder='Gold Pouch Number'
                    {...register('gold_pouch_number', {
                      onChange: (e) => {
                        if (e.target.value.trim() === rowData?.goldPouchNumber || e.target.value.trim() === getValues('new_gold_pouch_number')) {
                          setError('gold_pouch_number', { type: 'custom', message: 'Gold Pouch Number already exist' }, { shouldFocus: true });
                          return;
                        }
                        setValue('gold_pouch_number', e.target.value.trim(), { shouldValidate: true });
                      },
                      required: 'Please enter Gold Pouch Number',
                      pattern: { value: rowData.colender === 'SHIVALIK' ? REGEX.SHIVALIKGOLDPOUCHNUMBER : REGEX.GOLDPOUCHNUMBER, message: 'Gold Pouch Number is invalid' }
                    })}
                  />
                    {renderError('gold_pouch_number')}
                </Grid>
                )
              }
              <Grid item xs={12} sm={5} md={4} lg={3} xl={3} padding='10px 20px'>
                <TextFieldStyled
                  label='New Gold Pouch Number after Re-Audit?'
                  select
                  {...register('new_gold_pouch_number_after_reaudit', {
                    onChange: (e) => {
                      setAdditionalFieldInfo({
                        ...additionalFieldInfo,
                        isReAudited: e.target.value === 'yes'
                      });
                      setValue('new_gold_pouch_number_after_reaudit', e.target.value, { shouldValidate: true });
                      setValue('new_gold_pouch_number', null);
                      setValue('new_tare_weight', null);
                    },
                    required: 'Please select New Gold Pouch Number after Re-Audit?'
                  })}
                >
                  <SelectMenuStyle key='yes' value='yes'>Yes</SelectMenuStyle>
                  <SelectMenuStyle key='no' value='no'>No</SelectMenuStyle>
                </TextFieldStyled>
                {renderError('new_gold_pouch_number_after_reaudit')}
              </Grid>
              { additionalFieldInfo.isReAudited
            && (
            <>
              <Grid item xs={12} sm={5} md={4} lg={2} xl={2} padding='5px 20px'>
                <TextFieldStyled
                  placeholder='New Gold Pouch Number'
                  {...register('new_gold_pouch_number', {
                    onChange: (e) => {
                      if (e.target.value.trim() === rowData?.goldPouchNumber || e.target.value.trim() === getValues('gold_pouch_number')) {
                        setError('new_gold_pouch_number', { type: 'custom', message: 'New Gold Pouch Number already exist' }, { shouldFocus: true });
                        return;
                      }
                      setValue('new_gold_pouch_number', e.target.value.trim(), { shouldValidate: true });
                    },
                    required: 'Please enter New Gold Pouch Number',
                    pattern: { value: rowData.colender === 'SHIVALIK' ? REGEX.SHIVALIKGOLDPOUCHNUMBER : REGEX.GOLDPOUCHNUMBER, message: 'New Gold Pouch Number is invalid' }
                  })}
                />
                {renderError('new_gold_pouch_number')}
              </Grid>
              <Grid item xs={12} sm={5} md={4} lg={2} xl={2} padding='5px 20px'>
                <TextFieldStyled
                  placeholder='New TARE Weight'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  {...register('new_tare_weight', {
                    onChange: (e) => setValue('new_tare_weight', e.target.value, { shouldValidate: true }),
                    required: 'Please enter New TARE Weight',
                    min: { value: minRequiredTareWeight + 0.00000000001, message: `New TARE Weight should be greater than ${minRequiredTareWeight}` },
                    pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' }
                  })}
                />
                {renderError('new_tare_weight')}
              </Grid>
            </>
            )}
              <Grid container>
                <Grid item xs={12} sm={5} md={4} lg={3} xl={3} padding='5px 20px'>
                  <TextFieldStyled
                    label='Consolidated Remarks*'
                    multiline
                    maxRows={3}
                    {...register('consolidated_remarks', {
                      onChange: (e) => {
                        if (e.target.value.trim().length) {
                          setValue('consolidated_remarks', e.target.value, { shouldValidate: true });
                        } else {
                          setValue('consolidated_remarks', null, { shouldValidate: true });
                        }
                      },
                      required: 'Please enter Consolidated Remarks',
                      maxLength: { value: 2000, message: 'Maximum 2000 characters allowed' }
                    })}
                  />
                  {renderError('consolidated_remarks')}
                </Grid>
              </Grid>
            </>
            )
          }
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} padding='10px 0px' display='flex' alignItems='center' justifyContent='center'>
          <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'onSubmit'} type='submit'>
            Submit
          </LoadingButtonPrimary>
          <LoadingButtonPrimary onClick={() => setIsConfirmationOpen({ onSubmit: false, onCancel: true })}>
            Cancel
          </LoadingButtonPrimary>
        </Grid>
      </form>
      <DialogBox
        isOpen={isModalOpen.detailsCorrect || isModalOpen.spurious || isModalOpen.unacceptable}
        title={modalTitleHandler(isModalOpen)}
        width={['xs'].includes(screen) ? '100%' : '60%'}
        padding='10px'
        handleClose={handleModalClose}
      >
        { modalComponentHandler(isModalOpen)}
      </DialogBox>
      <DialogBox
        isOpen={spuriousReadOnlyData.length || nonSpuriousReadOnlyData.length}
        title='Spurious Details'
        width={['xs'].includes(screen) ? '100%' : '60%'}
        padding='10px'
        handleClose={handleModalClose}
      >
        { spuriousReadOnlyData.length ? <CustomText>Spurious</CustomText> : null }
        {spuriousReadOnlyData.map((item) => spuriousReadOnlyFormFields(item))}
        { nonSpuriousReadOnlyData.length ? <CustomText>Non Spurious</CustomText> : null }
        {nonSpuriousReadOnlyData.map((item) => nonSpuriousReadOnlyFormFields(item))}
      </DialogBox>
      <DialogBox
        isOpen={unacceptableReadOnlyData.length || acceptableReadOnlyData.length}
        title='Unacceptable Details'
        width={['xs'].includes(screen) ? '100%' : '60%'}
        padding='10px'
        handleClose={handleModalClose}
      >
        { unacceptableReadOnlyData.length ? <CustomText>Unacceptable</CustomText> : null }
        {unacceptableReadOnlyData.map((item) => unacceptableReadOnlyFormFields(item))}
        { acceptableReadOnlyData.length ? <CustomText>Acceptable</CustomText> : null }
        {acceptableReadOnlyData.map((item) => acceptableReadOnlyFormFields(item))}
      </DialogBox>
      <DialogBox
        isOpen={isConfirmationOpen.onSubmit || isConfirmationOpen.onCancel}
        title=''
        handleClose={handleConfirmationClose}
        width='auto'
        padding='40px'
      >
        <DialogContentText>
          {
                isConfirmationOpen.onSubmit ? 'Are you sure you want to submit the Audit information?'
                  : 'Are you sure you want to cancel the Audit information?'
            }
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <LoadingButtonSecondaryPrimary
            onClick={finalSubmitHandler}
            variant='contained'
            loading={false}
          >
            Yes
          </LoadingButtonSecondaryPrimary>
          <ButtonPrimary onClick={handleConfirmationClose}>No</ButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};
export default AuditorPage;
