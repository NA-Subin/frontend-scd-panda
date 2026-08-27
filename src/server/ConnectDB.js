import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback
} from "react";
import { get, ref } from "firebase/database";
import { database } from "./firebase";

// สร้าง Context
const DataContext = createContext();

// Hook ใช้เรียกใช้งาน Context
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({});         // เก็บข้อมูลทั้งหมดที่โหลด
  const [loading, setLoading] = useState(false); // สำหรับเช็คสถานะ loading

  // Memoize Refs ของ Firebase Path ทั้งหมด
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

  /**
   * 🔹 ดึงข้อมูลจาก path เดียว
   * @param {string} path ชื่อ path เช่น "trip"
   */
  const fetchData = useCallback(async (path) => {
    const refPath = refs[path];
    if (!refPath) {
      console.warn(`Path "${path}" ไม่ถูกต้อง`);
      return;
    }

    setLoading(true);
    try {
      const snapshot = await get(refPath);
      const value = snapshot.val() || {};
      setData((prev) => ({ ...prev, [path]: value }));
    } catch (error) {
      console.error(`โหลดข้อมูล "${path}" ล้มเหลว`, error);
    } finally {
      setLoading(false);
    }
  }, [refs]);

  /**
   * 🔹 ดึงข้อมูลจากหลาย path พร้อมกัน
   * @param {string[]} paths เช่น ["trip", "invoiceReport"]
   */
  const fetchDataMany = useCallback(async (paths) => {
    setLoading(true);
    try {
      const results = await Promise.all(
        paths.map((path) =>
          get(refs[path]).then((snapshot) => [path, snapshot.val() || {}])
        )
      );
      const dataEntries = Object.fromEntries(results);
      setData((prev) => ({ ...prev, ...dataEntries }));
    } catch (error) {
      console.error("โหลดหลาย path ล้มเหลว", error);
    } finally {
      setLoading(false);
    }
  }, [refs]);

  return (
    <DataContext.Provider value={{ data, fetchData, fetchDataMany, loading }}>
      {children}
    </DataContext.Provider>
  );
};
