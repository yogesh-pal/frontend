import moment from 'moment';
import {
  IDENTIFIER,
  REGEX
} from '../../../../../constants';

const nomineeDetailsStep = (props) => {
  const { handleDynamicNomineeValidation } = props;

  return {
    title: 'Customer & Nominee Details',
    variant: 'outlined',
    input: [
      {
        name: 'nominee_relationship',
        label: 'Nominee Relationship',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        defaultValue: ' ',
        option: ['Father', 'Mother', 'Spouse', 'Children', 'Brother', 'Other'],
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter gold nominee 1',
        },
      },
      {
        name: 'nominee_other_relation',
        label: 'Other Relation',
        type: 'text',
        defaultValue: ' ',
        identifier: IDENTIFIER.INPUTTEXT,
        condition: {
          type: 'showOnValue',
          baseOn: 'nominee_relationship',
          baseValue: 'Other'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter other relation',
          pattern: REGEX.ALPHABETSTRIMSPACESTARTEND,
          patternMsg: 'Please enter valid other relation.',
          maxLength: 150,
          maxLenMsg: 'Other relation should not be more than 150 characters.',
        },
      },
      {
        name: 'nominee_name',
        label: 'Nominee Name',
        type: 'text',
        defaultValue: ' ',
        identifier: IDENTIFIER.INPUTTEXT,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter nominee name.',
          pattern: REGEX.ALPHABETSTRIMSPACESTARTEND,
          patternMsg: 'Please enter valid nominee name.',
          maxLength: 150,
          maxLenMsg: 'Nominee name should not be more than 150 characters.',
        },
      },
      {
        name: 'nominee_dob',
        label: 'Nominee Date of Birth',
        type: 'date',
        defaultValue: ' ',
        identifier: IDENTIFIER.DATEPICKER,
        isFutureDateDisable: true,
        isPastDateDisable: false,
        readonly: true,
        greaterDateDisable: moment().subtract(18, 'years'),
        disableYears: (currentDate) => moment().diff(moment(currentDate), 'years') < 18,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter date of birth.',
        },
      },
      {
        name: 'nominee_mobile',
        label: 'Nominee Mobile Number',
        type: 'text',
        defaultValue: ' ',
        identifier: IDENTIFIER.INPUTTEXT,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter mobile number.',
          pattern: REGEX.MOBILENUMBER,
          patternMsg: 'Please enter valid mobile number.',
          maxLength: 10,
          maxLenMsg: 'Nominee mobile number should not be more than 10 digits.',
        },
      },
    ],
    dynamicValidation: handleDynamicNomineeValidation,
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

export { nomineeDetailsStep };
