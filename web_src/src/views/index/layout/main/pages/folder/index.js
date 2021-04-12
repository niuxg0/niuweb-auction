import React, { Component, Fragment } from 'react';
import { Row, Col, Input, Button, Tag } from 'antd';
import styled from 'styled-components'

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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
      directory: "",
      to: "",
      map: [],
      mapString: "",
      showMap: false
    }
  }
  handleOpenDirectory () {
    if (this.state.loading) return
    const directory = ipcRenderer.sendSync("openDirectory")[0]
    
    const files = ipcRenderer.sendSync("readDirectory", directory)
    const list = files.filter((file) => file.isDirectory).map((file, index) => ({
      from: file.name,
      to: ''
    }))

    const state = {
      directory,
      list
    }

    if (directory) {
      this.setState(state, () => this.handleMap())
    }
  }
  handleSetParam (key, value) {
    if (this.state.loading) return
    this.setState({
      [key]: value
    }, () => this.handleMap())
  }
  handleMap () {
    const {
      list,
      prefix = '',
      suffix = '',
      offset
    } = this.state
    this.setState({
      list: list.map((item, index) => ({
        from: item.from,
        to: Number.isNaN(Number(offset)) ? '-' : `${prefix}${Number(offset) + index}${suffix}`
      }))
    })
  }
  async handleCopy () {
    if (this.state.loading) return
    this.setState({
      loading: true
    })
    this.handleCopyOne(0)
  }
  handleCopyOne (fileIndex) {
    const list = JSON.parse(JSON.stringify(this.state.list))

    if (!list[fileIndex]) {
      console.log(1)
      this.setState({
        loading: false
      })
    } else {
      console.log(2)
      const { from, to } = list[fileIndex]
      console.log(from, to)
      const { status, message = "" } = ipcRenderer.sendSync("copyFile", this.state.directory, from, this.state.directory, to, 0)
      console.log(status, message)
      list[fileIndex].status = status
      list[fileIndex].message = {
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
          this.handleCopyOne(fileIndex + 1)
        }, 0)
      })
    }
  }
  render() {
    return (
      <PicturePanel>
        <Row gutter={16}>
          <Col span={8}>
            <Input value={this.state.directory} placeholder="点击选择源文件夹" readOnly onClick={() => this.handleOpenDirectory()} allowClear onChange={() => this.handleClearDirectory('from')} />
          </Col>
          <Col span={12}>
            <Input.Group compact>
              <Input style={{ width: '20%' }} value="请输入" disabled />
              <Input style={{ width: '23%' }} value={this.state.prefix} placeholder="前缀" onInput={(e) => this.handleSetParam('prefix', e.target.value)} />
              <Input style={{ width: '34%' }} value={this.state.offset} placeholder="起始编号" onInput={(e) => this.handleSetParam('offset', e.target.value)} />
              <Input style={{ width: '23%' }} value={this.state.suffix} placeholder="后缀" onInput={(e) => this.handleSetParam('suffix', e.target.value)} />
            </Input.Group>
          </Col>
          <Col span={4}>
            <Button
              style={{ width: '100%' }}
              type="primary"
              disabled={!this.state.directory || Number.isNaN(Number(this.state.offset))}
              loading={this.state.loading}
              onClick={() => this.handleCopy()}
            >
              开始
            </Button>
          </Col>
        </Row>
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
            (!this.state.directory) ?
            (
              <PictureBody style={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>
                请选择源文件夹、目标文件，并导入映射关系。
              </PictureBody>    
            )
            :
            (
              <PictureBody>
                {
                    this.state.list.map(({ from = "", to = "", status="", message = "" }) => (
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
