import { useState, useEffect } from "react";

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  dependencies?: React.DependencyList;
}

export const usePagination = ({
  totalItems,
  itemsPerPage,
  dependencies = [],
}: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Reset pagination when dependencies change
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  const goToPrevious = () => {
    goToPage(currentPage - 1);
  };

  const goToNext = () => {
    goToPage(currentPage + 1);
  };

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    goToPrevious,
    goToNext,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };
};
