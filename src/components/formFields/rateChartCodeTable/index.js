import { useEffect, useState } from 'react';
import { DataGridStyled } from '../../styledComponents';

const columns = [
  {
    field: 'startSlab',
    headerName: 'Start Days',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'endSlab',
    headerName: 'End Days',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'interest',
    headerName: 'Rebate Rate',
    minWidth: 100,
    sortable: false,
    flex: 1,
  }
];

const RateChartCodeTable = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { defaultValue, getValues } = props;
  const [tableData, setTableData] = useState([]);
  const selectedRateChartCode = getValues('rate_chart_code');
  const rateChartCode = getValues('rate_chart_code_table') ?? defaultValue;

  useEffect(() => {
    const rows = rateChartCode?.[selectedRateChartCode]?.slabs?.map((ele, ind) => ({
      id: ind,
      startSlab: ele.from,
      endSlab: ele.to === null ? '-' : ele.to,
      interest: ele.interest
    }));
    setTableData(rows ?? []);
  }, [selectedRateChartCode]);

  return (
    <div style={tableData?.length ? { height: '400px' } : { height: '200px' }}>
      <DataGridStyled
        hideFooter
        rows={tableData}
        columns={columns}
        pagination={false}
        disableColumnMenu
        hideFooterPagination
      />
    </div>
  );
};
export default RateChartCodeTable;
