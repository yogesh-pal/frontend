import { useState } from 'react';
import ErrorText from '../errorHandler';
import { INPUT } from './Input';
import {
  PasswordFormControl,
  PasswordLabelStyled
} from '../../styledComponents';

const PasswordInput = (props) => {
  const {
    register,
    errors,
    input,
    variant,
  } = props;
  const [values, setValues] = useState({
    showPassword: false,
  });

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const PasswordField = INPUT[variant ?? 'standard'];

  return (
    <>
      <PasswordFormControl variant={variant}>
        <PasswordLabelStyled htmlFor={`${variant}-adornment-password`}>{input?.label}</PasswordLabelStyled>
        <PasswordField
          input={input}
          values={values}
          register={register}
          handleClickShowPassword={handleClickShowPassword}
          handleMouseDownPassword={handleMouseDownPassword}
        />
      </PasswordFormControl>
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default PasswordInput;
