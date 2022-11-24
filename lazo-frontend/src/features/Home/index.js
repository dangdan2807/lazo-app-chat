import { Spin } from 'antd';
import React from 'react';
import 'react-quill/dist/quill.snow.css'; // ES6
import { useDispatch, useSelector } from 'react-redux';
import Header from './Components/Header';
import './style.scss';

function Home(props) {
    const {  infoApp, isLoading } =
        useSelector((state) => state.home);

    return (
        <Spin size="large" spinning={isLoading}>
            <div className="home_page">
                <Header data={infoApp} />
            </div>
        </Spin>
    );
}

export default Home;
