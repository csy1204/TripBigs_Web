import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styled from 'styled-components';
import { generateLog } from "../tracker/trackerSlice";

const imgContainer = styled.div`
    display: flex;
    justify-content: center;
`

export default function ImgTab({hid}) {
    const trackerState = useSelector((tracker) => tracker);
    const dispatch = useDispatch();

    const handleLog = (action_type) => {
        const data = {
            action_type,
            reference: hid,
            impressions: trackerState.impressions,
            prices: trackerState.prices,
        }
        dispatch(generateLog(data));
    }

    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        onSwipe: (key) => {
            handleLog('interaction item image');
            console.log(key, "swipe");
        }
      };
    
    return (
        <Slider {...settings}>
            {
                [...Array(9).keys()].map((i) => (
                    <imgContainer>
                        {/* <h3>{`https://storage.cloud.google.com/tripbigs/img/${hid}_00${i}.jpg?authuser=1`}</h3> */}
                        <img style={{margin: "auto"}} alt={"placeholder"} height={"400px"} src={`https://storage.cloud.google.com/tripbigs/imgs/${hid}_00${i}.jpg?authuser=1`} />
                    </imgContainer>
                ))
            }
        </Slider>
    )
}
