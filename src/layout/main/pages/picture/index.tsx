import React, { useEffect, useState } from 'react'
import { Button, Input, Tag, Modal, Row, Col, Switch, InputNumber } from 'antd'
import { ipcRenderer } from 'electron'

const Picture = () => {
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [mapString, setMapString] = useState<string>('')
  const [map, setMap] = useState<Array<{ from: string, to: string }>>([])
  const [fuzzy, setFuzzy] = useState<boolean>(false)
  const [compress, setCompress] = useState<boolean>(false)
  const [compressSize, setCompressSize] = useState<number>(1)
  const [modal, setModal] = useState<boolean>(false)
  const [list, setList] = useState<Array<{ from: string, to: string, files: Array<{ from: string, to: string, status?: number, message?: string }> }>>([])
  const [loading, setLoading] = useState<boolean>(false)

  const handleOpenDirectoryFrom = () => {
    const directory = ipcRenderer.sendSync('openDirectory')[0]
    setFrom(directory)
  }

  const handleOpenDirectoryTo = () => {
    const directory = ipcRenderer.sendSync('openDirectory')[0]
    setTo(directory)
  }

  const handleImport = () => {
    setModal(true)
  }

  const handleImportSubmit = async () => {
    const map = mapString.split("\n").map(string => {
      const m = string.split("\t")
      return {
        from: m[0],
        to: m[1]
      }
    })
    setMap(map)
    setModal(false)
  }

  const handleImportCancel = () => {
    setModal(false)
  }

  const handleMap = () => {
    if (!from || !to || map.length === 0) {
      setList([])
    } else {
      const files = ipcRenderer.sendSync("readDirectory", from).map((file: { name: string }) => file.name)
      const list = map.map(({from, to}) => (
        {
          from,
          to,
          files: files.filter((file: string) => (new RegExp(`^${from}${fuzzy ? '[^ \\.\\-\\(\\[（【]*' : ''}[ \\.\\-\\(\\[（【].*$`,'i')).test(file)).map((file: string) => ({
            from: file,
            to: file.replace(new RegExp(`^${from}${fuzzy ? '[^ \\.\\-\\(\\[（【]*' : ''}([ \\.\\-\\(\\[（【].*)$`,'i'), `${to}$1`),
            status: 0
          }))
        }
      ))
      setList(list)
    }
  }

  useEffect(handleMap, [ from, to, map ])

  const handleStart = () => {
    setLoading(true)
    handleCopy(0,0)
  }

  const handleCopy = (mapIndex: number, fileIndex: number) => {
    if (!list[mapIndex]) {
      setLoading(false)
    } else {
      if (!list[mapIndex].files[fileIndex]) {
        handleCopy(mapIndex+1, 0)
      } else {
        const { from: fileFrom, to: fileTo } = list[mapIndex].files[fileIndex]
        const { status, message = "" } = ipcRenderer.sendSync("copyFile", from, fileFrom, to, fileTo, compress ? compressSize * 1 : 0)
        console.log('111111', status, message)
        list[mapIndex].files[fileIndex].status = status
        list[mapIndex].files[fileIndex].message = {
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

        setList(list)

        setTimeout(() => {
          handleCopy(mapIndex, fileIndex + 1)
        }, 10)
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 8 }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <Input value={from} placeholder="点击选择来源文件夹" readOnly onClick={() => handleOpenDirectoryFrom()} style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ flex: 1, marginRight: 8 }}>
        <Input value={to} placeholder="点击选择目标文件夹" readOnly onClick={() => handleOpenDirectoryTo()} style={{ cursor: 'pointer' }} />
        </div>
        <div>
          <Button.Group>
            <Button
              disabled={!from || !to || map.length === 0 || loading}
              onClick={() => handleMap()}
            >刷新</Button>
            <Button
              disabled={loading}
              onClick={() => handleImport()}
            >导入</Button>
            <Modal
              visible={modal}
              title="导入映射"
              okText="导入"
              cancelText="取消"
              onOk={() => handleImportSubmit()}
              onCancel={() => handleImportCancel()}
            >
              <Input.TextArea
                value={mapString}
                onChange={(e) => setMapString(e.target.value)}
                autoSize={{ minRows: 4, maxRows: 10 }}
                placeholder={"在此处输入或粘贴映射关系\n每条规则一行，以Tab键分隔源文件名和目标文件名。"}
              />
              <Row gutter={16} style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', marginTop: 10, height: 30 }}>
                <Col span={4}>模糊搜索</Col>
                <Col span={4}><Switch checked={fuzzy} onChange={(fuzzy) => setFuzzy(fuzzy)} /></Col>
              </Row>
              <Row gutter={16} style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', marginBottom: -10, height: 30 }}>
                <Col span={4}>图片压缩</Col>
                <Col span={4}><Switch checked={compress} onChange={(compress) => setCompress(compress)} /></Col>
                {
                  compress && (
                    <React.Fragment>
                      <Col span={3}>压缩至</Col>
                      <Col span={13}>
                        <Input.Group compact>
                          <InputNumber value={compressSize} onChange={(compressSize) => setCompressSize(compressSize)} style={{ width: 90 }} />
                          <Input style={{ width: 50 }} disabled value="KB" />
                        </Input.Group>
                      </Col>
                    </React.Fragment>
                  )
                }
              </Row>
            </Modal>
          </Button.Group>
          <Button
            type='primary'
            style={{ marginLeft: 8 }}
            disabled={!from || !to || map.length === 0}
            loading={loading}
            onClick={() => handleStart()}
          >开始</Button>
        </div>
      </div>
      <div style={{border: '1px solid #d9d9d9', height: 'calc(100vh - 160px)', background: '#ffffff' }}>
        <div style={{ display: 'flex', height: 32, background: '#fafafa', borderBottom: '1px solid #d9d9d9' }}>
          <div style={{ lineHeight: '32px', padding: '0 6px', fontWeight: 'bold', flex: 1 }}>源文件</div>
          <div style={{ lineHeight: '32px', padding: '0 6px', fontWeight: 'bold', flex: 1 }}>目标文件</div>
          <div style={{ lineHeight: '32px', padding: '0 6px', fontWeight: 'bold', width: 198 }}>状态</div>
        </div>
        <div style={{ height: 'calc(100vh - 192px)', overflow: 'auto' }}>
          {list.map((map) => (
            <div>
              <div style={{ display: 'flex', height: 32, background: '#eeeeee', borderBottom: '1px solid #d9d9d9' }}>
                <div style={{ lineHeight: '32px', padding: '0 6px', flex: 1 }}>{map.from}</div>
                <div style={{ lineHeight: '32px', padding: '0 6px', flex: 1 }}>{map.to}</div>
                <div style={{ lineHeight: '32px', padding: '0 6px', width: 198 }}></div>
              </div>
              <div>
                {map.files.map((file) => (
                  <div style={{ display: 'flex', height: 40, background: '#ffffff', borderBottom: '1px solid #d9d9d9' }}>
                    <div style={{ lineHeight: '40px', padding: '0 6px', flex: 1 }}>{file.from}</div>
                    <div style={{ lineHeight: '40px', padding: '0 6px', flex: 1 }}>{file.to}</div>
                    <div style={{ lineHeight: '38px', padding: '0 3px', width: 198 }}>
                      {file.status === 0 && (<Tag key="0">等待</Tag>)}
                      {file.status === 1 && (<Tag key="1" color="#87d068">完成</Tag>)}
                      {file.status === 2 && (<Tag key="2" color="#f5222d">失败</Tag>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Picture