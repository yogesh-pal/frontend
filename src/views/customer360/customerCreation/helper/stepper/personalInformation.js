import {
  IDENTIFIER,
  REGEX
} from '../../../../../constants';
import {
  GENDERENUM
} from '../constant';

const personalInformationStep = () => ({
  title: 'Personal Information',
  variant: 'outlined',
  input: [
    {
      name: 'no_years_current_residence',
      label: 'Number of years in current residence',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      validation: {
        isRequired: true,
        requiredMsg: 'Please enter residence years.',
        pattern: REGEX.TWODIGITDECIMAL,
        patternMsg: 'Please enter valid residence years.'
      },
    },
    {
      name: 'education',
      label: 'Education',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      defaultValue: '',
      multiSelect: false,
      option: ['No Formal Education', '10th', '12th', 'Graduation', 'Post Graduation', 'Professional Degree'],
      validation: {
        isRequired: true,
        requiredMsg: 'Please select education',
      },
    },
    {
      name: 'primary_mobile_number',
      label: 'Primary Contact Number',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      validation: {
        isRequired: true,
        requiredMsg: 'Please enter primary contact number.',
        pattern: REGEX.MOBILENUMBER,
        patternMsg: 'Please enter valid primary contact number.',
        maxLength: 10,
        maxLenMsg: 'Primary contact number should not be more than 10 digits.',
      },
    },
    {
      name: 'secondary_mobile_number',
      label: 'Secondary Contact Number',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      validation: {
        pattern: REGEX.MOBILENUMBER,
        patternMsg: 'Please enter valid secondary contact number.',
        maxLength: 10,
        maxLenMsg: 'Secondary Contact Number should not be more than 10 digits.',
      },
    },
    {
      name: 'email_id',
      label: 'Email ID',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      validation: {
        pattern: REGEX.EMAIL,
        patternMsg: 'Please enter valid email id.',
        maxLength: 120,
        maxLenMsg: 'Email ID not be greater than 120 characters.',
      },
    },
    {
      name: 'marital_status',
      label: 'Marital Status',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['Married', 'Unmarried', 'Divorced'],
      validation: {
        isRequired: true,
        requiredMsg: 'Please select marital status.',
      },
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: GENDERENUM,
      validation: {
        isRequired: true,
        requiredMsg: 'Please select gender.'
      },
    },
    {
      name: 'religion',
      label: 'Religion',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhism', 'Jainism', 'Parsi', 'Others'],
      validation: {
        isRequired: true,
        requiredMsg: 'Please select religion.'
      }
    },
    {
      name: 'mother_name',
      label: 'Mother\'s Name',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      validation: {
        isRequired: true,
        requiredMsg: 'Please enter mother\'s name.',
        pattern: REGEX.ALPHABETSTRIMSPACESTARTEND,
        patternMsg: 'Please enter valid mother\'s name.',
        maxLength: 50,
        maxLenMsg: 'Mother\'s name should not be more than 50 characters.'
      }
    },
    {
      name: 'social_status',
      label: 'Social Status',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['General', 'OBC', 'SC', 'ST', 'Others'],
      validation: {
        isRequired: true,
        requiredMsg: 'Please select social status.'
      }
    },
    {
      name: 'father_name',
      label: 'Father\'s Name',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      validation: {
        isRequired: true,
        requiredMsg: 'Please enter father\'s name.',
        pattern: REGEX.ALPHABETSTRIMSPACESTARTEND,
        patternMsg: 'Please enter valid father\'s name.',
        maxLength: 50,
        maxLenMsg: 'Father\'s name should not be more than 50 characters.',
        minLength: 4,
        minLenMsg: 'Father\'s Name cannot be less than 4 Character.',
      }
    },
    {
      name: 'place_of_birth',
      label: 'Place of Birth',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      validation: {
        isRequired: true,
        requiredMsg: 'Please enter place of birth.',
        pattern: REGEX.ALPHABETSTRIMSPACESTARTEND,
        patternMsg: 'Please enter valid place of birth.',
        maxLength: 50,
        maxLenMsg: 'Place of birth should not be more than 50 characters.'
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
});
export {
  personalInformationStep
};
