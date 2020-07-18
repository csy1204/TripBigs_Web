import React, { useState }  from 'react'
import { Row, Col, Button, Divider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs } from 'antd';
import styled from 'styled-components';
import {
    DownOutlined,
    UpOutlined,
    RightOutlined

} from '@ant-design/icons';
import {
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams
  } from "react-router-dom";

import InfoTab from "./InfoTab";
import ImgTab from "./ImgTab";
import DealsTab from "./DealsTab";
import { generateLog } from "../tracker/trackerSlice"

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
    padding: 8px;
    min-height: 80px;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const NameSpan = styled.span`
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
`

const HotelImage = styled.img`
    object-fit: cover;
    width: 100%;
    height: 100%
`

const SelectButton = styled.button`
    margin-left: auto;
    padding: 4px 4px 4px 8px;
    width: auto;
    max-width: 100%;
    color: #fff;
    border-radius: 2px;
    background-color: #428500;
    border: 0;
    font-size: 12px;
    color: white;
    font-weight: bold;
`

const PriceCardFooter = styled.div`
    display: flex;
    align-items: center;
`

const PriceCardInner = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
    padding: 0 0 2px 0;
`

const CardFooter = styled.div`
    background: white;
    padding: 3px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    font-weight: bold;
`

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


const HotelCard = ({hotel, imps, prices}) => {
    const [tabNum, setTabNum] = useState(false);
    const { TabPane } = Tabs;
    const dispatch = useDispatch();

    const handleTabChange = (key) => {
        key===tabNum?setTabNum(false):setTabNum(key)
    }

    

    const handleLog = (action_type) => {
        const data = {
            action_type,
            reference: hotel.id,
            impressions: imps,
            prices: prices
        }
        dispatch(generateLog(data));
    }

    return (
        <HotelCardDiv>
            <Row style={{background:"white"}}>
                <Col xs={10} lg={4} style={{padding:"2px"}} onClick={() => { handleLog("interaction item image"); handleTabChange("2") }} >
                    <HotelImage alt={"placeholder"} src={"http:"+hotel.images[0].urls.preview} />
                </Col>
                <Col xs={14} lg={20} >
                    <PriceCardInner>
                        <div>
                            <NameSpan>{hotel.name}</NameSpan>
                            <p style={{fontSize:12}}>{hotel.type}</p>
                            <p onClick={() => {handleLog('interaction item deals'); handleTabChange("3")}} style={{fontSize:12, marginBottom: 2}}>
                                <RatingSpan index={hotel.reviewRating.index}> 
                                    {hotel.reviewRating.percentage} 
                                </RatingSpan>  
                                <b>{hotel.overallLiking}</b> (후기 {hotel.partnerReviewCount}개)
                            </p>
                            <p onClick={() => {handleLog('interaction item info'); handleTabChange("1")}} style={{fontSize:12, marginBottom: 2}}>
                                {hotel.address.street}
                            </p>
                        </div>
                        <Link to={`/location/${hotel.name}`}>맛집 추천 받기</Link>
                        <BestDealCard onClick={() => {handleLog('interaction item deals'); handleTabChange("3")}}>
                            <div>
                                <b>{hotel.price[1].site}</b>
                            </div>
                            <PriceCardFooter>
                                <h3 style={{color:"#316300", fontWeight: 700, fontSize:14, marginBottom: 2}}>
                                    {numberWithCommas(hotel.price[1].price)} 원
                                </h3>
                                
                                    <SelectButton><a 
                                        href={hotel.price[1].url} 
                                        style={{textDecoration: "none", color:"white"}}
                                        onClick={()=>handleLog('clickout item')}
                                        target="_blank"
                                        >선택 <RightOutlined /></a></SelectButton>
                                
                            </PriceCardFooter>        
                        </BestDealCard>   
                    </PriceCardInner>                 
                </Col>
            </Row>
            {tabNum ?
                <Row onClick={() => setTabNum(false)} >
                    <CardFooter>
                    <div>최저가: {numberWithCommas(hotel.price[0].price)} 원</div> <UpOutlined/>
                    </CardFooter>
                </Row>:<Row onClick={() => {handleLog('interaction item info');setTabNum("1")}}>
                    <CardFooter>
                        <div>최저가: {numberWithCommas(hotel.price[0].price)} 원</div> <DownOutlined />
                    </CardFooter>
                </Row>   
            }
            <Divider style={{width: '100%', margin: 0}} />
            <Row style={{background:"white"}}>
                {tabNum && 
                <Tabs style={{width: '100%', margin: "0 0 8px 0 important!"}} defaultActiveKey="1" activeKey={tabNum} onChange={(key)=>handleTabChange(key)}>
                    <TabPane tab="  정보   " key="1" style={{padding: "6px"}}>
                        <InfoTab hname={hotel.name} hid={hotel.id} amenities={hotel.amenities}  />
                    </TabPane>
                    <TabPane tab="  사진   " key="2" style={{padding: "0px 30px 30px"}}>
                        <ImgTab hid={hotel.id}/>
                    </TabPane>
                    <TabPane tab="  객실 요금   " key="3">
                        <DealsTab deals={hotel.price} />
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