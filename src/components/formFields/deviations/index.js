/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { cloneDeep, debounce } from 'lodash';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { ButtonPrimary, TextFieldStyled } from '../../styledComponents';
import ErrorText from '../errorHandler';

const Deviations = (props) => {
  const {
    register, errors, input, variant, defaultValue, setValue, getValues, clearErrors
  } = props;
  const [data, setdata] = useState([]);
  const [submit, setSubmit] = useState({});
  const formData = useSelector((state) => state.loanMaker.formData);
  useEffect(() => {
    const { deviations } = formData;
    const finaldata = {};
    deviations?.forEach((item, index) => {
      finaldata[index] = {
        deviation_parameter: item?.deviation_type,
        role: item?.primary_checker_role,
        maker_remarks: (formData?.application_stage !== 'stage8') ? item?.maker_remarks : '',
        // eslint-disable-next-line no-underscore-dangle
        _id: item?._id
      };
    });
    setSubmit(finaldata);
    setValue('deviations', finaldata);
    setdata(deviations);
  }, []);
  const handleChange = (index, name, value) => {
    const submitData = cloneDeep(submit);
    submitData[index][name] = value;
    setSubmit(submitData);
    setValue('deviations', submitData);
    clearErrors(`justification${index}`);
  };
  const debouncedOnChange = debounce(handleChange, 300);
  const renderErrorMsg = (inputdata, index) => ({ ...inputdata, name: `justification${index}` });
  return (
    data?.map((item, index) => (
      <>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextFieldStyled
              id={`${input?.name}-basic`}
              label='Deviation Parameter'
              // name={`Deviation Parameter${(index > 0) ? `__${index}` : ''}`}
              variant={variant}
              value={submit[index]?.deviation_parameter ?? item?.deviation_type}
              disabled
              multiline
              maxRows={3}
            />
          </Grid>
          <Grid item xs={4}>
            <TextFieldStyled
              id={`${input?.name}-basic`}
              label='Role'
              variant={variant}
              value={submit[index]?.role ?? item?.primary_checker_role}
              disabled
            />
          </Grid>
          <Grid item xs={4}>
            <TextFieldStyled
              id={`${input?.name}-basic`}
              label='Justification*'
              variant={variant}
              defaultValue={submit[index]?.maker_remarks || ''}
              onChange={(e) => { debouncedOnChange(index, 'maker_remarks', e.target.value); }}
            />
            <ErrorText input={renderErrorMsg(input, index)} errors={errors} />
          </Grid>
        </Grid>
        <br />
      </>
    ))
  );
};

export default Deviations;
