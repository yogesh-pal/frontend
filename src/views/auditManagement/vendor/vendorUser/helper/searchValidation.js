import {
  REGEX
} from '../../../../../constants';

export const validation = {
  user_id: {
    name: 'user_id',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter user id.',
      pattern: REGEX.ALPHANUMERICTRIMSPACE,
      patternMsg: 'Please enter valid user id.',
    }
  },
  mobile: {
    name: 'mobile',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter mobile number.',
      pattern: REGEX.ALPHANUMERICTRIMSPACE,
      patternMsg: 'Please enter valid mobile number.',
    }
  },
};
