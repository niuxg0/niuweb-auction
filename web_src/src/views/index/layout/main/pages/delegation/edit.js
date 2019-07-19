import React, { Component } from 'react'
import {
  Input, DatePicker, InputNumber, Row, Col, Spin, Divider, Table, Button, Modal, Form, Select, message, Switch
} from 'antd'
import moment from 'moment'
import { delegationDetail, delegationSave } from '@/api'
import auth from '@/utils/auth'
import styles from './index.less';

const electron = window.require('electron')
const { ipcRenderer } = electron

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
      loading: true,
      name: "",
      date: moment(),
      lot: [],
      staffs: [],
      delegates: [],
      staffEdit: false,
      delegateEdit: false,
      minOffset: window.localStorage.getItem('delegation.minOffset') * 1 || 5, // 单次电话前后最少要空闲的Lot号数量
      maxDelegateSpace: window.localStorage.getItem('delegation.maxDelegateSpace') * 1 || 10 // 委托Lot号不连续的情况下，间隔的Lot号超过此值后，可挂断电话。
    }
    this.staffInput = React.createRef()
    this.delegateInput = React.createRef()
    this.canvas = React.createRef()
  }
  componentDidMount () { 
    if (this.props.match && this.props.match.params && this.props.match.params.id) {
      delegationDetail({ id: this.props.match.params.id }).then(({ code, delegation }) => {
        if (code === 0) {
          this.setState({
            loading: false,
            id: this.props.match.params.id,
            name: delegation.name,
            date: moment(delegation.date),
            lot: [delegation.from, delegation.to],
            staffs: delegation.staffs,
            delegates: delegation.delegations
          }, () => this.init())
        }
      })
    } else {
      this.setState({
        loading: false
      })
      this.init()
    }
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
    const { index, name = "" } = this.state.staffEdit
    if (name === "") {
      message.error("姓名不能为空")
      return
    }
    const staffs = this.state.staffs
    if (index || index === 0) {
      staffs[index] = { name }
    } else {
      staffs.push({ name })
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
    const { index, number = "", name = "", phone = "", lots = [], assign = false, assignTo } = this.state.delegateEdit
    if (number === "") {
      message.error("号牌不能为空")
      return
    }
    if (name === "") {
      message.error("姓名不能为空")
      return
    }
    if (phone === "") {
      message.error("电话不能为空")
      return
    }
    lots.sort()
    const delegates = this.state.delegates
    if (index || index === 0) {
      delegates[index] = { number, name, phone, lots, assign, assignTo }
    } else {
      delegates.push({ number, name, phone, lots, assign, assignTo })
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

  handleShowSetting () {
    const {
      minOffset = 5,
      maxDelegateSpace = 10
    } = this.state
    this.setState({
      showSetting: true,
      showSettingMinOffset: minOffset === null ? 5 : minOffset,
      showSettingMaxDelegateSpace: maxDelegateSpace === null ? 10 : maxDelegateSpace
    })
  }

  handleHideSetting () {
    this.setState({
      showSetting: false
    })
  }

  handleSaveSetting () {
    const {
      showSettingMinOffset = 5,
      showSettingMaxDelegateSpace = 10
    } = this.state
    this.setState({
      showSetting: false,
      minOffset: showSettingMinOffset,
      maxDelegateSpace: showSettingMaxDelegateSpace
    }, () => this.renderCanvas())
    window.localStorage.setItem('delegation.minOffset', showSettingMinOffset)
    window.localStorage.setItem('delegation.maxDelegateSpace', showSettingMaxDelegateSpace)
  }

  handleSubmit () {
    const { id:email } = JSON.parse(auth.getUserInfo())
    const {
      id,
      name = "拍卖会",
      date = moment(),
      lot:[from, to] = [0,0],
      staffs,
      delegates
    } = this.state

    delegationSave({
      email,
      id,
      name,
      date: moment(date).format("YYYY/MM/DD HH:mm:ss"),
      from,
      to,
      staffs,
      delegations: delegates
    }).then(res => {
      if (res.code === 0) {
        message.success("保存成功")
        this.setState({
          id: res.id
        })
      }
    })
  }

  handleCancel () {
    this.props.history.push('/delegation/list')
  }

  handlePrint () {
    this.props.history.push('/print/delegation/' + encodeURIComponent(JSON.stringify({
        name: this.state.name,
        date: this.state.date.format("YYYY-HH-DD HH:mm:ss"),
        staffs: this.renderDelegate()
      })))
    return
    ipcRenderer.send(
      "delegation.print",
      {
        name: this.state.name,
        date: this.state.date.format("YYYY-HH-DD HH:mm:ss"),
        staffs: this.renderDelegate()
      }
    )
  }

  render () {
    const {
      lot,
      staffs,
      delegates,
      canvasWidth = 0,
      canvasHeight = 0,
      showSettingMinOffset = 5,
      showSettingMaxDelegateSpace = 10
    } = this.state
    console.log(showSettingMinOffset, showSettingMaxDelegateSpace)
    const lots = []
    for(let i = lot[0]; i <= lot[1]; i++) {
      lots.push(i)
    }
    return (
      <div className={styles.edit}>
        <Spin spinning={this.state.loading}>
          <Row gutter={16}>
            <Col span={8}>
              <Input placeholder="场次名称" value={this.state.name} onInput={(e) => this.setState({ name: e.target.value })} style={{ width: '100%' }} />
            </Col>
            <Col span={8}>
              <DatePicker placeholder="场次时间" value={this.state.date} onChange={(date) => this.setState({ date })} style={{ width: '100%' }} showTime={true} />
            </Col>
            <Col span={8}>
              <Input.Group compact>
                <Input value="Lot." style={{ width: 46 }} disabled />
                <InputNumber value={lot[0]} onChange={(value) => { const lot = this.state.lot; lot[0] = value; this.setState({ lot }) }} style={{ width: 'calc(50% - 37px)' }} />
                <Input value="-" style={{ width: 30 }} disabled />
                <InputNumber value={lot[1]} onChange={(value) => { const lot = this.state.lot; lot[1] = value; this.setState({ lot }) }} style={{ width: 'calc(50% - 37px)' }} />
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
                    <span>委托席</span>
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
                <Table.Column dataIndex="number" />
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
          <div style={{ width: '100', marginTop: 16, textAlign: 'right' }}>
            <Button icon="setting" style={{ float: 'left' }} onClick={() => this.handleShowSetting()} />
            <Button onClick={() => this.handlePrint()}>打印报告</Button>
            <Divider type="vertical" />
            <Button style={{ marginRight: 8 }} onClick={() => this.handleCancel()}>返回</Button>
            <Button type="primary" onClick={() => this.handleSubmit()}>保存</Button>
          </div>
          <Modal
            title="委托席"
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
                value={this.state.staffEdit.name}
                onInput={(e) => this.handleChangeStaff('name', e.target.value)}
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
                addonBefore="号牌"
                value={this.state.delegateEdit.number}
                onInput={(e) => this.handleChangeDelegate('number', e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Input
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
            <Form.Item>
              指定委托席
              <Switch checked={!!this.state.delegateEdit.assign} onChange={(assign) => this.handleChangeDelegate('assign', assign)} style={{ margin: '0 10px' }} />
              {
                this.state.delegateEdit.assign ? (
                  <Select value={this.state.delegateEdit.assignTo} onChange={(assignTo) => this.handleChangeDelegate('assignTo', assignTo)} style={{ width: 100 }} placeholder="请选择">
                    {this.state.staffs.map(({ name }) => (
                      <Select.Option key={name}>{name}</Select.Option>
                    ))}
                  </Select>
                ) : null
              }
            </Form.Item>
          </Modal>
          <Modal
            title="设置"
            visible={!!this.state.showSetting}
            footer={(
              <React.Fragment>
                <Button>恢复默认值</Button>
                <Divider type="vertical" />
                <Button onClick={() => this.handleHideSetting()}>返回</Button>
                <Button onClick={() => this.handleSaveSetting()} type="primary">保存</Button>
              </React.Fragment>
            )}
            forceRender={true}
            closable={false}
            maskClosable={false}
          >
            <Form.Item>
              <Input.Group compact>
                <Input value="委托之间至少需要间隔" style={{ width: 170, textAlign: 'center' }} disabled />
                <InputNumber style={{ width: 60, textAlign: 'right' }} value={showSettingMinOffset} onChange={(value) => this.setState({ showSettingMinOffset: value })} />
                <Input value="个Lot" style={{ width: 60 }} disabled />
              </Input.Group>
            </Form.Item>
            <Form.Item>
              <Input.Group compact>
                <Input value="委托中各Lot号之间间隔" style={{ width: 170, textAlign: 'center' }} disabled />
                <InputNumber style={{ width: 60, textAlign: 'right' }} value={showSettingMaxDelegateSpace} onChange={(value) => this.setState({ showSettingMaxDelegateSpace: value })} />
                <Input value="个Lot即可挂断电话承接其他委托" style={{ width: 230 }} disabled />
              </Input.Group>
            </Form.Item>
          </Modal>
        </Spin>
      </div>
    )
  }
  renderCanvas () {
    const {
      lot,
      canvasWidth,
      canvasHeight,
      canvasLeft,
      minOffset = 5
    } = this.state

    const staffs = this.renderDelegate()

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

      const {
        tasks = []
      } = staff

      tasks.forEach(task => {
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
        context.fillText(task.number, left + 20, top + height / 2 + canvasParams.labelFontSize * 0.6)

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
      delegates: _delegates,
      minOffset = 5,
      maxDelegateSpace = 10
    } = this.state

    const staffs = JSON.parse(JSON.stringify(_staffs))
    const delegates = JSON.parse(JSON.stringify(_delegates))

    delegates.forEach((delegate) => {
      if (delegate.assign) {
        const {
          lots = []
        } = delegate

        const staff = staffs.find(staff => staff.name === delegate.assignTo)
        if (!staff) return
        if (!staff.tasks) {
          staff.tasks = []
        }

        let from = lots.shift()
        let to = from
        let lotList = [from]
        while(lots.length) {
          const lot = lots.shift()
          if (lot - to > maxDelegateSpace) {
            staff.tasks.push({
              from,
              to,
              number: delegate.number,
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
          number: delegate.number,
          name: delegate.name,
          phone: delegate.phone,
          lotList
        })
      }
    })

    delegates.forEach((delegate) => {
      if (delegate.assign) return
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
                number: delegate.number,
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
            number: delegate.number,
            name: delegate.name,
            phone: delegate.phone,
            lotList
          })

          return true
        }
      })
    })

    staffs.forEach(({ tasks }) => {
      let i = 1
      while(tasks[i]) {
        if (tasks[i - 1].number === tasks[i].number) {
          tasks[i - 1].lotList = tasks[i - 1].lotList.concat(tasks[i].lotList)
          tasks[i - 1].to = tasks[i].to
          tasks.splice(i, 1)
        }
        i++
      }
    })
    console.log('staffs', staffs)

    return staffs
  }
}
