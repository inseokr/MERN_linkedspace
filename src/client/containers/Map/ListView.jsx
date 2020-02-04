import React, { Component } from 'react';
import './ListView.css';
import clsx from 'clsx';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import styles from './ListView.css';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import List from 'react-virtualized/dist/es/List';


class ListView extends Component {
    static contextTypes = {
        list: PropTypes.instanceOf(Immutable.List).isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            listHeight: 300,
            listRowHeight: 70,
            rowCount: props.testList.length,
            scrollToIndex: undefined,
            useDynamicRowHeight: false,
        };

        this._getRowHeight = this._getRowHeight.bind(this);
        this._noRowsRenderer = this._noRowsRenderer.bind(this);
        this._rowRenderer = this._rowRenderer.bind(this);
        this._selectListEntry = this._selectListEntry.bind(this);
    }

    render() {
        const {listHeight, listRowHeight, rowCount, scrollToIndex, useDynamicRowHeight} = this.state;

        return (
            <AutoSizer>
                {({width}) => (
                    <List
                        style = {{height: "100vh"}}
                        ref="List"
                        className={styles.List}
                        height={listHeight}
                        autoHeight
                        noRowsRenderer={this._noRowsRenderer}
                        rowCount={rowCount}
                        rowHeight={
                            useDynamicRowHeight ? this._getRowHeight : listRowHeight
                        }
                        rowRenderer={this._rowRenderer}
                        scrollToIndex={scrollToIndex}
                        width={width}
                    />
                )}
            </AutoSizer>
        );
    }

    _getDatum(index) {
        const {testList} = this.props;
        return testList[index % testList.length];
    }

    _getRowHeight({index}) {
        return this._getDatum(index).address.length;
    }

    _noRowsRenderer() {
        return <div className={styles.noRows}>No rows</div>;
    }

    _rowRenderer({index, isScrolling, key, style}) {
        const {showScrollingPlaceholder, useDynamicRowHeight} = this.state;

        if (showScrollingPlaceholder && isScrolling) {
            return (
                <div
                    className={clsx(styles.row, styles.isScrollingPlaceholder)}
                    key={key}
                    style={style}>
                    Scrolling...
                </div>
            );
        }

        const datum = this._getDatum(index);

        let additionalContent;

        if (useDynamicRowHeight) {
            switch (datum.size) {
                case 75:
                    additionalContent = <div>It is medium-sized.</div>;
                    break;
                case 100:
                    additionalContent = (
                        <div>
                            It is large-sized.<br />It has a 3rd row.
                        </div>
                    );
                    break;
            }
        }

        return (
            <div className={styles.row} key={key} style={style}>
                <div onClick={this._selectListEntry.bind(this, index)}>
                    <div className={styles.address}>{datum.address}</div>
                    <div className={styles.address}>{datum.price}</div>
                    <div className={styles.address}>{datum.duration}</div>
                    {additionalContent}
                </div>
                {useDynamicRowHeight && (
                    <span className={styles.height}>{datum.size}px</span>
                )}
            </div>
        );
    }

    _selectListEntry(index) {
        const {smoothZoom, updateCenter, toggleListingInfo} = this.props;
        const listing = this._getDatum(index);
        toggleListingInfo();
        // updateCenter(listing);
        // console.log(listing);
        // smoothZoom();
    }
}

export default ListView
