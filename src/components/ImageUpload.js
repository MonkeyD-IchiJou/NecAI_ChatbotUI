import React, { Component } from 'react';
import { Icon, Tooltip } from 'antd';
import './css/App.css';

class ImageUpload extends Component {

    constructor(props) {
        super(props);
        this.state = {file: '',imagePreviewUrl: ''};
    }

    handleImageSubmit = (e) => {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.target.files[0];

        reader.onloadend = () => {

            this.setState({
                file: file,
                imagePreviewUrl: reader.result
            });

            var newItem = {
                text: file.name,
                user: 'user',
                id: Date.now(),
                customData: {imagePreviewUrl: reader.result}
            };

            // store the latest info into my state
            this.props.onImageUpload(newItem);

            // send to server to evaluate
            let newresult = reader.result.split(',')[1];
            this.props.onImageUploadToAnalyse(newresult);
        }

        reader.readAsDataURL(file)
    }

    render() {
        return(
            <Tooltip title="Upload Image">
                <input type="file" name="file" id="file" className="inputfile" accept="image/*" onChange={(e) => { this.handleImageSubmit(e) }} />
                <label htmlFor="file">
                    <Icon type="camera-o" style={{ fontSize: 16, marginRight: 10 }} />Image Upload
                </label>
            </Tooltip>
        );
    }
}

export default ImageUpload;