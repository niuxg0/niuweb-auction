import React, { useEffect, useState } from 'react'
import { Result, Form, Input, Button, message, Spin } from 'antd'
import logo from '../../static/logo'
import { APILogin } from '../../apis'
import { useHistory } from 'react-router'

const Home = () => {
  const form = Form.useForm()
  const history = useHistory()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const token = window.localStorage.getItem('NIUWEB-AUCTION-TOKEN')
    if (token) {
      history.push('/main')
    }
  }, [])

  const handleSubmit = async () => {
    const { mail, password } = await form[0].validateFields()

    setLoading(true)
    const result = await APILogin(mail, password)

    if (result.data.code === 0) {
      window.localStorage.setItem('NIUWEB-AUCTION-TOKEN', result.data.data.clientToken)
      message.success('登录成功', 1, () => {
        history.push('/main')
      })
    } else {
      message.error('邮箱或密码错误')
    }
    setLoading(false)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: 50, background: '#eeeeee' }}>
      <Result
        icon={(<img src={logo} style={{ width: 200, height: 200 }} />)}
        title="欢迎使用 NiuWeb Auction"
        extra={(
          <Spin spinning={loading}>
            <Form
              form={form[0]}
              layout="vertical"
              style={{ width: 300, margin: 'auto', textAlign: 'left' }}
            >
              <Form.Item
                name="mail"
                rules={[
                  { required: true, message: '邮箱必填' },
                  { type: 'email', message: '邮箱格式错误' }
                ]}
              >
                <Input placeholder="邮箱" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '密码必填' }]}
              >
                <Input.Password placeholder="密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={() => handleSubmit()} style={{ width: 300 }}>登录</Button>
              </Form.Item>
            </Form>
            <div style={{ color: '#999999' }}>Copyright {new Date().getFullYear()} NiuWeb.com.cn </div>
          </Spin>
        )}
      />
    </div>
  )
}

export default Home