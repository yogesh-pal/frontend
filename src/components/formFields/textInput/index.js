/* eslint-disable max-len */
import { useState } from 'react';
import { debounce } from 'lodash';
import InputAdornment from '@mui/material/InputAdornment';
import ErrorText from '../errorHandler';
import { TextFieldStyled } from '../../styledComponents';
import { numberFormat } from '../../../utils';

const TextInput = (props) => {
  const {
    register, errors, input, variant, defaultValue, getValues, setValue, updateJsonHandler
  } = props;
  const [isHaveFocus, setIsHaveFocus] = useState(false);

  const inputValueHandler = (value) => {
    if (input?.isUpperCase) {
      return value.toUpperCase();
    }

    if (input.isAmount && value?.length > 3) {
      return numberFormat(value);
    }
    return value;
  };
  const handleChange = (e) => {
    const inputValue = inputValueHandler(e.target.value);
    setValue(input?.name, inputValue, {
      shouldValidate: true
    });
    if (input?.onChangeHandler) {
      input.onChangeHandler({
        setValue,
        updateJsonHandler,
        input

      });
    }
  };
  const debouncedOnChange = debounce(handleChange, 300);
  console.log(input.name, input);
  return (
    <>
      <TextFieldStyled
        id={`${input?.id}-basic`}
        label={input?.validation?.isRequired ? `${input?.label}*` : input?.label}
        variant={variant}
        defaultValue={defaultValue || ''}
        isDisabled={input?.disabled}
        maxRows={input?.maxRows}
        minRows={input?.minRows}
        multiline={input?.multiline !== undefined}
        colorCode={input?.colorCode}
        InputLabelProps={{ shrink: !!getValues(input?.name) || isHaveFocus || input?.InputProps !== undefined }}
        onFocus={() => setIsHaveFocus(true)}
        InputProps={
          {
            readOnly: input?.disabled,
            ...(input?.InputProps !== undefined) ? {
              [`${input?.InputProps.possition}Adornment`]: <InputAdornment position={input?.InputProps.possition}>{input?.InputProps.text}</InputAdornment>,
            } : { }
          }
      }
        {...register(
          input?.name,
          {
            onBlur: () => setIsHaveFocus(false),
            required: input?.validation?.isRequired,
            pattern: (input?.validation?.pattern)
              ? new RegExp(input?.validation?.pattern) : undefined,
            min: (input?.validation?.min)
              ? input?.validation?.min : undefined,
            max: (input?.validation?.max)
              ? input?.validation?.max : undefined,
            maxLength: (input?.validation?.maxLength)
              ? input?.validation?.maxLength : undefined,
            minLength: (input?.validation?.minLength)
              ? input?.validation?.minLength : undefined,
          },
        )
        }
        onChange={debouncedOnChange}
      />
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default TextInput;
