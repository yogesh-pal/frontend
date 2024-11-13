import { useState, useEffect } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import ErrorText from '../errorHandler';
import {
  SelectLabelStyled,
  SelectMenuStyle,
  SelectStyled
} from '../../styledComponents';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const MultiSelect = (props) => {
  const {
    register, errors, input, setValue, defaultValue
  } = props;

  let setDefault = [];
  if (defaultValue !== undefined && defaultValue !== '') setDefault = defaultValue;
  const [personName, setPersonName] = useState(setDefault);
  const [check, setcheck] = useState(input.onChangeuseEffectDisable ?? false);

  useEffect(() => {
    if (input.defaultSelectedAll) {
      const inputselect = input.option.map((item) => {
        if (item.value !== undefined) {
          return item.value;
        }

        return item;
      });
      setPersonName(inputselect);
      setValue(input.name, inputselect);
    }
  }, []);
  useEffect(() => {
    if (!check) {
      if (input.defaultSelectedAllOnChange) {
        const inputselect = input.option.map((item) => {
          if (item.value !== undefined) {
            return item.value;
          }
          return item;
        });
        setPersonName(inputselect);
        setValue(input.name, inputselect);
      }
    } else {
      setcheck(false);
    }
  }, [input.option]);
  useEffect(() => {
    if (defaultValue) {
      setPersonName(defaultValue);
    }
  }, [defaultValue]);
  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    setPersonName(
      value,
    );
    setValue(input.name, value, { shouldValidate: true });
  };
  const renderValues = (value) => {
    const valueData = [];
    input.option.forEach((item) => {
      if (typeof item === 'object' && !Array.isArray(item) && value.includes(item.value)) {
        valueData.push(item.label);
      } if (value.includes(item)) {
        valueData.push(item);
      }
    });
    return valueData;
  };
  return (
    <>
      <SelectLabelStyled isDisabled={input?.disabled && !defaultValue} variant={input.id}>{input?.validation?.isRequired ? `${input.label}*` : input.label}</SelectLabelStyled>
      <SelectStyled
        id={`${input.id}-basic`}
        label={input?.validation?.isRequired ? `${input.label}*` : input.label}
        variant={input.id}
        multiple
        {...register(input.name, { required: input?.validation?.isRequired })}
        value={personName}
        onChange={handleChange}
        MenuProps={MenuProps}
        renderValue={(selected) => renderValues(selected).join(',')}
        disabled={input?.disabled}
      >
        {input.option.map((option) => (
          <SelectMenuStyle
            className='option'
            style={{ display: 'flex', justifyContent: 'space-between' }}
            key={typeof option === 'object'
            && !Array.isArray(option) ? option.value : option}
            value={typeof option === 'object'
              && !Array.isArray(option) ? option.value : option}
          >
            {typeof option === 'object'
              && !Array.isArray(option) ? option.label : option}
            {personName.indexOf(`${typeof option === 'object'
              && !Array.isArray(option) ? option.value : option}`) !== -1 && <DoneIcon /> }
          </SelectMenuStyle>

        ))}
      </SelectStyled>
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default MultiSelect;
