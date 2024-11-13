import { useState } from 'react';
import { TextField } from '@mui/material';
import { AutoCompleteStyled } from '../../styledComponents/formFields/autoComplete';
import ErrorText from '../errorHandler';
import { SelectMenuStyle } from '../../styledComponents';

const AutoComplete = (props) => {
  const [open, setOpen] = useState(false);
  const {
    register, errors, input, setValue, getValues
  } = props;
  let autoCompleteValue = null;

  const selectedOption = input.option.filter((ele) => ele.value === getValues(input.name));
  if (selectedOption.length) {
    [autoCompleteValue] = selectedOption;
  }

  const handleChange = (event, values) => {
    if (values && values.value) {
      setValue(input.name, values.value, { shouldValidate: true });
    } else {
      setValue(input.name, null, { shouldValidate: true });
    }
  };

  return (
    <>
      <AutoCompleteStyled
        id='auto-complete'
        variant={input.id}
        {...register(input.name, {
          required: input?.validation?.requiredMsg
            ? input?.validation?.requiredMsg : input?.validation?.isRequired
        })}
        disabled={input?.disabled}
        noOptionsText={input?.noOptionsText ? input?.noOptionsText : 'No options'}
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        onChange={handleChange}
        isOptionEqualToValue={(option, values) => option.value === values.value}
        getOptionLabel={(option) => option.label}
        options={input?.option}
        renderOption={(prop, { label }) => (
          <SelectMenuStyle {...prop}>
            {label}
          </SelectMenuStyle>
        )}
        value={autoCompleteValue}
        renderInput={(params) => (
          <TextField
            {...params}
            label={input?.validation?.isRequired ? `${input.label}*` : input.label}
          />
        )}
      />
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default AutoComplete;
