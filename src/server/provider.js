import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ref, get, query, orderByKey, limitToFirst, startAfter } from "firebase/database";
import { database } from "./firebase";

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    // กำหนด state สำหรับ count ข้อมูลแต่ละ dataset
    const [counts, setCounts] = useState({
        transports: 0,
        gasstations: 0,
        bigtruck: 0,
        smalltruck: 0,
        driver: 0,
    });

    // ข้อมูลแต่ละหน้า (page) สำหรับ dataset
    const [transportsData, setTransportsData] = useState({});
    const [gasstationsData, setGasstationsData] = useState({});
    const [bigtruckData, setBigtruckData] = useState({});
    const [smalltruckData, setSmalltruckData] = useState({});
    const [driverData, setDriverData] = useState({});

    // pagination state
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // current page index (0-based)
    const [transportsPage, setTransportsPage] = useState(0);
    const [gasstationsPage, setGasstationsPage] = useState(0);
    const [bigtruckPage, setBigtruckPage] = useState(0);
    const [smalltruckPage, setSmalltruckPage] = useState(0);
    const [driverPage, setDriverPage] = useState(0);

    // เก็บ last keys สำหรับแต่ละหน้า เพื่อดึงข้อมูลหน้าถัดไป
    // เราจะเก็บ array ของ lastKey ของแต่ละหน้า เพื่อเลื่อนไปหน้าใดก็ได้
    const [transportsLastKeys, setTransportsLastKeys] = useState([]);
    const [gasstationsLastKeys, setGasstationsLastKeys] = useState([]);
    const [bigtruckLastKeys, setBigtruckLastKeys] = useState([]);
    const [smalltruckLastKeys, setSmalltruckLastKeys] = useState([]);
    const [driverLastKeys, setDriverLastKeys] = useState([]);

    // ฟังก์ชันโหลด count จำนวนข้อมูลทั้งหมดแบบง่ายๆ (ดึง snapshot แล้วนับ key)
    // หรือถ้ามี count เก็บแยกที่ Firebase จะดีกว่า (ไม่ต้องโหลดข้อมูลทั้งหมด)
    const fetchCounts = useCallback(async () => {
        const paths = {
            transports: "/customers/transports",
            gasstations: "/customers/gasstations",
            bigtruck: "/customers/bigtruck",
            smalltruck: "/customers/smalltruck",
            driver: "/employee/drivers",
        };

        const newCounts = {};
        for (const key in paths) {
            try {
                const snap = await get(ref(database, paths[key]));
                const val = snap.val();
                newCounts[key] = val ? Object.keys(val).length : 0;
            } catch {
                newCounts[key] = 0;
            }
        }
        setCounts(newCounts);
    }, []);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    // ฟังก์ชันโหลดข้อมูลหน้าแรกของแต่ละ dataset
    // โดยดึงข้อมูลที่เรียงตาม key และจำกัดจำนวน rowsPerPage
    const fetchPageData = useCallback(
        async (datasetKey, page, lastKeysArray, setLastKeysArray, setData) => {
            if (page === 0) {
                // โหลดหน้าแรก แบบ limitToFirst(rowsPerPage)
                const q = query(ref(database, datasetKey), orderByKey(), limitToFirst(rowsPerPage));
                const snap = await get(q);
                const data = snap.val() || {};

                // เก็บ lastKey หน้าแรก (key สุดท้ายใน data)
                const keys = Object.keys(data);
                const lastKey = keys.length > 0 ? keys[keys.length - 1] : null;
                setLastKeysArray([lastKey]); // หน้าแรกมี lastKey ตัวเดียวใน array

                setData(data);
            } else {
                // โหลดหน้าที่ > 0 ต้องใช้ startAfter(lastKey ของหน้าที่แล้ว)
                const prevLastKey = lastKeysArray[page - 1];
                if (!prevLastKey) {
                    // ถ้าไม่มี lastKey ของหน้าก่อนหน้า ให้โหลดหน้าแรกแทน
                    return fetchPageData(datasetKey, 0, lastKeysArray, setLastKeysArray, setData);
                }
                const q = query(
                    ref(database, datasetKey),
                    orderByKey(),
                    startAfter(prevLastKey),
                    limitToFirst(rowsPerPage)
                );
                const snap = await get(q);
                const data = snap.val() || {};

                // เก็บ lastKey ของหน้าปัจจุบันเข้าไปใน array
                const keys = Object.keys(data);
                const lastKey = keys.length > 0 ? keys[keys.length - 1] : null;

                // update lastKeysArray โดยคงค่าเดิมก่อนหน้า + lastKey ปัจจุบัน
                setLastKeysArray((prev) => {
                    const newLastKeys = [...prev];
                    newLastKeys[page] = lastKey;
                    return newLastKeys;
                });

                setData(data);
            }
        },
        [rowsPerPage]
    );

    // Step 1: รวม config ทุก dataset ที่ต้องการ pagination ไว้ที่เดียว
    const paginatedDatasets = [
        {
            key: "transports",
            path: "/customers/transports",
            page: transportsPage,
            lastKeys: transportsLastKeys,
            setLastKeys: setTransportsLastKeys,
            setData: setTransportsData,
        },
        {
            key: "gasstations",
            path: "/customers/gasstations",
            page: gasstationsPage,
            lastKeys: gasstationsLastKeys,
            setLastKeys: setGasstationsLastKeys,
            setData: setGasstationsData,
        },
        {
            key: "bigtruck",
            path: "/customers/bigtruck",
            page: bigtruckPage,
            lastKeys: bigtruckLastKeys,
            setLastKeys: setBigtruckLastKeys,
            setData: setBigtruckData,
        },
        {
            key: "smalltruck",
            path: "/customers/smalltruck",
            page: smalltruckPage,
            lastKeys: smalltruckLastKeys,
            setLastKeys: setSmalltruckLastKeys,
            setData: setSmalltruckData,
        },
        {
            key: "driver",
            path: "/employee/drivers",
            page: driverPage,
            lastKeys: driverLastKeys,
            setLastKeys: setDriverLastKeys,
            setData: setDriverData,
        },
    ];

    // เมื่อเปลี่ยน page หรือ rowsPerPage ให้โหลดข้อมูลใหม่ตาม dataset
    useEffect(() => {
        paginatedDatasets.forEach((dataset) => {
            fetchPageData(
                dataset.path,
                dataset.page,
                dataset.lastKeys,
                dataset.setLastKeys,
                dataset.setData
            );
        });
    }, [rowsPerPage, transportsPage, gasstationsPage, bigtruckPage, smalltruckPage, driverPage, fetchPageData]);


    // ฟังก์ชันจัดการเปลี่ยนจำนวนแถว
    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);

        // reset pagination หน้าแรก
        setTransportsPage(0);
        setGasstationsPage(0);
        setBigtruckPage(0);
        setSmalltruckPage(0);
        setDriverPage(0);

        // เคลียร์ lastKeys เพื่อโหลดใหม่ตาม rowsPerPage ใหม่
        setTransportsLastKeys([]);
        setGasstationsLastKeys([]);
        setBigtruckLastKeys([]);
        setSmalltruckLastKeys([]);
        setDriverLastKeys([]);
    };

    // ฟังก์ชันจัดการเปลี่ยนหน้า
    const handlePageChange = (setPage) => (_, newPage) => {
        setPage(newPage);
    };

    return (
        <DataContext.Provider
            value={{
                counts,
                rowsPerPage,
                data: {
                    transports: transportsData,
                    gasstations: gasstationsData,
                    bigtruck: bigtruckData,
                    smalltruck: smalltruckData,
                    driver: driverData,
                },
                pages: {
                    transports: transportsPage,
                    gasstations: gasstationsPage,
                    bigtruck: bigtruckPage,
                    smalltruck: smalltruckPage,
                    driver: driverPage,
                },
                pageHandlers: {
                    transports: handlePageChange(setTransportsPage),
                    gasstations: handlePageChange(setGasstationsPage),
                    bigtruck: handlePageChange(setBigtruckPage),
                    smalltruck: handlePageChange(setSmalltruckPage),
                    driver: handlePageChange(setDriverPage),
                },
                handleChangeRowsPerPage,
            }}
        >
            {children}
        </DataContext.Provider>

    );
};
