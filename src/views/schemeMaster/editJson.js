import {
  IDENTIFIER, FUNCTION_IDENTIFIER, FEE_ENUM_VALUES
} from '../../constants';

const handleDynamicValidation = (values, setError, clearErrors) => {
  let response = false;
  if (values?.is_pan_india === 'NO') {
    if (values?.scheme_branch?.length === 0) {
      setError('scheme_branch', { type: 'custom', customMsg: 'Scheme branch is required' });
      response = true;
    }
    if (values?.scheme_state?.length === 0) {
      setError('scheme_state', { type: 'custom', customMsg: 'Scheme state is required' });
      response = true;
    }
    if (values?.scheme_city?.length === 0) {
      setError('scheme_city', { type: 'custom', customMsg: 'Scheme city is required' });
      response = true;
    }
  } else {
    clearErrors();
  }
  return response;
};
export const getEditFormConfiguration = (
  data,
  stateDetailsHandler,
  cityDetailsHandler,
  branchDetailHandler,
  rateChartCode,
  rebatestepupChartCode,
  user
) => {
  const prePaymentData = [];
  const feeData = [];
  let rebateData = [];
  const prePayment = JSON.parse(data?.fullData?.scheme?.prepayment_charges);
  const fee = JSON.parse(data?.fullData?.scheme?.fee);
  if (['REB', 'RSU'].includes(data?.fullData?.scheme?.type)) {
    rebateData = [{
      name: 'rate_chart_code',
      label: 'Rate Chart Code',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      disabled: true,
      defaultValue: data?.fullData?.scheme?.fc_rebate_rate_chart_code,
      condition: {
        type: 'multiShowOnValue',
        baseOn: 'scheme_type',
        baseValue: ['REB', 'RSU']
      },
      validation: {
        isRequired: false,
      }
    },
    {
      name: 'rate_chart_code_table',
      label: 'Rate Chart Code Table',
      defaultValue: data.Scheme_Type === 'REB' ? rateChartCode : rebatestepupChartCode,
      identifier: IDENTIFIER.RATECHARTCODETABLE,
      condition: {
        type: 'dynamicShow',
        baseOn: 'rate_chart_code'
      },
      alignment: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12
      }
    }];
  }

  prePaymentData.push(
    {
      name: 'pre_payment',
      label: 'Pre Payment',
      type: 'radio',
      identifier: IDENTIFIER.RADIO,
      disabled: true,
      inline: true,
      option: ['YES', 'NO'],
      defaultValue: data?.fullData?.scheme?.prepayment_allowed ? 'YES' : 'NO',
      alignment: {
        xs: 12,
        sm: 12,
        md: 4,
        lg: 4,
        xl: 4
      }
    }
  );
  prePaymentData.push(
    {
      name: 'prepayment_tax_cgst',
      label: 'Tax on Prepayment Charges (CGST)',
      type: 'radio',
      identifier: IDENTIFIER.INPUTTEXT,
      disabled: true,
      defaultValue: prePayment !== null ? prePayment[0]?.cgst : '',
      InputProps: {
        possition: 'end',
        text: '%'
      },
      condition: {
        type: 'showOnValue',
        baseOn: 'pre_payment',
        baseValue: 'YES'
      },
      alignment: {
        xs: 12,
        sm: 12,
        md: 4,
        lg: 4,
        xl: 4
      }
    }
  );
  prePaymentData.push(
    {
      name: 'prepayment_tax_sgst',
      label: 'Tax on Prepayment Charges (SGST)',
      type: 'radio',
      identifier: IDENTIFIER.INPUTTEXT,
      disabled: true,
      defaultValue: prePayment !== null ? prePayment[0]?.sgst : '',
      InputProps: {
        possition: 'end',
        text: '%'
      },
      condition: {
        type: 'showOnValue',
        baseOn: 'pre_payment',
        baseValue: 'YES'
      },
      alignment: {
        xs: 12,
        sm: 12,
        md: 4,
        lg: 4,
        xl: 4
      }
    }
  );

  prePayment?.forEach((element, index) => {
    prePaymentData.push(
      {
        name: `start_slab_of_pre_payment${index > 0 ? `__${index}` : ''}`,
        label: 'Start Slab',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: element?.from,
        condition: {
          type: 'showOnValue',
          baseOn: 'pre_payment',
          baseValue: 'YES'
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4
        }
      }
    );
    prePaymentData.push(
      {
        name: `end_slab_of_pre_payment${index > 0 ? `__${index}` : ''}`,
        label: 'End Slab',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: element?.to,
        disabled: true,
        condition: {
          type: 'showOnValue',
          baseOn: 'pre_payment',
          baseValue: 'YES'
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4
        }
      }
    );
    prePaymentData.push(
      {
        name: `value_of_pre_payment${index > 0 ? `__${index}` : ''}`,
        label: 'value',
        type: 'text',
        InputProps: {
          possition: 'end',
          text: '%'
        },
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: element?.interest,
        disabled: true,
        condition: {
          type: 'showOnValue',
          baseOn: 'pre_payment',
          baseValue: 'YES'
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4
        }
      }
    );
  });
  fee?.forEach((singleFee, index) => {
    feeData.push(
      {
        name: `fee_name${index > 0 ? `__${index}` : ''}`,
        label: 'Fee Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: FEE_ENUM_VALUES[singleFee?.name]
      }
    );
    feeData.push(
      {
        name: `fee_type${index > 0 ? `__${index}` : ''}`,
        label: 'Fee Type',
        type: 'select',
        defaultValue: singleFee?.type,
        identifier: IDENTIFIER.SELECT,
        disabled: true,
        option: [
          { label: 'Flat Value', value: 'flat_value' },
          { label: 'Percentage of Loan Amount', value: 'percentage_of_loan_amount' },
        ]
      }
    );
    feeData.push(
      {
        name: `fee_value${index > 0 ? `__${index}` : ''}`,
        label: 'Fee Value',
        type: 'text',
        defaultValue: singleFee?.value,
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        condition: {
          type: 'showOnValue',
          baseOn: `fee_type${index > 0 ? `__${index}` : ''}`,
          baseValue: 'flat_value'
        }
      }
    );
    feeData.push(
      {
        name: `fee_value${index > 0 ? `__${index}` : ''}`,
        label: 'Fee Value',
        type: 'text',
        defaultValue: singleFee?.value,
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        InputProps: {
          possition: 'end',
          text: '%'
        },
        condition: {
          type: 'showOnValue',
          baseOn: `fee_type${index > 0 ? `__${index}` : ''}`,
          baseValue: 'percentage_of_loan_amount'
        }
      }
    );
    feeData.push(
      {
        name: `fee_tax_cgst${index > 0 ? `__${index}` : ''}`,
        label: 'Fee tax (CGST) ',
        type: 'text',
        defaultValue: singleFee?.cgst,
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        InputProps: {
          possition: 'end',
          text: '%'
        },
      }
    );
    feeData.push(
      {
        name: `fee_tax_sgst${index > 0 ? `__${index}` : ''}`,
        label: 'Fee tax (SGST) ',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: singleFee?.sgst,
        InputProps: {
          possition: 'end',
          text: '%'
        }
      }
    );
    feeData.push({
      name: `sperator__${index}`,
      identifier: IDENTIFIER.SPERATOR,
      index,
    });
  });

  // eslint-disable-next-line no-unused-vars
  const panChangeHandler = (values, callback, index, setValue, item) => {
    try {
      const schemeState = Object.keys(user?.stateData);
      let schemeCity = [];

      if (schemeState.length > 0) {
        schemeState.forEach((stateSelected) => {
          schemeCity = [...schemeCity, ...Object.keys(user?.stateData[stateSelected])];
        });
      }

      let tempBranch = [];

      if (schemeState.length > 0) {
        schemeState.forEach((state) => {
          schemeCity.forEach((city) => {
            if (user?.stateData[state] !== undefined
                && user?.stateData[state][city] !== undefined) {
              tempBranch = [
                ...tempBranch,
                ...user.stateData[state][city].map((branchDetails) => branchDetails?.value)
              ];
            }
          });
        });
      }
      setValue('scheme_city', schemeCity);
      setValue('scheme_state', schemeState);
      setValue('scheme_branch', tempBranch);
    } catch (err) {
      console.log(err);
    }
  };

  return {
    form: [
      {
        title: 'Scheme information',
        variant: 'outlined',
        input: [
          {
            name: 'scheme_name',
            label: 'Scheme Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            defaultValue: data?.fullData?.scheme?.name
          },
          {
            name: 'scheme_code',
            label: 'Scheme Code',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            defaultValue: data?.Scheme_Code
          },
          {
            name: 'scheme_for',
            label: 'Scheme For',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            defaultValue: data?.fullData?.scheme?.colender ?? 'CAPRI'
          },
          {
            name: 'scheme_description',
            label: 'Scheme Description',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            maxRows: 3,
            minRows: 3,
            defaultValue: data?.fullData?.scheme?.description
          },
          {
            name: 'scheme_type',
            label: 'Scheme Type',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            disabled: true,
            defaultValue: data?.fullData?.scheme?.type,
            option: [
              { label: 'Standard', value: 'STD' },
              { label: 'UpFront Interest', value: 'ADV' },
              { label: 'Rebate', value: 'REB' },
              { label: 'Rebate Step Up', value: 'RSU' }
            ]
          },
          {
            name: 'is_pan_india',
            label: 'Pan India',
            type: 'radio',
            identifier: IDENTIFIER.RADIO,
            inline: true,
            option: ['YES', 'NO'],
            customFunction: panChangeHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            functionChangeBaseOn: 'is_pan_india',
            defaultValue: data?.fullData?.scheme?.pan_india ? 'YES' : 'NO',
            validation: {
              isRequired: true,
              requiredMsg: 'Please choose Pan India',
            },
            onChange: {
              YES: {
                defaultValue: 'YES',
                disable: {
                  value: true,
                  disableFields: ['scheme_state', 'scheme_city', 'scheme_branch'],
                },
                validation: {
                  validationFields: [
                    {
                      label: 'scheme_state',
                      validation: {
                        isRequired: false,
                        requiredMsg: 'Please enter Scheme State',
                      }
                    },
                    {
                      label: 'scheme_city',
                      validation: {
                        isRequired: false,
                        requiredMsg: 'Please enter Scheme State',
                      }
                    },
                    {
                      label: 'scheme_branch',
                      validation: {
                        isRequired: false,
                        requiredMsg: 'Please enter Scheme State',
                      }
                    },
                  ],
                },
              },
              NO: {
                defaultValue: 'NO',
                disable: {
                  value: false,
                  disableFields: ['scheme_state', 'scheme_city', 'scheme_branch'],
                },
                validation: {
                  validationFields: [
                    {
                      label: 'scheme_state',
                      validation: {
                        isRequired: true,
                        requiredMsg: 'Please enter Scheme State',
                      }
                    },
                    {
                      label: 'scheme_city',
                      validation: {
                        isRequired: true,
                        requiredMsg: 'Please enter Scheme State',
                      }
                    },
                    {
                      label: 'scheme_branch',
                      validation: {
                        isRequired: true,
                        requiredMsg: 'Please enter Scheme State',
                      }
                    },
                  ],
                },
              },
            },
          },
          {
            name: 'scheme_state',
            label: 'Scheme State*',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            defaultValue: data?.fullData?.scheme?.pan_india ? [] : data?.fullData?.scheme?.state?.split(','),
            multiSelect: true,
            option: [],
            // defaultSelectedAll: true,
            disabled: data?.fullData?.scheme?.pan_india,
            customFunction: stateDetailsHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
            onChange: {
              resetFields: ['scheme_city', 'scheme_branch']
            },
            // validation: {
            //   isRequired: true,
            //   requiredMsg: 'Please enter Scheme State',
            // }
          },
          {
            name: 'scheme_city',
            label: 'Scheme City*',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            defaultValue: data?.fullData?.scheme?.pan_india ? [] : data?.fullData?.scheme?.city?.split(','),
            defaultSelectedAllOnChange: true,
            // onChangeuseEffectDisable: true,
            disabled: data?.fullData?.scheme?.pan_india,
            multiSelect: true,
            option: [],
            customFunction: cityDetailsHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            setValueArr: [
              // {
              //   name: 'scheme_branch',
              //   apiKey: 'branch'
              // },
              {
                name: 'scheme_city',
                apiKey: 'city'
              }
            ],
            functionChangeBaseOn: 'scheme_state',
            // validation: {
            //   isRequired: true,
            //   requiredMsg: 'Please enter Scheme City',
            // }
          },
          {
            name: 'scheme_branch',
            label: 'Scheme Branch*',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            multiSelect: true,
            defaultValue: data?.fullData?.scheme?.pan_india ? [] : data?.fullData?.branch_code?.split(','),
            defaultSelectedAllOnChange: true,
            // onChangeuseEffectDisable: true,
            disabled: data?.fullData?.scheme?.pan_india,
            option: [],
            customFunction: branchDetailHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            functionChangeBaseOn: 'scheme_city',
            // validation: {
            //   isRequired: true,
            //   requiredMsg: 'Please enter Scheme Branch',
            // }
          },
          {
            name: 'scheme_rpg_ltv',
            label: 'Scheme RPG LTV',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            defaultValue: data?.fullData?.scheme?.rpg_ltv,
            InputProps: {
              possition: 'end',
              text: '%'
            },
          },
          {
            name: 'scheme_rpg',
            label: 'Scheme RPG',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            defaultValue: data?.fullData?.scheme?.rpg_value,
          },
          {
            name: 'min_loan_amt',
            label: 'Min Loan Amount ',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            defaultValue: data?.fullData?.scheme?.min_loan_amount,
          },
          {
            name: 'max_loan_amt',
            label: 'Max Loan Amount',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: data?.fullData?.scheme?.max_loan_amount,
            disabled: true,
          },
          {
            name: 'scheme_roi',
            label: 'Rate of Interest (pa)',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: data?.fullData?.scheme?.roi,
            disabled: true,
            InputProps: {
              possition: 'end',
              text: '%'
            }
          },
          {
            name: 'loan_tenure',
            label: 'Loan Tenure (in Months) ',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            defaultValue: data?.fullData?.scheme?.loan_tenure,
          },
          {
            name: 'additional_interest',
            label: 'Additional Interest ',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            defaultValue: data?.fullData?.scheme?.additional_interest,
            InputProps: {
              possition: 'end',
              text: '%'
            }
          },
          {
            name: 'repayment_frequency',
            label: 'Repayment Frequency ',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            defaultValue: data?.fullData?.scheme?.repayment_frequency,
            disabled: true,
            option: [
              { value: '1', label: 'Monthly' },
              { value: '2', label: 'Bi-Monthly' },
              { value: '3', label: 'Quarterly' },
              { value: '6', label: 'Half Yearly' },
              { value: '12', label: 'Yearly' }
            ]
          },
          {
            name: 'reserve_amount',
            label: 'Reserve Amount',
            type: 'select',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: (data.fullData.scheme.reserve_amount).toString(),
            disabled: true
          },
        ],
        dynamicValidation: handleDynamicValidation,
        buttonDetails: {
          name: 'Next',
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 3,
          xl: 3
        }
      },
      {
        title: 'Pre Payment',
        variant: 'outlined',
        input: prePaymentData,
        buttonDetails: {
          name: 'Next',
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 3,
          xl: 3
        }
      },
      {
        title: 'Fees',
        variant: 'outlined',
        input: feeData,
        // addMore: true,
        buttonDetails: {
          name: 'Next',
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 3,
          xl: 3
        }
      },
      {
        title: 'Rebate',
        variant: 'outlined',
        input: rebateData,
        // addMore: true,
        // addMoreCondition: {
        //   type: 'showOnValue',
        //   baseOn: 'scheme_type',
        //   baseValue: 'REB'
        // },
        buttonDetails: {
          name: 'Update Scheme',
          type: 'submit'
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4
        }
      },
    ],
    stepper: {
      steps: ['Scheme Master', 'Pre Payment', 'Fees', 'Rebate',
      ],
      icons: ['1', '2', '3', '4'],
      stepperDirection: 'horizontal',
    },
    dataFomat: 'SINGLE'
  };
};
