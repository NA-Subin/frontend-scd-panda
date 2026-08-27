import dayjs from "dayjs";
import React, { useState, useEffect } from "react";

// ฟังก์ชันช่วยจัดรูปวันที่
function pad(n) {
    return String(n).padStart(2, "0");
}
function makeDate(y, m, d) {
    return new Date(y, m - 1, d); // JS month เริ่มที่ 0
}
function format(d) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${pad(day)}/${pad(m)}/${y}`;
}

// ฟังก์ชันสร้างงวดทั้งปี
export function buildPeriodsForYear(Y) {
    const periods = [];
    let id = 0;

    for (let M = 1; M <= 12; M++) {

        const currentMonth = dayjs(`${Y}-${M}-01`);
        const daysInMonth = currentMonth.endOf("month").date();

        const prevMonth = currentMonth.subtract(1, "month");
        const prevDaysInMonth = prevMonth.endOf("month").date();

        // 🔹 รอบกลางเดือน
        const midStart = prevMonth.date(prevDaysInMonth - 3); // วันสุดท้ายเดือนก่อน -3
        const midEnd = currentMonth.date(11);

        periods.push({
            id: id++,
            no: 2 * M - 1,
            year: Y,
            start: midStart.format("DD/MM/YYYY"),
            end: midEnd.format("DD/MM/YYYY"),
        });

        // 🔹 รอบสิ้นเดือน
        const endStart = currentMonth.date(12);
        const endEnd = currentMonth.date(daysInMonth - 4);

        periods.push({
            id: id++,
            no: 2 * M,
            year: Y,
            start: endStart.format("DD/MM/YYYY"),
            end: endEnd.format("DD/MM/YYYY"),
        });
    }

    return periods;
}

export function findCurrentPeriod(periods) {
    const today = dayjs().startOf("day"); // วันนี้
    const current = periods.find((p) => {
        const start = dayjs(p.start, "DD/MM/YYYY").startOf("day");
        const end = dayjs(p.end, "DD/MM/YYYY").endOf("day");
        return today.isSameOrAfter(start) && today.isSameOrBefore(end);
    });

    return current ? current.no : null; // ✅ return แค่ no
}

