import React, { Component, Fragment } from 'react';
import { Row, Col, Input, Button, Tag, Modal, Form, Switch, InputNumber, Select } from 'antd';
import styled from 'styled-components'
import { resolve, reject } from '_bluebird-lst@1.0.9@bluebird-lst';

const electron = window.require('electron')
const { ipcRenderer } = electron

const PicturePanel = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .ant-btn.ant-btn-loading:not(.ant-btn-circle):not(.ant-btn-circle-outline):not(.ant-btn-icon-only) {
    padding-left: 20px;
  }
`
const PictureTable = styled.div`
  flex: 1;
  margin-top: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
`

const PictureHeader = styled.div`
  background: #f7f7f7;
  padding: 8px 0;
  border-bottom: 1px solid #d9d9d9;

  .ant-col {
    height: 22px;
    line-height: 22px;
    margin-left: 11px;
    margin-right: -11px;
    font-weight: bold;
  }
`

const PictureBody = styled.div`
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
`

const PictureSubRow = styled(Row)`
  padding: 2px 0;
  border-bottom: 1px solid #d9d9d9;
  background-color: #fafafa;

  &:last-child {
    border-bottom: 0;
  }

  .ant-col {
    height: 22px;
    line-height: 22px;
    margin-left: 11px;
    margin-right: -11px;
    font-size: small;
    color: rgba(0,0,0,.4);
  }
`

const PictureRow = styled(Row)`
  padding: 8px 0;
  border-bottom: 1px solid #d9d9d9;

  &:last-child {
    border-bottom: 0;
  }

  .ant-col {
    height: 22px;
    line-height: 22px;
    margin-left: 11px;
    margin-right: -11px;
    display: flex;
  }
`

const PictureError = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 16px;
  font-size: small;
  color: #f5222d;
`

