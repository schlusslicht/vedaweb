import React, { Component } from "react";
import { Row, Col, Button, Icon, Select } from 'antd';

import './SearchField.css';

const Option = Select.Option;

class SearchField extends Component {


    /**
     * STATE:
     * fieldName = field
     * fieldValue = value
     */

    constructor(props){
        super(props);

        //TODO: change defaults
        this.state = {
            fieldName: null,
            fieldValue: null,
            fieldNameOptions: [{ text: 'Case', value: 'casus' },{ text: 'Mode', value: 'modus' }],
            fieldValueOptions: [],
            isLoaded: true
        };

        this.onRemove = this.onRemove.bind(this);
    }

    onChangeFieldName(value){

        this.setState({
            isLoaded: false,
            fieldName: value.value
        });
        
        fetch("/data/grammar/" + value.value)
        .then(res => res.json())
        .then(
            (result) => {

            var valueOptions = result.values.map(function(val) {
                return {
                    text: val,
                    value: val
                };
            });

            this.setState({
                isLoaded: true,
                fieldValueOptions: valueOptions
            });
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
            this.setState({
                isLoaded: true,
                error
            });
            }
        )
    }

    onRemove(e){
        this.props.onClickRemove(this);
    }

    render() {

        return (
            
            <Row
            type="flex"
            align="middle"
            gutter={8}
            className="search-field">

                <Col span={2} className="block-number">
                    { this.props.isFirstField &&
                        <Icon type="search" />
                    }
                </Col>

                <Col span={9}>
                    <Select
                    showSearch
                    placeholder="Attribute..."
                    onChange={(e,{value})=>this.onChangeFieldName({value})}
                    style={{ width: '98%' }} >
                        {this.state.fieldNameOptions.map((option, i) => (
                            <Option
                                key={i.toString(36) + i}
                                value={option.value}>
                                    {option.text}
                            </Option>
                        ))}
                    </Select>
                </Col>

                <Col span={9}>
                    <Select
                    showSearch
                    placeholder="Value..."
                    onChange={(e,{value})=>this.setState({fieldValue: value})}
                    disabled = {this.state.fieldValueOptions.length === 0}
                    style={{ width: '98%' }} >
                        {this.state.fieldValueOptions.map((option, i) => (
                            <Option
                                key={i.toString(36) + i}
                                value={option.value}>
                                    {option.text}
                            </Option>
                        ))}
                    </Select>
                </Col>

                <Col span={2} className="col-content-right">
                    <Button
                    disabled={!this.props.isRemovable}
                    ghost={!this.props.isRemovable}
                    onClick={this.onRemove}
                    shape="circle"
                    icon="minus" />
                </Col>

                <Col span={2} className="col-content-right">
                    <Button
                    onClick={this.props.onClickAdd}
                    disabled={!this.props.isLastField}
                    className={!this.props.isLastField ? "hidden-button" : ""}
                    shape="circle"
                    icon="plus" />
                </Col>

            </Row>

        );
    }
}

export default SearchField;