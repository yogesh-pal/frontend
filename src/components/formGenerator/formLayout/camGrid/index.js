import Grid from '@mui/material/Grid';
import CAM from '../../../formFields/CAM/CAM';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const DeviationsGrid = (props) => {
  const {
    alignment, variant, defaultValue, register, errors, setValue
  } = props;
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <CAM
          register={register}
          errors={errors}
          setValue={setValue}
          isAfterDisburse={false}
          setIsCertificateViewed={defaultValue}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default DeviationsGrid;
