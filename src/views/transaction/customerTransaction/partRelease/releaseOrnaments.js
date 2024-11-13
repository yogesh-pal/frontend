/* eslint-disable max-len */
import _ from 'lodash';
import Decimal from 'decimal.js';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import React, { useEffect, useRef, useState } from 'react';
import {
  Grid, TableHead, TableRow, TableCell, TableBody, DialogContentText, FormHelperText, InputAdornment
} from '@mui/material';
import { REGEX, MODULE, SENDOTPINTERVALSPOLLING } from '../../../../constants';
import { Service } from '../../../../service';
import { LivePhoto, ToastMessage, DialogBox } from '../../../../components';
import { useScreenSize } from '../../../../customHooks';
import {
  TextFieldStyled, ButtonPrimary, LoadingButtonPrimary, SelectMenuStyle, FullSizeButton,
  CenterContainerStyled, HeadingMaster
} from '../../../../components/styledComponents';
import {
  CustomTable2, CustomTextStyle, HeadingMaster2, CustomGrid, extractValidateApiErrors, collateralPurityEnum
} from '../../helper';

const TableWrapper = styled('div')(({ width, screen }) => ({
  padding: ['xs', 'sm'].includes(screen) ? '0px' : '0px 20px 20px',
  margin: ['xs', 'sm'].includes(screen) ? '0px 20px 0px 20px' : '0px',
  overflow: 'auto',
  width
}));

const initialConfirmState = {
  onSuccess: false, onFailure: false
};

const amountFormat = Intl.NumberFormat('en-IN');

