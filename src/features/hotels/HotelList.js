import React, { useEffect }  from 'react'
import { useSelector } from 'react-redux';
import HotelCard from './hotelCard';
// import { Row, Col } from 'antd';

export default function HotelList() {
    var hotels = useSelector(({hotels}) => hotels);

    useEffect(() => {
       hotels = hotels.sort((a, b)=> a.reviewRating.percentage > b.reviewRating.percentage)
    }, [])

    return (
        <div>
            {hotels.map((hotel) => 
                <HotelCard hotel={hotel} />
            )}
        </div>
    )
}
