import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// ✅ ติดตั้ง plugin
// customParseFormat is required for every dayjs(dateString, "DD/MM/YYYY")
// call throughout the app (that's how every stored date gets parsed back
// into a real Date for filtering/sorting). Without it, dayjs silently
// falls back to native Date parsing, which can't handle "DD/MM/YYYY" and
// returns an Invalid Date - and Invalid Date satisfies isBetween/
// isSameOrAfter/isSameOrBefore checks unpredictably (observed: always
// "in range"), which is why date-range filters looked like they accepted
// a new date but never actually narrowed any table. This previously only
// got registered as a side effect of MUI's AdapterDayjs constructor
// running (timing-dependent on render order, not guaranteed on first
// load), so it's registered explicitly here instead - this file is
// imported by virtually every page in the app, and also imported first
// thing in index.js to guarantee it runs before anything else.
dayjs.extend(buddhistEra);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale("th");

export class AdapterDayjsBuddhist extends AdapterDayjs {
  formatTokenMap = {
    ...super.formatTokenMap,
    BBBB: 'BBBB', // Buddhist year
  };

  formatByString(date, formatString) {
    return dayjs(date).locale("th").format(formatString);
  }

  getYear(date) {
    return Number(dayjs(date).locale("th").format("BBBB")); // พ.ศ.
  }

  setYear(date, year) {
    return dayjs(date).year(year - 543); // แปลง พ.ศ. → ค.ศ.
  }
}

// ✅ รูปแบบเต็ม เช่น: 8 กรกฎาคม พ.ศ.2568
export function formatThaiFullYear(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("D เดือนMMMM พ.ศ.BBBB")
    : "";
}

// ✅ รูปแบบเต็ม เช่น: 8 กรกฎาคม พ.ศ.2568
export function formatThaiFull(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("D MMMM BBBB")
    : "";
}

export function formatThaiMonth(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("MMMM")
    : "";
}

// ✅ รูปแบบย่อ เช่น: 8 ก.ค. พ.ศ.2568
export function formatThaiShort(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("D MMM BBBB")
    : "";
}

// ✅ รูปแบบตัวเลข เช่น: 08/07/2568
export function formatThaiSlash(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("DD/MM/BBBB")
    : "";
}

// ✅ รูปแบบตัวเลข เช่น: 2568
export function formatThaiYear(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("BBBB")
    : "";
}
