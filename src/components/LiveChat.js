import React, { Component } from 'react';
import { Table, Badge, Icon } from 'antd';
import openSocket from 'socket.io-client';

const socket = openSocket('http://ichijou.hopto.org:3000/adminsoc');

function subscribeToSocket(subscriptionName, cb) {
    socket.on(subscriptionName, data => cb(null, data));
}

var adminKey = 'generateauniqueadminkeypls';
var adminSessionID = '';

class LiveChat extends Component { 

    constructor(props) {
        super(props);

        this.state = {
            clientlists: [] // all the client bots sessionID
        };

        // socket on whether the server is alive or not
        /* 
            data:{ 
                server_msg: bool, 
                adminSessionID: string 
            }
        */
        subscribeToSocket('server_firstnotice', (err, data) => {

            // if server_msg return true, means the server has alive
            if (data.server_msg) {
                console.log('server is alive');

                // get the unique adminSessionID first
                adminSessionID = data.adminSessionID;

                // emit the admin key to my server and notify its first appearance
                socket.emit('admin_firstnotice', { key: adminKey, adminSessionID: adminSessionID });
            }

        });

        // socket on whether got any new bot connected or not
        /* 
            data:{ 
                currentclients: [{
                    sessionId: string,
                    date: dateformat,
                    status: string
                }]
            }
        */
        subscribeToSocket('clientListsUpdate', (err, data) => {
            this.setState({ clientlists: data.currentclients });
        });
    }

    componentWillUnmount() {
        socket.disconnect();
    }

    render() {

        const currentOnlineBots = this.state.clientlists;
        let data = [];

        // table structure
        const columns = [
            {
                title: (<div><Icon type="usergroup-add" /> ChatBots</div>),
                dataIndex: 'chatbot',
                key: 'chatbot',
                render: (text) => (<a href='/'>{text}</a>)
            },
            {
                title: (<Icon type="eye" />),
                dataIndex: 'status',
                key: 'status',
                render: (text) => {
                    return (<Badge status={text} />);
                }
            },
            {
                title: (<Icon type="clock-circle" />),
                dataIndex: 'logintime',
                key: 'logintime'
            }
        ];

        // all bots data
        for (let i = 0; i < currentOnlineBots.length; ++i) {
            data.push({
                key: i,
                chatbot: currentOnlineBots[i].sessionId,
                status: currentOnlineBots[i].status,
                logintime: currentOnlineBots[i].date
            });
        }

        // rowSelection object indicates the need for row selection
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            }
        };

        return(
            <div>
                <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
            </div>
        );
    }
}

export default LiveChat;