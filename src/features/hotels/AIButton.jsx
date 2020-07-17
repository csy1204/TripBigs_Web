import React from 'react'
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux'
import {
  ShareAltOutlined
} from '@ant-design/icons';
import { getClickProbs } from "./hotelsSlices";

export default function AIButton() {
    const dispatch = useDispatch();
    const state = useSelector(({hotels}) => hotels)

    return (
        <Button loading={state.isLoading}  onClick={()=>{dispatch(getClickProbs())}}> 
            <ShareAltOutlined /> AI 추천 순 정렬
        </Button>
    )
}
