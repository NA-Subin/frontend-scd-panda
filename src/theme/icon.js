import React from 'react';
import truckIconWhite from './img/OilTruck-white.png';
import tailtruckIconWhite from './img/OilTruck(Tail)-white.png';
import truckIconBlack from './img/OilTruck-black.png';
import tailtruckIconBlack from './img/OilTruck(Tail)-black.png';
import SmalltruckIconBlack from './img/OilSmallTruck-black.png';
import SmalltruckIconWhite from './img/OilSmallTruck-white.png';

function TruckIconBlack() {
    return (
        <img
            src={truckIconBlack}
            alt="Truck Icon"
            style={{ width: '3em', height: '3em' }}
        />
    );
}

function TruckIconWhite() {
    return (
        <img
            src={truckIconWhite}
            alt="Truck Icon"
            style={{ width: '4.5em', height: '4.5em' }}
        />
    );
}

function TailTruckIconBlack() {
    return (
        <img
            src={tailtruckIconBlack}
            alt="Truck Icon"
            style={{ width: '3em', height: '2.5em' }}
        />
    );
}

function TailTruckIconWhite() {
    return (
        <img
            src={tailtruckIconWhite}
            alt="Truck Icon"
            style={{ width: '4em', height: '3.5em' }}
        />
    );
}

function SmallTruckIconBlack() {
    return (
        <img
            src={SmalltruckIconBlack}
            alt="Truck Icon"
            style={{ width: '3em', height: '3em' }}
        />
    );
}

function SmallTruckIconWhite() {
    return (
        <img
            src={SmalltruckIconWhite}
            alt="Truck Icon"
            style={{ width: '4em', height: '4em' }}
        />
    );
}

export {
    TruckIconBlack,
    TruckIconWhite,
    TailTruckIconBlack,
    TailTruckIconWhite,
    SmallTruckIconBlack,
    SmallTruckIconWhite
};
