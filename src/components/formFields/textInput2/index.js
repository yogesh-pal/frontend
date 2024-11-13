import { debounce } from 'lodash';
import InputAdornment from '@mui/material/InputAdornment';
import ErrorText from '../errorHandler';
import { TextFieldStyled } from '../../styledComponents';
import { numberFormat } from '../../../utils';

const TextInput = (props) => {
  const {
    register, errors, input, variant, defaultValue, setValue
  } = props;

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
    setValue(input?.name, inputValueHandler(e.target.value), {
      shouldValidate: true
    });
  };
  const debouncedOnChange = debounce(handleChange, 500);
  return (
    <>
      <TextFieldStyled
        id={`${input?.id}-basic`}
        label={input?.validation?.isRequired ? `${input?.label}*` : input?.label}
        variant={variant}
        defaultValue={defaultValue || ''}
        value={defaultValue || ''}
        disabled={input?.disabled || false}
        isDisabled={input?.disabled && !defaultValue}
        maxRows={input?.maxRows}
        minRows={input?.minRows}
        multiline={input?.multiline !== undefined}
        InputProps={
          (input?.InputProps !== undefined) ? {
            readOnly: input?.readOnly,
            [`${input?.InputProps.possition}Adornment`]: <InputAdornment position={input?.InputProps.possition}>{input?.InputProps.text}</InputAdornment>,
          } : {}
      }
        {...register(
          input?.name,
          {
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
          }
        )
        }
        onChange={debouncedOnChange}
      />
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default TextInput;
