/* eslint-disable max-len */
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Grid, FormHelperText, DialogContentText } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MODULE, REGEX } from '../../../../../constants';
import { HeadingMaster2 } from '../../../helper';
import { Service } from '../../../../../service';
import { errorMessageHandler } from '../../../../../utils';
import {
  ToastMessage, LivePhoto, MultipleLivePhoto, DialogBox
} from '../../../../../components';
import {
  TextFieldStyled, SelectMenuStyle, LoadingButtonPrimary,
  CenterContainerStyled, ButtonPrimary
} from '../../../../../components/styledComponents';

const ThirdPartyRelease = ({ customerDetails, closeOnSuccess }) => {
  const [dob, setDOB] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({ onSubmit: false, onSucces: false });
  const {
    handleSubmit, register, unregister, setValue, getValues, formState: { errors },
  } = useForm();
  const { loan_account_no: lan, loan_dt: loanDt, amt_dt: amtDt } = customerDetails;
  const { COLLATERALRELEASE } = MODULE;

  const IDPROOFValidations = {
    DRIVLIC: {
      pattern: { value: REGEX.ONLYCHARANDDIGITS, message: 'Please enter valid driving license number.' },
      minLength: {
        value: 16,
        message: 'Driving license number should be 16 characters.'
      },
      maxLength: {
        value: 16,
        message: 'Driving license number should not more than 16 characters.'
      },
    },
    PASSPORT: {
      pattern: { value: REGEX.MUSTALPHANUMBERIC, message: 'Please enter valid passport number.' },
      minLength: {
        value: 8,
        message: 'Passport number should be 8 characters.'
      },
      maxLength: {
        value: 8,
        message: 'Passport number should not more than 8 characters.'
      },
    },
    VOTERID: { pattern: { value: REGEX.ALPHANUMBERICWITHTWOMANDATORYLETTERS, message: 'Please enter valid voter id number.' } },
    PAN: {
      pattern: { value: REGEX.PANCARD, message: 'Please enter valid pancard number.' },
      maxLength: {
        value: 10,
        message: 'PAN card number should not more than 10 characters.'
      },
    },
  };

  useEffect(() => {
    register('dob', { required: 'Please select dob' });
  }, []);

  const formHandler = (values) => {
    setFormData(values);
    setIsConfirmationOpen({ onSubmit: true, onSucces: false });
  };

  const finalSubmitHandler = async () => {
    try {
      setIsConfirmationOpen({ onSubmit: false, onSucces: false });
      setLoading({ loader: true, name: 'onSubmit' });
      let thirdPartyDocs = '';
      Object.keys(formData).forEach((item) => {
        if (item.includes('document_live_photo')) {
          thirdPartyDocs += thirdPartyDocs.length ? `,${formData[item]}` : formData[item];
        }
      });
      const thiryPartyDOB = moment(formData.dob).format('YYYY-MM-DD');
      const { status } = await Service.post(`${process.env.REACT_APP_COLLATERAL_SERVICE}/third-party/maker`, {
        loan_account_no: lan,
        dt: loanDt,
        amt_dt: amtDt,
        third_party_id_type: formData.IdProof,
        third_party_id_number: formData.IdNumber,
        third_party_name: formData.name,
        third_party_dob: thiryPartyDOB,
        third_party_mobile: formData.mobileNo,
        third_party_doc_live_pic: thirdPartyDocs,
        third_party_live_pic: formData.third_party_live_photo,
        third_party_remarks: formData.remarks,
        third_party_osv_done: 'Yes',
        third_party_relationship: formData.thiryPartyRelation,
        third_party_other_relation: formData.others
      });
      if (status === 200) {
        setIsConfirmationOpen({ onSubmit: false, onSucces: true });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } catch (err) {
      console.log('err', err);
      const msg = errorMessageHandler(err.response?.data?.message);
      if (msg) {
        setAlertShow({ open: true, msg, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  const handleConfirmationClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsConfirmationOpen({ onSubmit: false, onSucces: false });
  };

  const disableDOBDates = (currentDate) => moment().diff(moment(currentDate), 'years') < 18;

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <form onSubmit={handleSubmit(formHandler)}>
        <Grid container padding='0px 10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='Third Party Relation*'
              select
              {...register('thiryPartyRelation', {
                onChange: (e) => setValue('thiryPartyRelation', e.target.value, { shouldValidate: true }),
                required: 'Please select third party relation'
              })}
            >
              <SelectMenuStyle key='father' value='FATHER'>Father</SelectMenuStyle>
              <SelectMenuStyle key='mother' value='MOTHER'>Mother</SelectMenuStyle>
              <SelectMenuStyle key='spouse' value='SPOUSE'>Spouse</SelectMenuStyle>
              <SelectMenuStyle key='cousin' value='COUSIN'>Cousin</SelectMenuStyle>
              <SelectMenuStyle key='children' value='CHILDREN'>Children</SelectMenuStyle>
              <SelectMenuStyle key='others' value='OTHERS'>Others</SelectMenuStyle>
            </TextFieldStyled>
            {renderError('thiryPartyRelation')}
          </Grid>
          { getValues('thiryPartyRelation') === 'OTHERS'
          && (
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='Others*'
              {...register('others', {
                onChange: (e) => {
                  if (e.target.value.trim().length) {
                    setValue('others', e.target.value?.toUpperCase());
                  } else {
                    setValue('others', null, { shouldValidate: true });
                  }
                },
                required: 'Please enter relation',
                pattern: { value: REGEX.ALPHABETS, message: 'Please enter valid relation' },
                maxLength: { value: 20, message: 'Maximum 20 characters allowed' }
              })}
            />
            {renderError('others')}
          </Grid>
          )}
        </Grid>
        <Grid container padding='10px 20px'>
          <HeadingMaster2>Third Party Details</HeadingMaster2>
        </Grid>
        <Grid container padding='0px 10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='Name*'
              {...register('name', {
                onChange: (e) => {
                  if (e.target.value.trim().length) {
                    setValue('name', e.target.value, { shouldValidate: true });
                  } else {
                    setValue('name', null, { shouldValidate: true });
                  }
                },
                required: 'Please enter name',
                pattern: { value: REGEX.ALPHABETS, message: 'Please enter valid name' },
                maxLength: { value: 20, message: 'Maximum 20 characters allowed' }
              })}
            />
            {renderError('name')}
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                className='date-picker'
                label='DOB*'
                inputFormat='dd/MM/yyyy'
                value={dob}
                onChange={(dobValue) => {
                  setDOB(dobValue);
                  setValue('dob', dobValue, { shouldValidate: true, shouldDirty: true });
                }}
                renderInput={(params) => (
                  <TextFieldStyled
                    onKeyDown={(e) => e.preventDefault()}
                    variant='outlined'
                    {...params}
                  />
                )}
                disableFuture
                disableHighlightToday
                shouldDisableYear={disableDOBDates}
                shouldDisableDate={disableDOBDates}
              />
            </LocalizationProvider>
            {renderError('dob')}
          </Grid>
        </Grid>
        <Grid container padding='0px 10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='Mobile Number*'
              {...register('mobileNo', {
                onChange: (e) => setValue('mobileNo', e.target.value.trim(), { shouldValidate: true }),
                required: 'Please enter mobile number',
                pattern: { value: REGEX.MOBILENUMBER, message: 'Please enter valid mobile number of 10 digits' }
              })}
            />
            {renderError('mobileNo')}
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='ID Proof*'
              select
              {...register('IdProof', {
                required: 'Please select id proof'
              })}
              onChange={(e) => {
                const selectedValue = e.target.value;
                // setValue('IdNumber', null, { shouldValidate: true });
                unregister('IdNumber');
                register('IdNumber', {
                  required: 'Please Enter Id Number',
                  value: null,
                  pattern: IDPROOFValidations?.[selectedValue]?.pattern ?? undefined,
                  minLength: IDPROOFValidations?.[selectedValue]?.minLength ?? undefined,
                  maxLength: IDPROOFValidations?.[selectedValue]?.maxLength ?? undefined,
                  onChange: (v) => {
                    if (v.target.value.trim().length) {
                      setValue('IdNumber', v.target.value, { shouldValidate: true });
                    } else {
                      setValue('IdNumber', null, { shouldValidate: true });
                    }
                  },
                });
              }}
            >
              <SelectMenuStyle key='PASSPORT' value='PASSPORT'>Passport</SelectMenuStyle>
              <SelectMenuStyle key='DRIVLIC' value='DRIVLIC'>Driving License</SelectMenuStyle>
              <SelectMenuStyle key='VOTERID' value='VOTERID'>Voter ID</SelectMenuStyle>
              <SelectMenuStyle key='PAN' value='PAN'>PAN Card</SelectMenuStyle>
              <SelectMenuStyle key='GID' value='GID'>Government Issued ID Card</SelectMenuStyle>
            </TextFieldStyled>
            {renderError('IdProof')}
          </Grid>
        </Grid>
        <Grid container padding='0px 10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='ID Number*'
              {...register('IdNumber', {
                onChange: (e) => {
                  if (e.target.value.trim().length) {
                    setValue('IdNumber', e.target.value?.toUpperCase(), { shouldValidate: true });
                  } else {
                    setValue('IdNumber', null, { shouldValidate: true });
                  }
                },
                required: 'Please enter id number',
                // pattern: { value: REGEX.ALPHANUMERIC, message: 'Please enter valid id number' }
              })}
            />
            {renderError('IdNumber')}
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='OSV Done?*'
              select
              {...register('osvDone', {
                onChange: (e) => setValue('osvDone', e.target.value, { shouldValidate: true }),
                required: 'Please select osv done?'
              })}
            >
              <SelectMenuStyle key='Yes' value='yes'>Yes</SelectMenuStyle>
              <SelectMenuStyle key='No' value='no'>No</SelectMenuStyle>
            </TextFieldStyled>
            {renderError('osvDone')}
          </Grid>
        </Grid>
        <Grid container padding='0px 10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <MultipleLivePhoto
              register={register}
              unregister={unregister}
              errors={errors}
              setValue={setValue}
              getValues={getValues}
              input={{
                name: 'document_live_photo',
                label: 'Document Live Photo',
                filePath: `${COLLATERALRELEASE.name}/${COLLATERALRELEASE.details.documentPicture}`,
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload document live photo',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <LivePhoto
              register={register}
              errors={errors}
              setValue={setValue}
              getValues={getValues}
              input={{
                name: 'third_party_live_photo',
                label: 'Third Party Live Photo',
                type: 'file',
                filePath: `${COLLATERALRELEASE.name}/${COLLATERALRELEASE.details.thirdPartyPicture}`,
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload thiry party live photo',
                }
              }}
            />
          </Grid>
        </Grid>
        <Grid container padding='0px 10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='Remarks*'
              {...register('remarks', {
                onChange: (e) => {
                  if (e.target.value.trim().length) {
                    setValue('remarks', e.target.value, { shouldValidate: true });
                  } else {
                    setValue('remarks', null, { shouldValidate: true });
                  }
                },
                required: 'Please enter remarks',
                maxLength: { value: 30, message: 'Maximum 30 characters allowed' }
              })}
            />
            {renderError('remarks')}
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} display='flex' justifyContent='center'>
            <LoadingButtonPrimary
              type='submit'
              disabled={getValues('osvDone') !== 'yes'}
              loading={loading.loader && loading.name === 'onSubmit'}
              loadingPosition='start'
            >
              Submit
            </LoadingButtonPrimary>
          </Grid>
        </Grid>
      </form>
      <DialogBox
        isOpen={isConfirmationOpen.onSubmit || isConfirmationOpen.onSucces}
        title=''
        handleClose={handleConfirmationClose}
        width={isConfirmationOpen.onSubmit ? 'auto' : '460px'}
        padding='40px'
      >
        <DialogContentText>
          {
                isConfirmationOpen.onSubmit ? 'Are you sure you want to submit the case for Approval?'
                  : 'The case has been submitted successfully for approval.'
            }
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          {
            isConfirmationOpen.onSubmit ? (
              <>
                <ButtonPrimary
                  onClick={finalSubmitHandler}
                  variant='contained'
                  loading={false}
                >
                  Yes
                </ButtonPrimary>
                <ButtonPrimary onClick={() => setIsConfirmationOpen({ onSubmit: false, onSucces: false })}>No</ButtonPrimary>
              </>
            )
              : (<ButtonPrimary onClick={() => closeOnSuccess()}>Okay</ButtonPrimary>)
          }
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};
export default React.memo(ThirdPartyRelease);
