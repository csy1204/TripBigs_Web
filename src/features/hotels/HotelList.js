import React from 'react'
import { useSelector } from 'react-redux';
import HotelCard from './hotelCard';
import FadeIn from 'react-fade-in';
// import { useTransition, animated } from 'react-spring'
// import shuffle from 'lodash/shuffle'
// import {selectHotelList} from "./hotelsSlices";


// import { Row, Col } from 'antd';
export default function HotelList() {
    var hotels = useSelector(({hotels}) => hotels);

    // useEffect(() => void setInterval(() => set(shuffle), 2000), [])
    return (
        <FadeIn delay={100}>
            {hotels.hotelList.map((hotel, i) => 
                <HotelCard hotel={hotel} key={hotel.name} delay={i}/>
            )}
        </FadeIn>
    )
}
