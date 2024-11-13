/* eslint-disable no-unused-vars */
import {
  FUNCTION_IDENTIFIER,
  IDENTIFIER,
  REGEX,
  SUCCESSHANDLER,
  STOPWATCHTYPE,
  MODULE
} from '../../../../../constants';

const bankDetailsStep = (props) => {
  const {
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
  } = props;

  const { CUSTOMER } = MODULE;

  const leftSectionHandler = (leftSectionDetails) => {
    try {
      const { disabled, option } = leftSectionDetails;
      const { value } = option;
      const mapping = {
        UPI: 'Yes',
        Yes: 'No'
      };
      return LeftSectionComp(mapping[value], disabled);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const bottomSectionHandler = (leftSectionDetails) => {
    try {
      const { disabled, option } = leftSectionDetails;
      const { value } = option;
      const mapping = {
        UPI: 'Yes',
        Yes: 'No'
      };
      return BottomSectionComp(mapping[value], disabled);
    } catch (e) {
      console.log('Error', e);
    }
  };

  return {
    title: 'Bank Details',
    variant: 'outlined',
    input: [
      {
        alignment: {
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12
        },
        name: 'enter_bank_details',
        label: 'Enter Bank Details',
        type: 'radio',
        identifier: IDENTIFIER.CUSTOMRADIOBUTTON,
        radioGroupComponentCss: radioGroupRawCss,
        option: [
          {
            leftAlign: leftSectionHandler,
            bottomAlign: bottomSectionHandler,
            value: 'UPI',
            parentComponentCss: radioRawParentOptionsCss,
            topComponentCss: radioRawTopAlignCss,
            label: 'UPI',
          },
          {
            leftAlign: leftSectionHandler,
            bottomAlign: bottomSectionHandler,
            value: 'Yes',
            parentComponentCss: radioRawParentOptionsCss,
            topComponentCss: radioRawTopAlignCss,
            label: 'Yes'
          },

        ],
        defaultValue: 'No',
        condition: {
          type: 'visible',
          isShow: true
        },
      },
      {
        alignment: {
          xs: 6,
          sm: 6,
          md: 6,
          lg: 6,
          xl: 6
        },
        name: 'proceed',
        label: 'Proceed',
        identifier: IDENTIFIER.BUTTON,
        clickHanlder: proceedClickHandler,
        style: {
          width: '200px',
          position: 'absolute',
          right: 0,
          boxShadow: 'none',
          marginBottom: '20px'
        },
        layoutStyle: {
          paddingBottom: '40px'
        },
        limitReact: {
          disableOption: [
            {
              name: 'enter_bank_details',
              value: 'UPI',
              disabled: true
            }
          ],
          showField: [
            {
              name: 'skip',
              condition: 'isShow',
              value: true
            },
            {
              name: 'passbook_cheque_url',
              condition: 'isShow',
              value: false
            },
            {
              name: 'proprietorship_proof',
              condition: 'isShow',
              value: false
            },
            {
              name: 'account_number',
              condition: 'isShow',
              value: true
            },
            {
              name: 'branch_name',
              condition: 'isShow',
              value: true
            },
            {
              name: 'bank_name',
              condition: 'isShow',
              value: true
            },
            {
              name: 'ifsc',
              condition: 'isShow',
              value: true
            },
            {
              name: 'Qrcode',
              condition: 'isShow',
              value: false
            },
            {
              name: 'bankAccountVerificationStatus',
              condition: 'isShow',
              value: false
            },
            {
              name: 'beneficiary_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_account_number',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_branch_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_bank_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_ifsc',
              condition: 'isShow',
              value: false
            },
            {
              name: 'confirmed_with_customer',
              condition: 'isShow',
              value: false
            },
          ],
          disable: {
            value: true,
            disableFields: ['proceed'],
          },
          resetFields: ['upi_bank_name', 'upi_ifsc', 'upi_branch_name', 'upi_account_number'],
          enable: {
            value: false,
            disableFields: ['skip'],
          }
        },
        component: showComponent,
        success: {
          CONFIG: {
            IDENTIFIER: SUCCESSHANDLER.BASEDONVAUE,
            KEYS: {
              key: 'enter_bank_details',
            }
          },
          UPI: {
            showField: [
              {
                name: 'confirmed_with_customer',
                condition: 'isShow',
                value: false
              },
              {
                name: 'Qrcode',
                condition: 'isShow',
                value: true
              },
              {
                name: 'passbook_cheque_url',
                condition: 'isShow',
                value: false
              },
              {
                name: 'proprietorship_proof',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_account_number',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_branch_name',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_bank_name',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_ifsc',
                condition: 'isShow',
                value: false
              },
              {
                name: 'account_number',
                condition: 'isShow',
                value: false
              },
              {
                name: 'branch_name',
                condition: 'isShow',
                value: false
              },
              {
                name: 'bank_name',
                condition: 'isShow',
                value: false
              },
              {
                name: 'ifsc',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_account_number',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_branch_name',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_bank_name',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_ifsc',
                condition: 'isShow',
                value: false
              },
              {
                name: 'bankAccountVerificationStatus',
                condition: 'isShow',
                value: false
              },
              {
                name: 'beneficiary_name',
                condition: 'isShow',
                value: false
              }
            ],
          },
          Yes: {
            showField: [
              {
                name: 'passbook_cheque_url',
                condition: 'isShow',
                value: false
              },
              {
                name: 'proprietorship_proof',
                condition: 'isShow',
                value: false
              },
              {
                name: 'account_number',
                condition: 'isShow',
                value: true
              },
              {
                name: 'branch_name',
                condition: 'isShow',
                value: true
              },
              {
                name: 'bank_name',
                condition: 'isShow',
                value: true
              },
              {
                name: 'ifsc',
                condition: 'isShow',
                value: true
              },
              {
                name: 'Qrcode',
                condition: 'isShow',
                value: false
              },
              {
                name: 'bankAccountVerificationStatus',
                condition: 'isShow',
                value: false
              },
              {
                name: 'beneficiary_name',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_account_number',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_branch_name',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_bank_name',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upi_ifsc',
                condition: 'isShow',
                value: false
              },
              {
                name: 'confirmed_with_customer',
                condition: 'isShow',
                value: false
              },
            ],
            resetFields: ['upi_bank_name', 'upi_ifsc', 'upi_branch_name', 'upi_account_number'],
            disable: {
              value: false,
              disableFields: ['skip'],
            }
          }
        },
        fail: {
          showField: [
            {
              name: 'Qrcode',
              condition: 'isShow',
              value: false
            },
            {
              name: 'enter_bank_details',
              condition: 'isShow',
              value: true
            },
            {
              name: 'proceed',
              condition: 'isShow',
              value: true
            },
            {
              name: 'skip',
              condition: 'isShow',
              value: true
            },
          ],
        },
        condition: {
          type: 'visible',
          isShow: true
        },
      },
      {
        alignment: {
          xs: 6,
          sm: 6,
          md: 6,
          lg: 6,
          xl: 6
        },
        name: 'skip',
        label: 'Skip',
        identifier: IDENTIFIER.BUTTON,
        clickHanlder: skipClickHandler,
        layoutStyle: {
          paddingBottom: '40px'
        },
        success: {
          showField: [
            {
              name: 'passbook_cheque_url',
              condition: 'isShow',
              value: false
            },
            {
              name: 'proprietorship_proof',
              condition: 'isShow',
              value: false
            },
            {
              name: 'account_number',
              condition: 'isShow',
              value: false
            },
            {
              name: 'branch_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'bank_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'ifsc',
              condition: 'isShow',
              value: false
            },
            {
              name: 'Qrcode',
              condition: 'isShow',
              value: false
            },
            {
              name: 'bankAccountVerificationStatus',
              condition: 'isShow',
              value: false
            },
            {
              name: 'beneficiary_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_account_number',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_branch_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_bank_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_ifsc',
              condition: 'isShow',
              value: false
            },
          ],
          updateFormValues: [
            {
              name: 'activeFormIndex',
              value: 7
            }
          ]
        },
        style: {
          width: '200px',
          position: 'absolute',
          left: 0,
          background: '#ede9f1',
          boxShadow: 'none',
          color: '#502A74',
        },
        condition: {
          type: 'visible',
          isShow: true
        },

      },
      {
        alignment: {
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12
        },
        WatchType: STOPWATCHTYPE.FLAT,
        style: {
          iframe: {
            width: '100%',
            height: '700px',
            border: 'none',
          },
          parent: {
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center'
          },
          stopWatch: {
            position: 'absolute',
            right: '30px',
            top: '40px'
          }
        },
        name: 'Qrcode',
        loadingMessage: 'Loading QR for bank details verification.',
        identifier: IDENTIFIER.QRCODE,
        buttonDetails: {
          btn: [
            {
              name: 'Payment Status',
              clickHandler: paymentStatusCheckHandler
            }
          ]
        },
        component: showComponent,
        initialHandler: qrCodeHanlder,
        timeoutHandler: timeoutQRHandler,
        redirect: {
          showField: [
            {
              name: 'Qrcode',
              condition: 'isShow',
              value: false
            },
            {
              name: 'passbook_cheque_url',
              condition: 'isShow',
              value: false
            },
            {
              name: 'proprietorship_proof',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_account_number',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_branch_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_bank_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_ifsc',
              condition: 'isShow',
              value: false
            },
            {
              name: 'account_number',
              condition: 'isShow',
              value: true
            },
            {
              name: 'branch_name',
              condition: 'isShow',
              value: true
            },
            {
              name: 'bank_name',
              condition: 'isShow',
              value: true
            },
            {
              name: 'ifsc',
              condition: 'isShow',
              value: true
            },
            {
              name: 'Qrcode',
              condition: 'isShow',
              value: false
            },
            {
              name: 'bankAccountVerificationStatus',
              condition: 'isShow',
              value: false
            },
            {
              name: 'beneficiary_name',
              condition: 'isShow',
              value: false
            }
          ],
          disableOption: [
            {
              name: 'enter_bank_details',
              value: 'UPI',
              disabled: true
            }
          ],
          disable: {
            value: true,
            disableFields: ['proceed'],
          },
          enable: {
            value: false,
            disableFields: ['skip'],
          },
        },
        onClickUpdateJSON: {
          disable: {
            value: true,
            disableFields: ['proceed', 'skip'],
          },
        },
        paymentSuccess: {
          setValueArr: [
            {
              value: 'VALID',
              name: 'bankAccountVerificationStatus'
            },
            {
              name: 'upi_account_number',
              apiKey: 'upi_account_number'
            },
            {
              name: 'upi_branch_name',
              apiKey: 'upi_branch_name'
            },
            {
              name: 'upi_bank_name',
              apiKey: 'upi_bank_name'
            },
            {
              name: 'upi_ifsc',
              apiKey: 'upi_ifsc'
            },
            {
              name: 'beneficiary_name',
              apiKey: 'beneficiary_name'
            }
          ],
          showField: [
            {
              name: 'bankAccountVerificationStatus',
              condition: 'isShow',
              value: true
            },
            {
              name: 'upi_account_number',
              condition: 'isShow',
              value: true
            },
            {
              name: 'upi_branch_name',
              condition: 'isShow',
              value: true
            },
            {
              name: 'upi_bank_name',
              condition: 'isShow',
              value: true
            },
            {
              name: 'upi_ifsc',
              condition: 'isShow',
              value: true
            },
            {
              name: 'Qrcode',
              condition: 'isShow',
              value: false
            },
            {
              name: 'confirmed_with_customer',
              condition: 'isShow',
              value: true
            },
            {
              name: 'beneficiary_name',
              condition: 'isShow',
              value: true
            },
          ],
          // disableOption: [
          //   {
          //     name: 'enter_bank_details',
          //     value: 'UPI',
          //     disabled: true,
          //   },
          //   {
          //     name: 'enter_bank_details',
          //     value: 'Yes',
          //     disabled: true
          //   }
          // ],
        },

        status: false,
        success: {
          disable: {
            value: true,
            disableFields: ['skip'],
          },
          enable: {
            value: false,
            disableFields: ['proceed'],
          },
        },
        fail: {
          disable: {
            value: false,
            disableFields: ['proceed', 'skip'],
          },
          showField: [
            {
              name: 'upi_account_number',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_branch_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_bank_name',
              condition: 'isShow',
              value: false
            },
            {
              name: 'upi_ifsc',
              condition: 'isShow',
              value: false
            },
            {
              name: 'Qrcode',
              condition: 'isShow',
              value: false
            },
            {
              name: 'bankAccountVerificationStatus',
              condition: 'isShow',
              value: false
            },
          ],
        },
        initiatTimer: {
          hr: 0,
          min: 3,
          sec: 59
        },
        condition: {
          type: 'visible',
          isShow: false
        },
      },
      {
        name: 'upi_ifsc',
        label: 'IFSC',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: '',
        disabled: true,
        condition: {
          type: 'visible',
          isShow: false
        },
      },
      {
        name: 'upi_bank_name',
        label: 'Bank Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: '',
        disabled: true,
        condition: {
          type: 'visible',
          isShow: false
        },
      },
      {
        name: 'upi_branch_name',
        label: 'Branch Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: '',
        disabled: true,
        condition: {
          type: 'visible',
          isShow: false
        },
      },
      {
        name: 'upi_account_number',
        label: 'Bank Account Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: '',
        disabled: true,
        condition: {
          type: 'visible',
          isShow: false
        },
      },
      {
        name: 'confirmed_with_customer',
        label: 'Confirmed with customer',
        type: 'text',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
        defaultValue: 'Yes',
        condition: {
          type: 'visible',
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select confirmed with customer.',
        }
      },
      {
        name: 'ifsc',
        label: 'IFSC',
        type: 'text',
        isUpperCase: true,
        identifier: IDENTIFIER.INPUTOTP,
        function: ifscDetailsHandler,
        buttonName: 'Validate IFSC',
        apiBody: ['ifsc'],
        defaultValue: customerDetails?.ifsc || '',
        success: {
          setValueArr: [
            {
              apiKey: 'bank',
              name: 'bank_name'
            },
            {
              apiKey: 'branch',
              name: 'branch_name'
            }

          ],
          disable: {
            value: true,
            disableFields: ['bank_name', 'branch_name'],
          },
          enable: {
            value: false,
            disableFields: ['account_number']
          },
          status: true
        },
        fail: {
          disable: {
            value: false,
            disableFields: ['bank_name', 'branch_name'],
          },
          enable: {
            value: true,
            disableFields: ['account_number']
          },
          resetFields: ['bank_name', 'branch_name'],
          status: true
        },
        // condition: {
        //   type: 'showOnValue',
        //   baseOn: 'enter_bank_details',
        //   baseValue: 'Yes',
        // },
        condition: {
          type: 'visible',
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter ifsc code.',
          pattern: /^[A-Za-z0-9\s]{11}$/i,
          patternMsg: 'Please enter valid ifsc code.'
        },
      },
      {
        name: 'bank_name',
        label: 'Bank Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: customerDetails?.bank_name || '',
        // condition: {
        //   type: 'showOnValue',
        //   baseOn: 'enter_bank_details',
        //   baseValue: 'Yes',
        // },
        condition: {
          type: 'visible',
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter bank name.',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid bank name.',
          maxLength: 150,
          maxLenMsg: 'Bank name should not be more than 150 characters.',
        },
      },
      {
        name: 'branch_name',
        label: 'Branch Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: customerDetails?.branch_name || '',
        // condition: {
        //   type: 'showOnValue',
        //   baseOn: 'enter_bank_details',
        //   baseValue: 'Yes',
        // },
        condition: {
          type: 'visible',
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter branch name.',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid branch name.',
          maxLength: 150,
          maxLenMsg: 'Branch name should not be more than 150 characters.',
        },
      },
      {
        name: 'account_number',
        label: 'Bank Account Number',
        type: 'text',
        defaultValue: customerDetails?.account_number || '',
        identifier: IDENTIFIER.INPUTOTP,
        function: bankAccountVerificationHandler,
        apiBody: ['account_number', 'ifsc', 'first_name', 'middle_name', 'last_name'],
        status: false,
        disabled: true,
        success: {
          showField: [
            {
              name: 'passbook_cheque_url',
              condition: 'isShow',
              value: false
            },
            {
              name: 'proprietorship_proof',
              condition: 'isShow',
              value: false
            },
            {

              name: 'bankOSVDone',
              condition: 'isShow',
              value: false
            },
            {
              name: 'beneficiary_name',
              condition: 'isShow',
              value: true
            },
            {

              name: 'bankAccountVerificationStatus',
              condition: 'isShow',
              value: true
            },
            {
              name: 'skip',
              condition: 'isShow',
              value: false
            },
            {
              name: 'proceed',
              condition: 'isShow',
              value: false
            }
          ],
          setValueArr: [
            {
              value: 'VALID',
              name: 'bankAccountVerificationStatus'
            },
            {
              apiKey: 'beneficiary_name_with_bank',
              name: 'beneficiary_name'
            },

          ],
          disable: {
            value: true,
            disableFields: ['beneficiary_name', 'account_number', 'ifsc'],
          },
          disableOption: [
            {
              name: 'enter_bank_details',
              value: 'UPI',
              disabled: true
            },
            {
              name: 'enter_bank_details',
              value: 'Yes',
              disabled: true
            }
          ],
          status: true
        },
        fail: {
          disableOption: [
            {
              name: 'enter_bank_details',
              value: 'UPI',
              disabled: false
            },
            {
              name: 'enter_bank_details',
              value: 'Yes',
              disabled: false
            }
          ],
          showField: [
            {
              name: 'passbook_cheque_url',
              condition: 'isShow',
              value: true
            },
            {
              name: 'proprietorship_proof',
              condition: 'isShow',
              value: true
            },
            {

              name: 'bankOSVDone',
              condition: 'isShow',
              value: true
            },
            {
              name: 'beneficiary_name',
              condition: 'isShow',
              value: true
            },
            {

              name: 'bankAccountVerificationStatus',
              condition: 'isShow',
              value: true
            },
            {
              name: 'skip',
              condition: 'isShow',
              value: true
            },
            {
              name: 'proceed',
              condition: 'isShow',
              value: true
            }
          ],
          setValueArr: [
            {
              value: 'INVALID',
              name: 'bankAccountVerificationStatus'
            },
            {
              value: '',
              name: 'panCustomerNumber'
            },
          ],
          disable: {
            value: false,
            disableFields: ['beneficiary_name', 'account_number', 'ifsc'],
          },
          validation: {
            beneficiary_name: {
              isRequired: true,
              requiredMsg: 'Please enter beneficiary name.',
              pattern: REGEX.SPACESTARTEND,
              patternMsg: 'Please enter valid beneficiary name.',
              maxLength: 100,
              maxLenMsg: 'Beneficiary name should not be more than 100 characters.',
            },
          },
          status: true
        },
        // condition: {
        //   type: 'showOnValue',
        //   baseOn: 'enter_bank_details',
        //   baseValue: 'Yes',
        // },
        condition: {
          type: 'visible',
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter bank account number.',
          pattern: /^^\d{9,16}$/i,
          patternMsg: 'Please enter valid bank account number.',
          maxLength: 16,
          maxLenMsg: 'Bank account number should not be more than 16 digits',
          minLength: 9,
          minLenMsg: 'Bank account number should have at least 9 digits.',
        },
      },
      {
        name: 'beneficiary_name',
        label: 'Beneficiary Name',
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
          requiredMsg: 'Please enter beneficiary name.',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid beneficiary name.',
          maxLength: 100,
          maxLenMsg: 'Beneficiary name should not be more than 100 characters.',
        },
      },
      {
        name: 'bankAccountVerificationStatus',
        label: 'Bank Account Verification Status',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: '',
        disabled: true,
        condition: {
          type: 'visible',
          isShow: false
        }
      },
      {
        name: 'passbook_cheque_url',
        label: 'Upload Cheque/Passbook',
        type: 'file',
        identifier: IDENTIFIER.LIVEPHOTO,
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.passbookCheckUrl}`,
        // condition: {
        //   type: 'showOnValue',
        //   baseOn: 'enter_bank_details',
        //   baseValue: 'Yes',
        // },
        condition: {
          type: 'visible',
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please upload valid cheque/passbook.'
        },
        fileSize: 5
      },
      {
        name: 'proprietorship_proof',
        label: 'Upload Proprietorship Proof',
        type: 'file',
        identifier: IDENTIFIER.LIVEPHOTO,
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.proprietorshipProof}`,
        // condition: {
        //   type: 'showOnValue',
        //   baseOn: 'enter_bank_details',
        //   baseValue: 'Yes',
        // },
        condition: {
          type: 'visible',
          isShow: false
        },
        fileSize: 5
      },
    ],
    buttonDetails: {
      name: 'Next',
    },
    onBack: {
      condition: {
        currentForm: [
          {
            name: 'Qrcode',
            condition: 'isShow',
            value: false
          }
        ]
      }
    },
    nextValidate: nextValidateHandler,
    dynamicValidation: handleDynamicBankDetails,
    alignment: {
      xs: 12,
      sm: 12,
      md: 6,
      lg: 6,
      xl: 6
    }
  };
};
export {
  bankDetailsStep
};
