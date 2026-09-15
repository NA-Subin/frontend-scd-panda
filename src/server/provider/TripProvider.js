import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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

export const TripDataProvider = ({ children }) => {
    const [tripData, setTripData] = useState({
        banks: {},
        order: {},
        trip: {},
        tickets: {},
        reportFinancial: {},
        transferMoney: {},
        invoiceReport: {},
        report: {},
    });

    const [backendLoaded, setBackendLoaded] = useState(false);
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

    const loading = !backendLoaded;

    return (
        <TripDataContext.Provider value={{ ...tripData, loading, refetch: refetchBackend }}>
            {children}
        </TripDataContext.Provider>
    );
};
