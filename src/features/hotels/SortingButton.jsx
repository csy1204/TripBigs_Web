import React from 'react'
import { Menu, Button, Dropdown } from 'antd';
import { useDispatch } from 'react-redux';
import {
    FilterOutlined,
} from '@ant-design/icons';

import { sortByPrice, sortByRating} from './hotelsSlices';


  

export default function SortingButton() {
    const dispatch = useDispatch();

    const menu = (
        <Menu>
          <Menu.Item onClick={() => dispatch(sortByPrice())}>
              가격순
          </Menu.Item>
          <Menu.Item onClick={() => dispatch(sortByRating())}>
              평점순
          </Menu.Item>
        </Menu>
      );

    return (
        <Dropdown overlay={menu} placement="bottomLeft">
            <Button icon={<FilterOutlined />}>정렬</Button>
        </Dropdown>
    )
}
