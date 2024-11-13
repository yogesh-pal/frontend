import {
  IDENTIFIER,
  REGEX,
  FUNCTION_IDENTIFIER
} from '../../../../../constants';

const relationshipManagerStep = (props) => {
  const {
    relationShipManagerDetails,
    relationShipManagerCodeHandler,
    relationShipManagerMobileHandler
  } = props;

  return {
    title: 'Relationship Manager',
    variant: 'outlined',
    input: [
      {
        name: 'rm_name',
        label: 'RM Name',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        multiSelect: false,
        option: (
          relationShipManagerDetails && relationShipManagerDetails.map((ele) => ele.rm_name)) || [],
        validation: {
          isRequired: true,
          requiredMsg: 'Please select relationship manager name.'
        },
      },
      {
        name: 'rm_code',
        label: 'RM Employee Code',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
        customFunction: relationShipManagerCodeHandler,
        functionChangeBaseOn: 'rm_name'
      },
      {
        name: 'rm_mobile_number',
        label: 'RM Mobile Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
        customFunction: relationShipManagerMobileHandler,
        functionChangeBaseOn: 'rm_name',
        validation: {
          pattern: REGEX.MOBILENUMBER,
          patternMsg: 'Please enter valid mobile number.'
        },
      },
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
  relationshipManagerStep
};