const ReleaseOrnaments = (props) => {
  const OTPSENDVIACALL = 'onOTPSendViaCall';
  const OTPSENDVIASMS = 'onOTPSendViaSms';
  const OTPSENDVIAWHATSAPP = 'onOTPSendViaWhatsapp';

  const [timer, setTimer] = useState(0);
  const [activeOtp, setActiveOtp] = useState(null);
  const [disableButton, setDisableButton] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [maxTareWeight, setMaxTareWeight] = useState(null);
  const [intervalAddress, setIntervalAddress] = useState(null);
  const [onValidate, setOnValidate] = useState(initialConfirmState);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [isEligibleToValidate, setIsEligibleToValidate] = useState(false);
  const [isOTPSendSuccessfully, setIsOTPSendSuccessfully] = useState(false);
  const [isValidatedSuccessfully, setIsValidatedSuccessfully] = useState(false);
  const screen = useScreenSize();
  const { loanInfo, closeOnSuccess } = props;
  const { PARTRELEASE } = MODULE;
  const intervalRef = useRef(null);

  const {
    register, unregister, formState: { errors }, setValue, getValues, trigger, reset
  } = useForm();

  const calculatePercentage = (percent, total) => Number(new Decimal((percent / 100) * total).toFixed(2));

  useEffect(() => {
    loanInfo.ornaments.map((item) => {
      const dust = calculatePercentage(1, (item.total_weight_gm - item.stone_weight_gm));
      item.dust = dust;
      item.valuation = Math.floor(Number(new Decimal(loanInfo.appliedRPG * item.net_weight_gm).toFixed(2)));
      return null;
    });
    setTableData(_.cloneDeep(loanInfo.ornaments));
    return () => clearInterval(intervalAddress);
  }, []);

  const saveHandler = async (index) => {
    const fieldsToValidate = [`new_count_${index}`, `new_total_weight_${index}`, `new_stone_weight_${index}`, `ornament_photo_${index}`];
    const result = await trigger(fieldsToValidate);
    if (result) {
      const updatedTableData = [...tableData];
      const newCount = Number(getValues(`new_count_${index}`));
      const newTotalWeight = Number(getValues(`new_total_weight_${index}`));
      const newStoneWeight = Number(getValues(`new_stone_weight_${index}`));
      const newItemArray = updatedTableData.filter((item, ind) => ind !== index);
      if (newCount === 0 && newItemArray.every((item) => item?.item_count === 0)) {
        alert('Item count should be greater then 0.');
        return;
      }
      if ((newCount === 0) && (newTotalWeight > 0 || newStoneWeight > 0)) {
        alert('If count of ornament is 0, then Total Weight or Beads/Stone Weight has to be 0.');
        return;
      }
      if ((newTotalWeight === 0) && (newCount > 0 || newStoneWeight > 0)) {
        alert('If total weight is 0, then Count of Ornaments or Beads/Stone Weight has to be 0.');
        return;
      }
      updatedTableData[index].item_count = newCount;
      updatedTableData[index].ornament_photo = getValues(`ornament_photo_${index}`);
      const newDust = calculatePercentage(1, (newTotalWeight - newStoneWeight));
      const newNetWeight = Number(new Decimal((newTotalWeight - newStoneWeight - newDust) * (collateralPurityEnum[updatedTableData[index].purity] / 22)).toFixed(2));
      updatedTableData[index].dust = newDust;
      updatedTableData[index].net_weight_gm = newNetWeight;
      updatedTableData[index].total_weight_gm = newTotalWeight;
      updatedTableData[index].stone_weight_gm = newStoneWeight;
      updatedTableData[index].valuation = Math.floor(Number(new Decimal(newNetWeight * loanInfo.appliedRPG).toFixed(2)));
      updatedTableData[index].isEditModeOn = !updatedTableData[index].isEditModeOn;
      unregister(fieldsToValidate);
      setIsValidatedSuccessfully(false);
      setTableData(updatedTableData);
      setIsEligibleToValidate(true);
    }
  };

  const handleAction = (index) => {
    const updatedTableData = [...tableData];
    if (updatedTableData[index].isEditModeOn) {
      saveHandler(index);
      return;
    }
    updatedTableData[index].isEditModeOn = !updatedTableData[index].isEditModeOn;
    setTableData(updatedTableData);
  };

  const handleReset = () => {
    const dataToSet = _.cloneDeep(loanInfo.ornaments);
    reset();
    setTableData(dataToSet);
    setIsOTPSendSuccessfully(false);
    setIsValidatedSuccessfully(false);
    setIsConfirmed(false);
    setIsEligibleToValidate(false);
  };

  const itemsToSend = () => {
    const collateralDetails = [];
    tableData.forEach((ele, index) => {
      if (ele.item_count !== loanInfo.ornaments[index].item_count) {
        collateralDetails.push({
          dust_weight_gm: ele?.dust,
          name: ele?.name,
          item_count: ele?.item_count,
          valuation_amount: ele?.valuation,
          applied_rpg: loanInfo.appliedRPG,
          net_weight_gm: ele?.net_weight_gm,
          stone_weight_gm: ele?.stone_weight_gm,
          total_weight_gm: ele?.total_weight_gm,
          purity: collateralPurityEnum[ele?.purity]
        });
      }
    });
    return collateralDetails;
  };

  const validatePartRelease = async () => {
    try {
      const newValuation = Math.floor(Number(tableData.reduce((accumulator, currentValue) => accumulator + currentValue.valuation, 0)));
      if (newValuation >= loanInfo.totalDues) {
        setLoading({ loader: true, name: 'onValidatePartRelease' });
        const collateralItems = itemsToSend();
        const requestBody = {
          loan_account_no: loanInfo.loan_account_no,
          new_valuation: newValuation,
          collateral_items: collateralItems,
          dt: loanInfo?.loanToken
        };
        const { data } = await Service.post(`${process.env.REACT_APP_PART_RELEASE_SERVICE}/part_release/v2/validate`, requestBody);
        if (data?.message?.is_validated) {
          setOnValidate({ ...initialConfirmState, onSuccess: true });
          setIsValidatedSuccessfully(true);
          const totalNetWeight = tableData.reduce((accumulator, currentValue) => accumulator + currentValue.total_weight_gm, 0);
          setMaxTareWeight(totalNetWeight);
        } else {
          setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
        }
      } else {
        setOnValidate({ ...initialConfirmState, onFailure: true });
      }
    } catch (err) {
      console.log('err', err);
      const collateralItems = itemsToSend();
      const msg = extractValidateApiErrors(err.response?.data?.data, collateralItems);
      if (msg) {
        setAlertShow({ open: true, msg, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };
  const otpTypeMapping = {
    [OTPSENDVIACALL]: 'CALL',
    [OTPSENDVIASMS]: 'SMS',
    [OTPSENDVIAWHATSAPP]: 'WHATSAPP'
  };

  const recursivePoll = async (currentInterval, id) => {
    try {
      const pollingOtpRes = await Service.get(`${process.env.REACT_APP_LOS_OTP_SERVICE}/audit_log?otp_audit_log_id=${id}`);
      if (currentInterval >= SENDOTPINTERVALSPOLLING.length) {
        setAlertShow({ open: true, msg: 'Please try again after some time.', alertType: 'error' });
        return;
      }

      if (pollingOtpRes.data.status === 1) {
        if (pollingOtpRes.data.data.otp_status === 'FAILED') {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setTimer(0);
          setActiveOtp(null);
          setLoading((pre) => ({ ...pre, isEnableWhatsapp: true, loader: false }));
          setAlertShow({ open: true, msg: 'Unable to send OTP. Please try again later.', alertType: 'error' });
          return;
        }
        if (pollingOtpRes.data.data.otp_status === 'PENDING') {
          setTimeout(() => {
            recursivePoll(currentInterval + 1, id);
          }, SENDOTPINTERVALSPOLLING[currentInterval]);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Something went wrong.';
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
    }
  };

  const handleSendOTP = async (typeofOtp) => {
    try {
      const result = await trigger(['revised_tare_weight', 'is_new_packet_id', 'new_packet_id', 'customer_photo', 'consolidated_collateral_photo']);
      if (result) {
        if (timer) {
          return;
        }
        setLoading({ loader: true, name: typeofOtp });
        setActiveOtp(typeofOtp);
        const collateralItems = itemsToSend();
        const requestBody = {
          loan_account_no: loanInfo.loan_account_no,
          otp_type: otpTypeMapping[typeofOtp],
          collateral_items: collateralItems,
          new_valuation: Math.floor(tableData.reduce((accumulator, currentValue) => accumulator + currentValue.valuation, 0)),
          revised_tare_weight_gold_pouch: Number(getValues('revised_tare_weight')),
          consolidated_items_pic: getValues('consolidated_collateral_photo'),
          dt: loanInfo?.loanToken
        };
        if (getValues('new_packet_id')) {
          requestBody.new_gold_pouch_number = getValues('new_packet_id');
        }
        const { data } = await Service.post(`${process.env.REACT_APP_PART_RELEASE_SERVICE}/part_release/v2/send_otp`, requestBody);
        if (data.status === 1) {
          setTimer(1);
          intervalRef.current = setInterval(() => setTimer((pre) => (pre + 1)), 1000);
          setIntervalAddress(intervalRef.current);
          setIsOTPSendSuccessfully(true);

          const id = data.otp_audit_log_id;
          setTimeout(() => {
            recursivePoll(1, id);
          }, SENDOTPINTERVALSPOLLING[0]);
        } else {
          console.log('in else');
          setDisableButton(false);
          setAlertShow({ open: true, msg: 'Invalid mobile number.', alertType: 'error' });
        }
      }
    } catch (err) {
      console.log('err', err);
      setActiveOtp(null);
      setDisableButton(false);
      if (err?.response?.data?.errors?.lan_details) {
        setAlertShow({ open: true, msg: err.response.data.errors.lan_details, alertType: 'error' });
      } else if (err?.response?.data?.application_no) {
        setAlertShow({ open: true, msg: err.response.data.application_no, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const handleValidateOTP = async () => {
    try {
      const result = await trigger('entered_otp');
      if (result) {
        setLoading({ loader: true, name: 'onValidateOTP' });
        const collateralItems = itemsToSend();
        const requestBody = {
          loan_account_no: loanInfo.loan_account_no,
          new_valuation: Math.floor(tableData.reduce((accumulator, currentValue) => accumulator + currentValue.valuation, 0)),
          collateral_items: collateralItems,
          otp: getValues('entered_otp'),
          source_module: 'PR',
          revised_tare_weight_gold_pouch: Number(getValues('revised_tare_weight')),
          customer_live_pic: getValues('customer_photo'),
          consolidated_items_pic: getValues('consolidated_collateral_photo'),
          dt: loanInfo?.loanToken
        };
        if (getValues('new_packet_id')) {
          requestBody.new_gold_pouch_number = getValues('new_packet_id');
        }
        const { status } = await Service.post(`${process.env.REACT_APP_PART_RELEASE_SERVICE}/part_release/v2/release`, requestBody);
        if (status === 200) {
          closeOnSuccess();
        } else {
          setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
        }
      }
    } catch (err) {
      const msg = extractValidateApiErrors(err.response?.data?.errors, tableData);
      if (msg) {
        setAlertShow({ open: true, msg, alertType: 'error' });
      } else if (err?.response?.data?.message?.is_validated === 'False') {
        setAlertShow({ open: true, msg: 'OTP validation failed. Retry!', alertType: 'error' });
      } else if (err?.response?.data?.message?.application_no) {
        setAlertShow({ open: true, msg: err.response.data.message.application_no, alertType: 'error' });
      } else if (err?.response?.data?.message && typeof (err.response.data.message) === 'string') {
        setAlertShow({ open: true, msg: err.response.data.message, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  if (timer >= 180) {
    clearInterval(intervalAddress);
    setTimer(0);
    setActiveOtp(null);
    setDisableButton(false);
  }

  const handleConfirmationClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setOnValidate(initialConfirmState);
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <Grid continer padding='10px 20px'>
        <HeadingMaster>Part Release</HeadingMaster>
      </Grid>
      <Grid continer>
        <TableWrapper width={['xs', 'sm'].includes(screen) ? '90%' : '100%'} screen={screen}>
          <CustomTable2>
            <TableHead>
              <TableRow>
                { !isConfirmed ? <TableCell width='5%' /> : null}
                <TableCell width='12%' align='center'>Item Name</TableCell>
                <TableCell width='12%' align='center'>Count</TableCell>
                <TableCell width='12%' align='center'>Total Weight (in gm)</TableCell>
                <TableCell width='13%' align='center'>Beads/Stone Weight (in gm)</TableCell>
                <TableCell width='8%' align='center'>Dust (in gm)</TableCell>
                <TableCell width='9%' align='center'>Net Weight (in gm)</TableCell>
                <TableCell width='9%' align='center'>Applied RPG (₹)</TableCell>
                <TableCell width='9%' align='center'>Valuation Amount (₹)</TableCell>
                {
                  tableData.some((ele) => ele?.isEditModeOn) || tableData.some((ele) => ele?.ornament_photo)
                    ? <TableCell width='12%' align='center'>Ornament Photo</TableCell> : null
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((item, index) => (
                <TableRow>
                  {
                   !isConfirmed ? (
                     <TableCell align='center'>
                       <ButtonPrimary
                         onClick={() => handleAction(index)}
                       >
                         {item.isEditModeOn ? 'Save' : 'Edit'}
                       </ButtonPrimary>
                     </TableCell>
                   ) : null
                  }
                  <TableCell align='center'>
                    {item?.full_name}
                    <br />
                    {collateralPurityEnum[item.purity]}
                    {' '}
                    Carat
                  </TableCell>
                  <TableCell align='center'>
                    {
                        item.isEditModeOn ? (
                          <>
                            <CustomTextStyle>
                              Original:
                              {' '}
                              {loanInfo.ornaments[index]?.item_count}
                            </CustomTextStyle>
                            <TextFieldStyled
                              placeholder='New Count*'
                              {...register(`new_count_${index}`, {
                                onChange: (e) => {
                                  let { value } = e.target;
                                  value = value.replace(/[^0-9"]/g, '');
                                  if (value >= loanInfo.ornaments[index]?.item_count) {
                                    setValue(`new_count_${index}`, value.substring(0, value.length - 1), { shouldValidate: true });
                                    alert('New count should be less than the original count.');
                                    return;
                                  }
                                  setValue(`new_count_${index}`, value, { shouldValidate: true });
                                },
                                required: true,
                                min: { value: 0, message: null }
                              })}
                              error={errors?.[`new_count_${index}`]}
                            />
                          </>
                        ) : (
                          <>
                            {item?.item_count}
                            { item?.item_count !== loanInfo.ornaments[index]?.item_count
                              ? (
                                <>
                                  {' '}
                                  (ORG:
                                  {' '}
                                  {loanInfo.ornaments[index]?.item_count}
                                  )
                                </>
                              )
                              : null}
                          </>
                        )
                  }
                  </TableCell>
                  <TableCell align='center'>
                    {
                        item.isEditModeOn ? (
                          <>
                            <CustomTextStyle>
                              Original:
                              {' '}
                              {loanInfo.ornaments[index]?.total_weight_gm}
                            </CustomTextStyle>
                            <TextFieldStyled
                              placeholder='New Total Weight*'
                              {...register(`new_total_weight_${index}`, {
                                onChange: (e) => {
                                  let { value } = e.target;
                                  value = value.replace(/[^0-9."]/g, '');
                                  const valueArray = value.split('.');
                                  if (valueArray.length > 1 && valueArray[1].length) {
                                    value = `${valueArray[0]}.${valueArray[1].substring(0, 2)}`;
                                  }
                                  if (value >= loanInfo.ornaments[index]?.total_weight_gm) {
                                    setValue(`new_total_weight_${index}`, value.substring(0, value.length - 1), { shouldValidate: true });
                                    alert('New total weight should be less than the original total weight.');
                                    return;
                                  }
                                  setValue(`new_total_weight_${index}`, value, { shouldValidate: true });
                                },
                                required: true,
                                pattern: { value: REGEX.TWODIGITDECIMAL, message: null }
                              })}
                              error={errors?.[`new_total_weight_${index}`]}
                            />
                          </>
                        ) : (
                          <>
                            {item?.total_weight_gm}
                            { item?.total_weight_gm !== loanInfo.ornaments[index]?.total_weight_gm
                              ? (
                                <>
                                  {' '}
                                  (ORG:
                                  {' '}
                                  {loanInfo.ornaments[index]?.total_weight_gm}
                                  )
                                </>
                              )
                              : null}
                          </>
                        )
                  }
                  </TableCell>
                  <TableCell align='center'>
                    {
                        item.isEditModeOn ? (
                          <>
                            <CustomTextStyle>
                              Original:
                              {' '}
                              {loanInfo.ornaments[index]?.stone_weight_gm}
                            </CustomTextStyle>
                            <TextFieldStyled
                              placeholder='New Beads/Stone Weight*'
                              {...register(`new_stone_weight_${index}`, {
                                onChange: (e) => {
                                  let { value } = e.target;
                                  value = value.replace(/[^0-9."]/g, '');
                                  const valueArray = value.split('.');
                                  if (valueArray.length > 1 && valueArray[1].length) {
                                    value = `${valueArray[0]}.${valueArray[1].substring(0, 2)}`;
                                  }
                                  if (value > loanInfo.ornaments[index]?.stone_weight_gm) {
                                    setValue(`new_stone_weight_${index}`, value.substring(0, value.length - 1), { shouldValidate: true });
                                    alert('New beads/stone weight should be less than or equal to original beads/stone weight.');
                                    return;
                                  }
                                  setValue(`new_stone_weight_${index}`, value, { shouldValidate: true });
                                },
                                required: true,
                                pattern: { value: REGEX.TWODIGITDECIMAL, message: null }
                              })}
                              error={errors?.[`new_stone_weight_${index}`]}
                            />
                          </>
                        ) : (
                          <>
                            {item?.stone_weight_gm}
                            { item?.stone_weight_gm !== loanInfo.ornaments[index]?.stone_weight_gm
                              ? (
                                <>
                                  {' '}
                                  (ORG:
                                  {' '}
                                  {loanInfo.ornaments[index]?.stone_weight_gm}
                                  )
                                </>
                              )
                              : null}
                          </>
                        )
                  }
                  </TableCell>
                  <TableCell align='center'>{item.dust}</TableCell>
                  <TableCell align='center'>{item.net_weight_gm}</TableCell>
                  <TableCell align='center'>{amountFormat.format(loanInfo.appliedRPG)}</TableCell>
                  <TableCell align='center'>{amountFormat.format(item.valuation)}</TableCell>
                  {
                  tableData.some((ele) => ele?.isEditModeOn) || tableData.some((ele) => ele?.ornament_photo)
                    ? (
                      <TableCell align='center'>
                        {item.isEditModeOn || item.ornament_photo
                          ? (
                            <LivePhoto
                              register={register}
                              errors={errors}
                              setValue={setValue}
                              getValues={getValues}
                              input={{
                                name: `ornament_photo_${index}`,
                                label: 'Capture',
                                type: 'file',
                                getFilePath: item?.ornament_photo,
                                filePath: `${PARTRELEASE.name}/${PARTRELEASE.details.ornamentPicture}`,
                                disable: !item.isEditModeOn,
                                validation: {
                                  isRequired: false
                                }
                              }}
                            />
                          )
                          : null}
                      </TableCell>
                    ) : null
                }
                </TableRow>
              ))}
            </TableBody>
          </CustomTable2>
        </TableWrapper>
      </Grid>
      <Grid container padding='0px 20px 10px' display='flex'>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
          <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
            <HeadingMaster2 padding='0 !important'>Total Dues (₹)</HeadingMaster2>
          </Grid>
          <CustomGrid item xs={6} sm={6} md={6} lg={7} xl={7}>
            :
            &nbsp;
            <span>{amountFormat.format(loanInfo.totalDues)}</span>
          </CustomGrid>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex'>
          <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
            <HeadingMaster2 padding='0 !important'>New Valuation (₹)</HeadingMaster2>
          </Grid>
          <CustomGrid item xs={6} sm={6} md={6} lg={7} xl={7}>
            :
            &nbsp;
            <span>{amountFormat.format(Math.floor(tableData.reduce((accumulator, currentValue) => accumulator + currentValue.valuation, 0)))}</span>
          </CustomGrid>
        </Grid>
      </Grid>
      <Grid container padding='20px 0px' display='flex' justifyContent='center'>
        <LoadingButtonPrimary
          loading={loading.loader && loading.name === 'onValidatePartRelease'}
          disabled={!isEligibleToValidate || isConfirmed || tableData.some((ele) => ele.isEditModeOn)}
          onClick={validatePartRelease}
        >
          Validate Part Release
        </LoadingButtonPrimary>
        <LoadingButtonPrimary
          disabled={!isValidatedSuccessfully || isConfirmed || tableData.some((ele) => ele.isEditModeOn)}
          onClick={() => setIsConfirmed(true)}
        >
          Confirm
        </LoadingButtonPrimary>
        <LoadingButtonPrimary onClick={() => handleReset()}>Reset</LoadingButtonPrimary>
      </Grid>
      {
        isConfirmed ? (
          <>
            <Grid continer padding='0px 20px'>
              <HeadingMaster>Collateral Additional Details</HeadingMaster>
            </Grid>
            <Grid container padding='0px 10px' display='flex' justifyContent='space-between'>
              <Grid item xs={12} sm={6} md={6} lg={3} xl={3} padding='10px'>
                <TextFieldStyled
                  label='Revised TARE Weight*'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>gm</InputAdornment>,
                  }}
                  disabled={isOTPSendSuccessfully}
                  {...register('revised_tare_weight', {
                    onChange: (e) => setValue('revised_tare_weight', e.target.value, { shouldValidate: true }),
                    required: 'Please enter Revised TARE Weight',
                    min: { value: maxTareWeight, message: 'Revised TARE Weight should be greater or equal to the Revised Consolidated Total Weight' },
                    pattern: { value: REGEX.TWODIGITDECIMAL, message: 'Please enter valid two digit decimal value only' },
                    max: { value: parseFloat(loanInfo.tareWeight) - 0.01, message: 'Revised TARE Weight should be less than original TARE Weight' },
                  })}
                />
                {renderError('revised_tare_weight')}
              </Grid>
            </Grid>
            <Grid container padding='0px 10px' display='flex' justifyContent='space-between'>
              <Grid item xs={12} sm={6} md={6} lg={3} xl={3} padding='10px'>
                <TextFieldStyled
                  label='New Packet ID?*'
                  select
                  disabled={isOTPSendSuccessfully}
                  {...register('is_new_packet_id', {
                    onChange: (e) => {
                      if (e.target.value === 'no') {
                        setValue('new_packet_id', null, { shouldValidate: true });
                      }
                      setValue('is_new_packet_id', e.target.value, { shouldValidate: true });
                    },
                    required: 'Please select New Packet ID?'
                  })}
                >
                  <SelectMenuStyle key='yes' value='yes'>Yes</SelectMenuStyle>
                  <SelectMenuStyle key='no' value='no'>No</SelectMenuStyle>
                </TextFieldStyled>
                {renderError('is_new_packet_id')}
              </Grid>
              { getValues('is_new_packet_id') === 'yes'
                ? (
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
                    <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                      <TextFieldStyled
                        label='New Packet ID*'
                        disabled={isOTPSendSuccessfully}
                        {...register('new_packet_id', {
                          onChange: (e) => setValue('new_packet_id', e.target.value.trim(), { shouldValidate: true }),
                          required: 'Please enter New Packet ID',
                          pattern: { value: loanInfo.colender === 'SHIVALIK' ? REGEX.SHIVALIKGOLDPOUCHNUMBER : REGEX.GOLDPOUCHNUMBER, message: 'New Packet ID is invalid' }
                        })}
                      />
                      {renderError('new_packet_id')}
                    </Grid>
                  </Grid>
                )
                : null}
            </Grid>
            <Grid container padding='0px 10px' display='flex' justifyContent='space-between'>
              <Grid item xs={12} sm={6} md={6} lg={3} xl={3} padding='10px'>
                <LivePhoto
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  input={{
                    name: 'customer_photo',
                    label: 'Customer Photo',
                    type: 'file',
                    filePath: `${PARTRELEASE.name}/${PARTRELEASE.details.customerPicture}`,
                    disable: isOTPSendSuccessfully,
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please upload customer photo',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
                <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                  <LivePhoto
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    getValues={getValues}
                    input={{
                      name: 'consolidated_collateral_photo',
                      label: 'Consolidated Collateral Photo',
                      type: 'file',
                      filePath: `${PARTRELEASE.name}/${PARTRELEASE.details.cosolidatedOrnamentPicture}`,
                      disable: isOTPSendSuccessfully,
                      validation: {
                        isRequired: true,
                        requiredMsg: 'Please upload consolidated collateral photo',
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' padding='0px 10px'>
              <Grid item xs={6} md={3} padding='10px'>
                <TextFieldStyled
                  label='Mobile No'
                  defaultValue={loanInfo?.customerNumber}
                  disabled
                />
              </Grid>
              <Grid item xs={6} md={3} display='flex' justifyContent='start' paddingLeft='10px'>
                {
                  (activeOtp === null || activeOtp === OTPSENDVIASMS)
                && (
                <FullSizeButton
                  onClick={() => handleSendOTP(OTPSENDVIASMS)}
                  loading={loading.loader && loading.name === OTPSENDVIASMS}
                  loadingPosition='start'
                  margin='1px'
                >
                  { timer ? `Resend OTP in ${180 - timer} sec` : 'Send OTP'}
                </FullSizeButton>
                )
}
                {
                (activeOtp === null || activeOtp === OTPSENDVIACALL) && (
                <FullSizeButton
                  onClick={() => handleSendOTP(OTPSENDVIACALL)}
                  loading={loading.loader && loading.name === OTPSENDVIACALL}
                  loadingPosition='start'
                  margin='1px'
                >
                  { timer ? `Resend OTP in ${180 - timer} sec` : 'OTP Via Call'}
                </FullSizeButton>
                )
                }
                {
                (activeOtp === null || activeOtp === OTPSENDVIAWHATSAPP) && (
                <FullSizeButton
                  onClick={() => handleSendOTP(OTPSENDVIAWHATSAPP)}
                  loading={loading.loader && loading.name === OTPSENDVIAWHATSAPP}
                  disabled={disableButton}
                  loadingPosition='start'
                  margin='1px'
                >
                  { timer ? `Resend OTP in ${180 - timer} sec` : 'OTP Via Whatsapp'}
                </FullSizeButton>
                )
                }

              </Grid>

              {
              isOTPSendSuccessfully ? (
                <>
                  <Grid item xs={6} md={3} padding={['md', 'lg', 'xl'].includes(screen) ? '10px 0 10px 10px' : '10px'}>
                    <TextFieldStyled
                      label='Enter OTP*'
                      {...register('entered_otp', {
                        onChange: (e) => {
                          let { value } = e.target;
                          value = value.replace(/[^0-9"]/g, '');
                          setValue('entered_otp', value, { shouldValidate: true });
                        },
                        required: 'Please enter OTP',
                      })}
                    />
                    {renderError('entered_otp')}
                  </Grid>
                  <Grid item xs={6} md={3} display='flex' justifyContent='start' padding='10px'>
                    <FullSizeButton
                      onClick={handleValidateOTP}
                      loading={loading.loader && loading.name === 'onValidateOTP'}
                      margin='0'
                      loadingPosition='start'
                    >
                      Validate OTP
                    </FullSizeButton>
                  </Grid>

                </>
              ) : null
            }
            </Grid>
          </>
        ) : null
      }
      <DialogBox
        isOpen={Object.values(onValidate).some((ele) => ele)}
        title=''
        handleClose={handleConfirmationClose}
        width='460px'
        padding='30px'
      >
        <DialogContentText style={{ textAlign: 'center' }}>
          { onValidate.onSuccess ? 'Eligible for Part Release.' : null}
          { onValidate.onFailure ? `Not eligible for Part Release. The Customer needs to make repayment of the amount = 
          ${Math.ceil(loanInfo.totalDues - Math.floor(Number(tableData.reduce((accumulator, currentValue) => accumulator + currentValue.valuation, 0))))}` : null}
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <ButtonPrimary onClick={() => setOnValidate(initialConfirmState)}>Okay</ButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};

export default React.memo(ReleaseOrnaments, (prevProps, nextProps) => {
  if (prevProps.loanInfo !== nextProps.loanInfo || prevProps.foreclosureInq !== nextProps.foreclosureInq) {
    return false;
  }
  return true;
});
