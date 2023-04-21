import React from 'react'
import {Navigate, Route, Routes, Outlet} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import {Overview} from './components/Overview'
import {Settings} from './components/settings/Settings'
import {AccountHeader} from './AccountHeader'

const accountBreadCrumbs: Array<PageLink> = [
  {
    title: 'Account',
    path: '/crafted/account/overview',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const AccountPage: React.FC = () => {
  //if not employee
  const notEmployee = () => {
    if (localStorage.getItem('role') === 'employee') {
      return (
        <>
          {' '}
          <Route
            path='overview'
            element={
              <>
                <PageTitle breadcrumbs={accountBreadCrumbs}>Overview</PageTitle>
                <Overview />
              </>
            }
          />
          <Route
            path='settings'
            element={
              <>
                <PageTitle breadcrumbs={accountBreadCrumbs}>Settings</PageTitle>
                <Settings />
              </>
            }
          />
          <Route index element={<Navigate to='/crafted/account/overview' />} />
        </>
      )
    }
  }
  return (
    <Routes>
      <Route
        element={
          <>
            <AccountHeader />
            <Outlet />
          </>
        }
      >
        {notEmployee()}
      </Route>
    </Routes>
  )
}

export default AccountPage
