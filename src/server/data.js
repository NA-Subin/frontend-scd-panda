import { getDatabase, ref, onValue } from "firebase/database";
import { database } from "./firebase";

// ฟังก์ชันโหลดข้อมูลแบบ Realtime
export const fetchRealtimeData = (callback) => {
    const dbRefCompany = ref(database, "/company");
    const dbRefCustomer = ref(database, "/customer");
    const dbRefOfficers = ref(database, "/employee/officers");
    const dbRefDrivers = ref(database, "/employee/drivers");
    const dbRefCreditors = ref(database, "/employee/creditors");
    const dbRefOrder = ref(database, "/order");
    const dbRefTrip = ref(database, "/trip");
    const dbRefTickets = ref(database, "/tickets");
    const dbRefRegHead = ref(database, "/truck/registration/");
    const dbRefTail = ref(database, "/truck/registrationTail/");
    const dbRefSmall = ref(database, "/truck/small/");

    // ฟังข้อมูลจากพาธ `/truck/registration/`
    onValue(dbRefRegHead, (snapshot) => {
        const regheadData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, reghead: regheadData }));
    });

    // ฟังข้อมูลจากพาธ `/truck/registrationTail/`
    onValue(dbRefTail, (snapshot) => {
        const regtailData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, regtail: regtailData }));
    });

    // ฟังข้อมูลจากพาธ `/truck/small/`
    onValue(dbRefSmall, (snapshot) => {
        const smallData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, small: smallData }));
    });

    // ฟังข้อมูลจากพาธ `/employees`
    onValue(dbRefCompany, (snapshot) => {
        const companyData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, company: companyData }));
    });

    // ฟังข้อมูลจากพาธ `/departments`
    onValue(dbRefCustomer, (snapshot) => {
        const customerData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, customer: customerData }));
    });

    // ฟังข้อมูลจากพาธ `/employee/officer`
    onValue(dbRefOfficers, (snapshot) => {
        const officersData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, officers: officersData }));
    });

    // ฟังข้อมูลจากพาธ `/employee/drivers`
    onValue(dbRefDrivers, (snapshot) => {
        const driversData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, drivers: driversData }));
    });

    // ฟังข้อมูลจากพาธ `/employee/creditors`
    onValue(dbRefCreditors, (snapshot) => {
        const creditorsData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, creditors: creditorsData }));
    });

    // ฟังข้อมูลจากพาธ `/order`
    onValue(dbRefOrder, (snapshot) => {
        const orderData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, order: orderData }));
    });

    // ฟังข้อมูลจากพาธ `/trip`
    onValue(dbRefTrip, (snapshot) => {
        const tripData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, trip: tripData }));
    });

    // ฟังข้อมูลจากพาธ `/tickets`
    onValue(dbRefTickets, (snapshot) => {
        const ticketsData = snapshot.val() || {};
        callback((prevData) => ({ ...prevData, tickets: ticketsData }));
    });
};
