import React from 'react'
import { Divider, Col, Row } from 'antd'
import moment from 'moment'
import styled from 'styled-components'

const Header = styled(Row)`
 span {
   font-weight: bold;

   &:after {
     content: "：";
   }
 }
`
const Lot = styled(Row)`
 .ant-col {
   height: 50px;
   line-height: 40px;
   background: rgba(0,0,0,.2);
   position: relative;
   border: 5px solid white;
   box-sizing: border-box;

   &:after {
     width: 50%;
     height: 38px;
     position: absolute;
     top: 1px;
     right: 1px;
     background: white;
     content: " ";
   }
 }
`

export default class Delegation extends React.Component {
  componentDidMount () {
    const electron = window.require('electron')
    const { ipcRenderer } = electron
    ipcRenderer.sendSync("print")
    this.props.history.goBack()
  }
  render () {
    const {
      match: {
        params: {
          staffs:data = "[]"
        } = {}
      } = {}
    } = this.props

    console.log("this.props", this.props)

    const { name: auction, date, staffs } = JSON.parse(decodeURIComponent(data))
    return (
      <div>
        {
          staffs.map(({ name, tasks = [] }) => (
            <React.Fragment>
              <Header gutter={16} style={{ paddingTop: 90 }}>
                <Col span={6}><span>场次</span>{auction}</Col>
                <Col span={8}><span>时间</span>{date}</Col>
                <Col span={5}><span>姓名</span>{name}</Col>
              </Header>
              <Divider />
              {
                tasks.map(({ number, name, phone, lotList = [] }) => (
                  <React.Fragment>
                    <Header gutter={16} style={{ marginBottom: 10 }}>
                      <Col span={6}><span>号牌</span>{number}</Col>
                      <Col span={6}><span>委托人</span>{name}</Col>
                      <Col span={6}><span>电话</span>{phone}</Col>
                    </Header>
                    <Lot gutter={16}>
                      {
                        lotList.map((lot) => (
                          <Col span={4}>{lot}</Col>
                        ))
                      }
                    </Lot>
                  </React.Fragment>
                ))
              }
              <div style={{ pageBreakAfter: "always" }}></div>
            </React.Fragment>
          ))
        }
      </div>
    )
  }
}
