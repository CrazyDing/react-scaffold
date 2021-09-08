import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Popover, Progress, Alert } from 'antd';
import { SYS_ID, GLOBAL_NAME } from '../../constants';
import { updateModifyStatusAction, postModifyPasswordAction } from '../../actions/login/action';
import { connect } from 'react-redux';
import styles from './modify.module.less';

const FormItem = Form.Item;

const passwordStatusMap = {
    ok: <div className={styles.success}>强度：强</div>,
    pass: <div className={styles.warning}>强度：中</div>,
    pool: <div className={styles.error}>强度：太短</div>,
};

const passwordProgressMap = {
    ok: 'success',
    pass: 'normal',
    pool: 'exception'
};

class Modify extends Component {
    state = {
        confirmDirty: false,
        visible: false,
        help: '',
        count: 5
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields({ force: true }, (err, values) => {
            if (!err) {
                this.props.dispatch(
                    updateModifyStatusAction({
                        submitting: true
                    })
                );
                this.props.dispatch(
                    // 向后台发送用户名密码信息，核对数据
                    postModifyPasswordAction(values, (status) => {
                        if (status === 'ok') {
                            let count = 5;
                            this.interval = setInterval(() => {
                                count -= 1;
                                this.setState({ count });
                                if (count === 0) {
                                    clearInterval(this.interval);
                                    this.props.dispatch(
                                        updateModifyStatusAction({
                                            status: ''
                                        })
                                    );
                                    this.context.router.history.replace(`/${SYS_ID}/login`);
                                }
                            }, 1000);
                        }
                    })
                );
            }
        });
    };

    getPasswordStatus = () => {
        const { form } = this.props;
        const value = form.getFieldValue('pwd');
        if (value && value.length > 9) {
            return 'ok';
        }
        if (value && value.length > 5) {
            return 'pass';
        }
        return 'pool';
    };

    handleConfirmBlur = (e) => {
        const { value } = e.target;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };

    checkConfirm = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('pwd')) {
            callback('两次输入的密码不匹配!');
        } else {
            callback();
        }
    };

    checkPassword = (rule, value, callback) => {
        if (!value) {
            this.setState({
                help: '请输入密码！',
                visible: !!value
            });
            callback('error');
        } else {
            this.setState({
                help: ''
            });
            if (!this.state.visible) {
                this.setState({
                    visible: !!value
                });
            }
            if (value.length < 6) {
                callback('error');
            } else {
                const { form } = this.props;
                if (value && this.state.confirmDirty) {
                    form.validateFields(['confirm'], { force: true });
                }
                callback();
            }
        }
    };

    renderPasswordProgress = () => {
        const { form } = this.props;
        const value = form.getFieldValue('pwd');
        const passwordStatus = this.getPasswordStatus();
        return value && value.length ? (
            <div className={styles[`progress-${passwordStatus}`]}>
                <Progress
                    status={passwordProgressMap[passwordStatus]}
                    className={styles.progress}
                    strokeWidth={6}
                    percent={value.length * 10 > 100 ? 100 : value.length * 10}
                    showInfo={false}
                />
            </div>
        ) : null;
    };

    renderMessage = (type, message) => {
        return (
            <Alert
                style={{ marginBottom: 24 }}
                message={message}
                type={type}
                showIcon
            />
        );
    };

    render() {
        const { form, modify } = this.props;
        const { getFieldDecorator } = form;
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <a href={`/${SYS_ID}/login`}>
                        <img className={styles.logo} src={require('../../assets/imgs/logo.png')} />
                        <span className={styles.title}>{GLOBAL_NAME}</span>
                    </a>
                </div>
                <Form onSubmit={this.handleSubmit} className={styles['modify-form']}>
                    <h3>修改密码</h3>
                    {
                        modify.success === false &&
                        modify.submitting === false &&
                        this.renderMessage('error', modify.message)
                    }
                    {
                        modify.status === 'ok' &&
                        modify.submitting === false &&
                        this.renderMessage('success', `修改密码成功，${this.state.count}s后跳转至登录页面`)
                    }
                    <FormItem>
                        {getFieldDecorator('userId', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入账户名！'
                                }
                            ]
                        })(<Input size='large' placeholder='账户名' />)}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('oriPassword', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入原密码！'
                                }
                            ]
                        })(<Input size='large' type='password' placeholder='原密码' />)}
                    </FormItem>
                    <FormItem help={this.state.help}>
                        <Popover
                            content={
                                <div style={{ padding: '4px 0' }}>
                                    {passwordStatusMap[this.getPasswordStatus()]}
                                    {this.renderPasswordProgress()}
                                    <div style={{ marginTop: 10 }}>
                                        请至少输入 6 个字符。请不要使用容易被猜到的密码。
                                    </div>
                                </div>
                            }
                            overlayStyle={{ width: 240 }}
                            placement='right'
                            visible={this.state.visible}
                        >
                            {getFieldDecorator('pwd', {
                                rules: [
                                    {
                                        validator: this.checkPassword,
                                    }
                                ]
                            })(
                                <Input
                                    size='large'
                                    type='password'
                                    placeholder='新密码，至少6位且区分大小写'
                                />
                            )}
                        </Popover>
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('confirm', {
                            rules: [
                                {
                                    required: true,
                                    message: '请确认密码！'
                                },
                                {
                                    validator: this.checkConfirm
                                }
                            ],
                        })(<Input size='large' type='password' placeholder='确认密码' />)}
                    </FormItem>
                    <FormItem>
                        <Button
                            size='large'
                            loading={modify.submitting}
                            className={styles.submit}
                            type='primary'
                            htmlType='submit'
                        >
                            确定
                        </Button>
                        <a className={styles.login} href={`/${SYS_ID}/login`}>
                            使用已有账户登录
                        </a>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        modify: state.modify
    };
}

Modify.propTypes = {
    modify: PropTypes.object.isRequired
};

// contextTypes必须设置才能使用this.context
Modify.contextTypes = {
    router: PropTypes.object.isRequired
};

const NormalModify = Form.create()(Modify);

export default connect(mapStateToProps)(NormalModify);