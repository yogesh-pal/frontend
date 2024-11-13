import Grid from '@mui/material/Grid';
import { FileInput } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const TextInputGrid = ({
  alignment, input, register, errors, defaultValue, setValue, getValues, variant, clearErrors
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;

  return (
    <Grid
      item
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
    >
      <CustomFormControl variant={variant}>
        <FileInput
          register={register}
          errors={errors}
          clearErrors={clearErrors}
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

export default TextInputGrid;
