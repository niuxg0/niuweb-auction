import React from 'react'
import { Card } from 'antd'
import IconPicture from '../../../../static/mode/picture'
import { useHistory } from 'react-router-dom'

const Index = () => {
  const modes = [
    {
      path: 'picture',
      title: '图片顺号',
      cover: IconPicture
    }
  ]

  const history = useHistory()

  return (
    <div>
      <div>NiuWeb Auction</div>
      <div style={{ fontSize: 16, fontWeight: 'bold' }}>牛尾巴 - 拍卖行业辅助工具集</div>
      <div style={{ marginTop: 8 }}>
        {modes.map((mode) => (
          <Card
            hoverable
            cover={<img style={{ width: 80, height: 80, margin: '20px 80px 0px 80px' }} src={mode.cover} alt={mode.title} />}
            style={{ width: 240, marginRight: 16, marginBottom: 16 }}
            bodyStyle={{ padding: 20, textAlign: 'center' }}
            onClick={() => history.push(`/main/${mode.path}`)}
          >{mode.title}</Card>
        ))}
      </div>
    </div>
  )
}

export default Index