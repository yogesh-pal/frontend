/* eslint-disable no-nested-ternary */

import React, { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import styled from '@emotion/styled';
import moment from 'moment';
import {
  Grid, Typography, RadioGroup, FormControlLabel,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import PageLoader from '../../../../components/PageLoader';
import { useScreenSize } from '../../../../customHooks';
import {
  FullSizeButton, RadiobuttonStyle,
  TextFieldStyled, LoadingButtonPrimary, ResetButton, SelectStyled, SelectMenuStyle,
} from '../../../../components/styledComponents';
import store from '../../../../redux/store';
import {
  MultipleLivePhoto, ErrorText,
} from '../../../../components';
import { MODULE, PERMISSION } from '../../../../constants';
import { Service } from '../../../../service';
import { addressProvider, imageProvider } from '../constants';

const CustomGridLabel = styled(Grid)`
  display: flex;
  font-size: 14px;
  padding: 5px !important;
`;

const CustomGridValue = styled(Grid)`
  font-size: 19px;
  word-break: break-word;
`;

const CustomForm = styled.form`
  padding: 20px 0px;
  width: 100%;
`;

const CustomHeading = styled(Typography)`
font-size: 18px;
padding-bottom:0 !important;
 color: #502A74;
 font-weight: 700;
`;

const index = ({
  setAlertShow, setIsOpen, selectedData, fetchData, fetchCount, searchDetails
}) => {
  const [loading, setLoading] = useState({
    value: false,
    name: ''
  });
  const [cuslocation, setCusLocation] = useState({
    lat: '',
    long: '',
    address: ''
  });
  const [showWhatsapp, setShowWhatsapp] = useState(true);
  const [timer, setTimer] = useState(0);
  const [preFilledData, setPrefilledData] = useState();
  const [isAddressSame, setIsAddressSame] = useState('');
  const [intervalAddress, setIntervalAddress] = useState(null);
  const [isOTPSendSuccessfully, setIsOTPSendSuccessfully] = useState({
    value: false,
    type: ''
  });
  const [isOTPValidated, setIsOTPValidated] = useState(false);
  const reduxState = store.getState();
  const decodedToken = jwtDecode(reduxState.user.accessToken);
  const permissionsArray = decodedToken.permissions.split(',');
  const screen = useScreenSize();

  const {
    register, unregister, handleSubmit,
    formState: { errors }, setValue, getValues, trigger, reset
  } = useForm();

  const onSubmit = async (value) => {
    try {
      setLoading({
        value: true,
        name: 'SUBMIT'
      });
      const payload = {};
      payload.cpv_status = value.cpv_remarks;
      payload.branch = selectedData.maker_branch_code;
      payload.cpv_id = selectedData.cpv_id;
      payload.is_address_confirmed = isAddressSame === 'yes';
      if (isAddressSame === 'yes') {
        payload.house_locality_pic = imageProvider(value, 'document_live_photo_house');
        payload.customer_pic = imageProvider(value, 'document_live_photo_customer');
        payload.surveyor_pic = imageProvider(value, 'document_live_photo_surveyor');
        payload.visit_remarks = value.visit_remarks;
      }
      const { data } = await Service.post(process.env.REACT_APP_SUBMIT_CPV, payload);
      if (data.success) {
        setIsOpen(false);
        fetchData('NOTSEARCH', searchDetails.pageNumber, searchDetails.pageSize, searchDetails.payload);
        fetchCount(searchDetails.payload);
      }
    } catch (err) {
      setAlertShow({
        open: true,
        msg: 'Something Went Wrong. Please try again.',
        alertType: 'error'
      });
    } finally {
      setLoading({
        value: false,
        name: ''
      });
    }
  };

  const selectInput = {
    name: 'cpv_remarks',
    option: ['Positive', 'Negative'],
    validation: {
      isRequired: true,
      requiredMsg: 'Please select CPV remarks'
    }
  };

  const { CONTACTPOINTVERIFICATION } = MODULE;

  const handleValidateOTP = async () => {
    try {
      const result = await trigger(['document_live_photo_house', 'document_live_photo_customer', 'document_live_photo_surveyor', 'visit_remarks', 'cpv_remarks', 'entered_otp']);
      if (result) {
        const otpValue = getValues('entered_otp');
        setLoading({
          name: 'validateOTP',
          value: true
        });
        const { data } = await Service.get(`${process.env.REACT_APP_VERIFY_MOBILE_OTP}?dest=${selectedData?.mobile_no}&otp=${otpValue}`);
        if (data?.msg === 'Verified OTP') {
          setAlertShow({
            open: true,
            msg: 'OTP verification successful.',
            alertType: 'success'
          });
          setIsOTPValidated(true);
          clearInterval(intervalAddress);
          return;
        }
        const msg = data?.msg ?? 'OTP verification failed.';
        setAlertShow({
          open: true,
          msg,
          alertType: 'error'
        });
      }
    } catch (err) {
      console.log(err);
      setAlertShow({
        open: true,
        msg: 'OTP verification API failed. Try again',
        alertType: 'error'
      });
    } finally {
      setLoading({
        name: '',
        value: false
      });
    }
  };

  const sendOTPViaSms = async () => {
    try {
      setLoading({
        name: 'otpSendViaSMS',
        value: true
      });
      const { data } = await Service.get(`${process.env.REACT_APP_SEND_SMS_OTP}?dest=${selectedData?.mobile_no}&otplen=4&type=customer_cpv`);

      if (data.status === 1) {
        setTimer(1);
        const interval = setInterval(() => setTimer((pre) => (pre + 1)), 1000);
        setIntervalAddress(interval);
        setIsOTPSendSuccessfully({
          value: true,
          type: 'otpSendViaSMS'
        });
      } else {
        setShowWhatsapp(false);
        setAlertShow({ open: true, msg: 'Invalid mobile number.', alertType: 'error' });
      }
    } catch (err) {
      console.log(err);
      setShowWhatsapp(false);
      setAlertShow({
        open: true,
        msg: 'OTP send API failed. Try again.',
        alertType: 'error'
      });
    } finally {
      setLoading({
        name: '',
        value: false
      });
    }
  };

  const sendOTPViaCall = async () => {
    try {
      setLoading({
        name: 'otpSendViaCall',
        value: true
      });
      const { data } = await Service.get(`${process.env.REACT_APP_SEND_CALL_OTP}?dest=${selectedData?.mobile_no}&otplen=4`);
      if (data.status === 1) {
        setTimer(1);
        const interval = setInterval(() => setTimer((pre) => (pre + 1)), 1000);
        setIntervalAddress(interval);
        setIsOTPSendSuccessfully({
          value: true,
          type: 'otpSendViaCall'
        });
      } else {
        setShowWhatsapp(false);
        let msg = 'Invalid mobile number.';
        if (data.msg) {
          msg = data.msg;
        }

        setAlertShow({ open: true, msg, alertType: 'error' });
      }
    } catch (err) {
      console.log(err);
      setShowWhatsapp(false);
      setAlertShow({
        open: true,
        msg: 'OTP send API failed. Try again.',
        alertType: 'error'
      });
    } finally {
      setLoading({
        name: '',
        value: false
      });
    }
  };

  const sendOTPViaWhatsapp = async () => {
    try {
      setLoading({
        name: 'otpSendViaWhatsapp',
        value: true
      });
      const { data } = await Service.get(`${process.env.REACT_APP_SEND_SMS_OTP}?dest=${selectedData?.mobile_no}&otplen=4&otp_type=WHATSAPP&type=customer_cpv`);
      if (data.status === true) {
        setTimer(1);
        const interval = setInterval(() => setTimer((pre) => (pre + 1)), 1000);
        setIntervalAddress(interval);
        setIsOTPSendSuccessfully({
          value: true,
          type: 'otpSendViaWhatsapp'
        });
      } else {
        let msg = 'Invalid mobile number.';
        if (data.msg) {
          msg = data.msg;
        }

        setAlertShow({ open: true, msg, alertType: 'error' });
      }
    } catch (err) {
      console.log(err);
      setAlertShow({
        open: true,
        msg: 'OTP send API failed. Try again.',
        alertType: 'error'
      });
    } finally {
      setLoading({
        name: '',
        value: false
      });
    }
  };

  const funcObj = {
    otpSendViaCall: sendOTPViaCall,
    otpSendViaSMS: sendOTPViaSms,
    otpSendViaWhatsapp: sendOTPViaWhatsapp
  };

  const handleSendOTP = async (type) => {
    const result = await trigger(['document_live_photo_house', 'document_live_photo_customer', 'document_live_photo_surveyor', 'visit_remarks', 'cpv_remarks']);
    if (result) {
      if (timer) {
        return;
      }
      funcObj[type]();
    }
  };

  const handleAddressChange = (e) => {
    const { value } = e.target;
    if (value === 'no') {
      reset({ cpv_remarks: 'Negative' });
      if (intervalAddress) { clearInterval(intervalAddress); }
      setTimer(0);
    } else {
      reset({ cpv_remarks: '' });
      register('document_live_photo_house', { required: true });
      register('document_live_photo_customer', { required: true });
      register('document_live_photo_surveyor', { required: true });
    }
    setIsAddressSame(e.target.value);
  };

  if (timer >= 180) {
    clearInterval(intervalAddress);
    setTimer(0);
    setShowWhatsapp(false);
    setIsOTPSendSuccessfully({
      value: true,
      type: ''
    });
  }

  const canEdit = () => (preFilledData?.cpv_status === 'Pending' && permissionsArray.includes(PERMISSION.cpvUpdate));
  const canSupervise = () => ((permissionsArray.includes(PERMISSION.cpvChecker)));

  useEffect(() => {
    setLoading({
      value: 'true',
      name: 'LOCATIONPERMISSION'
    });
    const location = window.navigator && window.navigator.geolocation;
    if (location) {
      const myPromise = new Promise((resolve) => {
        location.getCurrentPosition((position) => {
          try {
            resolve({ lat: position.coords.latitude, long: position.coords.longitude });
          } catch (err) {
            console.log('error while fetching position ', err);
          }
        }, (error) => {
          console.log(error);
          let message = 'Something went wrong. Please try again.';
          switch (error?.code) {
            case error?.PERMISSION_DENIED:
              message = 'Please allow the location permission for further actions.';
              break;
            case error?.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error?.TIMEOUT:
              message = 'The request to get user location timed out.';
              break;
            default:
          }
          if (message) {
            console.log(message);
            setAlertShow({
              open: true,
              msg: message,
              alertType: 'error'
            });
          }
        });
      });
      myPromise.then(
        async (value) => {
          const { lat, long } = value;
          const request1 = Service.getAPI(`${process.env.REACT_APP_GET_ADDRESS}?lon=${long}&lat=${lat}`);
          const request2 = Service.get(`${process.env.REACT_APP_GET_CPV_DETAILS}?branch=${selectedData.maker_branch_code}&cpv_id=${selectedData.cpv_id}`);
          Promise.all([request1, request2]).then((v) => {
            const apiRes = v[1].data.data;
            const firstName = apiRes?.first_name ?? '';
            const lastName = apiRes?.last_name ?? '';
            const permanentAddress = addressProvider(
              apiRes.address_1,
              apiRes.address_2,
              apiRes.city,
              apiRes.state,
              apiRes.pincode
            );
            const currentAddress = addressProvider(
              apiRes.current_address_1,
              apiRes.current_address_2,

              apiRes.current_city,

              apiRes.current_state,

              apiRes.current_pincode
            );
            const occupationalAddress = addressProvider(
              apiRes.occupation_address_1,
              apiRes.occupation_address_2,

              apiRes.occupation_city,

              apiRes.occupation_state,

              apiRes.occupation_state
            );

            const customerData = [{
              label: 'Customer Name',
              value: `${firstName}  ${lastName}` || 'NA',
            }, {
              label: 'Customer ID',
              value: apiRes?.customer_id || 'NA',
            }, {
              label: 'Permanent Address',
              value: permanentAddress || 'NA',
            }, {
              label: 'Current Address',
              value: currentAddress || 'NA',
            }, {
              label: 'Occupation Address',
              value: occupationalAddress || 'NA',
            }];

            const myData = { customerData };
            myData.cpv_status = apiRes.cpv_status;
            let isAddressTemp = '';
            if (apiRes.cpv_status !== 'Pending') {
              if (apiRes.is_address_confirmed) {
                isAddressTemp = 'yes';
              } else {
                isAddressTemp = 'no';
              }
            }
            if (apiRes.visit_remarks) { setValue('visit_remarks', apiRes.visit_remarks); }
            if (apiRes?.cpv_status?.toLowerCase() === 'positive') {
              setValue('cpv_remarks', 'Positive');
            } else if (apiRes?.cpv_status?.toLowerCase() === 'negative') {
              setValue('cpv_remarks', 'Negative');
            }
            if (apiRes.house_locality_pic) {
              setValue('document_live_photo_house', apiRes.house_locality_pic[0]);
              if (apiRes.house_locality_pic.length > 1) {
                for (let i = 1; i < apiRes.house_locality_pic.length; i += 1) {
                  setValue(`document_live_photo_house_${i}`, apiRes.house_locality_pic[i]);
                }
              }
            }
            if (apiRes.customer_pic) {
              setValue('document_live_photo_customer', apiRes.customer_pic[0]);
              if (apiRes.customer_pic.length > 1) {
                for (let i = 1; i < apiRes.customer_pic.length; i += 1) {
                  setValue(`document_live_photo_customer_${i}`, apiRes.customer_pic[i]);
                }
              }
            }
            if (apiRes?.surveyor_pic) {
              setValue('document_live_photo_surveyor', apiRes.surveyor_pic[0]);
              if (apiRes.surveyor_pic.length > 1) {
                for (let i = 1; i < apiRes.surveyor_pic.length; i += 1) {
                  setValue(`document_live_photo_surveyor_${i}`, apiRes.surveyor_pic[i]);
                }
              }
            }
            setPrefilledData(myData);
            if (isAddressTemp) {
              setIsAddressSame(isAddressTemp);
            }
            const { address } = v[0].data;
            const fullAddress = address ?? '';
            setCusLocation({
              lat,
              long,
              address: fullAddress
            });
            setLoading({
              value: false,
              name: 'LOCATIONPERMISSION'
            });
          }).catch((err) => {
            console.log('error is', err);
            const message = 'Something went wrong. Please try again.';
            setAlertShow({
              open: true,
              msg: message,
              alertType: 'error'
            });
          });
        },
      );
    } else {
      setAlertShow({
        open: true,
        msg: 'Geolocation is not supported by this browser.',
        alertType: 'error'
      });
    }
  }, []);
  return (
    loading.value && loading.name === 'LOCATIONPERMISSION' ? <PageLoader />
      : (
        <Grid container padding='10px'>
          <Grid container spacing={3} margin='0' padding='10px'>
            {
        preFilledData?.customerData?.map((item) => (
          <CustomGridLabel
            key={item.label}
            item
            md={6}
            xs={12}
          >
            <Grid item xs={4} sm={4} lg={4}>
              <CustomHeading padding='0 !important'>{item.label}</CustomHeading>
            </Grid>
            <CustomGridValue
              item
              display='flex'
              xs={8}
              sm={8}
              lg={8}
            >
              <span style={{ marginRight: `${(['xs', 'sm'].includes(screen)) ? '0px' : '20px'}` }}>:</span>
            &nbsp;
              <span>{item.value}</span>
            </CustomGridValue>
          </CustomGridLabel>
        ))
      }
          </Grid>
          <CustomForm onSubmit={handleSubmit(onSubmit)}>
            <Grid container display='flex' alignItems='center' padding='0px 10px'>
              <Grid item xs={9} padding='10px' alignItems='center'>
                <CustomHeading>
                  *Is the Customer address same as Current address/occupation
                  address

                </CustomHeading>
              </Grid>
              <Grid item xs={3} padding='10px' alignItems='center'>
                <RadioGroup
                  row
                  aria-labelledby='radio-buttons'
                  name='radio-buttons-group'
                  value={isAddressSame}
                  onChange={handleAddressChange}
                >
                  <FormControlLabel value='yes' disabled={(canEdit() || canSupervise()) ? isOTPValidated : true} control={<RadiobuttonStyle />} label='Yes' checked={isAddressSame === 'yes'} />
                  <FormControlLabel value='no' disabled={(canEdit() || canSupervise()) ? isOTPValidated : true} control={<RadiobuttonStyle />} label='No' checked={isAddressSame === 'no'} />
                </RadioGroup>
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' padding='0px 10px'>
              <Grid item xs={7} md={9} padding='10px' alignItems='center'>
                <CustomHeading>*Capture photograph of House/Locality</CustomHeading>
              </Grid>
              <Grid item xs={5} md={3} padding='10px'>
                <MultipleLivePhoto
                  register={register}
                  unregister={unregister}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  input={{
                    name: 'document_live_photo_house',
                    disable: (canEdit() || canSupervise()) ? (!(isAddressSame === 'yes') || isOTPValidated) : true,
                    label: 'House/Locality Live Photo',
                    filePath: `${CONTACTPOINTVERIFICATION.name}/${CONTACTPOINTVERIFICATION.details.housePicture}`,
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please upload House/Locality live photo',
                    },
                    maxUploadCount: 5,
                    maxUploadMsg: 'Maximum Upload limit reached for House/Locality',
                    withWatermark: true,
                    watermarkContent: `${cuslocation.address}\nLatitude:${cuslocation.lat} Longitude:${cuslocation.long}\nDate&Time: ${moment(new Date()).format('DD-MM-YYYY HH:mm:ss')}`
                  }}
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' padding='0px 10px'>
              <Grid item xs={7} md={9} padding='10px' alignItems='center'>
                <CustomHeading>*Photo of the Customer</CustomHeading>
              </Grid>
              <Grid item xs={5} md={3} padding='10px'>
                <MultipleLivePhoto
                  register={register}
                  unregister={unregister}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  input={{
                    name: 'document_live_photo_customer',
                    label: 'Customer Live Photo',
                    disable: (canEdit() || canSupervise()) ? (!(isAddressSame === 'yes') || isOTPValidated) : true,
                    filePath: `${CONTACTPOINTVERIFICATION.name}/${CONTACTPOINTVERIFICATION.details.customerPicture}`,
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please upload Customer live photo',
                    },
                    maxUploadCount: 5,
                    maxUploadMsg: 'Maximum Upload limit reached for Photo of the Customer',
                    withWatermark: true,
                    watermarkContent: `${cuslocation.address}\nLatitude:${cuslocation.lat} Longitude:${cuslocation.long}\nDate&Time: ${moment(new Date()).format('DD-MM-YYYY HH:mm:ss')}`
                  }}
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' padding='0px 10px'>
              <Grid item xs={7} md={9} padding='10px' alignItems='center'>
                <CustomHeading>*Photo of the surveyor with customer</CustomHeading>
              </Grid>
              <Grid item xs={5} md={3} padding='10px'>
                <MultipleLivePhoto
                  register={register}
                  unregister={unregister}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  input={{
                    name: 'document_live_photo_surveyor',
                    disable: (canEdit() || canSupervise()) ? (!(isAddressSame === 'yes') || isOTPValidated) : true,
                    label: 'Customer with Surveyor Live Photo',
                    filePath: `${CONTACTPOINTVERIFICATION.name}/${CONTACTPOINTVERIFICATION.details.surveyor}`,
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please upload Customer with surveyor photo',
                    },
                    maxUploadCount: 5,
                    maxUploadMsg: 'Maximum Upload limit reached for Photo of the surveyor with customer',
                    withWatermark: true,
                    watermarkContent: `${cuslocation.address}\nLatitude:${cuslocation.lat} Longitude:${cuslocation.long}\nDate&Time: ${moment(new Date()).format('DD-MM-YYYY HH:mm:ss')}`
                  }}
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' padding='0px 10px'>
              <Grid item xs={7} md={9} padding='10px' alignItems='center'>
                <CustomHeading>*Visit Remarks</CustomHeading>
              </Grid>
              <Grid item xs={5} md={3} padding='10px' alignItems='center'>
                <TextFieldStyled
                  label=''
                  placeholder='Enter Visit Remarks'
                  disabled={(canEdit() || canSupervise()) ? (!(isAddressSame === 'yes') || isOTPValidated) : true}
                  multiline
                  maxRows={2}
                  {...register('visit_remarks', {
                    required: (isAddressSame === 'yes'),
                    maxLength: 200
                  })}
                />
                <ErrorText
                  errors={errors}
                  input={{
                    name: 'visit_remarks',
                    validation: {
                      requiredMsg: 'Please enter Visit remarks',
                      maxLenMsg: 'Atmost 200 characters are allowed only.'
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' padding='0px 10px'>
              <Grid item xs={7} md={9} padding='10px' alignItems='center'>
                <CustomHeading>*CPV Remarks</CustomHeading>
              </Grid>
              <Grid item xs={5} md={3} padding='10px' alignItems='center'>
                <SelectStyled
                  id='select-cpv'
                  readOnly={(canEdit() || canSupervise()) ? (!(isAddressSame === 'yes') || isOTPValidated) : true}
                  {...register(selectInput.name, {
                    required: (isAddressSame === 'yes')
                  })}
                  value={getValues('cpv_remarks')}
                  onChange={(e) => setValue('cpv_remarks', e.target.value, { shouldValidate: true })}
                  placeholder='Please select CPV remarks'

                >
                  {
                        selectInput.option.map((opt) => (
                          <SelectMenuStyle id={opt} value={opt}>
                            {opt}
                          </SelectMenuStyle>
                        ))
                    }
                </SelectStyled>
                <ErrorText
                  errors={errors}
                  input={{
                    name: selectInput.name,
                    validation: {
                      requiredMsg: selectInput.validation.requiredMsg
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' padding='0px 10px'>
              <Grid item xs={3} md={2} padding='10px' alignItems='center'>
                <CustomHeading>*Send OTP to</CustomHeading>
              </Grid>
              <Grid item xs={6} sm={3} md={2} padding='10px' alignItems='center'>
                <TextFieldStyled
                  label='Mobile No.'
                  value={selectedData.mobile_no}
                  disabled
                />
              </Grid>
              {' '}
              {
                (!isOTPSendSuccessfully.type || ((isOTPSendSuccessfully.type !== 'otpSendViaCall') && (isOTPSendSuccessfully.type !== 'otpSendViaWhatsapp'))) && (
                  (!isOTPValidated && isAddressSame !== 'no') ? (
                    <Grid xs={3} md={2} display='flex' justifyContent='center'>
                      <FullSizeButton
                        onClick={() => handleSendOTP('otpSendViaSMS')}
                        disabled={(canEdit() || canSupervise()) ? ((loading.name === 'otpSendViaCall' && loading.value) || (!(isAddressSame === 'yes'))) : true}
                        loading={loading.value && loading.name === 'otpSendViaSMS'}
                        loadingPosition='start'
                        margin={['xs', 'sm'].includes(screen) ? '0px' : null}
                      >
                        { timer ? `Resend OTP in ${180 - timer} sec` : 'OTP via SMS'}
                      </FullSizeButton>
                    </Grid>
                  ) : null
                )
              }
              {
                (!isOTPSendSuccessfully.type || ((isOTPSendSuccessfully.type !== 'otpSendViaSMS') && (isOTPSendSuccessfully.type !== 'otpSendViaWhatsapp'))) && (
                  (!isOTPValidated && isAddressSame !== 'no') ? (
                    <Grid xs={3} md={2} display='flex' justifyContent='center'>
                      <FullSizeButton
                        onClick={() => handleSendOTP('otpSendViaCall')}
                        loading={loading.value && loading.name === 'otpSendViaCall'}
                        loadingPosition='start'
                        disabled={(canEdit() || canSupervise()) ? ((loading.name === 'otpSendViaSMS' && loading.value) || (!(isAddressSame === 'yes'))) : true}
                        margin={['xs', 'sm'].includes(screen) ? '0px' : null}
                      >
                        { timer ? `Resend OTP in ${180 - timer} sec` : 'OTP via CALL '}
                      </FullSizeButton>
                    </Grid>
                  ) : null
                )
              }
              {
                (!isOTPSendSuccessfully.type || ((isOTPSendSuccessfully.type !== 'otpSendViaSMS') && isOTPSendSuccessfully.type !== 'otpSendViaCall')) && (
                  (!isOTPValidated && isAddressSame !== 'no') ? (
                    <Grid xs={3} md={2} display='flex' justifyContent='center'>
                      <FullSizeButton
                        onClick={() => handleSendOTP('otpSendViaWhatsapp')}
                        loading={loading.value && loading.name === 'otpSendViaWhatsapp'}
                        loadingPosition='start'
                        disabled={((canEdit() || canSupervise())) ? ((loading.name === 'otpSendViaWhatsapp' && loading.value) || (!(isAddressSame === 'yes')) || (showWhatsapp)) : true}
                        margin={['xs', 'sm'].includes(screen) ? '0px' : null}
                      >
                        { timer ? `Resend OTP in ${180 - timer} sec` : 'OTP via Whatsapp'}
                      </FullSizeButton>
                    </Grid>
                  ) : null
                )
              }
            </Grid>
            {
              isOTPSendSuccessfully.value ? (
                (!isOTPValidated && isAddressSame !== 'no')
                  ? (
                    <Grid container display='flex' alignItems='center' padding='0 10px'>
                      <Grid item xs={6} sm={3} md={2} padding='10px' alignItems='center'>
                        <CustomHeading>*Enter OTP</CustomHeading>
                      </Grid>
                      {
              isOTPSendSuccessfully.value ? (
                <>
                  <Grid item xs={6} sm={3} md={2} padding='10px'>
                    <TextFieldStyled
                      label='Enter OTP*'
                      disabled={(canEdit() || canSupervise()) ? !(isAddressSame === 'yes') : true}
                      {...register('entered_otp', {
                        onChange: (e) => {
                          let { value } = e.target;
                          value = value.replace(/[^0-9"]/g, '');
                          setValue('entered_otp', value, { shouldValidate: true });
                        },
                        required: 'Please enter OTP',
                      })}
                    />
                    <ErrorText
                      errors={errors}
                      input={{
                        name: 'entered_otp',
                        validation: {
                          requiredMsg: 'Please enter OTP'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} md={3} lg={2} display='flex' alignItems='center'>
                    <FullSizeButton
                      onClick={handleValidateOTP}
                      disabled={(canEdit() || canSupervise()) ? !(isAddressSame === 'yes') : true}
                      loading={loading.value && loading.name === 'validateOTP'}
                      loadingPosition='start'
                      margin={['xs', 'sm'].includes(screen) ? '0px' : null}
                    >
                      Validate OTP
                    </FullSizeButton>
                  </Grid>
                </>
              ) : null
            }
                    </Grid>
                  )
                  : null
              ) : null
            }
            <Grid container display='flex' alignItems='center' justifyContent='center'>
              <LoadingButtonPrimary
                variant='contained'
                loading={loading?.value && loading?.name === 'SUBMIT'}
                type='submit'
                disabled={(canEdit() || canSupervise()) ? (isAddressSame === 'no' ? false : !isOTPValidated) : true}
              >
                Submit
              </LoadingButtonPrimary>
              <ResetButton onClick={() => setIsOpen(false)}>Cancel</ResetButton>
            </Grid>
          </CustomForm>

        </Grid>
      )
  );
};

export default index;
