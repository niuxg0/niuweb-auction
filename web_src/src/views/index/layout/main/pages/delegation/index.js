import React, { Component } from 'react'
import {
  Table, Button
} from 'antd'
import { delegationList } from '@/api'
import auth from '@/utils/auth'
import moment from 'moment'

const electron = window.require('electron')

export default class Delegate extends Component {
  constructor () {
    super()
    this.state = {
      loading: true,
      delegations: []
    }
  }
  componentDidMount () {
    this.setState({
      loading: true
    })
    const { id: email } = JSON.parse(auth.getUserInfo())
    delegationList({email}).then(res => {
      if (res.code === 0) {
        this.setState({
          loading: false,
          delegations: res.delegations
        })
      }
    })
  }
  handleInsert () {
    this.props.history.push('/delegation/create')
  }
  handleEdit (id) {
    this.props.history.push(`/delegation/edit/${id}`)
  }
  render() {
    return (
      <React.Fragment>
        <div style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={() => this.handleInsert()}>新增场次</Button>
        </div>
        <Table
          dataSource={this.state.delegations}
          pagination={false}
          loading={this.state.loading}
          style={{ background: 'white' }}
        >
          <Table.Column dataIndex="name" title="场次名称" />
          <Table.Column dataIndex="date" title="场次时间" render={(date) => moment(date).format("YYYY-MM-DD HH:mm:ss")} />
          <Table.Column title="查看" render={(_, {id}) => {
            return <Button onClick={() => this.handleEdit(id)}>查看</Button>
          }} />
        </Table>
      </React.Fragment>
    )
  }
}
