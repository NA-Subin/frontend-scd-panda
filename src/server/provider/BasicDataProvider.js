// src/providers/BasicDataProvider.js
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { apiGet } from "../apiClient";

const BasicDataContext = createContext();

export const useBasicData = () => useContext(BasicDataContext);

const EMPTY_BASIC_DATA = {
    company: {},
    companyHistory: {},
    customer: {},
    positions: {},
    officers: {},
    drivers: {},
    creditors: {},
    reghead: {},
    regtail: {},
    small: {},
    transport: {},
    depots: {},
    gasstation: {},
    customertransports: {},
    customergasstations: {},
    customerbigtruck: {},
    customersmalltruck: {},
    customertickets: {},
    deductibleincome: {},
    companypayment: {},
    expenseitems: {},
    quotation: {},
    inspection: {},
};

// Poll interval to approximate the old Firebase realtime listeners without
// building out a websocket layer for Phase 1.
const POLL_INTERVAL_MS = 30000;

export const BasicDataProvider = ({ children }) => {
    const [basicData, setBasicData] = useState(EMPTY_BASIC_DATA);
    const [loading, setLoading] = useState(true);
    const mounted = useRef(true);

    const refetch = useCallback(async () => {
        try {
            const data = await apiGet("/api/basic-data");
            if (mounted.current) setBasicData(data);
        } catch (error) {
            console.error("โหลด basic data ล้มเหลว", error);
        } finally {
            if (mounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        mounted.current = true;
        refetch();
        const interval = setInterval(refetch, POLL_INTERVAL_MS);
        return () => {
            mounted.current = false;
            clearInterval(interval);
        };
    }, [refetch]);

    return (
        <BasicDataContext.Provider value={{ ...basicData, loading, refetch }}>
            {children}
        </BasicDataContext.Provider>
    );
};
