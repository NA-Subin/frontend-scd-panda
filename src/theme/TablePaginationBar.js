import React from "react";
import { Button, MenuItem, Select, Stack, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const MAX_PAGE_BUTTONS = 5;

// Shared table-footer control: rows-per-page select + prev/next + a sliding
// window of page-number buttons (up to MAX_PAGE_BUTTONS at a time). `page` is
// 0-based to match MUI's TablePagination convention.
const TablePaginationBar = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
}) => {
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);

  let start = Math.max(0, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
  let end = Math.min(totalPages - 1, start + MAX_PAGE_BUTTONS - 1);
  start = Math.max(0, end - MAX_PAGE_BUTTONS + 1);
  const pageNumbers = [];
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  const from = count === 0 ? 0 : currentPage * rowsPerPage + 1;
  const to = Math.min(count, (currentPage + 1) * rowsPerPage);

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
      sx={{ width: "100%", padding: "8px 4px" }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2">แสดงต่อหน้า:</Typography>
        <Select
          size="small"
          value={rowsPerPage}
          onChange={(event) => {
            onRowsPerPageChange(Number(event.target.value));
            onPageChange(0);
          }}
        >
          {rowsPerPageOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="body2" whiteSpace="nowrap">
          {from}-{to} จาก {count}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
        <Button
          size="small"
          variant="outlined"
          color="info"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          startIcon={<ChevronLeftIcon fontSize="small" />}
        >
          ก่อนหน้า
        </Button>

        {start > 0 && (
          <>
            <Button size="small" color="info" sx={{ minWidth: 36 }} onClick={() => onPageChange(0)}>
              1
            </Button>
            {start > 1 && <Typography sx={{ px: 0.5 }}>...</Typography>}
          </>
        )}

        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            size="small"
            variant={pageNumber === currentPage ? "contained" : "outlined"}
            color="info"
            sx={{ minWidth: 36 }}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber + 1}
          </Button>
        ))}

        {end < totalPages - 1 && (
          <>
            {end < totalPages - 2 && <Typography sx={{ px: 0.5 }}>...</Typography>}
            <Button size="small" color="info" sx={{ minWidth: 36 }} onClick={() => onPageChange(totalPages - 1)}>
              {totalPages}
            </Button>
          </>
        )}

        <Button
          size="small"
          variant="outlined"
          color="info"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          endIcon={<ChevronRightIcon fontSize="small" />}
        >
          ถัดไป
        </Button>
      </Stack>
    </Stack>
  );
};

export default TablePaginationBar;
