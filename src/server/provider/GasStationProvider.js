// src/providers/GasStationDataProvider.js
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { apiGet } from "../apiClient";

const GasStationDataContext = createContext();

export const useGasStationData = () => useContext(GasStationDataContext);

const POLL_INTERVAL_MS = 30000;

export const GasStationDataProvider = ({ children }) => {
    const [gasStationData, setGasStationData] = useState({
        gasstationDetail: {},
        stockDetail: {}
    });
    const [loading, setLoading] = useState(true);
    const mounted = useRef(true);

    const refetch = useCallback(async () => {
        try {
            const [gasstationDetail, stockDetail] = await Promise.all([
                apiGet("/api/depot_gas_stations"),
                apiGet("/api/depot_stock"),
            ]);
            if (mounted.current) setGasStationData({ gasstationDetail, stockDetail });
        } catch (error) {
            console.error("โหลดข้อมูลปั๊ม/สต็อกล้มเหลว", error);
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
        <GasStationDataContext.Provider value={{ ...gasStationData, loading, refetch }}>
            {children}
        </GasStationDataContext.Provider>
    );
};
