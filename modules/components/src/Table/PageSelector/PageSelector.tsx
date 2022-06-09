import { useTableContext } from '@/Table/helpers';

import { PageSelectorProps } from './types';

const PageSelector = ({
  className: customClassName,
}: // theme: { pageSizes: customPageSizes } = emptyObj,
PageSelectorProps) => {
  const { pageSize, setPageSize } = useTableContext({
    callerName: 'Table - PageSelector',
  });

  return (
    <select
    // value={instance.getState().pagination.pageSize}
    // onChange={(e) => {
    //   instance.setPageSize(Number(e.target.value));
    // }}
    >
      {[5, 10, 20, 25, 50, 100].map((pageSize) => (
        <option key={pageSize} value={pageSize}>
          Show {pageSize}
        </option>
      ))}
    </select>
  );
};

export default PageSelector;
