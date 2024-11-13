import Grid from '@mui/material/Grid';
import { CrifButton } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const CrifButtonGrid = ({
  alignment, input, register, errors, defaultValue, setValue, getValues, variant
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        {/* <ButtonInput register={register} errors={errors} input={input} variant={variant} /> */}
        <CrifButton
          register={register}
          errors={errors}
          input={input}
          defaultValue={defaultValue}
          setValue={setValue}
          getValues={getValues}
          variant={variant}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default CrifButtonGrid;
