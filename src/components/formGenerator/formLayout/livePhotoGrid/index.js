import Grid from '@mui/material/Grid';
import { LivePhoto } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const ButtonInputGrid = ({
  alignment, input, register, errors, defaultValue, setValue, getValues, variant
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        {/* <ButtonInput register={register} errors={errors} input={input} variant={variant} /> */}
        <LivePhoto
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

export default ButtonInputGrid;
