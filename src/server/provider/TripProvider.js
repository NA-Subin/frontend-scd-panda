// src/providers/TripDataProvider.js
import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import { apiGet } from "../apiClient";

const TripDataContext = createContext();

export const useTripData = () => useContext(TripDataContext);

const POLL_INTERVAL_MS = 30000;

// Backend-table keys that now come from Postgres.
const BACKEND_TABLES = {
    banks: "banks",
    order: "order",
    trip: "trip",
    tickets: "tickets",
    reportFinancial: "report_financial",
    transferMoney: "transfermoney",
    invoiceReport: "invoice",
    report: "report_invoice",
};

// typeFinancial/reportType live under Firebase paths ("/financial/type",
// "/report/type") that weren't present in the Firebase export imported into
// Postgres. Left on Firebase until that data is backfilled.
const FIREBASE_ONLY_REFS = {
    typeFinancial: "/financial/type/",
    reportType: "/report/type",
};

export const TripDataProvider = ({ children }) => {
    const [tripData, setTripData] = useState({
        banks: {},
        order: {},
        trip: {},
        tickets: {},
        typeFinancial: {},
        reportFinancial: {},
        transferMoney: {},
        invoiceReport: {},
        report: {},
        reportType: {},
    });

    const [backendLoaded, setBackendLoaded] = useState(false);
    const [firebaseLoaded, setFirebaseLoaded] = useState(false);
    const mounted = useRef(true);

    const refetchBackend = useCallback(async () => {
        try {
            const entries = await Promise.all(
                Object.entries(BACKEND_TABLES).map(async ([key, table]) => [key, await apiGet(`/api/${table}`)])
            );
            if (mounted.current) {
                setTripData((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
                setBackendLoaded(true);
            }
        } catch (error) {
            console.error("โหลด trip data ล้มเหลว", error);
        }
    }, []);

    useEffect(() => {
        mounted.current = true;
        refetchBackend();
        const interval = setInterval(refetchBackend, POLL_INTERVAL_MS);
        return () => {
            mounted.current = false;
            clearInterval(interval);
        };
    }, [refetchBackend]);

    const firebaseRefs = useMemo(
        () => Object.fromEntries(Object.entries(FIREBASE_ONLY_REFS).map(([key, path]) => [key, ref(database, path)])),
        []
    );

    useEffect(() => {
        let loadedCount = 0;
        const totalRefs = Object.keys(firebaseRefs).length;

        const unsubscribes = Object.entries(firebaseRefs).map(([key, refItem]) =>
            onValue(refItem, (snapshot) => {
                setTripData((prev) => ({ ...prev, [key]: snapshot.val() || {} }));
                loadedCount++;
                if (loadedCount === totalRefs) setFirebaseLoaded(true);
            })
        );

        return () => unsubscribes.forEach((unsub) => unsub());
    }, [firebaseRefs]);

    const loading = !backendLoaded || !firebaseLoaded;

    return (
        <TripDataContext.Provider value={{ ...tripData, loading, refetch: refetchBackend }}>
            {children}
        </TripDataContext.Provider>
    );
};
