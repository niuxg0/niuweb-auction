import React, { Component } from 'react'
import {
  Table, Button
} from 'antd'

const electron = window.require('electron')
const { ipcRenderer } = electron

export default class Delegate extends Component {
  componentDidMount () {
    const data = ipcRenderer.sendSync('niu_auction', 'Delegate.List')
  }
  handleInsert () {
    console.log('this.props.history', this.props.history)
    this.props.history.push('/delegation/edit')
  }
  render() {
    return (
      <React.Fragment>
        <div style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={() => this.handleInsert()}>新增场次</Button>
        </div>
        <Table />
      </React.Fragment>
    )
  }
}
