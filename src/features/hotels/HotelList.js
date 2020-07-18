import React from 'react'
import { useSelector } from 'react-redux';
import HotelCard from './hotelCard';
import FadeIn from 'react-fade-in';
// import { useTransition, animated } from 'react-spring'
// import shuffle from 'lodash/shuffle'
// import {selectHotelList} from "./hotelsSlices";


// import { Row, Col } from 'antd';

const USD_CHANGE = 0.00083

export default function HotelList() {
    var hotels = useSelector(({hotels}) => hotels);

    const imps = hotels.hotelList.map((hotel, i) => hotel.id.toString()).join("|");
    // console.log(hotels.hotelList[0])
    const prices = hotels.hotelList.map((hotel, i) => (parseInt(hotel.price[1].price * USD_CHANGE )).toString()).join("|");

    console.log(imps, prices)

    // useEffect(() => void setInterval(() => set(shuffle), 2000), [])
    return (
        <FadeIn delay={100}>
            {hotels.hotelList.map((hotel, i) => 
                <HotelCard hotel={hotel} key={hotel.name} imps={imps} prices={prices}/>
            )}
        </FadeIn>
    )
}
