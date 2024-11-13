import { useState, useRef, useEffect } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import styled from '@emotion/styled';
import ErrorText from '../errorHandler';
import { RadioLabelStyled, RadiobuttonStyle } from '../../styledComponents';

const WrapperDiv = styled('div')(({ marginTop }) => ({
  marginTop: marginTop ?? '25px'
}));

const StyledFieldset = styled('fieldset')(({ disabled }) => ({
  border: 'none',
  '& label span': {
    color: disabled && '#b1b1b1'
  }
}));
const RadioInput = (props) => {
  const {
    register, errors, input, setValue, updateJsonHandler, getValues
  } = props;

  const [details, setDetails] = useState({});
  const [radiovalue, setradioValue] = useState(input?.defaultValue ?? '');
  const radioRef = useRef(null);

  const onChangeHandler = async (e) => {
    try {
      if (input?.onChangeHandler) {
        const val = await input.onChangeHandler({
          setValue,
          updateJsonHandler,
          input,
          getValues,
          details,
          setDetails,
          selectedValue: e?.target?.value,
          refComponent: radioRef
        });

        if (val?.success) {
          updateJsonHandler(input, val);
        }
      }
      setValue(input.name, e?.target?.value);
    } catch (err) {
      console.log('Error', err);
    }
  };

  const componentRenderHandler = () => {
    try {
      return input.component({
        setValue,
        updateJsonHandler,
        input,
        getValues,
        details,
        setDetails,
        refComponent: radioRef
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  useEffect(() => {
    const value = getValues(input.name) || input.defaultValue;
    // const value = getValues(input.name);
    console.log('sdfsdfsdfs', value, input);
    setradioValue(value);
  }, [getValues(input.name)]);

  return (
    <WrapperDiv marginTop={input?.marginTop}>
      <RadioLabelStyled>{input?.validation?.isRequired ? `${input?.label}*` : input?.label}</RadioLabelStyled>
      <RadioGroup
        value={radiovalue}
        row={input?.inline ? input.inline : false}
        onChange={onChangeHandler}
      >
        {input.option.map((option) => (
          <StyledFieldset disabled={input?.disabled || (typeof option === 'object' && option.disabled)}>
            <FormControlLabel
              key={input.name + typeof option === 'object'
            && !Array.isArray(option) ? option.label : option}
              {...register(input.name, { required: input?.validation?.isRequired })}
              value={typeof option === 'object'
            && !Array.isArray(option) ? option.value : option}
              control={<RadiobuttonStyle />}
              label={typeof option === 'object'
            && !Array.isArray(option) ? option.label : option}
            />
          </StyledFieldset>
        ))}
      </RadioGroup>
      <ErrorText errors={errors} input={input} />
      {details?.isShowComponent && componentRenderHandler()}
    </WrapperDiv>
  );
};
export default RadioInput;
