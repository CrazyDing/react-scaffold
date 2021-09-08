import React, { Component } from 'react';
import { Select, Spin } from 'antd';
import { BASE_URL } from '../../constants';
import { startAxios, RenderEmpty } from '../../util/util';
import _ from 'lodash/core';
import debounce from 'lodash/debounce';

const Option = Select.Option;

class SearchInput extends Component {
    constructor(props) {
        super(props);
        const value = props.value || {};
        // 组件的state值将作为form的值传递给FormItem
        this.state = {
            data: value.data || [],
            value: value.value || [],
            fetching: false
        };
        this.lastFetchId = 0; // 请求时序控制
        this.fetch = debounce(this.fetch, 500); // 节流控制
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // if (prevState.fetching === true) {
        //     return null;
        // }
        // 受控组件才有钩子函数，这里setState目的是把更新后的表单值显示在Select输入框里
        if ('value' in nextProps && !_.isEmpty(nextProps.value)) {
            if (!_.isEqual(nextProps.value.value, prevState.value)) {
                return {
                    ...(nextProps.value || {})
                };
            } else {
                return null;
            }
        }
        return null;
    }

    fetch = (value) => {
        const url = this.props.dataUrl || `${BASE_URL}/select/getAppSystems`;
        const { method = 'post', queryName = 'query', attachParams = {} } = this.props;
        let params = _.isEmpty(value) ? null : {
            [queryName]: value,
            ...attachParams
        };
        this.lastFetchId += 1;
        let fetchId = this.lastFetchId;
        this.setState({ data: [], fetching: true });
        startAxios({
            url: url,
            data: params,
            params,
            method: method,
            headers: {
                'Content-Type': method === 'post' ? 'application/x-www-form-urlencoded' : 'application/json;charset=utf-8'
            }
        }).then(result => {
            if (fetchId !== this.lastFetchId) {
                return;
            }
            let data = [];
            if (_.isArray(result.rows)) {
                data = _.map(result.rows, (item) => {
                    return {
                        value: item.value || item.id,
                        text: item.text || item.name
                    };
                });
            } else {
                data = _.map(result, (item) => {
                    return {
                        value: item.value,
                        text: item.text
                    };
                });
            }

            this.setState({
                data: data,
                fetching: false
            });
        });
    }

    handleChange = (value) => {
        if (!_.isArray(value)) {
            value = [value];
        }
        if (!('value' in this.props)) {
            this.setState({
                value,
                fetching: false
            });
        }
        this.triggerChange({ value });
    }

    triggerChange = (changedValue) => {
        // 调用getFieldDecorator包装的trigger事件，默认是onChange事件，目的是赋值给外层form
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }

    handleSelect = (value, option) => {
        const { onSelect } = this.props;
        if (_.isFunction(onSelect)) {
            onSelect(value, option)
        }
    }

    handleDeSelect = (value, option) => {
        const { onDeselect } = this.props;
        if (_.isFunction(onDeselect)) {
            onDeselect(value, option)
        }
    }

    render() {
        const { data, value, fetching } = this.state;
        const { mode, placeholder, style, disabled, optionLabelProp } = this.props;
        const options = _.map(data, d => <Option key={d.value} value={d.value}>{d.text}</Option>);
        return (
            <Select
                allowClear
                showSearch
                disabled={disabled}
                value={value}
                loading={fetching}
                notFoundContent={fetching ? <Spin size='small' /> : <RenderEmpty />}
                tokenSeparators={[',']}
                mode={mode} // tags || multiple
                placeholder={placeholder}
                style={style}
                optionLabelProp={optionLabelProp || 'children'}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={this.fetch.bind(this)}
                onFocus={this.fetch.bind(this, ' ')}
                onChange={this.handleChange.bind(this)}
                onSelect={this.handleSelect.bind(this)}
                onDeselect={this.handleDeSelect.bind(this)}
            >
                {options}
            </Select>
        );
    }
}

export { SearchInput };