/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable no-unused-vars */
import { useEffect } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  RadioGroup,
  Grid
} from '@mui/material';
import styled from '@emotion/styled';
import ErrorText from '../errorHandler';
import { RadiobuttonStyle } from '../../styledComponents';

const WrapperDiv = styled('div')(({ marginTop }) => ({
  marginTop: marginTop ?? '25px'
}));

const RadioGroupContainer = styled(RadioGroup)(({ theme, style }) => ({
  [theme.breakpoints.only('xs')]: { ...style.onlyxs },
  [theme.breakpoints.up('xs')]: { ...style.xs },
  [theme.breakpoints.up('sm')]: { ...style.sm },
  [theme.breakpoints.up('md')]: { ...style.md },
  [theme.breakpoints.up('lg')]: { ...style.lg },
  [theme.breakpoints.up('xl')]: { ...style.xl },
}));

const ParentContainer = styled('div')(({ theme, style, disabled }) => ({
  [theme.breakpoints.only('xs')]: {
    ...style.onlyxs,
  },
  [theme.breakpoints.up('xs')]: {
    ...style.xs,
  },
  [theme.breakpoints.up('sm')]: {
    ...style.sm,
  },
  [theme.breakpoints.up('md')]: {
    ...style.md,
  },
  [theme.breakpoints.up('lg')]: {
    ...style.lg,
  },
  [theme.breakpoints.up('xl')]: {
    ...style.xlm,
  },

}));

const OptionContainer = styled('div')(({ theme, style, disabled }) => ({
  [theme.breakpoints.only('xs')]: { ...style.onlyxs },
  [theme.breakpoints.up('xs')]: { ...style.xs },
  [theme.breakpoints.up('sm')]: { ...style.sm },
  [theme.breakpoints.up('md')]: { ...style.md },
  [theme.breakpoints.up('lg')]: { ...style.lg },
  [theme.breakpoints.up('xl')]: { ...style.xl },
}));

const CustomizedRadioInput = (props) => {
  const {
    register,
    errors,
    input,
    defaultValue,
    setValue,
    getValues
  } = props;

  const optionClickHanlder = (option) => {
    try {
      const { value, label } = option;
      document.getElementById(label).click();
      setValue(input?.name, value);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const onChangeValueHandler = (value) => {
    try {
      const { option } = input;
      const opt = option.find((item) => item.value === value);
      document.getElementById(opt?.label).click();
      setValue(input?.name, opt?.value);
    } catch (e) {
      console.log('Error', e);
    }
  };

  useEffect(() => {
    onChangeValueHandler(defaultValue);
  }, [defaultValue]);

  return (
    <WrapperDiv marginTop={input?.marginTop}>
      <RadioGroupContainer
        defaultValue={defaultValue}
        style={input?.radioGroupComponentCss}
      >
        {input.option.map((option) => (
          <ParentContainer
            style={
              option?.disabled
                ? option?.parentComponentCss.disabled : option?.parentComponentCss.active
            }
            disabled={option?.disabled}
            onClick={() => !option?.disabled && optionClickHanlder(option)}
          >
            <OptionContainer style={option?.topComponentCss}>
              {option?.leftAlign({
                disabled: option?.disabled,
                option
              })}
              <FormControlLabel
                disabled={option?.disabled}
                key={input.name + typeof option === 'object'
                  && !Array.isArray(option) ? option.label : option}
                {...register(input.name, { required: input?.validation?.isRequired })}
                value={typeof option === 'object'
                  && !Array.isArray(option) ? option.value : option}
                control={<RadiobuttonStyle id={option?.label} />} />
            </OptionContainer>
            <div>
              {option?.bottomAlign({
                disabled: option?.disabled,
                option
              })}
            </div>
          </ParentContainer>
        ))}
      </RadioGroupContainer>
      <ErrorText errors={errors} input={input} />
    </WrapperDiv>
  );
};
export default CustomizedRadioInput;
