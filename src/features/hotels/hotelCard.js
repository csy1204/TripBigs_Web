import React, { useState }  from 'react'
import { Row, Col, Button, Divider } from 'antd';
import { Tabs } from 'antd';
import styled from 'styled-components';
import {
    DownOutlined,
    UpOutlined
} from '@ant-design/icons';

import InfoTab from "./InfoTab";
import ImgTab from "./ImgTab";
import DealsTab from "./DealsTab";

const ratingColorIndex = {
    5: "#316300", // 최고 좋음
    4: "#428500", // 아주 좋음
    3: "#71a340", // 좋음
    2: "#f48f00", 
    1: "#c94a30", 
};

const RatingSpan = styled.span`
    /* Adapt the colors based on primary prop */
    background-color: ${props => ratingColorIndex[props.index]};
    color: white;
    font-size: 12px;
    font-weight: bold;
    margin: 0 3px;
    padding: 2px 5px;
    text-align: center;
    width: 30px;
    height: 18px;
    border-radius: 18px;
`;

const HotelCardDiv = styled.div`
    margin-bottom: 10px;    
`;

const BestDealCard = styled.div`
    background-color: #ecf3e6;
    height: calc(100% - (124px));
`;

const HotelCard = ({hotel}) => {
    const [tabNum, setTabNum] = useState(false);
    const { TabPane } = Tabs;

    return (
        <HotelCardDiv>
            <Row style={{background:"white"}}>
                <Col xs={10} lg={8} style={{padding:"2px"}}>
                    <img alt={"placeholder"} width={"100%"} src={"http:"+hotel.images[0].urls.preview} />
                </Col>
                <Col xs={14} lg={16} >
                    <h3>{hotel.name}</h3>

                    <p style={{fontSize:12}}>{hotel.type}</p>

                    <p onClick={() => setTabNum("3")} style={{fontSize:12}}>
                        <RatingSpan index={hotel.reviewRating.index}> 
                            {hotel.reviewRating.percentage} 
                        </RatingSpan>  
                        {hotel.overallLiking} (후기 {hotel.partnerReviewCount}개)
                    </p>
                    <p onClick={() => setTabNum("2")} style={{fontSize:12}}>
                        {hotel.address.street}
                    </p>
                    <BestDealCard>
                        아고다
                        <h3 style={{color:"#316300", fontSize:20}}>{hotel.price} 원</h3>
                    </BestDealCard>
                </Col>
            </Row>
            {tabNum ?
            <Row onClick={() => setTabNum(false)} style={{background:"white", justifyContent: "flex-end", padding: "3px"}}>
                <UpOutlined/>
            </Row>:<Row onClick={() => setTabNum("1")}  style={{background:"white", justifyContent: "flex-end", padding: "3px"}}>
                <DownOutlined />
            </Row>   
            }
            <Divider style={{width: '100%', margin: 0}} />
            <Row style={{background:"white"}}>
                {tabNum && 
                <Tabs style={{width: '100%'}} defaultActiveKey="1" activeKey={tabNum} onChange={(key)=>key==tabNum?setTabNum(false):setTabNum(key)}>
                    <TabPane tab="  정보   " key="1" style={{padding: "6px"}}>
                        <InfoTab hname={hotel.name} hid={hotel.id} amenities={hotel.amenities}  />
                    </TabPane>
                    <TabPane tab="  사진   " key="2" style={{padding: "0px 30px 30px"}}>
                        <ImgTab hid={hotel.id}/>
                    </TabPane>
                    <TabPane tab="  객실 요금   " key="3">
                        <DealsTab />
                    </TabPane>
                </Tabs>}
            </Row>
            <Divider style={{width: '100%', margin: 0}} />
            <Row style={{background:"white"}}>
            {tabNum && 
                <Button onClick={() => setTabNum(false)}>닫기</Button>
            }
            </Row>
        </HotelCardDiv>   
    )
}


export default HotelCard;