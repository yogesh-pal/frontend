import { Breadcrumbs, Link } from '@mui/material';
import React from 'react';

const IconBreadcrumbs = ({ navigationDetails, maxItems = 2 }) => (
  <div role='presentation'>
    <Breadcrumbs aria-label='breadcrumb' maxItems={maxItems}>
      {
        navigationDetails?.map((item) => (
          <Link
            key={item?.name}
            underline='hover'
            color='inherit'
            href={item?.url}
          >
            {item?.name}
          </Link>
        ))
      }
    </Breadcrumbs>
  </div>
);

export default React.memo(IconBreadcrumbs);
