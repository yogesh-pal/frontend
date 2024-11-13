import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ErrorText from '../errorHandler';
import { TextFieldStyled } from '../../styledComponents';

const DatePickerComponent = (props) => {
  const [date, setDate] = useState(null);
  const {
    register, errors, input, setValue, variant, getValues
  } = props;
  const value = getValues(input?.name);
  const { activeFormIndex } = getValues();
  const location = useLocation();
  let goldInformationStep = 2;
  if (location.pathname === '/loan-disbursal/maker') {
    goldInformationStep = 3;
  }

  const disableCustomDates = (currentDate) => {
    if (input?.greaterDateDisable && input?.lesserDateDisable) {
      const lesserDate = new Date(input?.lesserDateDisable);
      const greaterDate = new Date(input?.greaterDateDisable);
      return currentDate < lesserDate || currentDate > greaterDate;
    }

    if (input?.greaterDateDisable) {
      const greaterDate = new Date(input?.greaterDateDisable);
      return currentDate > greaterDate;
    }

    if (input?.lesserDateDisable) {
      const lesserDate = new Date(input?.lesserDateDisable);
      return currentDate < lesserDate;
    }
  };

  useEffect(() => {
    if (['current_date_of_residence', 'permanent_date_of_residence'].includes(input?.name)) {
      if (activeFormIndex >= goldInformationStep) {
        register(input?.name, { required: input?.validation?.isRequired });
        setDate(value || null);
      }
    } else {
      register(input?.name, { required: input?.validation?.isRequired });
      setDate(value || null);
    }
  }, [value]);
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          className='date-picker'
          disableHighlightToday={false}
          today
          disabled={input?.disabled}
          selected
          label={input?.validation?.isRequired ? `${input?.label}*` : input?.label}
          inputFormat='dd/MM/yyyy'
          value={date}
          onChange={(v) => {
            if (!disableCustomDates(v)) {
              setValue(
                input?.name,
                v,
                { shouldValidate: true }
              );
            } else {
              setDate(v);
            }
          }}
          renderInput={(params) => (
            <TextFieldStyled
              onKeyDown={(e) => {
                if (input?.readonly) {
                  e.preventDefault();
                }
              }}
              variant={variant}
              {...params}
              inputMode={input?.inputMode ? input?.inputMode : null}
              isDisabled={input?.disabled}
              disabled={input?.disabled}
            />
          )}
          disableFuture={input?.isFutureDateDisable}
          disablePast={input?.isPastDateDisable}
          shouldDisableDate={disableCustomDates}
          shouldDisableYear={input?.disableYears}
        />
      </LocalizationProvider>
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default DatePickerComponent;
