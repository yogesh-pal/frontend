/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import {
  IDENTIFIER,
  REGEX,
  FUNCTION_IDENTIFIER
} from '../../../../../constants';

const employmentInformationStep = (props) => {
  const { annualIncomeHandler, customerOccupationHandler } = props;

  return {
    title: 'Employment Information',
    variant: 'outlined',
    input: [
      {
        name: 'customer_occupation',
        label: 'Customer Occupation',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        option: ['Self Employed', 'Salaried', 'Agriculturist', 'Homemaker', 'Unemployed', 'Student'],
        customFunction: customerOccupationHandler,
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'customer_occupation',
        onChange: {
          'Self Employed': {
            defaultValue: 'Self Employed',
            showField: [{
              name: 'psl_category',
              condition: 'isShow',
              value: true
            }],
            disable: {
              value: false,
              disableFields: ['annual_income_self_salaried', 'annual_income_salaried', 'annual_income_agriculturist', 'psl_status', 'psl_category'],
            },
            resetFields: ['risk_rating', 'annual_income_salaried', 'annual_income_agriculturist', 'psl_status', 'psl_category', 'annual_income_homemaker', 'annual_income_unemployed', 'annual_income_student']
          },
          Salaried: {
            defaultValue: 'Salaried',
            showField: [{
              name: 'psl_category',
              condition: 'isShow',
              value: false
            }],
            disable: {
              value: false,
              disableFields: ['annual_income_self_salaried', 'annual_income_salaried', 'annual_income_agriculturist'],
            },
            resetFields: ['risk_rating', 'annual_income_self_salaried', 'annual_income_agriculturist', 'annual_income_homemaker', 'annual_income_unemployed', 'annual_income_student']
          },
          Agriculturist: {
            defaultValue: 'Agriculturist',
            showField: [{
              name: 'psl_category',
              condition: 'isShow',
              value: true
            }],
            disable: [{
              value: true,
              disableFields: ['psl_category', 'psl_status'],
            }, {
              value: false,
              disableFields: ['annual_income_self_salaried', 'annual_income_salaried', 'annual_income_agriculturist'],
            }],
            resetFields: ['risk_rating', 'annual_income_self_salaried', 'annual_income_agriculturist', 'annual_income_homemaker', 'annual_income_unemployed', 'annual_income_student']
          },
          Homemaker: {
            defaultValue: 'Homemaker',
            disable: [{
              value: true,
              disableFields: ['psl_status'],
            }, {
              value: false,
              disableFields: ['annual_income_homemaker'],
            }
            ],
            resetFields: ['risk_rating', 'annual_income_self_salaried', 'annual_income_agriculturist', 'annual_income_salaried', 'annual_income_homemaker', 'annual_income_unemployed', 'annual_income_student']
          },
          Unemployed: {
            defaultValue: 'Unemployed',
            disable: [{
              value: true,
              disableFields: ['psl_status'],
            }, {
              value: false,
              disableFields: ['annual_income_unemployed'],
            }],
            resetFields: ['risk_rating', 'annual_income_self_salaried', 'annual_income_agriculturist', 'annual_income_salaried', 'annual_income_homemaker', 'annual_income_unemployed', 'annual_income_student']
          },
          Student: {
            defaultValue: 'Student',
            disable: [{
              value: true,
              disableFields: ['psl_status'],
            }, {
              value: false,
              disableFields: ['annual_income_student'],
            }],
            resetFields: ['risk_rating', 'annual_income_self_salaried', 'annual_income_agriculturist', 'annual_income_salaried', 'annual_income_homemaker', 'annual_income_unemployed', 'annual_income_student']
          },
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select customer occupation.',
        },
      },
      {
        name: 'annual_income_self_salaried',
        label: 'Annual Income',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'annual_income_self_salaried',
        customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_self_salaried'),
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'customer_occupation',
          baseValue: 'Self Employed',
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select annual income.',
        },
      },
      {
        name: 'annual_income_salaried',
        label: 'Annual Income',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'annual_income_salaried',
        customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_salaried'),
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'customer_occupation',
          baseValue: 'Salaried',
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select annual income.',
        },
      },
      {
        name: 'annual_income_agriculturist',
        label: 'Annual Income',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'annual_income_agriculturist',
        customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_agriculturist'),
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'customer_occupation',
          baseValue: 'Agriculturist',
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select annual income.',
        },
      },
      {
        name: 'annual_income_homemaker',
        label: 'Annual Income',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'annual_income_homemaker',
        customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_homemaker'),
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'customer_occupation',
          baseValue: 'Homemaker',
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select annual income.',
        },
      },
      {
        name: 'annual_income_unemployed',
        label: 'Annual Income',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'annual_income_unemployed',
        customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_unemployed'),
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'customer_occupation',
          baseValue: 'Unemployed',
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select annual income.',
        },
      },
      {
        name: 'annual_income_student',
        label: 'Annual Income',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'annual_income_student',
        customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_student'),
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'customer_occupation',
          baseValue: 'Student',
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select annual income.',
        },
      },
      {
        name: 'risk_rating',
        label: 'Risk Category',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        InputProps: true,
        readOnly: true,
        defaultValue: ''
      },
      {
        name: 'psl_status',
        label: 'PSL Status',
        type: 'radio',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select psl status'
        },
        condition: {
          type: 'multiShowOnValue',
          baseOn: 'customer_occupation',
          baseValue: ['Self Employed', 'Agriculturist', 'Homemaker', 'Unemployed', 'Student'],
        },
      },
      {
        name: 'psl_category',
        label: 'PSL Category',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        option: ['Agriculture', 'MSME', 'Education', 'Housing', 'Social Infrastructure', 'Renewable Energy', 'Others'],
        validation: {
          isRequired: true,
          requiredMsg: 'Please select psl category.'
        },
        condition: {
          type: 'visible,showOnValue',
          isShow: false,
          baseOn: 'psl_status',
          baseValue: 'Yes',
        },
      },
      {
        name: 'is_gst_applicable',
        label: 'Is GST Applicable for Customer?',
        type: 'text',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        defaultValue: 'No',
        inline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select any of the above options'
        }
      },
      {
        name: 'customer_gst_number',
        label: 'Customer GST Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        condition: {
          type: 'showOnValue',
          baseOn: 'is_gst_applicable',
          baseValue: 'Yes'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter Customer GST Number.',
          pattern: REGEX.GSTNUMBER,
          patternMsg: 'Please enter valid Customer GST Number.'
        }
      }
    ],
    buttonDetails: {
      name: 'Next',
    },
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
  employmentInformationStep
};
