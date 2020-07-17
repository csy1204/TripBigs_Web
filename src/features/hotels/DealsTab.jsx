import React from 'react'
import styled from 'styled-components';
import {
    RightOutlined
} from '@ant-design/icons';


const DealsTabHeader = styled.div`
margin: 0;
padding: 0 0 8px 8px;
font-size: 14px;
font-weight: bold;
`

const DealsTabCard = styled.div`
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
const DealsHeader = styled.div`
`

const DealsDetail = styled.div`
display: flex;
flex-direction: column;
align-items: flex-start;
margin-top: auto;
width: 100%;
`
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function DealsTab({deals}) {
    return (
        <div>
            <DealsTabHeader>
            마음에 드실 만한 상품
            </DealsTabHeader>
            <a 
                href={deals[0].url} 
                style={{textDecoration: "none", color:"black"}}
                target="_blank"
                >
            <DealsTabCard>
                <DealsHeader>가장 낮은 요금 <RightOutlined /> </DealsHeader>
                <DealsDetail>
                <span style={{fontSize: 16, marginRight: 3, fontWeight:"bold"}}>{numberWithCommas(deals[0].price)} 원</span><span style={{margin: "8px 0px", fontSize: 11}}>{deals[0].site}</span>
                </DealsDetail>
            </DealsTabCard>
            </a>
            <a 
                href={deals[1].url} 
                style={{textDecoration: "none"}}
                target="_blank"
                >
            <DealsTabCard>
                <DealsHeader>추천 요금 <RightOutlined /> </DealsHeader>
                <DealsDetail>
                <span style={{fontSize: 16, marginRight: 3, fontWeight:"bold"}}>{numberWithCommas(deals[1].price)} 원</span><span style={{margin: "8px 0px", fontSize: 11}}>{deals[1].site}</span>
                </DealsDetail>
            </DealsTabCard>
            </a>
        </div>
    )
}
