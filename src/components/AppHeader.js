import React, { Component } from 'react';
import { Row, Col, Icon } from 'antd';
import './css/App.css';

class AppHeader extends Component {
    render() {
        const headercolor = this.props.BotInfo.headerColor;
        const agentname = this.props.BotInfo.agentName;
        const namecolor = this.props.BotInfo.headerNameColor;

        return (
            <div style={{ backgroundColor: headercolor}}>

                <Row type='flex' align="middle">

                    <Col span={2}>
                    </Col>

                    <Col span={20}>
                        <h1 className='AgentName' style={{ color: namecolor}}>{agentname}</h1>
                    </Col>

                    <Col span={2} >
                        <Icon type="down" style={{ fontSize: 20, marginTop: 3, color: namecolor }} />
                    </Col>

                </Row>

            </div>
        );
    }
}

export default AppHeader;