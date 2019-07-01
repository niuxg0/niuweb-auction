import React, { Fragment } from 'react'
import { Redirect, Route, Switch, Link } from 'react-router-dom'
import DocumentTitle from 'react-document-title'
import styled from 'styled-components'
import routes from './routes'
import logo from '@/assets/jui-logo.svg';
import styles from './index.less';

const Header = styled.div`
  position: fixed;
  padding: 20px;
  display: flex;
  align-items: center;

  img {
    width: 50px;
    height: 50px;
  }
  span {
    font-size: 28px;
    font-weight: bold;
    color: black;
    margin-left: 5px;
  }
`
const Body = styled.div`
  width: 100%;
  margin: 0 20px;
`

const Mask = styled.div`
  @media screen {
    &:before {
      content: "打印中";
      position: fixed;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`

export default class exceptionLayout extends React.Component {

  getPageTitle() {
    let title = 'CYB Ant Design'
    return title
  }

  render() {
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <React.Fragment>
          <Header>
            <img src={logo} alt="logo" />
            <span>NiuWeb</span>
          </Header>
          <Body>
            <Switch>
              {routes.map((route, idx) => {
                return route.component ? (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    render={props => (
                      <route.component {...props} />
                    )} />
                ) : (null)
              })}
            </Switch>
          </Body>
          <Mask />
        </React.Fragment>
      </DocumentTitle>
    )
  }
}
