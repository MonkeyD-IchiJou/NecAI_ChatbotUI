import React, { Component } from 'react';
import { Button, Form, Input, Row, Col, Icon, Tooltip, Menu, Dropdown } from 'antd';
import './css/App.css';
import ImageUpload from './ImageUpload';
const FormItem = Form.Item;


// Check whether got any errors in any other fields
function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

// Callback when any fields change
function onFieldsChange(props, fields){
    // console.log(fields.Message);
    // some fields has changed
}

class UserMsgForm extends Component {

    componentDidMount() {
        // To disabled submit button at the beginning
        this.props.form.validateFields();
    }

    handleSubmit = (e) => {

        e.preventDefault();

        this.props.form.validateFields(
            (err, values) => {
                if(!err) {
                    console.log('Received values of form: ', values);
                }

                let newItem = {
                    text: values.Message,
                    user: 'user',
                    id: Date.now()
                };

                // store the latest info into my state
                this.props.onMsgStore(newItem);

                // need to inform server about msg has sent
                this.props.onAPIAICall(values.Message);
                
                // set it back to default field
                this.props.form.resetFields();
                this.props.form.validateFields();
            }
        );

    }

    handleThumbsUp = (e) => {
        let newItem = {
            text: 'thumbs up',
            user: 'user',
            id: Date.now(),
            customData: { thumbs: 'like-o' }
        };

        // store the latest info into my state
        this.props.onMsgStore(newItem);

        // need to inform server about msg has sent
        this.props.onAPIAICall('thumbs-up');
    }

    handleThumbsDown = (e) => {
        let newItem = {
            text: 'thumbs down',
            user: 'user',
            id: Date.now(),
            customData: { thumbs: 'dislike-o' }
        };

        // store the latest info into my state
        this.props.onMsgStore(newItem);

        // need to inform server about msg has sent
        this.props.onAPIAICall('thumbs-down');
    }

    render() {

        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        
        // Only show error after a field is touched.
        const MsgError = isFieldTouched('Message') && getFieldError('Message');

        const MenuItem = (
            <Menu>
                <Menu.Item>
                    <ImageUpload onImageUpload={this.props.onMsgStore} onImageUploadToAnalyse={this.props.onImageUploadToAnalyse} />
                </Menu.Item>
                <Menu.Item>
                    <Icon type="sound" style={{ fontSize: 16, marginRight: 5 }} onClick={() => { console.log('VoiceClick') }} /> Voice Input
                </Menu.Item>
            </Menu>
        );

        return(
            <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark={true}>

                <Row className="MainControl" type='flex' align="top">

                    <Col span={21}>
                        <FormItem validateStatus={MsgError ? 'validating' : ''} help={MsgError || ''}>
                            {
                                getFieldDecorator('Message', {
                                    rules: [{ 
                                        required: true,
                                        whitespace: true ,
                                        max: 50
                                    }],

                                })(
                                    <Input 
                                        placeholder="Type here . . ."
                                        size="large"
                                        prefix={
                                            <Dropdown overlay={MenuItem}>
                                                <Icon type="paper-clip" onClick={() => { console.log('Utilities Click') }} />
                                            </Dropdown>
                                        }
                                        suffix={
                                            <div>

                                                <Tooltip title="Thumbs Up">
                                                    <Icon type="like-o" style={{ fontSize: 16, marginRight: 10 }} onClick={this.handleThumbsUp} />
                                                </Tooltip>

                                                <Tooltip title="Thumbs Down">
                                                    <Icon type="dislike-o" style={{ fontSize: 16, marginRight: 10 }} onClick={this.handleThumbsDown} />
                                                </Tooltip>

                                            </div>
                                        }
                                    />
                                )
                            }
                        </FormItem>
                    </Col>

                    <Col span={1}>
                    </Col>

                    <Col span={2}>
                        <FormItem>
                            <Tooltip title="Send">
                                <Button 
                                type="primary" 
                                htmlType="submit" 
                                shape="circle"
                                size="large"
                                icon="enter"
                                disabled={hasErrors(getFieldsError())}></Button>
                            </Tooltip>
                        </FormItem>
                    </Col>

                </Row>

            </Form>
        );
        
    }

}

const WrappedUserMsgForm = Form.create({onFieldsChange})(UserMsgForm);

export default WrappedUserMsgForm;