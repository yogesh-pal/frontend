import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LaunchIcon from '@mui/icons-material/Launch';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { ButtonPrimary, TextFieldStyled } from '../../styledComponents';
import ErrorText from '../errorHandler';

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.input.primary
}));
const GridIconContainer = styled(Grid)(() => ({
  textAlign: 'center',
}));
const CrifButton = (props) => {
  const {
    register, errors, input, variant, defaultValue, setValue, getValues
  } = props;
  const [show, setShow] = useState(false);
  const [data, setdata] = useState({});
  useEffect(() => {
    const val = getValues('crif');
    if (val !== undefined) {
      setShow(true);
      setdata(val);
    }
  }, []);
  const handleClick = () => {
    const res = input.onclick();
    setdata(res);
    setValue('crif', res);
    setShow(true);
  };
  return (
    <>
      {!show
        ? <ButtonPrimary onClick={handleClick} type='button' variant='contained'>{input?.label}</ButtonPrimary>
        : (
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <TextFieldStyled
                id={`${input?.name}-basic`}
                label='CRIF Score'
                variant={variant}
                value={defaultValue}
                disabled
              // onChange={(e) => { setValue(input?.name, e.target.value); }}
                {...register(input?.name, { value: data.score })}
              />
            </Grid>
            <GridIconContainer item xs={2}>
              <Tooltip title='CRIF Report'>
                <CustomIconButton>
                  <LaunchIcon onClick={() => window.open(data.url, '_blank')} />
                </CustomIconButton>
              </Tooltip>
            </GridIconContainer>
          </Grid>
        )}
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default CrifButton;
