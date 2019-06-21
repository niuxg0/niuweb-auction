import React from 'react'
import { Button } from 'antd'
import { Link } from 'react-router-dom'
import Result from './result'
import styles from './index.less'

const actions = (
  <div className={styles.actions}>
    <Link to="/">
      <Button size="large">返回首页</Button>
    </Link>
  </div>
)

export default ({ location }) => (

  <Result
    className={styles.registerResult}
    type="success"
    title={
      <div className={styles.title}>
        你的账户：
        {location.state ? location.state.account : 'AntDesign@example.com'} 注册成功
      </div>
    }
    actions={actions}
    style={{ marginTop: 56 }}
  />
)
