/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  links: any;
  currentPage: number;
  lastPage: number;
  onChangePage: (page: any, type: any) => void;
}

export const Pagination = (props: Props) => {
  const pageRange = () => {
    const { currentPage, lastPage } = props;
    const range = [];

    if (lastPage <= 5) {
      for (let counter = 1; counter <= lastPage; counter++) {
        range.push(counter);
      }
    } else if (lastPage > 5) {
      if (currentPage <= 4) {
        for (let counter = 1; counter < 6; counter++) {
          range.push(counter);
        }
        range.push('...');
        range.push(lastPage);
      } else if (currentPage > 4 && currentPage < lastPage - 3) {
        range.push(1);
        range.push('...');
        for (let counter = currentPage - 1; counter <= currentPage + 1; counter++) {
          range.push(counter);
        }
        range.push('...');
        range.push(lastPage);
      } else {
        range.push(1);
        range.push('...');
        for (let counter = lastPage - 4; counter <= lastPage; counter++) {
          range.push(counter);
        }
      }
    }
    return range;
  };

  return (
    <ul className="pagination pagination-sm mb-0">
      <li className={`page-item ${!props.links.prev ? 'disabled' : ''}`}>
        <a onClick={() => props.onChangePage(null, 'prev')} role="button" className="page-link">
          <i className="ri-arrow-left-s-line"></i>
        </a>
      </li>
      {pageRange().map((item, index) => (
        <li
          key={index}
          className={`page-item ${item == '...' ? 'disabled' : null} ${
            props.currentPage == item ? 'active' : ''
          }`}
        >
          {props.currentPage == item ? (
            <a role="button" className={`page-link`}>
              {item}
            </a>
          ) : (
            <a
              onClick={() => props.onChangePage(item, 'current')}
              role="button"
              className={`page-link`}
            >
              {item}
            </a>
          )}
        </li>
      ))}
      <li className={`page-item ${!props.links.next ? 'disabled' : ''}`}>
        <a onClick={() => props.onChangePage(null, 'next')} role="button" className="page-link">
          <i className="ri-arrow-right-s-line"></i>
        </a>
      </li>
    </ul>
  );
};

export default Pagination;
