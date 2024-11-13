import Grid from '@mui/material/Grid';
import { InputOTP } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const InputButtonCombGrid = ({
  alignment,
  input,
  register,
  errors,
  defaultValue,
  setValue,
  getValues,
  variant,
  updateJsonHandler,
  setError
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
        <InputOTP
          register={register}
          errors={errors}
          input={input}
          defaultValue={defaultValue}
          setValue={setValue}
          getValues={getValues}
          variant={variant}
          updateJsonHandler={updateJsonHandler}
          setError={setError}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default InputButtonCombGrid;
