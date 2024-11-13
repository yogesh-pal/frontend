/* eslint-disable max-len */
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import {
  IDENTIFIER, REGEX, FUNCTION_IDENTIFIER,
} from '../../constants';

const getRepaymentFrequency2 = (value) => {
  switch (value) {
    case '1':
      return 30;
    case '2':
      return 60;
    case '3':
      return 90;
    case '6':
      return 180;
    case '12':
      return 360;
    default:
      return 365;
  }
};
const handleDynamicValidation = (values, setError, clearErrors) => {
  let response = false;
  if (values.scheme_name.trim().length === 0) {
    setError('scheme_name', { type: 'custom', customMsg: 'Please enter Scheme Name' });
    response = true;
  } else if (values.scheme_description.trim().length === 0) {
    setError('scheme_description', { type: 'custom', customMsg: 'Please enter Scheme Description' });
    response = true;
  } else if (parseInt(values.min_loan_amt, 10) > parseInt(values.max_loan_amt, 10)) {
    setError('min_loan_amt', { type: 'custom', customMsg: 'Min Loan amount is not greater than Max loan amount' });
    response = true;
  } else {
    clearErrors('min_loan_amt');
  }
  return response;
};
// eslint-disable-next-line no-unused-vars
const handleDynamicValidationPrePayment = (values, setError, clearErrors) => {
  let response = false;
  const valueKey = Object.keys(values);
  const prepaymentCount = valueKey.filter((item) => item.includes('end_slab_of_pre_payment'));
  prepaymentCount.forEach((prePayment) => {
    const nameArray = prePayment.split('__');
    const index = nameArray.length > 1 ? `__${nameArray[nameArray.length - 1]}` : '';
    if (values[prePayment] > getRepaymentFrequency2(values.repayment_frequency)) {
      setError(prePayment, { type: 'custom', customMsg: `End slab value not be greater ${getRepaymentFrequency2(values.repayment_frequency)}` });
      response = true;
    } else if (values[`start_slab_of_pre_payment${index}`] > values[prePayment]) {
      setError(prePayment, { type: 'custom', customMsg: 'End Slab must be greater than equal to Start Slab' });
      response = true;
    } else {
      clearErrors(prePayment);
    }
  });
  return response;
};

const handleSchemeTypeChange = (values, setError, clearErrors, setValue) => {
  if (values?.scheme_type === 'REB') {
    setValue('reserve_amount', '900');
  }
};

