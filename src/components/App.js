import React, { Component } from 'react';
import AppHeader from './AppHeader';
import MsgBody from './MsgBody';
import WrappedUserMsgForm from './UserMsgForm';
import request from 'superagent';
import { Spin } from 'antd';
import './css/App.css';

import openSocket from 'socket.io-client';

const localtest = false; // localhost or cloud vm?
var socket = ''; // the socket
var sessionID = ''; // the unique sessionID for this chatbot
var tokenID = ''; // this tokenID will differentiate this chatbot from others
var queryUrl = '';
var visionUrl = '';

/* ----------------------------------------------------------------------------------------------- */
/* Client sockets setup
/* emit :           [ 'client_firstnotice', 'disconnect' ]
/* subscribe :      [ 'server_firstnotice', 'server_chatbotValidation', 'disconnect' ]
/* ----------------------------------------------------------------------------------------------- */

if (localtest) {
    socket = openSocket('http://localhost:3002/clientbot');
    tokenID = '59be963e1711d1515861c160'; // WARNING Hardcoded tokenID, for local test only
    queryUrl = 'http://localhost:3000/query';
    visionUrl = 'http://localhost:3000/vision';
}
else {
    socket = openSocket('http://13.228.81.65:3002/clientbot');
    tokenID = '59be963e1711d1515861c160'; // WARNING Hardcoded tokenID, need to have view render engine in my server asap
    queryUrl = 'http://13.228.81.65:3000/query';
    visionUrl = 'http://13.228.81.65:3000/vision';
}

function subscribeToSocket(subscriptionName, cb) {
    socket.on(subscriptionName, data => cb(null, data));
}

class App extends Component {

    // Main app Constructor
    constructor(props) {
        super(props);

        this.StoreMsg = this.StoreMsg.bind(this);
        this.QueryFromNECAIServer = this.QueryFromNECAIServer.bind(this);
        this.QueryFromVisionApi = this.QueryFromVisionApi.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        // default state
        this.state = { 
            verifySuccess: false,
            botinfo: {
                parentID: 'unknownbot',
                sessionID: '0', // unique session ID for this page
                agentName: 'noname', // Agent name
                headerColor: '',
                bottomColor: '',
                bodyColor: '',
                headerNameColor: '',
                chatbotCollectionName: ''
            },
            MsgStorage: [], 
            msg: '', // current text msg
            cardloading: false, 
            windowWidth: 0, 
            windowHeight: 0
        };

        // socket on whether the server is alive or not
        subscribeToSocket('server_firstnotice', (err, data) => {

            // if server_msg return true, means the server has alive
            if (data.server_msg) {
                console.log('server is alive');

                // get the unique sessionID first
                sessionID = data.sessionID;

                // this bot emit to server socket to notify its first appearance
                socket.emit('client_firstnotice', { tokenID: tokenID, sessionID: sessionID });
            }

        });

        // wait and receive the validation info from the server
        subscribeToSocket('server_chatbotValidation', (err, data) => {

            if (err) {
                console.log('server error: ' + err);
            }
            else {
                console.log(data);

                let chatbotSkin = data.chatbotSkin;
                let bi = {
                    parentID: data.clientName,
                    sessionID: sessionID, // unique session ID for this page
                    agentName: chatbotSkin.agentName, // Agent name
                    headerColor: chatbotSkin.headerColor,
                    bottomColor: chatbotSkin.bottomColor,
                    bodyColor: chatbotSkin.bodyColor,
                    headerNameColor: chatbotSkin.headerNameColor,
                    chatbotCollectionName: data.chatbotCollectionName
                }

                this.setState({
                    verifySuccess: true,
                    botinfo: bi
                });
            }

        });

        // see whether the server has disconnected
        subscribeToSocket('disconnect', (err, data) => {

            console.log("server has disconnected");
            this.setState({
                verifySuccess: false
            });
        });
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);

