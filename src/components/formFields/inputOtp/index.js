/* eslint-disable no-unused-vars */
import { useState, useRef } from 'react';
import { debounce } from 'lodash';
import { styled } from '@mui/material/styles';
import TextInput from '../textInput';
import { FullSizeButton, TextFieldStyled } from '../../styledComponents';
import ErrorText from '../errorHandler';
import PageLoader from '../../PageLoader';

const FieldWrapper = styled('div')(({ theme, show }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100%',
  borderRadius: '8px',
  background: show === 'fail' ? theme.text.secondary : '',
}));

const InputButtonOtp = (props) => {
  const {
    register,
    errors,
    input,
    variant,
    defaultValue,
    setValue,
    getValues,
    updateJsonHandler,
    setError
  } = props;
  const [loading, setLoading] = useState();
  const [details, setDetails] = useState({});
  const componentRef = useRef(null);
  const clickHandler = async (name) => {
    try {
      setLoading(true);
      const formValue = getValues();
      const obj = {};
      input?.apiBody?.forEach((item) => {
        obj[item] = formValue[item];
      });
      const val = await input.function(obj, {
        input,
        updateJsonHandler
      });
      if (val?.success) {
        updateJsonHandler(input, val);
        setError(input.name, '');
      }
      if (!val?.success && !val.validation) {
        updateJsonHandler(input, val);
      }
      setLoading(false);
    } catch (e) {
      console.log('Error', e);
      setLoading(false);
    }
  };

  const disableHandler = () => {
    try {
      if (loading || input?.disabled) return true;
      if (input?.enablebutton) {
        if (input.enablebutton?.length) {
          if (defaultValue?.length === input?.enablebutton?.length) {
            if (input?.validation?.pattern
              && new RegExp(input?.validation?.pattern).test(getValues(input.name))) {
              return false;
            }
            if (input?.validation?.hasOwnProperty('pattern')) {
              return true;
            }
            return false;
          }
          return true;
        }
      }

      if (input?.validation?.pattern
        && new RegExp(input?.validation?.pattern).test(getValues(input.name))) {
        return false;
      }

      if (input?.validation?.hasOwnProperty('pattern')) {
        return true;
      }
    } catch (e) {
      console.log('Error', e);
    }
  };
  const handleChange = (event) => {
    const { value } = event.target;
    setValue(input?.name, input?.isUpperCase
      ? value.toUpperCase() : value, {
      shouldValidate: true
    });
  };
  const debouncedOnChange = debounce(handleChange, 300);
  return (
    <>
      {(loading && input?.isPageLoaderRequired?.val)
        ? <PageLoader msg={input?.isPageLoaderRequired?.msg} /> : null}
      <FieldWrapper>
        <TextFieldStyled
          id={`${input?.id}-basic`}
          label={input?.validation?.isRequired ? `${input?.label}*` : input?.label}
          variant={variant}
          defaultValue={defaultValue}
          disabled={input?.disabled}
          {...register(
            input?.name,
            {
              required: input?.validation?.isRequired,
              pattern: (input?.validation?.pattern)
                ? new RegExp(input?.validation?.pattern) : undefined,
              minLength: (input?.validation?.minLength)
                ? input?.validation?.minLength : undefined,
              maxLength: (input?.validation?.maxLength)
                ? input?.validation?.maxLength : undefined
            }
          )
          }
          onChange={debouncedOnChange}
        />
        <FullSizeButton
          width='250px'
          onClick={clickHandler}
          loading={loading}
          disabled={disableHandler()}
          loadingPosition='start'
        >
          { input?.buttonName || 'Verify'}
        </FullSizeButton>
      </FieldWrapper>
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default InputButtonOtp;
