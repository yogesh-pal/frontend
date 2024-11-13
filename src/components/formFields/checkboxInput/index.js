import FormGroup from '@mui/material/FormGroup';
import { FormControlLabel } from '@mui/material';
import styled from '@emotion/styled';
import ErrorText from '../errorHandler';
import { CheckboxPrimary, CheckboxLabelPrimary } from '../../styledComponents';

const WrapperDiv = styled.div`
margin-top: 20px;
`;

const CheckboxInput = (props) => {
  const {
    register, errors, input, defaultValue
  } = props;

  const defaultValueHandler = (defaultVal, option) => {
    if (defaultVal === undefined) return false;
    if (typeof (defaultVal) === 'object') {
      return defaultVal.find((element) => element === option) !== undefined;
    }
    return option === defaultVal;
  };
  return (
    <WrapperDiv>
      <CheckboxLabelPrimary>{input?.name}</CheckboxLabelPrimary>
      <FormGroup defaultValue={defaultValue}>
        {input?.option?.map((option) => (
          <FormControlLabel
            key={input.name + option}
            {...register(input?.name, { required: input?.validation?.isRequired })}
            value={option}
            control={(
              <CheckboxPrimary
                defaultChecked={defaultValueHandler(defaultValue, option)}
              />
            )}
            label={option}
          />
        ))}
      </FormGroup>
      <ErrorText input={input} errors={errors} />
    </WrapperDiv>
  );
};
export default CheckboxInput;
