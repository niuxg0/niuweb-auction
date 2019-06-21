import React, { Component } from 'react'
import {
  Input, DatePicker, InputNumber, Row, Col, Slider, Divider, Table, Button, Modal, Form, Select
} from 'antd'
import styles from './index.less';

const electron = window.require('electron')
const { ipcRenderer } = electron

// 单次电话前后最少要空闲的Lot号数量
const minOffset = 5
// 委托Lot号不连续的情况下，间隔的Lot号超过此值后，可挂断电话。
const maxDelegateSpace = 10

const withLabelLayout = {
  labelCol: {
    span: 3,
    style: { textAlign: 'left' }
  },
  wrapperCol: {
    span: 12,
  },
};

const withoutLabelLayout = {
  wrapperCol: {
    span: 10,
    offset: 7
  }
}

const canvasParams = {
  lotFontSize: 20,
  lotWidth: 80,
  lotHeight: 60,
  nameFontSize: 28,
  nameHeight: 80,
  namePadding: 20,
  labelFontSize: 20
}

export default class Delegate extends Component {
  constructor () {
    super()
    this.state = {
      lot: [],
      staffEdit: false,
      delegateEdit: false
    }
    this.staffInput = React.createRef()
    this.delegateInput = React.createRef()
    this.canvas = React.createRef()
  }
  componentDidMount () {
    const data = ipcRenderer.sendSync('niu_auction', 'Delegate.List')
    const lot = [1000, 1100]
    const staffs = [
      {
        name: "陈京",
        number: 1266
      },
      {
        name: "牛晓光",
        number: 974
      }
    ]
    const delegates = [
      {
        name: "张三",
        phone: "13812345678",
        lots: [
          1023, 1024, 1036, 1040, 1069, 1072
        ]
      },
      {
        name: "李四",
        phone: "13812345678",
        lots: [
          1030
        ]
      },
      {
        name: "王五",
        phone: "13812345678",
        lots: [
          1015
        ]
      }
    ]
    this.setState({
      lot,
      staffs,
      delegates
    }, () => this.init())
  }

  handleNewStaff () {
    this.setState({
      staffEdit: {}
    }, () => {
        this.staffInput.current && this.staffInput.current.focus()
    })
  }
  handleEditStaff (index) {
    this.setState({
      staffEdit: {
        index,
        ...JSON.parse(JSON.stringify(this.state.staffs[index]))
      }
    }, () => {
      this.staffInput.current && this.staffInput.current.focus()
    })
  }
  handleChangeStaff (key, value) {
    const staffEdit = this.state.staffEdit
    staffEdit[key] = value
    this.setState({
      staffEdit
    })
  }
  handleSaveStaff () {
    const { index, ...staffEdit } = this.state.staffEdit
    const staffs = this.state.staffs
    if (index || index === 0) {
      staffs[index] = staffEdit
    } else {
      staffs.push(staffEdit)
    }
    this.setState({
      staffs,
      staffEdit: false
    }, () => this.init())
  }
  handleCancelStaff () {
    this.setState({
      staffEdit: false
    })
  }
  handleRemoveStaff (index) {
    const staffs = this.state.staffs
    staffs.splice(index, 1)
    this.setState({
      staffs
    }, () => this.init())
  }

  handleNewDelegate() {
    this.setState({
      delegateEdit: {}
    }, () => {
      this.delegateInput.current && this.delegateInput.current.focus()
    })
  }
  handleEditDelegate(index) {
    this.setState({
      delegateEdit: {
        index,
        ...JSON.parse(JSON.stringify(this.state.delegates[index]))
      }
    }, () => {
      this.delegateInput.current && this.delegateInput.current.focus()
    })
  }
  handleChangeDelegate(key, value) {
    const delegateEdit = this.state.delegateEdit
    delegateEdit[key] = value
    this.setState({
      delegateEdit
    })
  }
  handleSaveDelegate() {
    const { index, ...delegateEdit } = this.state.delegateEdit
    delegateEdit.lots.sort()
    const delegates = this.state.delegates
    if (index || index === 0) {
      delegates[index] = delegateEdit
    } else {
      delegates.push(delegateEdit)
    }
    this.setState({
      delegates,
      delegateEdit: false
    }, () => this.init())
  }
  handleCancelDelegate() {
    this.setState({
      delegateEdit: false
    })
  }
  handleRemoveDelegate(index) {
    const delegates = this.state.delegates
    delegates.splice(index, 1)
    this.setState({
      delegates
    }, () => this.init())
  }

