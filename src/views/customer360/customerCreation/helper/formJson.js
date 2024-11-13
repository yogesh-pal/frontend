/* eslint-disable no-unused-vars */
import {
  LeftSectionComp,
  BottomSectionComp
} from './UPIRadionComponent';
import { showComponent } from './redirectComponent';
import { biometricComponent } from './component';
import {
  radioRawTopAlignCss,
  radioRawParentOptionsCss,
  radioGroupRawCss
} from './style';
import {
  kycDocumentStep,
  personalInformationStep,
  employmentInformationStep,
  occupationAddressStep,
  nomineeDetailsStep,
  relationshipManagerStep,
  bankDetailsStep,
  sendOptStep
} from './stepper';
import { useCreateCustomer } from './stepperFunction';

export const formJsonDetails = (props) => {
  const {
    setLoader,
    setAlertShow,
    relationShipManagerDetails,
    dispatch,
    bankDetailsReducer,
    aadhaarCardTimeStampReducer,
    fatherOrSpouseReducer,
    resendReducer,
    unmaskedAadhaarNoReducer,
    customerDetails,
    setRedirect,
    customerID = null,
    setIsLoading,
    poolingIntervalRef,
    errorMessageHandler,
    customerHelperRef,
    bankDetails,
    CONFIGURATION
  } = props;

  const {
    nextValidateHandler,
    handleDynamicBankDetails,
    timeoutQRHandler,
    qrCodeHanlder,
    paymentStatusCheckHandler,
    skipClickHandler,
    proceedClickHandler,
    idProofListHandler,
    handleDynamicKYCValidation,
    aadhaarVerifyHandler,
    resetField,
    preFillIfExists,
    annualIncomeHandler,
    relationShipManagerMobileHandler,
    relationShipManagerCodeHandler,
    aadhaarOTPVerificationHandler,
    aadhaarCardOtpHandler,
    ifscDetailsHandler,
    handleNomineeValidationHandler,
    bankAccountVerificationHandler,
    pincodeVerificationHandler,
    panVerificationHandler,
    otpMobileVerificationHandler,
    otpHandler,
    onSaveClickHandler,
    onSaveClickHandlerID,
    onSaveClickHandlerAddress,
    aadhaarVerificationModeHandler,
    closeHandlerAadhaarVerificationHandler,
    biometricEnableHandler,
    onChangeKycHandler,
    resetFormValues,
    onDeleteHandlerId,
    customerOccupationHandler
  } = useCreateCustomer({
    customerID,
    setRedirect,
    setAlertShow,
    dispatch,
    resendReducer,
    setLoader,
    bankDetailsReducer,
    setIsLoading,
    fatherOrSpouseReducer,
    customerDetails,
    unmaskedAadhaarNoReducer,
    aadhaarCardTimeStampReducer,
    relationShipManagerDetails,
    customerHelperRef,
    poolingIntervalRef,
    errorMessageHandler,
    bankDetails,
    CONFIGURATION,
  });
  const formConfiguration = {
    form: [
      kycDocumentStep({
        customerID,
        customerDetails,
        aadhaarVerifyHandler,
        aadhaarCardOtpHandler,
        aadhaarOTPVerificationHandler,
        pincodeVerificationHandler,
        panVerificationHandler,
        idProofListHandler,
        handleDynamicKYCValidation,
        preFillIfExists,
        resetField,
        onSaveClickHandler,
        onSaveClickHandlerID,
        onSaveClickHandlerAddress,
        biometricComponent,
        aadhaarVerificationModeHandler,
        closeHandlerAadhaarVerificationHandler,
        CONFIGURATION,
        biometricEnableHandler,
        onChangeKycHandler,
        resetFormValues,
        onDeleteHandlerId
      }),
      personalInformationStep(),
      employmentInformationStep({
        annualIncomeHandler,
        customerOccupationHandler
      }),
      occupationAddressStep({
        pincodeVerificationHandler
      }),
      nomineeDetailsStep({
        customerDetails,
        handleNomineeValidationHandler
      }),
      relationshipManagerStep({
        relationShipManagerDetails,
        relationShipManagerCodeHandler,
        relationShipManagerMobileHandler
      }),
      bankDetailsStep({
        radioGroupRawCss,
        LeftSectionComp,
        BottomSectionComp,
        radioRawParentOptionsCss,
        radioRawTopAlignCss,
        proceedClickHandler,
        paymentStatusCheckHandler,
        showComponent,
        qrCodeHanlder,
        timeoutQRHandler,
        ifscDetailsHandler,
        customerDetails,
        bankAccountVerificationHandler,
        skipClickHandler,
        handleDynamicBankDetails,
        nextValidateHandler,
        customerHelperRef
      }),
      sendOptStep({
        otpHandler,
        otpMobileVerificationHandler
      }),
    ],
    stepper: {
      steps: ['KYC Documents', 'Personal Information', 'Employment Information', 'Occupation Address', 'Nominee Details', 'Relationship Manager', 'Bank Details', 'Send OTP'],
      icons: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'F'],
      hide: ['xs', 'sm'],
      stepperDirection: 'horizontal',
    },
    dataFormat: 'SINGLE',
  };

  return formConfiguration;
};
