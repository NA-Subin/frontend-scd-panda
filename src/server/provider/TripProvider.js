// src/providers/TripDataProvider.js
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";

const TripDataContext = createContext();

export const useTripData = () => useContext(TripDataContext);

export const TripDataProvider = ({ children }) => {
    const [tripData, setTripData] = useState({
        banks: {},
        customer: {},
        order: {},
        trip: {},
        tickets: {},
        typeFinancial: {},
        reportFinancial: {},
        transferMoney: {},
        invoiceReport: {},
        report: {},
        reportType: {},
        deductionIncome: {}
    });

    const [loading, setLoading] = useState(true);

    const refs = useMemo(() => ({
        banks: ref(database, "/banks"),
        customer: ref(database, "/customer"),
        order: ref(database, "/order"),
        trip: ref(database, "/trip"),
        tickets: ref(database, "/tickets"),
        typeFinancial: ref(database, "/financial/type/"),
        reportFinancial: ref(database, "/report/financial"),
        transferMoney: ref(database, "/transfermoney/"),
        invoiceReport: ref(database, "/invoice/"),
        report: ref(database, "/report/invoice"),
        reportType: ref(database, "/report/type"),
        deductionIncome: ref(database, "/financial/deductionIncome")
    }), []);

    useEffect(() => {
        let loadedCount = 0;
        const totalRefs = Object.keys(refs).length;

        const unsubscribes = Object.entries(refs).map(([key, refItem]) =>
            onValue(refItem, snapshot => {
                setTripData(prev => ({
                    ...prev,
                    [key]: snapshot.val() || {}
                }));
                loadedCount++;
                if (loadedCount === totalRefs) {
                    setLoading(false); // ✅ ข้อมูลโหลดครบทุก path แล้ว
                }
            })
        );

        return () => unsubscribes.forEach(unsub => unsub());
    }, [refs]);

    return (
        <TripDataContext.Provider value={{ ...tripData, loading }}>
            {children}
        </TripDataContext.Provider>
    );
};
