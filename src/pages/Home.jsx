import React from 'react';
import { Row, Col } from 'antd';
import HotelList from "../features/hotels/HotelList"
import SortingButton from "../features/hotels/SortingButton"
// import AIButton from "../features/hotels/AIButton"
import AiButton from "../features/hotels/AIButton";

export default function Home() {
    return (
        <Row>
            <Col xs={{ span: 24, offset: 0 }} lg={{ span: 16, offset: 4 }} xl={{ span: 12, offset: 6 }}>
                <div style={{ padding: "10px 0px" }}>
                    <SortingButton />
                    <AiButton />
                    {/* <AIButton /> */}
                </div>
                <div className="site-layout-background" style={{ padding: "10px 0px", minHeight: 380 }}>
                <HotelList />
                </div>
  
            </Col>
        </Row>
    )
}