export default class Picture extends Component {
  constructor () {
    super()
    this.state = {
      list: [],
      from: "",
      to: "",
      map: [],
      mapString: "",
      showMap: false
    }
  }
  handleOpenDirectory (order) {
    if (this.state.loading) return
    const directory = ipcRenderer.sendSync("openDirectory")[0]
    const state = {
      [order]: directory
    }

    if (directory) {
      this.setState(state, () => this.handleMap())
    }
  }
  handleClearDirectory (order) {
    if (this.state.loading) return
    this.setState({
      [order]: ""
    }, () => this.handleMap())
  }
  handleMapShow () {
    if (this.state.loading) return
    this.setState({
      showMap: true,
      mapString: Object.entries(this.state.map).map(map => map.join("\t")).join("\n")
    })
  }
  handleCompress (compress) {
    this.setState({
      compress,
      compressSize: 0
    })
  }
  handleMapImport () {
    if (this.state.loading) return
    const map = {}
    this.state.mapString.split("\n").forEach(string => {
      const m = string.split("\t")
      map[m[0]] = m[1]
    })
    this.setState({
      showMap: false,
      map
    }, () => this.handleMap())
  }
  handleMapCancel () {
    this.setState({
      showMap: false
    })
  }
  handleMap () {
    if (this.state.loading) return
    if (!this.state.from || !this.state.to || this.state.map.length === 0) {
      this.setState({
        list: []
      })
    } else {
      const files = ipcRenderer.sendSync("readDirectory", this.state.from).map(file => file.name)
      const list = Object.entries(this.state.map).map(([from,to]) => (
        {
          from,
          to,
          files: files.filter((file) => (new RegExp(`^${from}[\\.\\-\\(\\[（【].*$`)).test(file)).map(file => ({
            from: file,
            to: file.replace(new RegExp(`^${from}([\\.\\-\\(\\[（【].*)$`), `${to}$1`)
          }))
        }
      ))
      this.setState({
        list
      })
    }
  }
  async handleCopy () {
    if (this.state.loading) return
    this.setState({
      loading: true
    })
    this.handleCopyOne(0,0)
  }
  handleCopyOne (mapIndex, fileIndex) {
    const list = JSON.parse(JSON.stringify(this.state.list))

    if (!list[mapIndex]) {
      this.setState({
        loading: false
      })
    } else {
      if (!list[mapIndex].files[fileIndex]) {
        this.handleCopyOne(mapIndex+1, 0)
      } else {
        const { from, to } = list[mapIndex].files[fileIndex]
        const { status, message = "" } = ipcRenderer.sendSync("copyFile", this.state.from, from, this.state.to, to, this.state.compress ? this.state.compressSize * 1 : 0)
        list[mapIndex].files[fileIndex].status = status
        list[mapIndex].files[fileIndex].message = {
          "EACCES": "拒绝访问",
          "EADDRINUSE": "地址已被使用",
          "ECONNREFUSED": "连接被拒绝",
          "ECONNRESET": "连接被重置",
          "EEXIST": "文件已存在",
          "EISDIR": "是一个目录",
          "EMFILE": "系统打开了太多文件",
          "ENOENT": "无此文件或目录",
          "ENOTDIR": "不是一个目录",
          "ENOTEMPTY": "目录非空",
          "EPERM": "操作不被允许",
          "EPIPE": "管道损坏",
          "ETIMEDOUT": "操作超时"
        }[message.code]

        this.setState({
          list
        }, () => { 
          setTimeout(() => {
            this.handleCopyOne(mapIndex, fileIndex + 1)
          }, 0)
         })
      }
    }
  }
  render() {
    console.log('render')
    return (
      <PicturePanel>
        <Row gutter={16}>
          <Col span={8}>
            <Input value={this.state.from} placeholder="点击选择源文件夹" readOnly onClick={() => this.handleOpenDirectory('from')} allowClear onChange={() => this.handleClearDirectory('from')} />
          </Col>
          <Col span={8}>
            <Input value={this.state.to} placeholder="点击选择目标文件夹" readOnly onClick={() => this.handleOpenDirectory('to')} allowClear onChange={() => this.handleClearDirectory('to')} />
          </Col>
          <Col span={5}>
            <Button.Group
              style={{ width: '100%' }}
            >
              <Button style={{ width: '50%' }} disabled={!this.state.from || !this.state.to || this.state.map.length === 0 || this.state.loading} onClick={() => this.handleMap()}>刷新</Button>
              <Button style={{ width: '50%' }} disabled={this.state.loading} onClick={() => this.handleMapShow()}>导入</Button>
            </Button.Group>
          </Col>
          <Col span={3}>
            <Button
              style={{ width: '100%' }}
              type="primary"
              disabled={!this.state.from || !this.state.to || this.state.map.length === 0}
              loading={this.state.loading}
              onClick={() => this.handleCopy()}
            >
              开始
            </Button>
          </Col>
        </Row>

        <Modal
          visible={this.state.showMap}
          title="导入映射"
          onOk={() => this.handleMapImport()}
          onCancel={() => this.handleMapCancel()}
        >
          <Input.TextArea
            value={this.state.mapString}
            onInput={(e) => this.setState({ mapString: e.target.value })}
            autosize={{ minRows: 4, maxRows: 10 }}
            placeholder={"在此处输入或粘贴映射关系\n每条规则一行，以Tab键分隔源文件名和目标文件名。"}
          />
          <Row gutter={16} style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', marginTop: 10, marginBottom: -10, height: 30 }}>
            <Col span={4}>图片压缩</Col>
            <Col span={4}><Switch value={this.state.compress} onChange={(compress) => this.handleCompress(compress)} /></Col>
            {
              this.state.compress && (
                <React.Fragment>
                  <Col span={3}>压缩至</Col>
                  <Col span={13}>
                    <Input.Group compact>
                      <InputNumber value={this.state.compressSize} onChange={(compressSize) => this.setState({ compressSize })} style={{ width: 90 }} />
                      <Input style={{ width: 50 }} disabled value="KB" />
                    </Input.Group>
                  </Col>
                </React.Fragment>
              )
            }
          </Row>
        </Modal>

        <PictureTable>
          <PictureHeader>
            <Row gutter={16}>
              <Col span={8}>
                源文件
              </Col>
              <Col span={8}>
                目标文件
              </Col>
              <Col span={8}>
                状态
              </Col>
            </Row>
          </PictureHeader>

          {
            (!this.state.from || !this.state.to || this.state.map.length === 0) ?
            (
              <PictureBody style={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>
                请选择源文件夹、目标文件，并导入映射关系。
              </PictureBody>    
            )
            :
            (
              <PictureBody>
                {
                    this.state.list.map(({ from = "", to = "", files = [], message = "" }) => (
                    <React.Fragment>
                      <PictureSubRow key={from} gutter={16}>
                        <Col span={8}>{from}</Col>
                        <Col span={8}>{to}</Col>
                      </PictureSubRow>
                      {
                        files.length > 0 ?
                          files.map(({ from, to, status = 0, message }) => {
                            console.log('111', from, status)
                            return (
                            <PictureRow gutter={16}>
                              <Col span={8}>{from}</Col>
                              <Col span={8}>{to}</Col>
                              <Col span={8}>
                                {status === 0 && (<Tag key="0">等待</Tag>)}
                                {status === 1 && (<Tag key="1" color="#87d068">完成</Tag>)}
                                {status === 2 && (<Tag key="2" color="#f5222d">失败</Tag>)}
                                {status === 2 && (<PictureError key="3">{message}</PictureError>)}
                              </Col>
                            </PictureRow>
                          )}) : (
                            <PictureRow gutter={16}>
                              <Col span={16}>文件不存在</Col>
                              <Col span={8}><Tag color="#2db7f5">无文件</Tag></Col>
                            </PictureRow>
                        )
                      }
                    </React.Fragment>
                  ))
                }
              </PictureBody>
            )
          }
        </PictureTable>
      </PicturePanel>
    )
  }
}
