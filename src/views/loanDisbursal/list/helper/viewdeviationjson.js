import { IDENTIFIER } from '../../../../constants';

export const viewDeviationDetailsJson = (setIsCertificateViewed) => {
  const formConfiguration = {
    form: [
      {
        title: '',
        variant: 'outlined',
        input: [
          {
            name: 'cam',
            type: 'cam',
            defaultValue: setIsCertificateViewed,
            identifier: IDENTIFIER.CAMREPORT,
            alignment: {
              xs: 12,
              sm: 12,
              md: 12,
              lg: 12,
              xl: 12
            }
          },
        ],
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4
        }
      },
    ],
  };

  return formConfiguration;
};
