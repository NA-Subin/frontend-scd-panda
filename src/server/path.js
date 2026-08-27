import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { get, onValue, ref } from "firebase/database";
import { database } from "./firebase";

// สร้าง Context
const DataContext = createContext();

// Hook ใช้งาน Context
export const useData = () => useContext(DataContext);

// DataProvider Component
export const DataProvider = ({ children }) => {
    const [data, setData] = useState({
        company: {},
        customer: {},
        positions: {},
        officers: {},
        drivers: {},
        creditors: {},
        order: {},
        trip: {},
        tickets: {},
        reghead: {},
        regtail: {},
        small: {},
        depots: {},
        gasstation: {},
        customertransports: {},
        customergasstations: {},
        customerbigtruck: {},
        customersmalltruck: {},
        reportFinancial: {},
        typeFinancial: {},
        transferMoney: {},
        invoiceReport: {},
        report: {},
        reportType: {},
        deductionIncome: {}
    });

    // 🔹 ใช้ useMemo เพื่อป้องกันไม่ให้ ref ถูกสร้างใหม่ทุกครั้งที่ Component re-render
    const refs = useMemo(() => ({
        company: ref(database, "/company"),
        banks: ref(database, "/banks"),
        customer: ref(database, "/customer"),
        positions: ref(database, "/positions"),
        officers: ref(database, "/employee/officers"),
        drivers: ref(database, "/employee/drivers"),
        creditors: ref(database, "/employee/creditors"),
        order: ref(database, "/order"),
        trip: ref(database, "/trip"),
        tickets: ref(database, "/tickets"),
        reghead: ref(database, "/truck/registration/"),
        regtail: ref(database, "/truck/registrationTail/"),
        small: ref(database, "/truck/small/"),
        depots: ref(database, "/depot/oils"),
        gasstation: ref(database, "/depot/gasStations/"),
        customertransports: ref(database, "/customers/transports/"),
        customergasstations: ref(database, "/customers/gasstations/"),
        customerbigtruck: ref(database, "/customers/bigtruck/"),
        customersmalltruck: ref(database, "/customers/smalltruck/"),
        customertickets: ref(database, "/customers/tickets/"),
        typeFinancial: ref(database, "/financial/type/"),
        reportFinancial: ref(database, "/financial/report/"),
        transferMoney: ref(database, "/transfermoney/"),
        invoiceReport: ref(database, "/invoice/"),
        report: ref(database, "/report/invoice"),
        reportType: ref(database, "/report/type"),
        deductionIncome: ref(database, "/financial/deductionIncome")
    }), []);

    // ฟังก์ชันโหลดข้อมูลทั้งหมดครั้งแรก
    const fetchInitialData = useCallback(async () => {
        const results = await Promise.all(
            Object.entries(refs).map(([key, ref]) =>
                get(ref).then(snapshot => [key, snapshot.val() || {}])
            )
        );
        setData(Object.fromEntries(results));
    }, [refs]);

    useEffect(() => {
        // โหลดข้อมูลครั้งแรก
        fetchInitialData();

        // ตั้งค่าการฟัง Realtime (Subscribe)
        const unsubscribes = Object.entries(refs).map(([key, ref]) =>
            onValue(ref, snapshot => {
                setData(prev => ({ ...prev, [key]: snapshot.val() || {} }));
            })
        );

        // Cleanup function เมื่่อ component ถูก unmount
        return () => unsubscribes.forEach(unsub => unsub());
    }, [fetchInitialData, refs]);

    return (
        <DataContext.Provider value={data}>
            {children}
        </DataContext.Provider>
    );
};
