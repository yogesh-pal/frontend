import Grid from '@mui/material/Grid';
import { PasswordInput } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const TextInputGrid = ({
  alignment, input, register, errors, defaultValue, setValue, getValues, variant
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
      <CustomFormControl variant='standard'>
        <PasswordInput
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

export default TextInputGrid;