        // welcome the user
        this.QueryFromNECAIServer('', 'WELCOME');
    }

    componentWillUnmount() {
        socket.disconnect();
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    // Window resize update
    updateWindowDimensions() {
        this.setState({
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        });
    }

    // Update and store the latest messages in this session
    StoreMsg(newItem, cardloadingornot) {

        if (cardloadingornot) {
            // store the latest info into my state
            this.setState((prevState) => ({
                MsgStorage: prevState.MsgStorage.concat(newItem),
                message: newItem.text,
                cardloading: false
            }));
        }
        else {
            // store the latest info into my state
            this.setState((prevState) => ({
                MsgStorage: prevState.MsgStorage.concat(newItem),
                message: newItem.text
            }));
        }


    }

    // Basic text input send
    QueryFromNECAIServer(queryText, eventcall) {

        request
        .post(queryUrl)
        .set('contentType', 'application/json; charset=utf-8')
        .set('dataType', 'json')
        .send({
            parentID: this.state.botinfo.parentID,
            sessionID: this.state.botinfo.sessionID,
            query: queryText,
            e: eventcall,
            tokenId: tokenID,
            chatbotCollectionName: this.state.botinfo.chatbotCollectionName
        })
        .end((err, res) => {

            if(err) {
                console.log('NEC AI query error: ' + err);
            }
            else {

                let querysuccess = res.body.success;

                if(querysuccess) {

                    let fulfillment = res.body.res.result.fulfillment;
                    let AllMessages = [];

                    if (fulfillment.messages) {

                        for (let i = 0; i < fulfillment.messages.length; ++i) {

                            let message = fulfillment.messages[i];

                            switch (message.type) {
                                case 0:

                                    // Text Response
                                    AllMessages.push({
                                        type: 0, 
                                        text:message.speech
                                    });
                                    break;

                                case 4:

                                    // Payload
                                    switch (message.payload.type) {

                                        case 0:

                                            // Quick Replies
                                            AllMessages.push({
                                                type: 1,
                                                title: message.payload.title,
                                                qrs: message.payload.quick_replies
                                            });

                                            break;

                                        case 1:

                                            // link
                                            AllMessages.push({
                                                type: 2,
                                                link: message.payload.link
                                            });

                                            break;

                                        case 2:

                                            // event
                                            AllMessages.push({
                                                type: 3,
                                                event: message.payload.e
                                            });

                                            break;

                                        case 3:

                                            // images
                                            AllMessages.push({
                                                type: 4,
                                                title: message.payload.title,
                                                imageURL: message.payload.imageUrl
                                            });

                                            break;

                                        case 4:

                                            // Quick Replies
                                            AllMessages.push({
                                                type: 5,
                                                title: message.payload.title,
                                                qrs: message.payload.quick_replies
                                            });

                                            console.log(message.payload.quick_replies);

                                            break;
                                    
                                        default:
                                            break;

                                    }

                                    break;
                            
                                default:
                                    break;
                            }

                        }

                    }

                    let newItem = {
                        user: 'ai',
                        id: Date.now(),
                        AiMessages: AllMessages
                    };

                    // store the msg return from api ai pls
                    this.StoreMsg(newItem);

                    // check got any events
                    for (let i = 0; i < AllMessages.length; ++i) {

                        let message = AllMessages[i];

                        if (message.type === 3) {
                            // got any event to fire?
                            // if got any event call?
                            console.log('got event pls: ' + message.event);
                            this.QueryFromNECAIServer('', message.event);
                        }
                    }

                }
                else {
                    console.log('query not success');
                }

            }
            
        });

    }

    // Basic Image input send to google vision API
    QueryFromVisionApi(ImageURL) {
        request
        .post(visionUrl)
        .set('contentType', 'application/json; charset=utf-8')
        .set('dataType', 'json')
        .send({
            imageURL: ImageURL,
            tokenId: tokenID,
        })
        .end((err, res) => {
            if (err) {
                console.log('google api vision error: ' + err);

                let newItem = {
                    text: err,
                    user: 'ai',
                    id: Date.now()
                };

                // store the msg return from vision ai pls
                this.StoreMsg(newItem, 'stop loading');
            }
            else {
                let responses = res.body;

                let labelAnnotations = responses.labelAnnotations;
                let webDetection = responses.webDetection;
                let safeSearchAnnotation = responses.safeSearchAnnotation;
                let fullTextAnnotation = responses.fullTextAnnotation;
                let logoAnnotation = '';
                let landmarkAnnotation = '';

                if (responses.landmarkAnnotations) { landmarkAnnotation = responses.landmarkAnnotations[0]; }
                if (responses.logoAnnotations) { logoAnnotation = responses.logoAnnotations[0]; }

                let newItem = {
                    text: 'Image Analyse Results',
                    user: 'ai',
                    id: Date.now(),
                    customData: {
                        image: 'yes',
                        logoAnnotation: logoAnnotation,
                        labelAnnotations: labelAnnotations,
                        webDetection: webDetection,
                        safeSearchAnnotation: safeSearchAnnotation,
                        fullTextAnnotation: fullTextAnnotation,
                        landmarkAnnotation: landmarkAnnotation
                    }
                };

                // store the msg return from vision ai pls
                this.StoreMsg(newItem, 'stop loading');
            }
        });

        this.setState({ cardloading: true });
    }

    render() {

        let displayRender = (
            <div className="MainApp">

                <AppHeader BotInfo={this.state.botinfo} />

                <MsgBody
                    WindowWidth={this.state.windowWidth}
                    WindowHeight={this.state.windowHeight}
                    displayMsg={this.state.MsgStorage}
                    currentMsg={this.state.message}
                    cardLoading={this.state.cardloading}
                    BotInfo={this.state.botinfo}
                    onMsgStore={this.StoreMsg}
                    onAPIAICall={this.QueryFromNECAIServer}
                />

                <div className="MainBottom" style={{backgroundColor: this.state.botinfo.bottomColor}}>
                    <WrappedUserMsgForm
                        onMsgStore={this.StoreMsg}
                        onAPIAICall={this.QueryFromNECAIServer}
                        onImageUploadToAnalyse={this.QueryFromVisionApi}
                    />
                </div>

            </div>
        );

        if(!this.state.verifySuccess) {
            displayRender = (
                <div>
                    <Spin tip="Loading..."/>
                </div>
            );
        }

        return displayRender;
    }
}

export default App;
