import React, { Component } from 'react';
import { Avatar, Row, Col, Card, Button, Icon } from 'antd';
import ReactDOM from 'react-dom';
import './css/App.css';
import avatarimage from './css/assets/avatarpic.jpeg';

const gridStyle = {
    width: '100%',
    textAlign: 'center',
    float: 'left'
};

class MsgBody extends Component {

    constructor(props) {
        super(props);
        this.AddMsgBody = this.AddMsgBody.bind(this);
        this.AIMsgBody = this.AIMsgBody.bind(this);
        this.AIMsgBodyQR = this.AIMsgBodyQR.bind(this);
        this.UserMsgBody = this.UserMsgBody.bind(this);
        this.AIImageBodyResponse = this.AIImageBodyResponse.bind(this);
        this.state = {
            avatar: (<Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }} src={avatarimage} />)
        };
        //<Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>M</Avatar>
    }

    AddMsgBody(msg) {

        // AI bot is the one tht send this msg
        if (msg.user === 'ai') {

            // Any custom data such as image
            if (msg.customData) {

                let customData = msg.customData;

                // if image response
                if (customData.image) {
                    return this.AIImageAnalyseCardBody(msg.id, msg.text, customData);
                }

            }
            else {

                // from text query

                let rows = [];

                for (let i = 0; i < msg.AiMessages.length; ++i) {

                    let aimessage = msg.AiMessages[i];

                    switch (aimessage.type) {

                        case 0:
                            rows.push(this.AIMsgBody(i.toString() + msg.id, aimessage.text));
                            break;

                        case 1:
                            rows.push(this.AIMsgBodyQR(i.toString() + msg.id, aimessage.title, aimessage.qrs));
                            break;

                        case 2:
                            rows.push(this.AIMsgBody(i.toString() + msg.id, '', aimessage.link));
                            break;

                        case 4:
                            rows.push(this.AIImageBodyResponse(i.toString() + msg.id, aimessage.title, aimessage.imageURL));
                            break;

                        case 5:
                            rows.push(this.AIMsgBodyQRe(i.toString() + msg.id, aimessage.title, aimessage.qrs));
                            break;

                        default:
                            break;

                    }
                }

                return rows;
            }

            

        }

        // User is the one tht send this msg
        else if (msg.user === 'user') {

            // Any customData such as image upload..
            if (msg.customData) {

                let customData = msg.customData;

                // if any given image url
                if (customData.imagePreviewUrl) {
                    return this.UserMsgBody(msg.id, msg.text, customData.imagePreviewUrl);
                }

                // if thumbs up or down 
                if (customData.thumbs) {
                    return this.UserMsgBodyIcon(msg.id, customData.thumbs);
                }

            }
            else {
                // if not, it is just a text msg sent only
                return this.UserMsgBody(msg.id, msg.text);
            }

        }

    }

    // Default design for AI msg display
    AIMsgBody(key, text, link) {

        let linkmsg = '';
        let spacebreak = text ? (<br/>) : '';

        // if there is a website link, update the DisplayMsg
        if(link) {
            linkmsg = (
                <div>
                    {spacebreak}For more info, visit this <a href={link} target="_blank">link</a>
                </div>
            );
        }

        // default text display design 
        let DisplayMsg = (<h3 className="MsgContent" style={{ float: 'left' }}> {text} {linkmsg} </h3>);

        // return the design msg box
        return (
            <Row type='flex' align="middle" key={key} style={{marginLeft: 5}}>

                <Col span={2}>
                    {this.state.avatar}
                </Col>

                <Col span={22}>
                    { DisplayMsg }
                </Col>

            </Row>
        );
    }

    // Quick replies 
    AIMsgBodyQR(key, text, qr) {

        // default text display design 
        let DisplayMsg = (<h3 className="MsgContent" style={{ float: 'left' }}> {text}</h3>);

        let qrrows = [];

        for(let i = 0; i < qr.length; ++i) {

            qrrows.push((
                <Button
                    type="primary"
                    key={key + i}
                    style={{ float: 'left', margin: 5 }}
                    size="large"
                    value={qr[i]}
                    onClick={(e) => {

                        let newItem = {
                            text: e.target.value,
                            user: 'user',
                            id: Date.now()
                        };
                        this.props.onMsgStore(newItem);
                        this.props.onAPIAICall(e.target.value);
                        
                    }}
                >
                    {qr[i]}
                </Button>
            ));

        }

        // return the design msg box
        return (
            <Row type='flex' align="middle" key={key} style={{marginLeft: 5}}>

                <Col span={2}>
                    {this.state.avatar}
                </Col>

                <Col span={22}>
                    {DisplayMsg}
                    <div style={{ float: 'left', marginLeft: 3 }}>{qrrows}</div>
                </Col>

            </Row>
        );

    }

    // quick replies with event
    AIMsgBodyQRe(key, text, qr) {

        // default text display design 
        let DisplayMsg = (<h3 className="MsgContent" style={{ float: 'left' }}> {text}</h3>);

        let qrrows = [];

        for (let i = 0; i < qr.length; ++i) {

            let bttntxt = qr[i].text;
            let eventname = qr[i].e;

            qrrows.push((
                <Button
                    type="primary"
                    key={key + i}
                    style={{ float: 'left', margin: 5 }}
                    size="large"
                    value={bttntxt}
                    onClick={(e) => {

                        let newItem = {
                            text: e.target.value,
                            user: 'user',
                            id: Date.now()
                        };
                        this.props.onMsgStore(newItem);
                        this.props.onAPIAICall('', eventname);

                    }}
                >
                    {bttntxt}
                </Button>
            ));

        }

        // return the design msg box
        return (
            <Row type='flex' align="middle" key={key} style={{ marginLeft: 5 }}>

                <Col span={2}>
                    {this.state.avatar}
                </Col>

                <Col span={22}>
                    {DisplayMsg}
                    <div style={{ float: 'left', marginLeft: 3 }}>{qrrows}</div>
                </Col>

            </Row>
        );

    }

    AIImageBodyResponse(key, text, imageURL) {

        // default text display design 
        let DisplayMsg = (<h3 className="MsgContent" style={{ float: 'left' }}>{text}</h3>);

        // return the design msg box
        return (
            <div key={key}>
                <Row type='flex' align="middle" style={{ marginLeft: 5 }}>

                    <Col span={2}>
                        {this.state.avatar}
                    </Col>

                    <Col span={22}>

                        {DisplayMsg}

                    </Col>

                </Row>

                <Row type='flex' align="middle" style={{ marginLeft: 5 }}>
                    <Col span={2}></Col>

                    <Col span={22}>

                        <div style={{ display: 'block', marginLeft: 10 }}>
                            <img alt="example" src={imageURL} style={{ maxWidth: 250 }}/>
                        </div>

                    </Col>
                </Row>

            </div>
        );
    }

    // AI Image card response design
    AIImageAnalyseCardBody(key, text, customData) {

        let totalCardContents = [];

        let labelAnnotations = customData.labelAnnotations;
        let labelAnnotationsContent = (
            <Card.Grid style={gridStyle} key="labelcard">
                <p>Sorry, I do not know what this pic is trying to say</p>
            </Card.Grid>
        );

        let webDetection = customData.webDetection;
        let webDetectionContent = (
            <Card.Grid style={gridStyle} key="webdetectioncard">
                <p>No similar pages found</p>
            </Card.Grid>
        );

        let safeSearchAnnotation = customData.safeSearchAnnotation;
        let safeSearchAnnotationContent = (
            <Card.Grid style={gridStyle} key="safesearchcard">
                <p>Cannot determine the safe search</p>
            </Card.Grid>
        );

        let fullTextAnnotation = customData.fullTextAnnotation;
        let fullTextAnnotationContent = (
            <Card.Grid style={gridStyle} key="textwrittencard">
                <p>No Text Written on the image</p>
            </Card.Grid>
        );

        let landmarkAnnotation = customData.landmarkAnnotation;
        let landmarkAnnotationContent = (
            <Card.Grid style={gridStyle} key="landmarkcard">
                <p>No landmark found</p>
            </Card.Grid>
        );

        let logoAnnotation = customData.logoAnnotation;
        let logoAnnotationContent = (
            <Card.Grid style={gridStyle} key="logocard">
                <p>No logo found</p>
            </Card.Grid>
        );

        // if there is any label
        if(labelAnnotations) {
            let confidencemah = false;
            let Content = '';
    
            // only get the description if its score is above 0.9
            for (let i = 0; i < labelAnnotations.length; ++i) {

                if (labelAnnotations[i].score > 0.9) {
                    Content += labelAnnotations[i].description + ', ';
                    confidencemah = true;
                }
                else {
                    labelAnnotationsContent = (<Card.Grid style={gridStyle} key="labelcard"><p> It looks like a <i><b>{Content}</b></i> to me</p></Card.Grid>);
                    break;
                }

            }
    
            if (confidencemah === false) {
    
                // check for score 0.75
                for (let i = 0; i < labelAnnotations.length; ++i) {

                    if (labelAnnotations[i].score > 0.75) {
                        Content += labelAnnotations[i].description + ', ';
                        confidencemah = true;
                    }
                    else {
                        labelAnnotationsContent = (<Card.Grid style={gridStyle} key="labelcard"><p> It looks like a <i><b>{Content}</b></i> to me</p></Card.Grid>);
                        break;
                    }

                }
    
            }
        }

        // default must push this
        totalCardContents.push(labelAnnotationsContent);

        // Any Text read?
        if (fullTextAnnotation) {

            fullTextAnnotationContent = (
                <Card.Grid style={gridStyle} key="textwrittencard">
                    <p>I found text written as <i><b>{fullTextAnnotation.text}</b></i> </p>
                </Card.Grid>
            );

            totalCardContents.push(fullTextAnnotationContent);
        }

        // Landmark detection
        if (landmarkAnnotation) {
            landmarkAnnotationContent = (
                <Card.Grid style={gridStyle} key="landmarkcard">
                    <p>I think it is the <i><b>{landmarkAnnotation.description}</b></i> </p>
                </Card.Grid>
            );
            totalCardContents.push(landmarkAnnotationContent);
        }

        // Logo Detection
        if (logoAnnotation) {

            logoAnnotationContent = (
                <Card.Grid style={gridStyle} key="logocard">
                    <p>It has <i><b>{logoAnnotation.description}</b></i> logo on it</p>
                </Card.Grid>
            );
            totalCardContents.push(logoAnnotationContent);

        }

        // if there is any web pages
        if(webDetection) {

            if(webDetection.webEntities){
                let Content = '';
                let webEntities = webDetection.webEntities;
                let count = webEntities.length > 5 ? 5 : webEntities.length;

                for(let i = 0; i < count; ++i) {
                    Content += webEntities[i].description + ', ';
                }

                let webEntitiesContent = (
                    <Card.Grid style={gridStyle} key="webentitiescard">
                        <p>It also can be referred as <i><b>{Content}</b></i> on the internet</p>
                    </Card.Grid>
                );

                totalCardContents.push(webEntitiesContent);
            }

            let pagesWithMatchingImages = webDetection.pagesWithMatchingImages;

            if (pagesWithMatchingImages) {

                webDetectionContent = (
                    <Card.Grid style={gridStyle} key="webdetectioncard">
                        <p>
                            I found some similar pages url about this image -> <a href={pagesWithMatchingImages[0].url}>link</a>
                        </p>
                    </Card.Grid>
                );

            }

            totalCardContents.push(webDetectionContent);
        }
        
        // Safe Search or not
        if (safeSearchAnnotation) {

            safeSearchAnnotationContent = (
                <Card.Grid style={gridStyle} key="safesearchcard">
                    <p>Adult: <i><b>{safeSearchAnnotation.adult}</b></i> </p>
                    <p>Medical: <i><b>{safeSearchAnnotation.medical}</b></i></p>
                    <p>Spoof: <i><b>{safeSearchAnnotation.spoof}</b></i> </p>
                    <p>Violence: <i><b>{safeSearchAnnotation.violence}</b></i> </p>

                </Card.Grid>
            );

            totalCardContents.push(safeSearchAnnotationContent);
        }
        
        return (
            <Row type='flex' align="bottom" key={key} style={{marginLeft: 5}}>

                <Col span={2}>
                    {this.state.avatar}
                </Col>

                <Col span={22}>

                    <Card title={text} style={{ width: 270, margin: 5 }} noHovering>
                        {totalCardContents}
                    </Card>

                </Col>

            </Row>
        );
    }

    // Default design for user message square box display with text or image
    UserMsgBody(key, text, imagePreviewUrl) {

        // If user send any image
        if (imagePreviewUrl) {

            return (
                <Row type='flex' align="middle" key={key} style={{ marginRight: 5 }}>

                    <Col span={22}>
                        <img alt="example" width="150px" src={imagePreviewUrl} style={{ margin: 5, float: 'right' }}/>
                    </Col>

                    <Col span={2}>
                        <Avatar icon="user" style={{ float: 'right' }}></Avatar>
                    </Col>

                </Row>
            );

        }
        // Else, just a txt sent
        else {

            return (
                <Row type='flex' align="middle" key={key} style={{ marginRight: 5 }}>

                    <Col span={22}>
                        <h3 className="MsgContent" style={{ float: 'right' }}>{text}</h3>
                    </Col>

                    <Col span={2}>
                        <Avatar icon="user" style={{ float: 'right' }}></Avatar>
                    </Col>

                </Row>
            );

        }
    }

    UserMsgBodyIcon = (key, icon) => {
        return (
            <Row type='flex' align="middle" key={key} style={{ marginRight: 5 }}>

                <Col span={22}>
                    <h3 className="MsgContent" style={{ float: 'right' }}>
                        <Icon type={icon} style={{ fontSize: 30 }} />
                    </h3>
                </Col>

                <Col span={2}>
                    <Avatar icon="user" style={{ float: 'right' }}></Avatar>
                </Col>

            </Row>
        );
    }

    // Scroll to bottom when added new msg 
    scrollToBottom = () => {
        const node = ReactDOM.findDOMNode(this.messagesEnd);
        node.scrollIntoView({ behavior: "smooth" });
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        // prepare all the display datas into the rows
        let rows = [];
        for (let i = 0; i < this.props.displayMsg.length; ++i) {

            let column = this.AddMsgBody(this.props.displayMsg[i]);

            // if row is an array
            if (column.constructor === Array) {

                for(let h = 0; h < column.length; ++h) {
                    rows.push(column[h]);
                }
                
            }
            else {
                rows.push(column);
            }

        }

        const windowwidth = this.props.WindowWidth;
        const windowheight = this.props.WindowHeight;

        // Default content height
        let contentHeight = 500;

        // if the window width is too small, change mobile phone mode
        if(windowwidth < 500) {
            // need adjust based on app size
            contentHeight = windowheight - 111;
        }

        // just a loading screen for card
        const cardloadingdisplay = (
            <Row type='flex' align="middle" style={{ marginLeft: 5 }}>

                <Col span={2}>
                    <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>M</Avatar>
                </Col>

                <Col span={22}>

                    <Card loading title="Ahh, Let me see..." style={{ width: 270, margin: 5 }} noHovering>
                        Whatever content
                    </Card>

                </Col>

            </Row>
        );

        // background color
        const bgcolor = this.props.BotInfo.bodyColor;
        
        return (
            <div style={{ height: contentHeight, backgroundColor: bgcolor }} className="ChatBody">
                <Row type='flex' justify="center" align="middle">

                    <Col span={24}>
                        <div style={{margin: 7}}>

                            {rows}

                            {
                                this.props.cardLoading && cardloadingdisplay
                            }

                            <div style={{ float: "left", clear: "both" }}
                                ref={(el) => { this.messagesEnd = el; }}>
                            </div>

                        </div>

                    </Col>

                </Row>
            </div>
        );
    }
}

export default MsgBody;