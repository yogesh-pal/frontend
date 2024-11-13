import { useId, useState, useEffect } from 'react';
import { debounce } from 'lodash';
import ErrorText from '../errorHandler';
import {
  SelectLabelStyled,
  SelectMenuStyle,
  SelectStyled
} from '../../styledComponents';

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: '300px',
      width: 250,
    }
  }
};

const SelectInput = (props) => {
  const {
    register, errors, input, defaultValue,
    setValue, getValues, updateJsonHandler
  } = props;
  const [selectedValue, setSelectedValue] = useState(defaultValue || '');
  const id = useId();
  if (input.deselect && input.deselect?.allow) {
    const firstElement = input?.option[0];
    const DeselectOption = {
      label: input.deselect?.optionName,
      value: ''
    };
    if (typeof (firstElement) !== 'object') {
      input.option = [DeselectOption, ...input.option];
    } else if (firstElement.label !== input.deselect?.optionName) {
      input.option = [DeselectOption, ...input.option];
    }
  }
  useEffect(() => {
    setSelectedValue(defaultValue || '');
  }, [defaultValue]);
  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    setValue(input.name, value, { shouldValidate: true });
    if (input?.checkifExists && input?.checkField) {
      input?.checkifExists(
        input.checkField,
        value,
        getValues,
        setValue,
        { updateJsonHandler, input }
      );
    }
  };
  const debouncedOnChange = debounce(handleChange, 300);
  return (
    <>
      <SelectLabelStyled variant={input.id} isDisabled={input?.disabled && !defaultValue}>{input?.label && (input?.validation?.isRequired ? `${input.label}*` : input.label)}</SelectLabelStyled>
      <SelectStyled
        id={`${input.id}-basic`}
        label={input?.validation?.isRequired ? `${input.label}*` : input.label}
        variant={input.id}
        {...register(input.name, { required: input?.validation?.isRequired })}
        defaultValue={defaultValue}
        value={selectedValue}
        disabled={input?.disabled}
        MenuProps={MenuProps}
        onChange={debouncedOnChange}
      >
        {input.option.map((option) => (
          <SelectMenuStyle
            // onClick={handleChange}
            key={`${typeof option === 'object'
              && !Array.isArray(option) ? option.value : option}-${id}`}
            value={typeof option === 'object'
              && !Array.isArray(option) ? option.value : option}
            disabled={typeof option === 'object'
            && !Array.isArray(option) ? option?.disabled : false}
          >
            {typeof option === 'object'
              && !Array.isArray(option) ? option.label : option}
          </SelectMenuStyle>
        ))}
      </SelectStyled>
      <ErrorText input={input} errors={errors} />
    </>
  );
};
export default SelectInput;
