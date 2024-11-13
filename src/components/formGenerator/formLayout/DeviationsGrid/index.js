import Grid from '@mui/material/Grid';
import { Deviations } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const DeviationsGrid = ({
  alignment, input, register, errors, defaultValue, setValue, getValues, variant,
  setError,
  clearErrors
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        {/* <ButtonInput register={register} errors={errors} input={input} variant={variant} /> */}
        <Deviations
          register={register}
          errors={errors}
          input={input}
          defaultValue={defaultValue}
          setValue={setValue}
          getValues={getValues}
          variant={variant}
          setError={setError}
          clearErrors={clearErrors}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default DeviationsGrid;
