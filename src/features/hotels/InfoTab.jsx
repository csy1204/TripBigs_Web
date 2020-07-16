import React from 'react'
import { Row, Col, Button, Card } from 'antd';
import styled from 'styled-components';



const AmSpan = styled.div`
    /* Adapt the colors based on primary prop */
    color: "#37454d";
    opacity: ${props => props.isAvailable ? "1" : "0.25"};
    font-size: 14px;
    font-weight: bold;
    padding: 0px 15px 15px 0px;
    text-align: left;
    border-radius: 18px;
`;

export default function InfoTab({hname, hid, amenities}) {
    console.log(hname);
    const title = `${hname}의 기본 정보`
    return (
        <Card title={title} style={{ width: "100%"}}>
            <Row>
                {amenities.map(amenity => (
                    <Col xs={8} sm={6}
                    ><AmSpan isAvailable={amenity.isAvailable}>{amenity.title}</AmSpan></Col>
                ))}
            </Row>
        </Card>
    )
}
