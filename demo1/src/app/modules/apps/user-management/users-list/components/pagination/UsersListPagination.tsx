/* eslint-disable jsx-a11y/anchor-is-valid */
import clsx from 'clsx'
import {useQueryResponseLoading, useQueryResponsePagination} from '../../core/QueryResponseProvider'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import axios from 'axios'
import {useState} from 'react'
import {useEffect} from 'react'
import {EmployeeContext, EmployeeDispatchContext} from '../../../context/employeeProvider'
import {useContext} from 'react'

const UsersListPagination = () => {
  const [count, setCount] = useState(0)
  const pagination = useQueryResponsePagination()
  const {setEmployeeDetails} = useContext(EmployeeDispatchContext)
  //constructor
  useEffect(() => {
    ;(async () => {
      await LoadCount()
    })()
  }, [])
  //counts the number of employees in the database
  async function LoadCount() {
    const varToken = localStorage.getItem('token')
    const res = await axios.get('http://localhost:3000/api/v1/admin/count', {
      headers: {
        Authorization: 'Bearer ' + varToken,
      },
    })
    setCount(res.data.data.count)
    //6 employees and 3 per page, 6/3 = 2 pages
  }

  async function updateState(num: any) {
    const varToken = localStorage.getItem('token')
    const page = num
    const res = await axios.get('http://localhost:3000/api/v1/admin/view/', {
      params: {
        p: page,
      },
      headers: {
        Authorization: 'Bearer ' + varToken,
      },
    })
    console.log(res.data.data.emp)
    setEmployeeDetails(res.data.data.emp)
  }
  console.log(pagination.links)
  return (
    <div className='row'>
      <div className='col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'></div>
      <div className='col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'>
        <div id='kt_table_users_paginate'>
          <div>
            {Array.from({length: Math.ceil(count / 5)}, (_, i) => i + 1).map((num: any) => (
              <button
                className='btn btn-sm btn-icon btn-bg-light btn-color-primary btn-hover-primary'
                key={num}
                onClick={() => {
                  updateState(num)
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
export {UsersListPagination}
