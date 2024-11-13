/* eslint-disable max-len */
import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorText from '../errorHandler';
import store from '../../../redux/store';
import PageLoader from '../../PageLoader';
import { Service } from '../../../service';
import CustomToaster from '../../mesaageToaster';
import MultipleLivePhoto from '../multipleLivePhoto';
import { TextFieldStyled, FullSizeButton } from '../../styledComponents';
import FileInputEndUSeOfGold from './FileInputEndUseOfGold';

const EndUseOfGold = (props) => {
  const [isVerified, setIsVerified] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });

  const {
    input, register, errors, setValue, getValues, unregister, trigger, clearErrors
  } = props;
  const { alignment } = input.inputField;
  const state = store.getState();
  const { formData } = state.loanMaker;
  const colenderArray = ['IOB - BUSINESS'];
  const { colender } = formData;
  const { end_use_loan_details: endUseLoanDetails } = formData;
  const isPresent = endUseLoanDetails && endUseLoanDetails?.udyam_meta_data && endUseLoanDetails?.udyam_meta_data?.mode === 'Offline' && endUseLoanDetails?.udyam_meta_data?.proof?.length > 0 && !endUseLoanDetails?.udyam_meta_data?.proof?.[0]?.includes('.pdf');
  useEffect(() => {
    if (input?.isVerify && (getValues()).hasOwnProperty(`${input.inputField.name}_verify`)) {
      const inputVerifiedStatus = getValues(`${input.inputField.name}_verify`);
      if (inputVerifiedStatus === true) {
        setIsVerified({ verified: true });
      } else if (inputVerifiedStatus === false) {
        setIsVerified({ verified: false });
      }
    }
  }, []);

  const verifyNumber = async () => {
    try {
      setIsLoading({ loader: true, name: 'onVerify' });
      const result = await trigger([input.inputField.name]);
      if (result) {
        const udyamNumber = getValues(input.inputField.name);
        const { data } = await Service.post(`${process.env.REACT_APP_UDYAM_VERIFY_SERVICE}?id=${udyamNumber}`, {});
        if (data?.is_verified) {
          setValue(`${input.inputField.name}_verify`, true);
          setIsVerified({ verified: true });
        } else {
          setValue(`${input.inputField.name}_verify`, false);
          setIsVerified({ verified: false });
        }
      }
    } catch (err) {
      console.log('Error', err);
      setValue(`${input.inputField.name}_verify`, false);
      setIsVerified({ verified: false });
      setAlertShow({ open: true, msg: `Not able to verify ${input.inputField.label} at the moment.`, alertType: 'error' });
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  return (
    <>
      {isLoading.loader && isLoading.name === 'onVerify' ? <PageLoader /> : null}
      <CustomToaster
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <Grid container>
        <Grid item xs={alignment?.xs ?? 12} sm={alignment?.sm ?? 12} md={alignment?.md ?? 12} lg={alignment?.lg ?? 12} xl={alignment?.xl ?? 12}>
          <TextFieldStyled
            label={`${input?.inputField?.label}*`}
            disabled={input?.disabled || (isVerified && isVerified.verified)}
            InputProps={{
              endAdornment: isVerified ? <CheckCircleOutlineIcon style={{ color: isVerified.verified ? 'green' : 'red' }} /> : null,
            }}
            {...register(input.inputField.name, {
              onChange: (e) => {
                setValue(input.inputField.name, e.target.value.trim(), { shouldValidate: true });
                setIsVerified(null);
                unregister(`${input.inputField.name}_verify`);
              },
              required: input?.inputField?.validation?.isRequired ?? false,
              pattern: (input?.inputField?.validation?.pattern) ? new RegExp(input?.inputField?.validation?.pattern) : undefined
            })}
          />
          <ErrorText input={input?.inputField} errors={errors} />
        </Grid>
        { input?.isVerify
          ? (
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
              <FullSizeButton
                onClick={verifyNumber}
                disabled={input?.disabled || (isVerified && isVerified.verified)}
                loadingPosition='start'
              >
                VERIFY
              </FullSizeButton>
            </Grid>
          )
          : null}
      </Grid>
      <Grid container padding='20px 0px'>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          {isPresent
            && (
              <MultipleLivePhoto
                register={register}
                unregister={unregister}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
                input={{
                  name: input.uploadField.name,
                  disable: input?.disabled,
                  label: input.uploadField.label,
                  filePath: input.uploadField.filePath,
                  validation: formData.colender === 'IOB - AGRI' && input.name === 'agriculture_record_number' ? {} : input?.uploadField?.validation ?? {},
                  maxUploadCount: input?.uploadField?.validation?.maxUploadCount ?? 5,
                  maxUploadMsg: input?.uploadField?.validation?.maxUploadMsg ?? 'Maximum Upload limit reached.'
                }}
              />
            )}
          {!colenderArray.includes(colender) && !isPresent
            ? (
              <MultipleLivePhoto
                register={register}
                unregister={unregister}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
                input={{
                  name: input.uploadField.name,
                  disable: input?.disabled,
                  label: input.uploadField.label,
                  filePath: input.uploadField.filePath,
                  validation: formData.colender === 'IOB - AGRI' && input.name === 'agriculture_record_number' ? {} : input?.uploadField?.validation ?? {},
                  maxUploadCount: input?.uploadField?.validation?.maxUploadCount ?? 5,
                  maxUploadMsg: input?.uploadField?.validation?.maxUploadMsg ?? 'Maximum Upload limit reached.'
                }}
              />
            )
            : !isPresent && (
              <FileInputEndUSeOfGold
                register={register}
                errors={errors}
                clearErrors={clearErrors}
                isS3Upload={colenderArray.includes(colender)}
                input={{
                  name: input.uploadField.name,
                  disabled: input?.disabled,
                  label: input.uploadField.label,
                  fileSize: input.uploadField.fileSize,
                  isMulti: input.uploadField.isMulti,
                  filePath: input.uploadField.filePath,
                  validation: input.uploadField?.validation,
                  maxUploadCount: input.uploadField?.validation?.maxUploadCount ?? 5,
                  maxUploadMsg: input?.uploadField?.validation?.maxUploadMsg ?? 'Maximum Upload limit reached.'
                }}
                setValue={setValue}
                getValues={getValues}
              />
            )}
        </Grid>
      </Grid>
    </>
  );
};
export default EndUseOfGold;
