import { withNormalizedColumns, withSearchTableColumns } from './utils';
import TableToolbar from './TableToolbar';
import BaseTable from './Table';
import BaseDataTable from './DataTable';

const Table = withNormalizedColumns(BaseTable);
// const DataTable = withNormalizedColumns(BaseDataTable);
const DataTable = withSearchTableColumns(BaseDataTable);

export { Table, TableToolbar };
export { getSingleValue } from './utils';
export { default as ColumnsState } from './ColumnsState';

export default DataTable;
