import React  from 'react'
import { useSelector } from 'react-redux';
import HotelCard from './hotelCard';
// import { Row, Col } from 'antd';

export default function HotelList() {
    const hotels = useSelector(({hotels}) => hotels);
    return (
        <div>
            {hotels.map((hotel) => 
                <HotelCard hotel={hotel} />
            )}
        </div>
    )
}
