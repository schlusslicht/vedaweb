import React, { Component } from "react";
import { Row, Col, Button, Icon, Tabs } from 'antd';

import SearchAdvanced from "./SearchAdvanced";
import SearchScope from "./SearchScope";
import SearchTransliteration from "./SearchTransliteration";

import './css/SearchView.css';

import { view } from 'react-easy-state';

import searchMetaStore from "./stores/searchMetaStore";

const TabPane = Tabs.TabPane;

class SearchView extends Component {

    constructor(props){
        super(props);
        this.switchMode = this.switchMode.bind(this);
    }

    switchMode(key){
        if (key !== "help")
            searchMetaStore.mode = key;
    }


    render() {

        const helpText = <div className="search-container">
            <h4>VedaVeb Search Modes</h4>
            This document describes the holy search modes as they were handed down for generations.<br/>There is a simple one and a more complex one. Choose from your options wisely.<br/>If these enlightened words are not verbose enough for you, please feel free to call our hotline:<br/>+49 221 S-A-N-S-K-R-I-T
        </div>;

        return (

            <Row
            className="search-view page-content"
            type="flex"
            justify="center">

                <Col
                span={12}
                id="search-view"
                key="search-view">

                    <div className="top-gap card-nobox">
                        <h4>Advanced Search</h4>
                        
                        <SearchTransliteration/>
                        <hr/>
                        <SearchScope/>
                        <hr/>
                        
                        
                        <div className="bold bottom-gap">
                            <Icon type="search" className="gap-right"/>
                            What are you searching for?
                        </div>
                        
                        <Tabs
                        onChange={this.switchMode}
                        type="card"
                        id="search-mode-selector"
                        tabBarGutter={8}>
                            <TabPane tab="Grammar Search" key="advanced">
                                <SearchAdvanced />
                            </TabPane>
                            <TabPane tab="Other Search" key="somemode">
                                <div className="search-container">
                                Some other search mode...
                                </div>
                            </TabPane>
                            <TabPane tab={<Icon type="question"/>} key="help">
                                {helpText}
                            </TabPane>
                        </Tabs>

                        <Row>
                            <Col span={12} className="content-left">
                                {/* <Button icon="cross" size="large" onClick={this.props.onClose}>Close</Button> */}
                            </Col>
                            <Col span={12} className="content-right">
                                <Button icon="search" size="large">Search</Button>
                            </Col>
                        </Row>
                    </div>
                </Col>  

            </Row>
        );

    }

}

export default view(SearchView);