  init () {
    const {
      lot,
      staffs,
      delegates
    } = this.state
    const context = this.canvas.current.getContext('2d')
    context.font = `${canvasParams.nameFontSize}px sans-serif`
    const canvasLeft = Math.max(...staffs.map(staff => context.measureText(staff.name).width + canvasParams.namePadding * 2))
    this.setState({
      lot,
      staffs,
      delegates,
      canvasWidth: canvasLeft + (lot[1] - lot[0] + 1) * canvasParams.lotWidth,
      canvasHeight: staffs.length * canvasParams.nameHeight + canvasParams.lotHeight,
      canvasLeft
    }, () => this.renderCanvas())
  }

  render () {
    const {
      lot,
      staffs,
      delegates,
      canvasWidth = 0,
      canvasHeight = 0
    } = this.state
    const lots = []
    for(let i = lot[0]; i <= lot[1]; i++) {
      lots.push(i)
    }
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input placeholder="场次名称" style={{ width: '100%' }} />
          </Col>
          <Col span={8}>
            <DatePicker placeholder="场次时间" style={{ width: '100%' }} />
          </Col>
          <Col span={8}>
            <Input.Group compact>
              <Input value="Lot." style={{ width: 46 }} disabled />
              <InputNumber value={lot[0]} style={{ width: 'calc(50% - 37px)' }} />
              <Input value="-" style={{ width: 30 }} disabled />
              <InputNumber value={lot[1]} style={{ width: 'calc(50% - 37px)' }} />
            </Input.Group>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16, marginBottom: 16 }}>
          <Col span={12}>
            <Table
              style={{ flex: 1 }}
              scroll={{ y: 180 }}
              title={() => (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>委托席 / 号牌</span>
                  <Button size="small" onClick={() => this.handleNewStaff()}>新增</Button>
                </div>
              )}
              size="small"
              showHeader={false}
              pagination={false}
              dataSource={staffs}
              rowKey="name"
            >
              <Table.Column dataIndex="name" />
              <Table.Column dataIndex="number" />
              <Table.Column align="right" render={(_, __, index) => (
                <Button.Group size="small">
                  <Button onClick={() => this.handleEditStaff(index)}>编辑</Button>
                  <Button onClick={() => this.handleRemoveStaff(index)}>删除</Button>
                </Button.Group>
              )} />
            </Table>
          </Col>
          <Col span={12}>
            <Table
              style={{ flex: 1 }}
              scroll={{ y: 180 }}
              title={() => (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>委托</span>
                  <Button size="small" onClick={() => this.handleNewDelegate()}>新增</Button>
                </div>
              )}
              size="small"
              showHeader={false}
              pagination={false}
              dataSource={delegates}
              rowKey="name"
            >
              <Table.Column dataIndex="name" />
              <Table.Column dataIndex="phone" />
              <Table.Column align="right" render={(_, __, index) => (
                <Button.Group size="small">
                  <Button onClick={() => this.handleEditDelegate(index)}>编辑</Button>
                  <Button onClick={() => this.handleRemoveDelegate(index)}>删除</Button>
                </Button.Group>
              )} />
            </Table>
          </Col>
        </Row>
        <div style={{ width: '100%', flex: 1, display: 'flex', overflow: 'auto' }}>
          <canvas ref={this.canvas} style={{ width: canvasWidth / 2, height: canvasHeight / 2 }} width={canvasWidth} height={canvasHeight} />
        </div>
        <div style={{ width: '100', textAlign: 'right' }}>
          <Button type="primary">保存</Button>
        </div>
        <Modal
          title="委托席 / 号牌"
          visible={this.state.staffEdit}
          onOk={() => this.handleSaveStaff()}
          onCancel={() => this.handleCancelStaff()}
          forceRender={true}
          closable={false}
          maskClosable={false}
        >
          <Form.Item>
            <Input
              ref={this.staffInput}
              addonBefore="姓名"
              value={!!this.state.staffEdit.name}
              onInput={(e) => this.handleChangeStaff('name', e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Input
              addonBefore="号牌"
              value={this.state.staffEdit.number}
              onInput={(e) => this.handleChangeStaff('number', e.target.value)}
            />
          </Form.Item>
        </Modal>
        <Modal
          title="委托"
          visible={!!this.state.delegateEdit}
          onOk={() => this.handleSaveDelegate()}
          onCancel={() => this.handleCancelDelegate()}
          forceRender={true}
          closable={false}
          maskClosable={false}
        >
          <Form.Item>
            <Input
              ref={this.delegateInput}
              addonBefore="姓名"
              value={this.state.delegateEdit.name}
              onInput={(e) => this.handleChangeDelegate('name', e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Input
              addonBefore="电话"
              value={this.state.delegateEdit.phone}
              onInput={(e) => this.handleChangeDelegate('phone', e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Input.Group compact>
              <Input value="Lot." disabled style={{ width: 50 }} />
              <Select
                style={{ width: "calc(100% - 50px)" }}
                mode="tags"
                tokenSeparators={[',', ' ']}
                dropdownStyle={{ visibility: "hidden" }}
                value={this.state.delegateEdit.lots}
                onChange={(lots) => this.handleChangeDelegate('lots', lots)}
              >
                {lots.map(l => <Select.Option key={l} value={l.toString()}>{l}</Select.Option>)}
              </Select>
            </Input.Group>
          </Form.Item>
        </Modal>
      </div>
    )
  }
  renderCanvas () {
    console.log('renderCanvas')
    const {
      lot,
      // staffs,
      canvasWidth,
      canvasHeight,
      canvasLeft
    } = this.state

    const staffs = this.renderDelegate()

    console.log('staffs', staffs)

    const context = this.canvas.current.getContext('2d')
    context.clearRect(0, 0, canvasWidth, canvasHeight)

    context.textBaseline = 'middle'
    context.lineWidth = 0.5
    context.strokeStyle = 'RGBA(0,0,0,.4)'
    context.font = `${canvasParams.lotFontSize}px sans-serif`
    context.fillStyle = '#000000'
    for (let i = lot[0]; i <= lot[1]; i++) {
      context.beginPath()
      context.moveTo(canvasLeft + (i - lot[0]) * canvasParams.lotWidth, 0)
      context.lineTo(canvasLeft + (i - lot[0]) * canvasParams.lotWidth, canvasHeight)
      context.stroke()
      context.fillText(i, canvasLeft + (i - lot[0]) * canvasParams.lotWidth + 10, canvasParams.lotHeight / 2)
    }
    context.beginPath()
    context.moveTo(0, canvasParams.lotHeight)
    context.lineTo(canvasWidth, canvasParams.lotHeight)
    context.stroke()
    staffs.forEach((staff, i) => {
      if (!i % 2) {
        context.fillStyle = 'RGBA(255,255,255,.4)'
        context.fillRect(0, canvasParams.lotHeight + canvasParams.nameHeight * i, canvasWidth, canvasParams.nameHeight)
      }
      context.font = `${canvasParams.nameFontSize}px sans-serif`
      context.fillStyle = '#000000'
      context.fillText(staff.name, canvasLeft - canvasParams.namePadding - context.measureText(staff.name).width, canvasParams.lotHeight + canvasParams.nameHeight * (i + 0.5))

      staff.tasks.forEach(task => {
        const fromIndex = Math.max(task.from - lot[0] - minOffset, 0)
        const toIndex = task.to - lot[0] + 1
        const left = canvasLeft + (fromIndex + 0.5) * canvasParams.lotWidth
        const top = canvasParams.lotHeight + canvasParams.nameHeight * i
        const width = (toIndex - fromIndex) * canvasParams.lotWidth
        const height = canvasParams.nameHeight
        context.fillStyle = '#F0250F40'
        context.fillRect(
          left + 10,
          top + 20,
          width - 20,
          height - 40
        )
        context.fillRect(
          left + 20,
          top + 10,
          width - 40,
          10
        )
        context.fillRect(
          left + 20,
          top + height - 20,
          width - 40,
          10
        )
        context.beginPath();
        context.moveTo(left + 20, top + 20)
        context.arc(left + 20, top + 20, 10, Math.PI, Math.PI * 1.5)
        context.fill()

        context.beginPath();
        context.moveTo(left + width - 20, top + 20)
        context.arc(left + width - 20, top + 20, 10, - Math.PI * 0.5, 0)
        context.fill()

        context.beginPath();
        context.moveTo(left + 20, top + height - 20)
        context.arc(left + 20, top + height - 20, 10, Math.PI * 0.5, Math.PI)
        context.fill()

        context.beginPath();
        context.moveTo(left + width - 20, top + height - 20)
        context.arc(left + width - 20, top + height - 20, 10, 0, Math.PI * 0.5)
        context.fill()

        context.fillStyle = 'RGBA(0,0,0,0.8)'
        context.font = `${canvasParams.labelFontSize}px sans-serif`
        context.fillText(task.name, left + 20, top + height / 2 - canvasParams.labelFontSize * 0.6)
        context.fillText(task.phone, left + 20, top + height / 2 + canvasParams.labelFontSize * 0.6)

        task.lotList.forEach(lotID => {
          context.fillStyle = '#F0250F60'
          context.fillRect(
            canvasLeft + (lotID - lot[0]) * canvasParams.lotWidth,
            top + 10,
            canvasParams.lotWidth,
            canvasParams.nameHeight - 20
          )

          context.fillStyle = 'RGBA(255,255,255,0.8)'
          context.font = `${canvasParams.labelFontSize}px sans-serif`
          context.fillText('Lot.', canvasLeft + (lotID - lot[0]) * canvasParams.lotWidth + 10, top + height / 2 - canvasParams.labelFontSize * 0.6)
          context.font = `bolder ${canvasParams.labelFontSize}px sans-serif`
          context.fillText(lotID, canvasLeft + (lotID - lot[0]) * canvasParams.lotWidth + 10, top + height / 2 + canvasParams.labelFontSize * 0.6)
        })
      })
    })
  }
  renderDelegate () {
    const {
      staffs: _staffs,
      delegates: _delegates
    } = this.state

    const staffs = JSON.parse(JSON.stringify(_staffs))
    const delegates = JSON.parse(JSON.stringify(_delegates))

    delegates.forEach((delegate) => {
      const {
        lots = []
      } = delegate

      staffs.sort((a,b) => {
        if (!a.tasks) a.tasks = []
        if (!b.tasks) b.tasks = []
        if (a.tasks.length < b.tasks.length) {
          return -1
        }
        if (a.tasks.length > b.tasks.length) {
          return 1
        }
        return 0
      })

      staffs.find((staff) => {
        if (!staff.tasks) {
          staff.tasks = []
        }

        const {
          tasks
        } = staff

        if (!lots.find(lot => {
          return tasks.find(task => {
            const {
              from,
              to
            } = task

            return from - minOffset <= lot && to + minOffset >= lot
          })
        })) {
          let from = lots.shift()
          let to = from
          let lotList = [from]
          while(lots.length) {
            const lot = lots.shift()
            if (lot - to > maxDelegateSpace) {
              staff.tasks.push({
                from,
                to,
                name: delegate.name,
                phone: delegate.phone,
                lotList
              })
              from = lot
              lotList = []
            }
            to = lot
            lotList.push(lot)
          }

          staff.tasks.push({
            from,
            to,
            name: delegate.name,
            phone: delegate.phone,
            lotList
          })

          return true
        }
      })
    })

    return staffs
  }
}
