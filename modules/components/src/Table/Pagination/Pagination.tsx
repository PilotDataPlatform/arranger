import { useMemo } from 'react';
import { css } from '@emotion/react';
import cx from 'classnames';
import { merge } from 'lodash';

import MaxRowsSelector from '@/Table/MaxRowsSelector';
import { useThemeContext } from '@/ThemeContext';
import { emptyObj } from '@/utils/noops';

import { PaginationProps } from './types';

const Pagination = ({
  className: customClassName,
  theme: { MaxRowSelector: customMaxRowSelectorProps } = emptyObj,
}: PaginationProps) => {
  const {
    components: {
      Table: {
        Pagination: {
          className: themeClassName,
          MaxRowsSelector: themeMaxRowsSelectorProps = emptyObj,
        } = emptyObj,
      } = emptyObj,
    } = emptyObj,
  } = useThemeContext({ callerName: 'Table - Pagination' });
  const className = cx('Pagination', customClassName, themeClassName);
  const maxRowsSelectorTheme = merge({}, themeMaxRowsSelectorProps, customMaxRowSelectorProps);

  return useMemo(
    () => (
      <section
        className={className}
        css={css`
          align-items: flex-start;
          display: flex;
          justify-content: space-between;
        `}
      >
        <MaxRowsSelector
          css={css`
            margin-left: 0.3rem;

            .Spinner {
              justify-content: space-between;
              width: 65%;
            }
          `}
          theme={maxRowsSelectorTheme}
        />
      </section>
    ),
    [className, maxRowsSelectorTheme],
  );
};

export default Pagination;
