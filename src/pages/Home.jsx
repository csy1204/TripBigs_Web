import React from 'react';
import { Layout, Menu, Row, Col, Button, Dropdown } from 'antd';
import {
  RightOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import HotelList from "../features/hotels/HotelList"
import SortingButton from "../features/hotels/SortingButton"

const { Header, Content, Footer } = Layout;

export default function Home() {
    return (
        <Row>
            <Col xs={{ span: 24, offset: 0 }} lg={{ span: 16, offset: 4 }} xl={{ span: 12, offset: 6 }}>
                <div style={{ padding: "10px 0px" }}>
                <SortingButton />
                <Button> <ShareAltOutlined /> AI 추천 순 정렬&nbsp;&nbsp;</Button>
                </div>
                <div className="site-layout-background" style={{ padding: "10px 0px", minHeight: 380 }}>
                <HotelList />
                </div>
  
            </Col>
        </Row>
    )
}
