import Grid from '@mui/material/Grid';
import { InputButtonOtp } from '../../../formFields';
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
        <InputButtonOtp
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
