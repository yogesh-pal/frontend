/* eslint-disable max-len */
/* eslint-disable camelcase */
import { IDENTIFIER, REGEX, SENDOTPINTERVALSPOLLING } from '../../../../constants';
import { Service } from '../../../../service';
import { ReadOnlyFields } from '../../loanCreation/loanDisbursementReadOnlyFields';

export const viewDisbursementDetailsJson = (customerDetails) => {
  const formConfiguration = {
    form: [
      {
        title: '',
        variant: 'outlined',
        input: {
          readonlyData: ReadOnlyFields(customerDetails),
          identifier: IDENTIFIER.READONLY,
        },
        type: 'readonly',
        alignment: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6
        }
      }
    ],
  };
  return formConfiguration;
};

export const otpFormJsonDetails = (props) => {
  const {
    applicationNo,
    mobile,
    setAlertShow,
    dispatch,
    setIsOTPVerified,
    resendReducer,
    additionalInfo
  } = props;

  const recursivePoll = async (currentInterval, id, resetfunction) => {
    try {
      const pollingOtpRes = await Service.get(`${process.env.REACT_APP_LOS_OTP_SERVICE}/audit_log?otp_audit_log_id=${id}`);
      if (currentInterval >= SENDOTPINTERVALSPOLLING.length) {
        setAlertShow({ open: true, msg: 'Please try again after some time.', alertType: 'error' });
        return;
      }

      if (pollingOtpRes.data.status === 1) {
        if (pollingOtpRes.data.data.otp_status === 'FAILED') {
          resetfunction();
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

  const otpHandler = async (apiDetails, name, resetfunction) => {
    try {
      const { language } = apiDetails;
      // if (!language) {
      //   setAlertShow({ open: true,
      // msg: 'Kindly select the language first to send OTP.', alertType: 'error' });
      //   return { success: false, disabled: false };
      // }
      if (name === 'CALL') {
        const { data } = await Service.post(`${process.env.REACT_APP_LOS_OTP_SERVICE}/send`, {
          application_no: applicationNo,
          otp_type: 'CALL',
          language

        });
        if (data.status === 1) {
          dispatch(resendReducer('SEND'));
          data.success = true;
          data.disabled = true;

          const id = data.otp_audit_log_id;
          setTimeout(() => {
            recursivePoll(1, id, resetfunction);
          }, SENDOTPINTERVALSPOLLING[0]);

          return data;
        }
        setAlertShow({ open: true, msg: data?.msg, alertType: 'error' });
        return { success: false, disabled: false };
      }
      if (name === 'WHATSAPP') {
        const { data } = await Service.post(`${process.env.REACT_APP_LOS_OTP_SERVICE}/send`, {
          application_no: applicationNo,
          otp_type: 'WHATSAPP',
          language
        });
        if (data.status === 1) {
          dispatch(resendReducer('SEND'));
          data.success = true;
          data.disabled = true;

          const id = data.otp_audit_log_id;
          setTimeout(() => {
            recursivePoll(1, id, resetfunction);
          }, SENDOTPINTERVALSPOLLING[0]);

          return data;
        }
        setAlertShow({ open: true, msg: data?.msg, alertType: 'error' });
        return { success: false, disabled: false };
      }
      const { data } = await Service.post(`${process.env.REACT_APP_LOS_OTP_SERVICE}/send`, {
        application_no: applicationNo,
        otp_type: 'SMS',
        language
      });
      if (data.status === 1) {
        dispatch(resendReducer('SEND'));
        data.success = true;
        data.disabled = true;

        const id = data.otp_audit_log_id;
        setTimeout(() => {
          recursivePoll(1, id, resetfunction);
        }, SENDOTPINTERVALSPOLLING[0]);

        return data;
      }
      setAlertShow({ open: true, msg: 'Invalid mobile number.', alertType: 'error' });
      return { success: false, disabled: false };
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.application_no) {
        setAlertShow({ open: true, msg: err?.response?.data?.application_no, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong.', alertType: 'error' });
      }
      return { success: false, disabled: false };
    }
  };

  const otpMobileVerificationHandler = async (apiDetails) => {
    try {
      const { data } = await Service.post(`${process.env.REACT_APP_LOS_OTP_SERVICE}/validate`, {
        application_no: applicationNo,
        otp: apiDetails.primaryContactNumberOTP
      });
      if (data?.is_validated === 'True') {
        setAlertShow({ open: true, msg: 'OTP Verification successful.', alertType: 'success' });
        setIsOTPVerified(true);
        dispatch(resendReducer('VERIFIED'));
        data.success = true;
        return data;
      }
      setAlertShow({ open: true, msg: 'OTP Verification failed.', alertType: 'error' });
      return { success: false };
    } catch (err) {
      if (err?.response?.data?.is_validated === 'False') {
        setAlertShow({ open: true, msg: 'OTP Verification failed.', alertType: 'error' });
      } else if (err?.response?.data?.application_no) {
        setAlertShow({ open: true, msg: err.response.data.application_no, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong.', alertType: 'error' });
      }
      return { success: false };
    }
  };

  const handleLanguageEnable = (input, updateJsonHandler) => {
    updateJsonHandler(input, {
      dynamicKey: 'enableLanguage',
      success: true
    });
  };

  const handleBranchLanguage = (info) => {
    if (info?.branchLanguage?.hasOwnProperty(info?.selectedBranch)) {
      if (info.branchLanguage[info.selectedBranch]) {
        return info.branchLanguage[info.selectedBranch];
      }
      return 'hi';
    }
    return 'hi';
  };

  const formConfiguration = {
    form: [
      {
        variant: 'outlined',
        input: [
          {
            name: 'language',
            label: 'Language',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            multiSelect: false,
            defaultValue: handleBranchLanguage(additionalInfo),
            option: [{ label: 'Hindi', value: 'hi' }, { label: 'Gujarati', value: 'gu' }, { label: 'Marathi', value: 'mr' }],
            alignment: {
              xs: 12,
              sm: 12,
              md: 4,
              lg: 4,
              xl: 4
            }
          },
          {
            name: 'primary_mobile_number',
            label: 'Primary Mobile Number',
            type: 'text',
            identifier: IDENTIFIER.INPUTBUTTONOTP,
            function: otpHandler,
            timerExpireHandler: handleLanguageEnable,
            apiBody: ['primary_mobile_number', 'language'],
            disabled: true,
            defaultValue: mobile,
            status: false,
            disableTime: 1000,
            isButtonEnable: true,
            count: 180,
            buttonDetails: {
              isCall: true,
              isOtp: true,
              isWhatsapp: true,
              disableWhatsapp: true,
              attemptWhatsapp: 1,
              callName: 'Send OTP via Call',
              sendOTP: 'Send OTP',
              sendWhatsapp: 'OTP via Whatsapp',
              fail: {
                disableWhatsapp: false,
              }
            },
            enableLanguage: {
              disable: {
                value: false,
                disableFields: ['language'],
              },
            },
            success: {
              setValueArr: [{
                value: '',
                name: 'OTPVerificationStatus'
              }],
              showField: [{
                name: 'primaryContactNumberOTP',
                condition: 'isShow',
                value: true
              },
              {
                name: 'OTPVerificationStatus',
                condition: 'isShow',
                value: false
              }
              ],
              disable: {
                value: true,
                disableFields: ['language'],
              },
              status: true,
            },
            fail: {
              setValueArr: [{
                value: '',
                name: 'OTPVerificationStatus'
              }],
              showField: [{
                name: 'primaryContactNumberOTP',
                condition: 'isShow',
                value: false
              },
              {
                name: 'OTPVerificationStatus',
                condition: 'isShow',
                value: false
              }],
              status: true
            }
          },
          {
            name: 'primaryContactNumberOTP',
            label: 'OTP',
            type: 'text',
            identifier: IDENTIFIER.INPUTOTP,
            function: otpMobileVerificationHandler,
            status: false,
            enablebutton: {
              length: 4
            },
            apiBody: ['primary_mobile_number', 'primaryContactNumberOTP'],
            success: {
              setValueArr: [{
                value: 'VALID',
                name: 'OTPVerificationStatus'
              }],
              showField: [{
                name: 'primaryContactNumberOTP',
                condition: 'isShow',
                value: false
              },
              {
                name: 'OTPVerificationStatus',
                condition: 'isShow',
                value: true
              }],
              disable: {
                value: true,
                disableFields: ['primary_mobile_number'],
              },
            },
            fail: {
              setValueArr: [{
                value: 'INVALID',
                name: 'OTPVerificationStatus'
              }],
              showField: [{
                name: 'primaryContactNumberOTP',
                condition: 'isShow',
                value: true
              },
              {
                name: 'OTPVerificationStatus',
                condition: 'isShow',
                value: true
              }],
              disable: {
                value: false,
                disableFields: ['primary_mobile_number'],
              },
            },
            condition: {
              type: 'visible',
              isShow: false
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter OTP',
              pattern: REGEX.OTPVERIFICATION,
              patternMsg: 'Please enter valid OTP.'
            }
          },
          {
            name: 'OTPVerificationStatus',
            label: 'Status',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter your name',
              pattern: REGEX.ALPHABETS,
              patternMsg: 'Alphabetical characters only'
            },
          }
        ],
        alignment: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6
        }
      },
    ],
    stepper: {
      steps: ['Send OTP'],
      icons: ['A'],
      hide: ['xs', 'sm'],
      stepperDirection: 'horizontal',
      isRemovePadding: true
    },
    dataFormat: 'SINGLE',
  };

  return formConfiguration;
};
