import * as React from "react";
import classNames from 'classnames';
import { changeParamInUrl } from "../../modules/utils/url";
import { isXsScreenWidth } from "../../modules/utils/device";
import { Link } from 'react-router-dom';

interface IPageLinkParams {
  pageNumber?: number;
  rel?: string;
  name?: string;
  disabled?: boolean;
  active?: boolean;
  linkBuilder(page: number): string;
}

const PageLink: React.StatelessComponent<IPageLinkParams> =
  ({pageNumber, rel, name, disabled, active, linkBuilder}: IPageLinkParams) => (
    <li className={classNames('page', {disabled: disabled, active: active})}>
      {pageNumber ? (
        <Link rel={rel} to={linkBuilder(pageNumber)}>
          {name ? name : pageNumber}
        </Link>
      ) : (
        <a rel={rel}>{name ? name : pageNumber}</a>
      )}
    </li>
  );

export interface IPaginationParams {
  currentPageNumber: number;
  lastPageNumber: number;
  linkBuilder?(page: number): string;
}

function* range (begin: number, end: number, interval: number = 1) : Iterable<number> {
    for (let i = begin; i <= end; i += interval) {
        yield i;
    }
}

function pagesRel(currentPageNumber: number, p: number): string {
  switch (true) {
    case p == currentPageNumber - 1:
      return "prev";
    case p == currentPageNumber + 1:
      return "next";
    default:
      return "";
  }
}

function paginate({currentPageNumber, lastPageNumber, linkBuilder}: IPaginationParams): JSX.Element[]|JSX.Element {
  if (lastPageNumber === 0) {
    return null;
  }

  if (isXsScreenWidth()) {
    return (
      <div>
        <nav aria-label="mobile-pagination">
          <h3>Страница №{currentPageNumber}</h3>
          <ul className="pager">
            <li className={classNames("previous", {disabled: currentPageNumber === 1})}>
              <Link rel="prev" to={linkBuilder(currentPageNumber - 1)}>
                <span aria-hidden="true">&larr;</span> Предыдущие
              </Link>
            </li>
            <li className={classNames("next", {disabled: currentPageNumber === lastPageNumber})}>
              <Link rel="prev" to={linkBuilder(currentPageNumber + 1)}>
                Следующие <span aria-hidden="true">&rarr;</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    )
  }

  let pages: JSX.Element[] = [];
  if (currentPageNumber !== 1) {
    pages.push(<PageLink linkBuilder={linkBuilder} key="first" pageNumber={1} name="« Первая" />);
    pages.push(<PageLink linkBuilder={linkBuilder} key="prev" rel="prev" name="‹ Предыдущая" pageNumber={currentPageNumber - 1} />);
  }
  const pagesWindow = 4;
  const pageFrom = Math.max(currentPageNumber - pagesWindow, 1);
  const pageTo = Math.min(currentPageNumber + pagesWindow, lastPageNumber);

  if (pageFrom > 1) {
    pages.push(<PageLink linkBuilder={linkBuilder} key="first..." name="..." disabled />);
  }

  for (let p of range(pageFrom, pageTo)) {
    pages.push(<PageLink linkBuilder={linkBuilder} key={p} rel={pagesRel(currentPageNumber, p)} pageNumber={p} active={p === currentPageNumber} />);
  }

  if (pageTo < lastPageNumber) {
    pages.push(<PageLink linkBuilder={linkBuilder} key="last..." name="..." disabled />);
  }

  if (currentPageNumber !== lastPageNumber) {
    pages.push(<PageLink linkBuilder={linkBuilder} key="next" rel="next" name="Следующая ›" pageNumber={currentPageNumber + 1} />);
    pages.push(<PageLink linkBuilder={linkBuilder} key="last" pageNumber={lastPageNumber} name="Последняя »" />);
  }

  return (
    <ul className="pagination">
      {pages}
    </ul>
  )
}

export const Pagination: React.StatelessComponent<IPaginationParams> =
  (params: IPaginationParams) => (
    <div>
      {paginate(params)}
    </div>
  );
