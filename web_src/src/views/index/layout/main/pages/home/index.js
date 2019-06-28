import React, { Component, Fragment } from 'react'
import { Row, Col, Card } from 'antd'
import styled from 'styled-components'
import iconDelegation from '@/assets/icon/delegation.png';
import iconPicture from '@/assets/icon/picture.png';

const Item = styled(Card)`
  .ant-card-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    .icon {
      width: 60px;
      height: 60px;
      background-size: contain;
      background-position: center center;
      background-repeat: no-repeat;
    }

    .title {
      width: 85%;
      text-align: center;
      font-weight: bold;
      padding-top: 10px;
    }
  }
`

const item = [
  {
    icon: iconPicture,
    label: "图片顺号",
    path: "picture"
  },
  {
    icon: iconDelegation,
    label: "委托分配",
    path: "delegation/list"
  }
]

const itemLayout = {
  md: 8,
  lg: 6,
  xxl: 4
}

export default class dashboard extends Component {
  render() {
    return (
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <h1>NiuWeb Auction</h1>
        <h3 style={{ marginBottom: 16 }}>牛尾巴 - 拍卖行业辅助工具集</h3>
        <Row gutter={16}>
          {item.map(({icon, label, path}) => (
            <Col {...itemLayout}>
              <Item onClick={() => this.props.history.push(path)}>
                <div className="icon" style={{ backgroundImage: `url('${icon}')` }}></div>
                <div className="title">{label}</div>
              </Item>
            </Col>
          ))}
        </Row>
      </div>
    )
  }
}
