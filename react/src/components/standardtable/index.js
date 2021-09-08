import React, { PureComponent, Fragment } from 'react';
import { Table, Alert, Button, Tooltip, Row, Col, Modal, Checkbox, Spin } from 'antd';
import { requestFlowUserInfo } from '../../actions/common/flow/action';
import { getTableColumns, saveTableColumns } from '../../actions/common/module/action';
import _ from 'lodash/core';
import includes from 'lodash/includes';
import cloneDeep from 'lodash/cloneDeep';
import divide from 'lodash/divide';
import findIndex from 'lodash/findIndex';
import { connect } from 'react-redux';
import styles from './index.module.less';

function initTotalList(columns) {
  const totalList = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

class StandardTable extends PureComponent {
  constructor(props) {
    super(props);
    const { columns } = props;
    const needTotalList = initTotalList(columns);

    this.state = {
      forceState: false,
      selectedRowKeys: props.rowSelection && props.rowSelection.selectedRowKeys || [],
      needTotalList,
      columnModalVisible: false,
      tempStateColumns: props.columns || [],
      stateColumns: props.columns || [],
      maxColNum: props.maxColNum || 0,
      configCheckLoading: false,
      confirmLoading: false
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // clean state
    if (_.isEmpty(nextProps.rowSelection)) {
      return null;
    } else {
      if (_.isEmpty(nextProps.rowSelection.selectedRowKeys)) {
        if (prevState.forceState === true) {
          return {
            ...prevState,
            forceState: false
          };
        } else {
          const needTotalList = initTotalList(nextProps.columns);
          return {
            selectedRowKeys: [],
            needTotalList,
          };
        }
      } else if (nextProps.rowSelection.type === 'radio') {
        if (prevState.forceState === true) {
          return {
            ...prevState,
            forceState: false
          };
        } else {
          return {
            ...prevState,
            forceState: false,
            selectedRowKeys: nextProps.rowSelection.selectedRowKeys
          };
        }
      }
    }
    return null;
  }

  selectRow = (record) => {
    let { onSelectRow, data: { list }, rowSelection, rowKey = 'key' } = this.props;
    let selectedRowKeys = [...this.state.selectedRowKeys];
    if (rowSelection) {
      if (rowSelection.type === 'radio') {
        selectedRowKeys = [];
        selectedRowKeys.push(record[rowKey]);
      } else {
        if (selectedRowKeys.indexOf(record[rowKey]) >= 0) {
          selectedRowKeys.splice(selectedRowKeys.indexOf(record[rowKey]), 1);
        } else {
          selectedRowKeys.push(record[rowKey]);
        }
      }
    }

    let selectedRows = _.filter(list, (item) => {
      return includes(selectedRowKeys, item[rowKey]);
    });
    if (onSelectRow) {
      onSelectRow(selectedRows);
    }

    this.setState({
      selectedRowKeys,
      forceState: true
    });
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    let { needTotalList } = this.state;
    needTotalList = needTotalList.map(item => ({
      ...item,
      total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex], 10), 0),
    }));
    const { onSelectRow } = this.props;
    if (onSelectRow) {
      onSelectRow(selectedRows);
    }

    this.setState({
      forceState: true,
      selectedRowKeys,
      needTotalList
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  };

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  };

  /** 在弹出框中动态配置表格显示的列名 === Begin */
  openColumnModal = () => {
    let { dispatch, pageId, columns } = this.props;
    this.setState({ columnModalVisible: true, configCheckLoading: true });
    dispatch(requestFlowUserInfo({}, (userData) => {
      let userId = userData.drafterCode;
      dispatch(getTableColumns({ userId, pageId }, (colData) => {
        let stateColumns = JSON.parse(colData.columns);
        if (_.isEmpty(stateColumns)) {
          stateColumns = cloneDeep(columns);
        }
        this.setState({
          stateColumns,
          tempStateColumns: stateColumns,
          configCheckLoading: false
        });
      }));
    }));
  }

  closeColumnModal = () => {
    let stateColumns = [...this.state.stateColumns];
    this.setState({
      columnModalVisible: false,
      tempStateColumns: stateColumns
    });
  }

  saveColumns = () => {
    let { dispatch, pageId } = this.props;
    let { tempStateColumns, confirmLoading } = this.state;
    if (confirmLoading) {
      return;
    }

    this.setState({
      confirmLoading: true
    });

    let colNum = _.filter(tempStateColumns, (col) => {
      return col.selected === true;
    }).length;

    _.each(tempStateColumns, (tempCol) => {
      tempCol.width = `${divide(100, colNum)}%`;
    });

    dispatch(requestFlowUserInfo({}, (userData) => {
      let userId = userData.drafterCode;
      let params = { pageId, userId, columns: JSON.stringify(tempStateColumns) };
      dispatch(saveTableColumns(params, () => {
        this.setState({
          columnModalVisible: false,
          stateColumns: tempStateColumns,
          confirmLoading: false
        });
      }));
    }))
  }

  onColumnsCheck = (checkedValues) => {
    let { showSetting, maxColNum } = this.props;
    if (showSetting) {
      let stateColumns = cloneDeep(this.state.stateColumns);
      _.each(stateColumns, (col) => {
        if (includes(checkedValues, col.dataIndex || col.key)) {
          col.selected = true;
        } else {
          col.selected = false;
        }
      });

      if (checkedValues.length >= maxColNum) {
        _.each(stateColumns, (col) => {
          if (!col.selected) {
            col.disabled = true;
          }
        });
      } else {
        _.each(stateColumns, (col) => {
          col.disabled = false;
        });
      }
      this.setState({
        tempStateColumns: stateColumns
      });
    }
  }
  /** 在弹出框中动态配置表格显示的列名 === End */

  componentDidMount() {
    let { dispatch, pageId, showSetting } = this.props;
    if (!!showSetting) {
      dispatch(requestFlowUserInfo({}, (userData) => {
        let userId = userData.drafterCode;
        dispatch(getTableColumns({ userId, pageId }, (colData) => {
          let stateColumns = JSON.parse(colData.columns);
          this.setState({
            stateColumns,
            tempStateColumns: stateColumns
          });
        }));
      }));
    }
  }

  render() {
    let { selectedRowKeys, needTotalList, columnModalVisible, stateColumns = [], tempStateColumns = [],
      maxColNum, configCheckLoading, confirmLoading } = this.state;
    let { data = {}, rowKey, rowSelection, showTotal, showSetting, columns = [], ...rest } = this.props;
    let { list = [], pagination } = data;

    maxColNum = maxColNum || stateColumns.length;

    let paginationProps = pagination === false
      ? false : {
        showSizeChanger: true,
        showQuickJumper: true,
        ...pagination,
      };

    let rowSelectionProps = !!rowSelection === false
      ? null : {
        ...rowSelection,
        selectedRowKeys,
        onChange: this.handleRowSelectChange,
        getCheckboxProps: record => ({
          disabled: record.disabled,
        })
      };

    let allColumns = !!showSetting && !_.isEmpty(stateColumns) ? stateColumns : columns,
      finalCheckedColumns = _.filter(allColumns, (col) => {
        return col.selected === true;
      }),
      checkedColumnValues = _.map(tempStateColumns, (col) => {
        if (col.selected === true) {
          return col.dataIndex || col.key;
        }
      });
    checkedColumnValues = _.compact(checkedColumnValues);
    _.each(finalCheckedColumns, (checkedCol) => {
      let i = findIndex(columns, (o) => { return o.dataIndex === checkedCol.dataIndex || o.dataIndex === checkedCol.key || (o.key && o.key === checkedCol.key); });
      if (columns[i] && _.isFunction(columns[i].render)) {
        checkedCol.render = columns[i].render;
      }
    });

    return (
      <div className={styles.standardTable}>
        {
          showTotal &&
          <div className={styles.tableAlert}>
            <Alert
              message={
                <Fragment>
                  已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                  {needTotalList.map(item => (
                    <span style={{ marginLeft: 8 }} key={item.dataIndex}>
                      {item.title}
                      总计&nbsp;
                    <span style={{ fontWeight: 600 }}>
                        {item.render ? item.render(item.total) : item.total}
                      </span>
                    </span>
                  ))}
                  <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>清空</a>
                </Fragment>
              }
              type='info'
              showIcon
            />
          </div>
        }
        {
          showSetting &&
          <Row>
            <Col span={4} offset={20} className={styles.settingBox}>
              <Tooltip placement='topLeft' title='设置列表字段'>
                <Button
                  type='primary'
                  shape='circle'
                  icon='setting'
                  className={styles.setting}
                  onClick={this.openColumnModal.bind(this)}
                />
              </Tooltip>
            </Col>
          </Row>
        }
        <Modal
          title='设置列表字段'
          visible={columnModalVisible}
          onOk={this.saveColumns.bind(this)}
          onCancel={this.closeColumnModal.bind(this)}
          confirmLoading={confirmLoading}
        >
          <Row>
            <Col>
              <Alert
                type='info'
                message={
                  [
                    <Row><Col>选择您想要显示在列表里的信息，最多选择 {maxColNum || 0} 项。</Col></Row>,
                    <Row><Col>您还可以继续添加 <span style={{ color: 'red' }}>{maxColNum - checkedColumnValues.length}</span> 项</Col></Row>
                  ]
                }
              />
            </Col>
          </Row>
          <Spin spinning={configCheckLoading}>
            <Row>
              {
                <Checkbox.Group value={checkedColumnValues} onChange={this.onColumnsCheck.bind(this)} style={{ width: '100%' }}>
                  <Row>
                    {
                      _.map(tempStateColumns, (item) => {
                        return (
                          <Col span={6} key={item.dataIndex || item.key} style={{ marginTop: 8 }}>
                            <Checkbox
                              disabled={item.disabled}
                              value={item.dataIndex || item.key}
                            >
                              {item.title}
                            </Checkbox>
                          </Col>
                        );
                      })
                    }
                  </Row>
                </Checkbox.Group>
              }
            </Row>
          </Spin>
        </Modal>
        <Table
          rowKey={rowKey || 'key'}
          rowSelection={rowSelectionProps}
          columns={showSetting ? finalCheckedColumns : columns}
          dataSource={list}
          pagination={paginationProps}
          onChange={this.handleTableChange}
          onRow={(record) => ({
            onClick: () => {
              this.selectRow(record);
            }
          })}
          {...rest}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {

  };
})(StandardTable);