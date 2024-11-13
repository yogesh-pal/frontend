import Grid from '@mui/material/Grid';
import { HeaderComponent } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const ButtonInputGrid = ({
  alignment,
  input,
  register,
  errors,
  variant,
  activeFormIndex,
  setActiveFormIndex,
  setValue,
  updateJsonHandler,
  getValues
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <HeaderComponent
          register={register}
          errors={errors}
          input={input}
          getValues={getValues}
          variant={variant}
          activeFormIndex={activeFormIndex}
          setActiveFormIndex={setActiveFormIndex}
          setValue={setValue}
          updateJsonHandler={updateJsonHandler}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default ButtonInputGrid;