export const getAddFormConfiguration = (
  stateDetailsHandler,
  cityDetailsHandler,
  branchDetailHandler,
  changePrepaymentEndSlab,
  getRepaymentFrequency,
  submitFormValues,
  updateSlabValidation,
  calculateRpg,
  schemeValidations,
  rebaterateChartCode,
  rebateStepuprateChartCode,
  schemeForOptions
) => {
  // eslint-disable-next-line no-unused-vars
  const rateChartGetter = (values, callback,) => {
    if (values.scheme_type === 'REB') callback(Object.keys(rebaterateChartCode));
    else callback(Object.keys(rebateStepuprateChartCode));
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
            multiline: true,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Scheme Name',
              pattern: REGEX.ALPHANUMERIC,
              patternMsg: 'Please enter Alphanumeric value only',
              maxLength: 40,
              maxLenMsg: 'Scheme Name should not be greater than 40 characters.',
            }
          },
          {
            name: 'scheme_for',
            label: 'Scheme For',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            option: schemeForOptions,
            validation: {
              isRequired: true,
              requiredMsg: 'Please select Scheme For'
            }
          },
          {
            name: 'scheme_description',
            label: 'Scheme Description',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            maxRows: 3,
            minRows: 3,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Scheme Description',
            }
          },
          {
            name: 'scheme_type',
            label: 'Scheme Type',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            option: [
              { label: 'Standard', value: 'STD' },
              { label: 'Rebate', value: 'REB' },
              { label: 'Rebate Step Up', value: 'RSU' }
            ],
            customFunction: handleSchemeTypeChange,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            functionChangeBaseOn: 'scheme_type',
            onChange: {
              STD: {
                disable: {
                  value: false,
                  disableFields: ['reserve_amount'],
                },
                validation: {
                  min_loan_amt: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Minimum Loan Amount',
                      pattern: REGEX.NUMBER,
                      patternMsg: 'Please enter numeric digits only',
                      min: schemeValidations?.STD?.validations?.amount?.min,
                      minMsg: `It should be greater than or equal to ${schemeValidations?.STD?.validations?.amount?.min}`,
                      max: schemeValidations?.STD?.validations?.amount?.max,
                      maxMsg: `It should be less than or equal to ${schemeValidations?.STD?.validations?.amount?.max}`
                    }
                  },
                  max_loan_amt: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Maximum Loan Amount',
                      pattern: REGEX.NUMBER,
                      patternMsg: 'Please enter numeric digits only',
                      min: schemeValidations?.STD?.validations?.amount?.min,
                      minMsg: `It should be greater than or equal to ${schemeValidations?.STD?.validations?.amount?.min}`,
                      max: schemeValidations?.STD?.validations?.amount?.max,
                      maxMsg: `It should be less than or equal to ${schemeValidations?.STD?.validations?.amount?.max}`
                    }
                  },
                  loan_tenure: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Loan Tenure (in Months)',
                      pattern: REGEX.NUMBER,
                      patternMsg: 'Please enter numeric digits only',
                      min: schemeValidations?.STD?.validations?.tenure?.min,
                      minMsg: `Please enter value in range (${schemeValidations?.STD?.validations?.tenure?.min} - ${schemeValidations?.STD?.validations?.tenure?.max}) months`,
                      max: schemeValidations?.STD?.validations?.tenure?.max,
                      maxMsg: `Please enter value in range (${schemeValidations?.STD?.validations?.tenure?.min} - ${schemeValidations?.STD?.validations?.tenure?.max}) months`
                    }
                  },
                  scheme_roi: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Rate of Interest (pa)',
                      pattern: REGEX.TWODIGITDECIMAL,
                      patternMsg: 'Please enter valid percentage value',
                      min: schemeValidations?.STD?.validations?.interest?.min,
                      minMsg: `Please enter value in range (${schemeValidations?.STD?.validations?.interest?.min} - ${schemeValidations?.STD?.validations?.interest?.max})%`,
                      max: schemeValidations?.STD?.validations?.interest?.max,
                      maxMsg: `Please enter value in range (${schemeValidations?.STD?.validations?.interest?.min} - ${schemeValidations?.STD?.validations?.interest?.max})%`
                    }
                  },
                  additional_interest: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Additional Interest',
                      pattern: REGEX.TWODIGITDECIMAL,
                      patternMsg: 'Please enter valid percentage value',
                      min: schemeValidations?.STD?.validations?.additional_interest?.min,
                      minMsg: `Please enter value in range (${schemeValidations?.STD?.validations?.additional_interest?.min} - ${schemeValidations?.STD?.validations?.additional_interest?.max})%`,
                      max: schemeValidations?.STD?.validations?.additional_interest?.max,
                      maxMsg: `Please enter value in range (${schemeValidations?.STD?.validations?.additional_interest?.min} - ${schemeValidations?.STD?.validations?.additional_interest?.max})%`
                    }
                  }
                }
              },
              REB: {
                disable: {
                  value: true,
                  disableFields: ['reserve_amount'],
                },
                validation: {
                  min_loan_amt: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Minimum Loan Amount',
                      pattern: REGEX.NUMBER,
                      patternMsg: 'Please enter numeric digits only',
                      min: schemeValidations?.REB?.validations?.amount?.min,
                      minMsg: `It should be greater than or equal to ${schemeValidations?.REB?.validations?.amount?.min}`,
                      max: schemeValidations?.REB?.validations?.amount?.max,
                      maxMsg: `It should be less than or equal to ${schemeValidations?.REB?.validations?.amount?.max}`
                    }
                  },
                  max_loan_amt: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Maximum Loan Amount',
                      pattern: REGEX.NUMBER,
                      patternMsg: 'Please enter numeric digits only',
                      min: schemeValidations?.REB?.validations?.amount?.min,
                      minMsg: `It should be greater than or equal to ${schemeValidations?.REB?.validations?.amount?.min}`,
                      max: schemeValidations?.REB?.validations?.amount?.max,
                      maxMsg: `It should be less than or equal to ${schemeValidations?.REB?.validations?.amount?.max}`
                    }
                  },
                  loan_tenure: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Loan Tenure (in Months)',
                      pattern: REGEX.NUMBER,
                      patternMsg: 'Please enter numeric digits only',
                      min: schemeValidations?.REB?.validations?.tenure?.min,
                      minMsg: `Please enter value in range (${schemeValidations?.REB?.validations?.tenure?.min} - ${schemeValidations?.REB?.validations?.tenure?.max}) months`,
                      max: schemeValidations?.REB?.validations?.tenure?.max,
                      maxMsg: `Please enter value in range (${schemeValidations?.REB?.validations?.tenure?.min} - ${schemeValidations?.REB?.validations?.tenure?.max}) months`
                    }
                  },
                  scheme_roi: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Rate of Interest (pa)',
                      pattern: REGEX.TWODIGITDECIMAL,
                      patternMsg: 'Please enter valid percentage value',
                      min: schemeValidations?.REB?.validations?.interest?.min,
                      minMsg: `Please enter value in range (${schemeValidations?.REB?.validations?.interest?.min} - ${schemeValidations?.REB?.validations?.interest?.max})%`,
                      max: schemeValidations?.REB?.validations?.interest?.max,
                      maxMsg: `Please enter value in range (${schemeValidations?.REB?.validations?.interest?.min} - ${schemeValidations?.REB?.validations?.interest?.max})%`
                    }
                  },
                  additional_interest: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Additional Interest',
                      pattern: REGEX.TWODIGITDECIMAL,
                      patternMsg: 'Please enter valid percentage value',
                      min: schemeValidations?.REB?.validations?.additional_interest?.min,
                      minMsg: `Please enter value in range (${schemeValidations?.REB?.validations?.additional_interest?.min} - ${schemeValidations?.REB?.validations?.additional_interest?.max})%`,
                      max: schemeValidations?.REB?.validations?.additional_interest?.max,
                      maxMsg: `Please enter value in range (${schemeValidations?.REB?.validations?.additional_interest?.min} - ${schemeValidations?.REB?.validations?.additional_interest?.max})%`
                    }
                  }
                }
              },
              RSU: {
                disable: {
                  value: true,
                  disableFields: ['reserve_amount'],
                },
                validation: {
                  min_loan_amt: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Minimum Loan Amount',
                      pattern: REGEX.NUMBER,
                      patternMsg: 'Please enter numeric digits only',
                      min: schemeValidations?.RSU?.validations?.amount?.min,
                      minMsg: `It should be greater than or equal to ${schemeValidations?.RSU?.validations?.amount?.min}`,
                      max: schemeValidations?.RSU?.validations?.amount?.max,
                      maxMsg: `It should be less than or equal to ${schemeValidations?.RSU?.validations?.amount?.max}`
                    }
                  },
                  max_loan_amt: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Maximum Loan Amount',
                      pattern: REGEX.NUMBER,
                      patternMsg: 'Please enter numeric digits only',
                      min: schemeValidations?.RSU?.validations?.amount?.min,
                      minMsg: `It should be greater than or equal to ${schemeValidations?.RSU?.validations?.amount?.min}`,
                      max: schemeValidations?.RSU?.validations?.amount?.max,
                      maxMsg: `It should be less than or equal to ${schemeValidations?.RSU?.validations?.amount?.max}`
                    }
                  },
                  loan_tenure: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Loan Tenure (in Months)',
                      pattern: REGEX.NUMBER,
                      patternMsg: 'Please enter numeric digits only',
                      min: schemeValidations?.RSU?.validations?.tenure?.min,
                      minMsg: `Please enter value in range (${schemeValidations?.RSU?.validations?.tenure?.min} - ${schemeValidations?.RSU?.validations?.tenure?.max}) months`,
                      max: schemeValidations?.RSU?.validations?.tenure?.max,
                      maxMsg: `Please enter value in range (${schemeValidations?.RSU?.validations?.tenure?.min} - ${schemeValidations?.RSU?.validations?.tenure?.max}) months`
                    }
                  },
                  scheme_roi: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Rate of Interest (pa)',
                      pattern: REGEX.TWODIGITDECIMAL,
                      patternMsg: 'Please enter valid percentage value',
                      min: schemeValidations?.RSU?.validations?.interest?.min,
                      minMsg: `Please enter value in range (${schemeValidations?.RSU?.validations?.interest?.min} - ${schemeValidations?.RSU?.validations?.interest?.max})%`,
                      max: schemeValidations?.RSU?.validations?.interest?.max,
                      maxMsg: `Please enter value in range (${schemeValidations?.RSU?.validations?.interest?.min} - ${schemeValidations?.RSU?.validations?.interest?.max})%`
                    }
                  },
                  additional_interest: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter Additional Interest',
                      pattern: REGEX.TWODIGITDECIMAL,
                      patternMsg: 'Please enter valid percentage value',
                      min: schemeValidations?.RSU?.validations?.additional_interest?.min,
                      minMsg: `Please enter value in range (${schemeValidations?.RSU?.validations?.additional_interest?.min} - ${schemeValidations?.RSU?.validations?.additional_interest?.max})%`,
                      max: schemeValidations?.RSU?.validations?.additional_interest?.max,
                      maxMsg: `Please enter value in range (${schemeValidations?.RSU?.validations?.additional_interest?.min} - ${schemeValidations?.RSU?.validations?.additional_interest?.max})%`
                    }
                  }
                }
              }
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Scheme Type',
            }
          },
          {
            name: 'is_pan_india',
            label: 'Pan India',
            type: 'radio',
            identifier: IDENTIFIER.RADIO,
            inline: true,
            option: ['YES', 'NO'],
            defaultValue: 'NO',
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
                  scheme_state: {
                    validation: {
                      isRequired: false,
                      requiredMsg: 'Please select Scheme State.'
                    },
                  },
                  scheme_city: {
                    validation: {
                      isRequired: false,
                      requiredMsg: 'Please select Scheme city'
                    },
                  },
                  scheme_branch: {
                    validation: {
                      isRequired: false,
                      requiredMsg: 'Please select Scheme branch'
                    },
                  }
                }
              },
              NO: {
                defaultValue: 'NO',
                disable: {
                  value: false,
                  disableFields: ['scheme_state', 'scheme_city', 'scheme_branch'],
                },
                validation: {
                  scheme_state: {
                    isRequired: {
                      isRequired: true,
                      requiredMsg: 'Please select Scheme State.'
                    }
                  },
                  scheme_city: {
                    isRequired: {
                      isRequired: true,
                      requiredMsg: 'Please select Scheme City'
                    },
                  },
                  scheme_branch: {
                    isRequired: {
                      isRequired: true,
                      requiredMsg: 'Please select Scheme Branch'
                    },
                  }
                }
              },
            },
          },
          {
            name: 'scheme_state',
            label: 'Scheme State',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            defaultSelectedAll: true,
            multiSelect: true,
            option: [],
            customFunction: stateDetailsHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Scheme State',
            }
          },
          {
            name: 'scheme_city',
            label: 'Scheme City',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            defaultSelectedAll: true,
            defaultSelectedAllOnChange: true,
            multiSelect: true,
            option: [],
            customFunction: cityDetailsHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            setValueArr: [
              {
                name: 'scheme_branch',
                apiKey: 'branch'
              },
              {
                name: 'scheme_city',
                apiKey: 'city'
              }
            ],
            functionChangeBaseOn: 'scheme_state',
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Scheme City',
            }
          },
          {
            name: 'scheme_branch',
            label: 'Scheme Branch',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            multiSelect: true,
            defaultSelectedAll: true,
            defaultSelectedAllOnChange: true,
            option: [],
            customFunction: branchDetailHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            functionChangeBaseOn: 'scheme_city',
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Scheme Branch',
            }
          },
          {
            name: 'scheme_rpg_ltv',
            label: 'Scheme RPG LTV',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            InputProps: {
              possition: 'end',
              text: '%'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Scheme RPG LTV',
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid percentage value',
              min: 1,
              max: 100,
              maxMsg: 'Please enter value in range (1 - 100)%',
              minMsg: 'Please enter value in range (1 - 100)%',
            }
          },
          {
            name: 'scheme_rpg',
            label: 'Scheme RPG',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            customFunction: calculateRpg,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            functionChangeBaseOn: 'scheme_rpg_ltv',
            defaultValue: 0,
            disabled: true
          },
          {
            name: 'min_loan_amt',
            label: 'Min Loan Amount ',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            InputProps: {
              possition: 'start',
              text: <CurrencyRupeeIcon />
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Min Loan Amount ',
              pattern: REGEX.NUMBER,
              patternMsg: 'Please enter numeric digits only',
              min: schemeValidations?.DEFAULT?.validations?.amount?.min,
              minMsg: `It should be greater than or equal to ${schemeValidations?.DEFAULT?.validations?.amount?.min}`,
              max: schemeValidations?.DEFAULT?.validations?.amount?.max,
              maxMsg: `It should be less than or equal to ${schemeValidations?.DEFAULT?.validations?.amount?.max}`
            }
          },
          {
            name: 'max_loan_amt',
            label: 'Max Loan Amount',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            InputProps: {
              possition: 'start',
              text: <CurrencyRupeeIcon />
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Max Loan Amount',
              pattern: REGEX.NUMBER,
              patternMsg: 'Please enter numeric digits only',
              min: schemeValidations?.DEFAULT?.validations?.amount?.min,
              minMsg: `It should be greater than or equal to ${schemeValidations?.DEFAULT?.validations?.amount?.min}`,
              max: schemeValidations?.DEFAULT?.validations?.amount?.max,
              maxMsg: `It should be less than or equal to ${schemeValidations?.DEFAULT?.validations?.amount?.max}`
            }
          },
          {
            name: 'scheme_roi',
            label: 'Rate of Interest (pa)',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            InputProps: {
              possition: 'end',
              text: '%'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Rate of Interest (pa) ',
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid percentage value',
              min: schemeValidations?.DEFAULT?.validations?.interest?.min,
              minMsg: `Please enter value in range (${schemeValidations?.DEFAULT?.validations?.interest?.min} - ${schemeValidations?.DEFAULT?.validations?.interest?.max})%`,
              max: schemeValidations?.DEFAULT?.validations?.interest?.max,
              maxMsg: `Please enter value in range (${schemeValidations?.DEFAULT?.validations?.interest?.min} - ${schemeValidations?.DEFAULT?.validations?.interest?.max})%`
            }
          },
          {
            name: 'loan_tenure',
            label: 'Loan Tenure (in Months) ',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Loan Tenure (in Months) ',
              pattern: REGEX.NUMBER,
              patternMsg: 'Please enter numeric digits only',
              min: schemeValidations?.DEFAULT?.validations?.tenure?.min,
              minMsg: `Please enter value in range (${schemeValidations?.DEFAULT?.validations?.tenure?.min} - ${schemeValidations?.DEFAULT?.validations?.tenure?.max}) months`,
              max: schemeValidations?.DEFAULT?.validations?.tenure?.max,
              maxMsg: `Please enter value in range (${schemeValidations?.DEFAULT?.validations?.tenure?.min} - ${schemeValidations?.DEFAULT?.validations?.tenure?.max}) months`
            }
          },
          {
            name: 'additional_interest',
            label: 'Additional Interest ',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            InputProps: {
              possition: 'end',
              text: '%'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Additional Interest ',
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid percentage value',
              min: schemeValidations?.DEFAULT?.validations?.additional_interest?.min,
              minMsg: `Please enter value in range (${schemeValidations?.DEFAULT?.validations?.additional_interest?.min} - ${schemeValidations?.DEFAULT?.validations?.additional_interest?.max})%`,
              max: schemeValidations?.DEFAULT?.validations?.additional_interest?.max,
              maxMsg: `Please enter value in range (${schemeValidations?.DEFAULT?.validations?.additional_interest?.min} - ${schemeValidations?.DEFAULT?.validations?.additional_interest?.max})%`
            }
          },
          {
            name: 'repayment_frequency',
            label: 'Repayment Frequency ',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            option: [
              { value: '1', label: 'Monthly' },
              { value: '2', label: 'Bi-Monthly' },
              { value: '3', label: 'Quarterly' },
              { value: '6', label: 'Half Yearly' },
              { value: '12', label: 'Yearly' }
            ],
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Repayment Frequency ',
            }
          },
          {
            name: 'reserve_amount',
            label: 'Reserve Amount',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            option: [
              { value: '900', label: '0' },
              { value: '901', label: '500' },
              { value: '902', label: '1000' },
              { value: '903', label: '2000' },
            ],
            defaultValue: '900',
            validation: {
              isRequired: false
            }
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
        title: 'Pre Payment Charges',
        variant: 'outlined',
        input: [
          {
            name: 'pre_payment',
            label: 'Pre Payment',
            type: 'radio',
            identifier: IDENTIFIER.RADIO,
            inline: true,
            option: ['YES', 'NO'],
            defaultValue: 'NO',
            alignment: {
              xs: 12,
              sm: 12,
              md: 4,
              lg: 4,
              xl: 4
            }
          },
          {
            name: 'prepayment_tax_cgst',
            label: 'Tax on Prepayment Charges (CGST)',
            type: 'radio',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: 9,
            disabled: true,
            InputProps: {
              possition: 'end',
              text: '%'
            },
            condition: {
              type: 'showOnValue',
              baseOn: 'pre_payment',
              baseValue: 'YES'
            },
            validation: {
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid percentage value',
              min: 1,
              max: 100,
              maxMsg: 'Please enter value in range (1 - 100)%',
              minMsg: 'Please enter value in range (1 - 100)%',
            },
            alignment: {
              xs: 12,
              sm: 12,
              md: 4,
              lg: 4,
              xl: 4
            }
          },
          {
            name: 'prepayment_tax_sgst',
            label: 'Tax on Prepayment Charges (SGST)',
            type: 'radio',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: 9,
            disabled: true,
            InputProps: {
              possition: 'end',
              text: '%'
            },
            condition: {
              type: 'showOnValue',
              baseOn: 'pre_payment',
              baseValue: 'YES'
            },
            validation: {
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid percentage value',
              min: 1,
              max: 100,
              maxMsg: 'Please enter value in range (1 - 100)%',
              minMsg: 'Please enter value in range (1 - 100)%',
            },
            alignment: {
              xs: 12,
              sm: 12,
              md: 4,
              lg: 4,
              xl: 4
            }
          },
          {
            name: 'start_slab_of_pre_payment',
            label: 'Start Slab',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: 0,
            InputProps: {
              possition: 'end',
              text: 'Day'
            },
            condition: {
              type: 'showOnValue',
              baseOn: 'pre_payment',
              baseValue: 'YES'
            },
            copyCondition: false,
            disabled: true,
            alignment: {
              xs: 12,
              sm: 12,
              md: 4,
              lg: 4,
              xl: 4
            }
          },
          {
            name: 'end_slab_of_pre_payment',
            label: 'End Slab',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            customFunction: changePrepaymentEndSlab,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            functionChangeBaseOn: 'end_slab_of_pre_payment',
            condition: {
              type: 'showOnValue',
              baseOn: 'pre_payment',
              baseValue: 'YES'
            },
            InputProps: {
              possition: 'end',
              text: 'Day'
            },
            copyCondition: false,
            alignment: {
              xs: 12,
              sm: 12,
              md: 4,
              lg: 4,
              xl: 4
            },
          // validation: {
          //   max: getRepaymentFrequency(submitFormValues.repayment_frequency),
          //   maxMsg: `End slab value not be greater ${getRepaymentFrequency(submitFormValues.repayment_frequency)}`
          // }
          },
          {
            name: 'value_of_pre_payment',
            label: 'Value',
            type: 'text',
            InputProps: {
              possition: 'end',
              text: '%'
            },
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid percentage value',
              min: 0,
              max: 100,
              maxMsg: 'Please enter value between 0 - 100',
              minMsg: 'Please enter value between 0 - 100',
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
          },
        ],
        addMore: true,
        addMoreCopyDefaultValue: false,
        addMoreCallAuto: true,
        addMoreSperatorEnable: true,
        addMoreValidation: updateSlabValidation,
        dynamicValidation: handleDynamicValidationPrePayment,
        addMoreCondition: {
          type: 'showOnValue',
          baseOn: 'pre_payment',
          baseValue: 'YES'
        },
        addMoreFields: ['start_slab_of_pre_payment', 'end_slab_of_pre_payment', 'value_of_pre_payment'],
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
        input: [
          {
            name: 'fee_name',
            label: 'Fee Name',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            option: [
              { label: 'MTM Charges', value: 'MTM' },
              { label: 'Processing Fee', value: 'PROCESSING' },
              { label: 'SOA Charges', value: 'SOA' },
              { label: 'Pre-Auction Charges', value: 'PREAUCTION' },
              { label: 'Post-Auction Charges', value: 'POSTAUCTION' },
              { label: 'Courier Charges', value: 'COURIER' },
              { label: 'Other Charges', value: 'OTHER' },
              { label: 'Legal Charges', value: 'LEGAL' }
            ],
            onChange: {
              MTM: {
                validation: {
                  fee_type: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select fee type'
                    }
                  },
                  fee_value: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter fee value'
                    }
                  }
                }
              },
              PROCESSING: {
                validation: {
                  fee_type: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select fee type'
                    }
                  },
                  fee_value: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter fee value'
                    }
                  }
                }
              },
              SOA: {
                validation: {
                  fee_type: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select fee type'
                    }
                  },
                  fee_value: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter fee value'
                    }
                  }
                }
              },
              PREAUCTION: {
                validation: {
                  fee_type: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select fee type'
                    }
                  },
                  fee_value: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter fee value'
                    }
                  }
                }
              },
              POSTAUCTION: {
                validation: {
                  fee_type: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select fee type'
                    }
                  },
                  fee_value: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter fee value'
                    }
                  }
                }
              },
              COURIER: {
                validation: {
                  fee_type: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select fee type'
                    }
                  },
                  fee_value: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter fee value'
                    }
                  }
                }
              },
              OTHER: {
                validation: {
                  fee_type: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select fee type'
                    }
                  },
                  fee_value: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter fee value'
                    }
                  }
                }
              },
              LEGAL: {
                validation: {
                  fee_type: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select fee type'
                    }
                  },
                  fee_value: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter fee value'
                    }
                  }
                }
              },
            },
            isRemovePreviousSelectedOption: true
          },
          {
            name: 'fee_type',
            label: 'Fee Type',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            option: [
              { label: 'Flat Value', value: 'flat_value' },
              { label: 'Percentage of Loan Amount', value: 'percentage_of_loan_amount' },
            ]
          },
          {
            name: 'fee_value',
            label: 'Fee Value',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            condition: {
              type: 'showOnValue',
              baseOn: 'fee_type',
              baseValue: 'flat_value'
            },
            copyCondition: true,
          },
          {
            name: 'fee_value',
            label: 'Fee Value',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              pattern: REGEX.NUMBER,
              patternMsg: 'Please enter numeric digits only',
              min: 1,
              max: 100,
              maxMsg: 'Please enter value in range (1 - 100)%',
              minMsg: 'Please enter value in range (1 - 100)%',
            },
            InputProps: {
              possition: 'end',
              text: '%'
            },
            condition: {
              type: 'showOnValue',
              baseOn: 'fee_type',
              baseValue: 'percentage_of_loan_amount'
            },
            copyCondition: true,
          },
          {
            name: 'fee_tax_cgst',
            label: 'Fee tax (CGST) ',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: 9,
            disabled: true,
            InputProps: {
              possition: 'end',
              text: '%'
            },
            addMoreWithDefaultValue: true,
            validation: {
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid percentage value',
              min: 1,
              max: 100,
              maxMsg: 'Please enter value in range (1 - 100)%',
              minMsg: 'Please enter value in range (1 - 100)%',
            },
          },
          {
            name: 'fee_tax_sgst',
            label: 'Fee tax (SGST) ',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: 9,
            disabled: true,
            InputProps: {
              possition: 'end',
              text: '%'
            },
            addMoreWithDefaultValue: true,
            validation: {
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid percentage value'
            },
          },
        ],
        addMore: true,
        addMoreCopyDefaultValue: false,
        addMoreCallAuto: true,
        addMoreSperatorEnable: true,
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
        input: [
          {
            name: 'rate_chart_code',
            label: 'Rate Chart Code',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            defaultSelectedAll: true,
            multiSelect: false,
            option: [],
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
            customFunction: rateChartGetter,
            condition: {
              type: 'multiShowOnValue',
              baseOn: 'scheme_type',
              baseValue: ['REB', 'RSU']
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please select rate chart code',
            }
          },
          {
            name: 'rate_chart_code_table',
            label: 'Rate Chart Code Table',
            defaultValue: rebaterateChartCode,
            identifier: IDENTIFIER.RATECHARTCODETABLE,
            customFunction: (values, callback, index, setValue) => {
              console.log('values, rateChartGetter', values.scheme_type, rebaterateChartCode, rebateStepuprateChartCode);
              const chart = values.scheme_type === 'REB' ? rebaterateChartCode : rebateStepuprateChartCode;
              setValue('rate_chart_code_table', chart, {
                shouldValidate: true
              });
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            functionChangeBaseOn: 'rate_chart_code',
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
          }
        ],
        buttonDetails: {
          name: 'Save Scheme',
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
