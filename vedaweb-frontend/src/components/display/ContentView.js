import React, { Component } from "react";
import { Row, Col, Affix, Spin, Icon, Drawer, Badge, Modal, Button } from 'antd';

import ContentLocation from "./ContentLocation";
import ContentFilterSwitch from "./ContentFilterSwitch";
import ErrorMessage from "../errors/ErrorMessage";

import "./ContentView.css";

import { withRouter } from 'react-router-dom';

import { view } from 'react-easy-state';

import scrollToComponent from 'react-scroll-to-component';

import axios from 'axios';
import stateStore from "../../stateStore";
import DictionaryView from "./DictionaryView";
import HelpButton from "../widgets/HelpButton";
import BetaInfoContent from "../static/BetaInfoContent";
import ExportDrawer from "../widgets/ExportDrawer";
import ExportButton from "../widgets/ExportButton";



class ContentView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            data: {},
            isLoaded: false,
            filtersVisible: false,
            exportVisible: false,
            condensedView: false,
            showMetricalData: false,
            controlsAffixed: false,
        }
    }

    componentDidMount() {
        if (!this.props.match.params.by || !this.props.match.params.value){
            this.props.history.replace("/view/index/0");
        } else {
            this.loadData(this.props.match.params.by, this.props.match.params.value);
        }
        window.scrollTo(0, 0);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.match.params.by) {
            this.props.history.replace("/view/index/0");
        } else if (JSON.stringify(this.props.match.params) !== JSON.stringify(prevProps.match.params)){
            this.loadData(this.props.match.params.by, this.props.match.params.value);
        }
    }

    propsChanged(newProps){
        return JSON.stringify(this.props) !== JSON.stringify(newProps);
    }

    loadData(by, value){
        this.setState({
            isLoaded: false,
            error: undefined,
        });

        axios.get(process.env.PUBLIC_URL + "/api/document/" + by + "/" + value)
            .then((response) => {
                this.setState({
                    isLoaded: true,
                    data: response.data
                });
                //set page title
                document.title = "VedaWeb | " +
                    ((response.data.id !== undefined)
                        ? "Stanza " + response.data.book + "." + response.data.hymn + "." + response.data.stanza
                            + " | " + response.data.hymnGroup
                        : " Rigveda online");
            })
            .catch((error) => {
                this.setState({
                    isLoaded: true,
                    error: error
                });
            });
    }

    filterChange(target, show){
        if (show) stateStore.ui.viewScrollTo = true;
        stateStore.ui.toggleLayer(target, show);
    }

    scrollTo(component){
        if (stateStore.ui.viewScrollTo){
            scrollToComponent(component, {align:'middle'});
            stateStore.ui.viewScrollTo = false;
        }
    }

    resolveAbbrevationToHTML(abb, cat){
        return abb.split('').map((key, i) => (
            <span key={"abb_" + i}>
                <span className="bold secondary-font">{key}</span>
                <span> ({stateStore.ui.abbreviations[cat][key]}) </span>
            </span>
        ));
    }

    cleanLemmaString(lemma){
        if (typeof lemma === 'string' || lemma instanceof String){
            lemma = lemma.replace(/\s?\d/g,'');
            if (lemma.startsWith('\u221A') && lemma.charAt(lemma.length - 1) === '-'){
                lemma = lemma.substr(0, lemma.length - 1);
            }
        }
        return lemma.trim();
    }

    capitalize(string) {
        string = string.toLowerCase();
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    render() {

        const { error, isLoaded, data, condensedView, showMetricalData } = this.state;

        return (
            <Spin
            size="large"
            delay={200}
            spinning={!isLoaded} >

                <div className="page-content">

                    {/** ERROR **/}
                    { isLoaded && error !== undefined &&
                        <ErrorMessage/>
                    }

                    <Affix
                    offsetTop={0}
                    onChange={(affixed) => this.setState({controlsAffixed: affixed})}>

                        <div
                        className="content-center"
                        style={{
                            position: 'relative',
                            top: this.state.controlsAffixed ? -2 : 0
                        }}>

                            <div
                            className={"v-middle" + (this.state.controlsAffixed ? " box-shadow" : "")}
                            style={{
                                display: 'inline-block',
                                padding: '1.2rem',
                                background: this.state.controlsAffixed ? '#fff' : 'transparent',
                                border: this.state.controlsAffixed ? '1px solid #b4b1ae' : 'none',
                                borderTop: 'none',
                                borderRadius: '3px'
                            }}>

                                {/** CONTENT NAVIGATOR **/}
                                { data.book !== undefined &&
                                    <ContentLocation
                                    key={'loc_' + data.id}
                                    currIndex={data.index}
                                    currId={data.id}
                                    book={data.book}
                                    hymn={data.hymn}
                                    stanza={data.stanza}
                                    hymnAbs={data.hymnAbs} />
                                }
                                
                                {/** TOOLS BUTTON: TOGGLE CONTENT */}
                                <Button
                                type="default"
                                icon="eye"
                                size="large"
                                title="Show view selectors"
                                onClick={() => this.setState({filtersVisible: true})}
                                style={{marginLeft: '2.4rem'}}
                                data-tour-id="toggle-content">
                                    <Badge
                                    showZero
                                    style={{backgroundColor:'#605a5a'}}
                                    offset={[15,-5]}
                                    count={stateStore.ui.layers.filter(l => l.id.endsWith('_') && l.show).length}>
                                        Toggle content
                                    </Badge>
                                </Button>

                                {/** TOOLS BUTTON: TOGGLE CONDENSED VIEW */}
                                <Button
                                type="default"
                                icon={condensedView ? "colum-height" : "vertical-align-middle"}
                                size="large"
                                title="Toggle condensed reading view"
                                onClick={() => this.setState({condensedView: !condensedView})}
                                style={{marginLeft: '1rem'}}
                                data-tour-id="toggle-condensed view">
                                    {condensedView ? "Full size view" : "Condensed view"}
                                </Button>

                                {/** TOOLS BUTTON: EXPORT */}
                                <Button
                                type="default"
                                icon="export"
                                size="large"
                                title="Show export options"
                                onClick={() => this.setState({exportVisible: true})}
                                style={{marginLeft: '1rem'}}
                                data-tour-id="toggle-export">
                                    Export
                                </Button>

                            </div>
                        </div>
                    </Affix>

                    {/** LOADED, NO ERROR **/}
                    { error === undefined &&
                        <Row>
                            {/** CONTENT **/}
                            <Col>

                                { data.versions !== undefined &&
                                    <div>

                                        {/** STANZA PROPERTIES **/}
                                        {stateStore.ui.isLayerVisible('stanzaProperties_') &&
                                            <div
                                            className="glossing content-block card"
                                            ref={this.scrollTo}>
                                                <h1>Stanza Properties</h1>

                                                {/** STANZA META 1 */}
                                                <div style={{display:"inline-block", whiteSpace:"nowrap", marginRight:"1rem"}}>
                                                    {/** # / ADR / GROUP */}
                                                    <span className="bold">Hymn #: </span>
                                                    <span className="text-font">{data.hymnAbs}</span><br/>
                                                    <span className="bold">Hymn addressee: </span>
                                                    <span className="text-font">{data.hymnAddressee}</span><br/>
                                                    <span className="bold">Hymn group: </span>
                                                    <span className="text-font">{data.hymnGroup}</span><br/>
                                                    {/** STRATA */}
                                                    <span
                                                    className="bold"
                                                    title="Arnold, Edward Vernon. 'Sketch of the Historical Grammar of the Rig and Atharva Vedas'.
                                                    Journal of the American Oriental Society 18 (1897): 203–352.">Strata:&nbsp;</span>
                                                    {data.strata}
                                                    <HelpButton inline style={{marginLeft:".5rem"}} type="metaStrata"/>
                                                </div>

                                                {/** STANZA META 2: PADA LABELS */}
                                                <div className="gap-left-big" style={{display:"inline-block", whiteSpace:"nowrap"}}>
                                                    <span
                                                    title="provided by D. Gunkel and K. Ryan"
                                                    className="bold gap-right">
                                                        Pada Labels
                                                    </span>
                                                    <HelpButton inline type="metaLabels"/>
                                                    {data.padas.map(pada => (
                                                        <div key={pada.index}>
                                                            <div style={{display:"inline-block", verticalAlign:"top"}} className="bold red gap-right">{pada.id}:</div>
                                                            <div style={{display:"inline-block", verticalAlign:"top"}} className="text-font">{pada.label.split('').join(', ')}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        }

                                        {/** TEXT VERSIONS & TRANSLATIONS **/}
                                        {(stateStore.ui.isLayerVisible('version_') || stateStore.ui.isLayerVisible('translation_')) &&
                                            <div
                                            className="content-plain content-block card"
                                            ref={this.scrollTo}>

                                                <h1 className="inline-block">
                                                    {stateStore.ui.isLayerVisible('version_') && "Text Versions"}
                                                    {stateStore.ui.isLayerVisible('version_') && stateStore.ui.isLayerVisible('translation_') && " & "}
                                                    {stateStore.ui.isLayerVisible('translation_') && "Translations"}
                                                </h1>

                                                { stateStore.ui.isLayerVisible('version_') && !condensedView &&
                                                    <div
                                                    className="font-small light-grey bottom-gap gap-left-big"
                                                    onClick={() => this.setState({showMetricalData: !this.state.showMetricalData})}
                                                    style={{cursor: "pointer", display: "inline-block"}}>
                                                        <Icon
                                                        type={showMetricalData ? "eye-invisible" : "eye"}
                                                        className="gap-right"/>
                                                        {showMetricalData ? "hide" : "show"} available metrical data
                                                    </div>
                                                }

                                                {stateStore.ui.layers.filter(l => l.id.startsWith('version_')
                                                    && l.id !== 'version_' && l.show).map(version => {
                                                        let v = data.versions.find(x => x.id === version.id);
                                                        return v === undefined ? "" :
                                                            <div
                                                            key={"v_" + v.id}
                                                            className="translation"
                                                            ref={this.scrollTo}>

                                                                <span
                                                                className="bold gap-right"
                                                                style={{display: condensedView ? "none" : "inline"}}>
                                                                    {version.label}
                                                                    <HelpButton inline iconStyle={{marginLeft: ".5rem"}} type={v.id}/>
                                                                </span>

                                                                <div
                                                                className={(v.language === "deva" ? "deva-font" : "text-font")}
                                                                style={{
                                                                    display: condensedView ? "inline-block" : "block",
                                                                    paddingLeft: condensedView ? 0 : "1rem"
                                                                }}>
                                                                    {v.form.map((line, i) => (
                                                                        <div
                                                                        key={"version_" + i}
                                                                        style={{display: condensedView ? "inline-block" : "block"}}>
                                                                            {v.applyKeys && !condensedView ?
                                                                                <span className="red gap-right">{String.fromCharCode(i + 97)} </span>
                                                                                : ''
                                                                            }

                                                                            {line}&nbsp;

                                                                            { showMetricalData && !condensedView && v.metricalData && 
                                                                                <span className="font-small gap-left-big light-grey main-font">
                                                                                {v.metricalData[i].replace(/L/ig,"—").replace(/S/ig,"◡").replace(/ /ig,"\u3000") + "\u3000" +
                                                                                "(" + v.metricalData[i].replace(/ /ig,"").length + ")"}
                                                                                </span>
                                                                            }
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div
                                                                className="gap-left font-small text-font-i light-grey"
                                                                style={{display: condensedView ? "block" : "none"}}>
                                                                    &mdash;&nbsp;{version.label}
                                                                </div>
                                                            </div>
                                                })}

                                                {stateStore.ui.layers.filter(l => l.id.startsWith('translation_')
                                                    && l.id !== 'translation_'
                                                    && stateStore.ui.isLayerVisible(l.id)).map(l => {
                                                        let t = data.versions.find(x => x.id === l.id);
                                                        return t === undefined ? "" :
                                                            <div
                                                            key={"t_" + t.source}
                                                            className="translation"
                                                            ref={this.scrollTo}
                                                            style={{display: condensedView ? "inline-block" : "block"}}>

                                                                <span
                                                                style={{display: condensedView ? "none" : "inline"}}>
                                                                    <span className="bold">{t.source}</span>
                                                                    ({t.language})
                                                                    <HelpButton inline iconStyle={{marginLeft: ".5rem"}} type={t.id}/>
                                                                </span>

                                                                {/* <span className="bold">{t.source} </span>({t.language})
                                                                <HelpButton inline type={l.id} style={{marginLeft:'.5rem'}}/> */}

                                                                <div
                                                                className="text-font"
                                                                style={{
                                                                    display: condensedView ? "inline-block" : "block",
                                                                    paddingLeft: condensedView ? 0 : "1rem"
                                                                }}>
                                                                    {t.form.map((line, i) => (
                                                                        <div
                                                                        key={"trans_" + i}
                                                                        style={{display: condensedView ? "inline-block" : "block"}}>
                                                                            {line}&nbsp;
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div
                                                                className="gap-left font-small text-font-i light-grey"
                                                                style={{display: condensedView ? "block" : "none"}}>
                                                                    &mdash;&nbsp;{t.source} ({t.language})
                                                                </div>
                                                            </div>
                                                })}
                                            </div>
                                        }

                                        {/** TRANSLATIONS
                                        {stateStore.ui.isLayerVisible('translation_')
                                            && data.versions.filter(v => (
                                                v.id.startsWith('translation_') && stateStore.ui.isLayerVisible(v.id))
                                            ).length > 0 &&

                                            <div
                                            className="content-plain content-block card"
                                            ref={this.scrollTo}>
                                                <h1>Translations</h1>

                                                {stateStore.ui.layers.filter(
                                                    l => l.id.startsWith('translation_')
                                                    && l.id !== 'translation_'
                                                    && stateStore.ui.isLayerVisible(l.id)).map(l => {
                                                        let translation = data.versions.find(v => v.id === l.id);
                                                        return translation === undefined ? "" :
                                                        <div
                                                        key={"t_" + translation.source}
                                                        className="translation"
                                                        ref={this.scrollTo}
                                                        style={{display: condensedView ? "inline-block" : "block"}}>
                                                            <span className="bold">{translation.source} </span>({translation.language})
                                                            <HelpButton inline type={l.id} style={{marginLeft:'.5rem'}}/>
                                                            <div
                                                            className="text-font gap-left"
                                                            style={{display: condensedView ? "inline-block" : "block"}}>
                                                                {translation.form.map((line, i) => (
                                                                    <div
                                                                    key={"trans_" + i}
                                                                    style={{display: condensedView ? "inline-block" : "block"}}>
                                                                        {line}&nbsp;
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                })}
                                            </div>
                                        }
                                        **/}

                                        {/** METRICAL DATA **/}
                                        {/** 
                                        {stateStore.ui.isLayerVisible('metricaldata_')
                                            && data.metricalData &&
                                            <div
                                            className="content-plain content-block card"
                                            ref={this.scrollTo}>
                                                <h1>
                                                    Metrical Data (experimental)&#12288;
                                                    <span className="font-small grey">
                                                        — long &#12288; ◡ short { !condensedView && "\u3000 (n) syllables" }
                                                    </span>
                                                </h1>

                                                {data.metricalData.map((line, i) => (
                                                    <div
                                                    key={"metricalData_" + i}
                                                    style={{display: condensedView ? "inline-block" : "block"}}>
                                                        {line.replace(/L/ig,"—").replace(/S/ig,"◡").replace(/ /ig,"\u3000") + "\u3000"}
                                                        {!condensedView && "(" + line.replace(/ /ig,"").length + ")"}
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                            **/}

                                        {/** GLOSSINGS **/}
                                        {stateStore.ui.isLayerVisible('glossing_') &&
                                            <div
                                            className="glossing content-block card"
                                            ref={this.scrollTo}>
                                                <h1>
                                                    Morphological Glossing
                                                    <HelpButton type="zurichGlossing" inline style={{marginLeft:'.5rem'}}/>

                                                    {/** GLOSSINGS EXPORT HTML TABLE **/}
                                                    <ExportButton
                                                    buttonType="secondary"
                                                    text="Export HTML table"
                                                    title="Export glossings as HTML table"
                                                    reqUrl={process.env.PUBLIC_URL + "/api/export/glossings/" + this.state.data.id + "/html"}
                                                    fileName={"VedaWeb-" + this.state.data.id + "-glossings.html"}
                                                    style={{marginLeft:"1rem", float:"right"}} />

                                                    {/** GLOSSINGS EXPORT ALIGNED **/}
                                                    <ExportButton
                                                    buttonType="secondary"
                                                    text="Export tab-aligned"
                                                    title="Export glossings in tab-aligned format"
                                                    reqUrl={process.env.PUBLIC_URL + "/api/export/glossings/" + this.state.data.id + "/txt"}
                                                    fileName={"VedaWeb-" + this.state.data.id + "-glossings.txt"}
                                                    style={{marginLeft:"1rem", float:"right"}} />
                                                </h1>

                                                {data.padas.map(pada => (
                                                    <div
                                                    className="glossing-line"
                                                    key={"p_" + pada.index}
                                                    style={{display: condensedView ? "inline-block" : "block"}}>

                                                        <span
                                                        key={"p_gloss_line" + pada.index}
                                                        className="pada-line text-font"
                                                        style={{display: condensedView ? "none" : "inlie-block"}}>
                                                            {pada.id}
                                                        </span>

                                                        {pada.grammarData.map(token => (
                                                            <div
                                                            className="glossing-token"
                                                            key={"t_" + token.index}>
                                                                <span className="text-font-i">{token.form}</span>
                                                                <br/>
                                                                <div className="glossing-annotation text-font">
                                                                    {this.cleanLemmaString(token.lemma)}
                                                                    {
                                                                        stateStore.ui.search.grammar.tagsOrder
                                                                            .filter(tag => token.props[tag] !== undefined)
                                                                            .map(tag => (
                                                                                tag !== "lemma type" && tag !== "position" &&
                                                                                <span key={"t_" + token.index + "_" + tag} className="glossing-annotation-tags">
                                                                                    .{this.capitalize(token.props[tag])}
                                                                                </span>
                                                                            ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        ))}

                                                    </div>
                                                ))}
                                            </div>
                                        }

                                        {/** DICTIONARIES **/}
                                        {stateStore.ui.isLayerVisible('dictionaries_') &&
                                            <div
                                            className="glossing content-block card"
                                            ref={this.scrollTo}>
                                                <h1>Dictionaries</h1>
                                                <DictionaryView
                                                key={'dict_' + data.id}
                                                data={data.padas}
                                                history={this.props.history}
                                                stanzaId={data.id}/>
                                            </div>
                                        }

                                    </div>
                                }
                            </Col>
                        </Row>
                    }

                    <Drawer
                    title={<h1 style={{marginBottom:'0'}}><Icon type="eye" className="gap-right"/> Toggle Content</h1>}
                    placement="right"
                    width="auto"
                    closable={true}
                    onClose={() => this.setState({filtersVisible: false})}
                    visible={this.state.filtersVisible} >

                        {/* LAYER SWITCHES */}
                        { data.versions !== undefined && stateStore.ui.layers.map(l => (
                            <ContentFilterSwitch
                            key={'switch_' + l.id}
                            label={l.label}
                            size={l.id.endsWith('_') ? "default" : "small"}
                            disabled={!l.id.endsWith('_') && data.versions.find(v => v.id === l.id) === undefined}
                            checked={l.show}
                            onChange={(e) => this.filterChange(l.id, e)} />
                        )) }

                    </Drawer>

                    {/** EXPORT */}
                    <ExportDrawer
                    docId={this.state.data.id}
                    onClose={() => this.setState({exportVisible: false})}
                    visible={this.state.exportVisible}
                    layers={[
                        stateStore.ui.layers
                            .filter(l => l.show && !l.id.endsWith("_"))
                            .map(l => ( {id: l.id, label: l.label} ))
                    ]} />

                </div>

                {/** BETA INFO MODAL */}
                <Modal
                visible={stateStore.settings.firstVisit}
                title={null}
                centered
                maskClosable={true}
                onCancel={() => stateStore.settings.firstVisit = false}
                onOk={() => stateStore.settings.firstVisit = false}
                footer={null}>
                    <BetaInfoContent/>
                </Modal>

            </Spin>
        );
    }
}

export default withRouter(view(ContentView));