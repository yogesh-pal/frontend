import { cloneDeep } from 'lodash';
import { REGEX, IDENTIFIER, FUNCTION_IDENTIFIER } from '../../../constants';

export const FormDetails = ({ stateDetails, defaultValue }) => {
  const stateDetailsHandler = (values, callback) => {
    try {
      callback(Object.keys(stateDetails));
    } catch (e) {
      console.log('Error', e);
    }
  };

  const cityDetailsHandler = (values, callback, index, setValue) => {
    try {
      let data = [];
      if (values?.state.length > 0) {
        values?.state.forEach((item) => {
          data = [...data, ...Object.keys(stateDetails[item])];
        });
      }
      const dataBranch = [];
      data.forEach((item) => {
        if (values.city.includes(item)) {
          dataBranch.push(item);
        }
      });
      setValue('city', dataBranch);
      callback({
        city: data,
        branch: [],
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const branchDetailHandler = (values, callback, index, setValue) => {
    try {
      let data = [];
      if (values?.state.length > 0) {
        values?.state.forEach((state) => {
          values?.city.forEach((city) => {
            if (stateDetails[state] !== undefined
                && stateDetails[state][city] !== undefined) {
              data = [...data, ...stateDetails[state][city]];
            }
          });
        });
      }
      const dataBranch = [];

      data.forEach((item) => {
        if (values.branch_code.includes(item.value)) {
          dataBranch.push(item.value);
        }
      });
      setValue('branch_code', dataBranch);
      callback(data);
    } catch (e) {
      console.log('Error', e);
    }
  };
  const formDetails = {
    form: [
      {
        variant: 'outlined',
        input: [
          {
            name: 'name',
            type: 'text',
            label: 'Charge Name',
            identifier: IDENTIFIER.SELECT,
            option: [
              { label: 'Stamp Duty Rajasthan', value: 'STAMPDUTYRJ' }
            ],
            validation: {
              isRequired: true,
              requiredMsg: 'Please select charge name'
            }
          },
          {
            name: 'type',
            type: 'text',
            label: 'Charge Type',
            identifier: IDENTIFIER.SELECT,
            option: [
              { label: 'Flat', value: 'FLT' },
              { label: 'Percentage', value: 'PER' },
            ],
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter charge type'
            },
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            multiSelect: false,
            option: ['ACTIVE', 'INACTIVE'],
            validation: {
              isRequired: true,
              requiredMsg: 'Please select status.'
            },
          },
          {
            name: 'pan_india',
            label: 'Pan India',
            type: 'radio',
            defaultValue: 'NO',
            identifier: IDENTIFIER.RADIO,
            inline: true,
            option: ['YES', 'NO'],
            onChange: {
              YES: {
                defaultValue: 'YES',
                disable: {
                  value: true,
                  disableFields: ['state', 'city', 'branch_code'],
                },
                validation: {
                  state: {
                    validation: {
                      isRequired: false,
                      requiredMsg: 'Please select state.'
                    },
                  },
                  city: {
                    validation: {
                      isRequired: false,
                      requiredMsg: 'Please select city.'
                    },
                  },
                  branch_code: {
                    validation: {
                      isRequired: false,
                      requiredMsg: 'Please select branch.'
                    },
                  }
                }
              },
              NO: {
                defaultValue: 'NO',
                disable: {
                  value: false,
                  disableFields: ['state', 'city', 'branch_code'],
                },
                validation: {
                  state: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select state.'
                    }
                  },
                  city: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select city.'
                    },
                  },
                  branch_code: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select branch.'
                    },
                  }
                }
              },
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please choose Pan India',
            }
          },
          {
            name: 'state',
            label: 'State',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            multiSelect: true,
            defaultSelectedAll: true,
            option: [],
            customFunction: stateDetailsHandler,
            onChange: {
              resetFields: ['city', 'branch_code']
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please select state.'
            },
          },
          {
            name: 'city',
            label: 'City',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            multiSelect: true,
            defaultSelectedAll: true,
            defaultSelectedAllOnChange: true,
            option: [],
            customFunction: cityDetailsHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            setValueArr: [
              {
                name: 'branch',
                apiKey: 'branch'
              },
              {
                name: 'city',
                apiKey: 'city'
              }
            ],
            functionChangeBaseOn: 'state',
            validation: {
              isRequired: true,
              requiredMsg: 'Please select city.'
            },
          },
          {
            name: 'branch_code',
            label: 'Branch',
            type: 'select',
            identifier: IDENTIFIER.MULTISELECT,
            multiSelect: true,
            defaultSelectedAll: true,
            defaultSelectedAllOnChange: true,
            option: [],
            customFunction: branchDetailHandler,
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            functionChangeBaseOn: 'city',
            validation: {
              isRequired: true,
              requiredMsg: 'Please select branch.'
            },
          },
          {
            name: 'valueFLT',
            type: 'text',
            label: 'Charge Value',
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter charge value',
              pattern: /^(?:\d{1,6}.\d{1,2}|\d+)$/,
              patternMsg: 'Please enter valid charge value',
              min: 0,
              max: 999999,
              maxMsg: 'Please enter value between 0 - 999999',
              minMsg: 'Please enter value between 0 - 999999',
            },
            condition: {
              type: 'showOnValue',
              baseOn: 'type',
              baseValue: 'FLT'
            },
          },
          {
            name: 'valuePER',
            type: 'text',
            label: 'Charge Value',
            identifier: IDENTIFIER.INPUTTEXT,
            InputProps: {
              possition: 'end',
              text: '%'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter charge value',
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid charge value',
              min: 0.1,
              max: 100,
              maxMsg: 'Please enter value between 0.1 - 100',
              minMsg: 'Please enter value between 0.1 - 100',
            },
            condition: {
              type: 'showOnValue',
              baseOn: 'type',
              baseValue: 'PER'
            },
          },
          {
            name: 'cgst',
            type: 'text',
            label: 'Cow Protection Cess On Stamp Duty',
            disabled: true,
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '20.00',
            InputProps: {
              possition: 'end',
              text: '%'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter charge tax (CGST)',
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid charge tax (CGST)',
              min: 0.1,
              max: 100,
              maxMsg: 'Please enter value between 0.1 - 100',
              minMsg: 'Please enter value between 0.1 - 100',
            }
          },
          {
            name: 'sgst',
            type: 'text',
            disabled: true,
            label: 'Surcharge on Stamp Duty',
            defaultValue: '10.00',
            identifier: IDENTIFIER.INPUTTEXT,
            InputProps: {
              possition: 'end',
              text: '%'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter charge tax (SGST)',
              pattern: REGEX.TWODIGITDECIMAL,
              patternMsg: 'Please enter valid charge tax (SGST)',
              min: 0,
              max: 100,
              maxMsg: 'Please enter value between 0.1 - 100',
              minMsg: 'Please enter value between 0.1 - 100',
            }
          },
        ],
        buttonDetails: {
          name: 'Add Charge',
          type: 'submit',
          isShow: true
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6
        }
      }
    ]
  };

  const copyForm = cloneDeep(formDetails);

  if (defaultValue) {
    const tempForm = copyForm.form[0];
    tempForm.buttonDetails.name = 'Update Charge';
    tempForm.input.forEach((item, index) => {
      if (item.name in defaultValue || item.name === 'valuePER' || item.name === 'valueFLT') {
        delete tempForm.input[index].defaultSelectedAll;
        delete tempForm.input[index].defaultSelectedAllOnChange;
        if ((!['state', 'city', 'branch_code', 'pan_india'].includes(item.name) || defaultValue?.pan_india === 'YES') && item.name !== 'pan_india') {
          tempForm.input[index].disabled = true;
        }

        let value = '';
        if (['state', 'city', 'branch_code'].includes(item.name)) {
          value = defaultValue?.pan_india === 'YES' ? [] : defaultValue[item.name].split(',');
          if (defaultValue?.pan_india === 'YES') {
            tempForm.input[index].validation.isRequired = false;
          }
        } else if (item.name === 'valuePER' || item.name === 'valueFLT') {
          value = defaultValue?.value;
        } else {
          value = defaultValue[item.name];
        }
        tempForm.input[index].defaultValue = value;
      }
    });
  }

  return copyForm;
};
