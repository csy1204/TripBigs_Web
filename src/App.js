import React, { useState, useEffect } from 'react';
import './App.css';
import ReactGA from "react-ga";
import { Layout, Menu } from 'antd';
import Home from "./pages/Home";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import api from "./lib/api";

const { Header, Content, Footer } = Layout;


function About() {
  return <Content>
    <h2>About</h2>
    </Content>;
}

function Users() {
  return <Content>
  <h2>Users</h2>
  </Content>;
}


function App() {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    ReactGA.pageview(window.location.pathname)

    const fetch = async () => {
      const { data } = await api.getTime();
      console.log(data);
      setCurrentTime(data.time);

    }

    fetch();
    
  }, []);

  return (
    <Router>
    <div className="App">
      <Layout>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
          <div className="logo" >
            <img height={65} src="https://storage.cloud.google.com/tripbigs/tripbigslogo.png?authuser=1&folder&organizationId" />
          </div>
          <Menu theme="" mode="horizontal" defaultSelectedKeys={['1']}>
            <Menu.Item key="1"><Link to="/">Main</Link></Menu.Item>
            <Menu.Item key="2"><Link to="/about">About</Link></Menu.Item>
            {/* <Menu.Item key="3"><Link to="/members">Member</Link></Menu.Item> */}
          </Menu>
        </Header>
        <Content className="site-layout" style={{ padding: '0 30px', marginTop: 64, minHeight: "100vh" }}>
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/members">
            <Users />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
      </Layout>
    </div>
    <p>{currentTime}</p>
    </Router>
  );
}

export default App;
