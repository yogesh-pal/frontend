import Grid from '@mui/material/Grid';
import { QRCode } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const QRCodeGrid = ({
  alignment,
  input,
  register,
  errors,
  defaultValue,
  variant,
  getValues,
  updateJsonHandler,
  setValue
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <QRCode
          register={register}
          errors={errors}
          input={input}
          defaultValue={defaultValue}
          variant={variant}
          getValues={getValues}
          setValue={setValue}
          updateJsonHandler={updateJsonHandler}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default QRCodeGrid;
