import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { Popover, Grid } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  ButtonPrimary, SelectMenuStyle, TextFieldStyled
} from '../../../components/styledComponents';
import { businessTypeOptions } from '../constant';

const CustomForm = styled.form`
  padding: 10px;
`;
const CustomGrid = styled(Grid)`
  padding: 5px 0px;
`;
const IconWrapper = styled.div`
 display: flex;
 align-items: center;
`;
const CustomIconStyle = styled(CheckCircleRoundedIcon)`
 color: #502A74;
`;

const Filter = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [category, setCategory] = useState('');
  const [yearAndMonthValue, setYearAndMonthValue] = useState(null);
  const {
    register, handleSubmit, setValue, getValues
  } = useForm();
  const open = Boolean(anchorEl);
  const {
    onFilterSubmit, filterResetHandler, isFilterApplied, setIsFilterApplied
  } = props;
  const id = open ? 'simple-popover' : undefined;

  useEffect(() => {
    register('yearAndMonth', { required: false });
  }, []);

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setCategory(getValues('category'));
  };

  return (
    <>
      {
      isFilterApplied ? <IconWrapper><CustomIconStyle /></IconWrapper> : null
    }
      <ButtonPrimary onClick={(event) => setAnchorEl(event.currentTarget)}>
        Filters
      </ButtonPrimary>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => handlePopoverClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <CustomForm onSubmit={
          handleSubmit((value) => {
            onFilterSubmit(value);
            handlePopoverClose();
          })
        }
        >
          <CustomGrid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <TextFieldStyled
              label='Circular Category'
              select
              defaultValue={category}
              {...register('category', { required: false })}
            >
              {businessTypeOptions.map((option) => (
                <SelectMenuStyle
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectMenuStyle>
              ))}
            </TextFieldStyled>
          </CustomGrid>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CustomGrid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <DatePicker
                views={['year', 'month']}
                label='Year and Month'
                value={yearAndMonthValue}
                onChange={(newValue) => {
                  setYearAndMonthValue(newValue);
                  setValue('yearAndMonth', newValue, { shouldValidate: true, shouldDirty: true });
                }}
                disableFuture
                renderInput={(params) => (
                  <TextFieldStyled
                    {...params}
                    inputProps={{
                      ...params.inputProps,
                      placeholder: 'MMMM-YYYY'
                    }}
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                  />
                )}
              />
            </CustomGrid>
          </LocalizationProvider>
          <CustomGrid item xs={12} sm={12} md={12} lg={12} xl={12} display='flex' justifyContent='center'>
            <ButtonPrimary type='submit'>
              Apply
            </ButtonPrimary>
            <ButtonPrimary onClick={() => {
              filterResetHandler();
              setCategory('');
              setYearAndMonthValue(null);
              setValue('yearAndMonth', null);
              setValue('category', null);
              setAnchorEl(null);
              setIsFilterApplied(false);
            }}
            >
              Reset
            </ButtonPrimary>
          </CustomGrid>
        </CustomForm>
      </Popover>
    </>
  );
};
export default React.memo(Filter);
