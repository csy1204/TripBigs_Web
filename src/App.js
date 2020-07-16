import React, { useState, useEffect } from 'react';
import './App.css';
import ReactGA from "react-ga";
import { Layout, Menu, Row, Col, Button, Dropdown } from 'antd';
import {
  FilterOutlined
} from '@ant-design/icons';
import HotelList from "./features/hotels/HotelList"


const { Header, Content, Footer } = Layout;

const menu = (
  <Menu>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
        1st menu item
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
        2nd menu item
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
        3rd menu item
      </a>
    </Menu.Item>
  </Menu>
);

function App() {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    ReactGA.pageview(window.location.pathname)
    fetch('/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, []);

  return (
    <div className="App">
      <Layout>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
            <Menu.Item key="1">nav 1</Menu.Item>
            <Menu.Item key="2">nav 2</Menu.Item>
            <Menu.Item key="3">nav 3</Menu.Item>
          </Menu>
        </Header>
        <Row>
          <Col xs={{ span: 24, offset: 0 }} lg={{ span: 16, offset: 4 }} xl={{ span: 12, offset: 6 }}>
            <Content className="site-layout" style={{ padding: '0 30px', marginTop: 64, minHeight: "100vh" }}>
            <div style={{ padding: "10px 0px" }}>
            <Dropdown overlay={menu} placement="bottomLeft">
              <Button icon={<FilterOutlined />}>정렬</Button>
            </Dropdown>
            </div>
            <div className="site-layout-background" style={{ padding: "10px 0px", minHeight: 380 }}>
              <HotelList />
            </div>
          </Content>
          </Col>
        </Row>
        <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
      </Layout>
    </div>
  );
}

export default App;
