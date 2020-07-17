import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit'
import { List, Row, Col, Typography, Divider, Button } from 'antd';
import styled from 'styled-components';
import FadeIn from 'react-fade-in';

import {
    GlobalOutlined,
    MonitorOutlined,
    UpOutlined,
    RightOutlined

} from '@ant-design/icons';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";

const HotelCardDiv = styled.div`
    margin-bottom: 10px;    
`;

const HeaderButtonGroup = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 10px 0px 10px 0px;
    justify-content: space-around;
`

const EatCard = styled.div`
    min-height: 74px;
    height: auto;
    padding: 12px;
    text-align: left;
    margin: 0 4px 8px 4px;
    border-radius: 2px;
    border: 1px solid #cdd0d2;
    background-color: #fff;
    cursor: pointer;
`

const SelectButtonGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 0 4px 8px 4px;
`

const mapSearchUrl = "https://map.naver.com/v5/search/"


const EatList = ({eats}) => {
    return (<FadeIn>
        {eats.map((eat) => (
            <a href={mapSearchUrl+eat} target="_blank">
            <EatCard>
                {eat} <RightOutlined />
            </EatCard>
            </a>
        ))}
    </FadeIn>)
}

const historyKey = [
    '루엘드파리|이성당 롯데백화점잠실점', 
    '비사벌전주콩나물국밥|소문난감자탕', 
    '토속촌삼계탕|순희네빈대떡', 
    '프릳츠 도화점|카페 노티드 청담점', 
    '형훈라멘|미미면가'
]

const history = [
    '루엘드파리 / 이성당 롯데백화점잠실점', 
    '비사벌전주콩나물국밥 / 소문난감자탕', 
    '토속촌삼계탕 / 순희네빈대떡', 
    '프릳츠 도화점 / 카페 노티드 청담점', 
    '형훈라멘 / 미미면가'
]

const SelectHistory = ({handleSelect}) => {
    return <SelectButtonGroup>
        {history.map((h, i)=>{
        return (<Button style={{margin: "0 10px 3px 0"}} onClick={() => handleSelect(historyKey[i])} >
            {h}
        </Button>)
    })}</SelectButtonGroup>
}

export default function Location() {
    let { locationName } = useParams();
    const [toggle, setToggle] = useState(false);
    const [selectHistory, setSelectHistory] = useState(null);
    
    const hotels = useSelector(({hotels}) => hotels);
    const hotel = hotels.hotelList.filter(h => h.name === locationName)[0]

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])


    if (!hotel) {
        return (
            <div style={{padding: 30}}>
                <h1>결과를 찾을 수 없습니다.</h1>
            </div>
        )
    }

    const handleToggle = (key) => {
        setToggle(key)
    }

    
    return (
        <Row>
            <Col xs={{ span: 24, offset: 0 }} lg={{ span: 16, offset: 4 }} xl={{ span: 12, offset: 6 }}>
            {/* {hotel.name} / {hotel.id} */}
            <HeaderButtonGroup className={'animate__animated animate__fadeInUp'}>
                <Button onClick={()=>handleToggle(1)} style={{width: "48%"}} type="primary" icon={<MonitorOutlined />} >
                    로컬 맛집
                </Button>
                <Button onClick={()=>handleToggle(2)} style={{width: "48%"}} type="primary" icon={<GlobalOutlined />} >
                    글로벌 맛집
                </Button>
            </HeaderButtonGroup>
            {
                toggle === 2? // 로컬
                <EatList eats={hotel.global_eat} />
                : ((toggle === 1) && !selectHistory)? // 글로벌
                <SelectHistory handleSelect={setSelectHistory} />
                : ((toggle === 1) && selectHistory) ?
                (
                    <>
                    <SelectHistory handleSelect={setSelectHistory} />
                    <Divider style={{borderTop: "1px solid #1890ff", opacity: 0.5}}/>
                    <EatList eats={hotel.local_eat[selectHistory]} />
                    </>
                )
                : <div></div>
            }
            </Col>
        </Row>
    )
}
