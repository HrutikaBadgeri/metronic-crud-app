/* eslint-disable react-hooks/exhaustive-deps */
import {createContext, useState, useEffect} from 'react'
import {initialQueryState, KTSVG, useDebounce} from '../../../../../../../_metronic/helpers'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import axios from 'axios'
import {eventEmitter} from '../../table/UsersTable'
import {EmployeeContext, EmployeeDispatchContext} from '../../../context/employeeProvider'
import {useContext} from 'react'

const UsersListSearchComponent = () => {
  const {employeeDetails} = useContext(EmployeeContext)
  const {setEmployeeDetails} = useContext(EmployeeDispatchContext)
  const [value, setValue] = useState('')
  const {updateState} = useQueryRequest()
  const [submit, setSubmit] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState<string>('')

  async function searchEmployee(value: any) {
    const varToken = localStorage.getItem('token')
    const res = await axios.get('http://localhost:3000/api/v1/admin/view/' + value, {
      headers: {
        Authorization: 'Bearer ' + varToken,
      },
    })
    const result = res.data.data.emp
    if (res.data.data.emp.length === 0) {
      setSearchError('No employee found')
    } else {
      setSearchError('')
    }
    if (result) {
      setEmployeeDetails(result)
    }
  }

  return (
    <div className='card-title'>
      {/* begin::Search */}
      <div className='d-flex align-items-center position-relative my-1'>
        <KTSVG
          path='/media/icons/duotune/general/gen021.svg'
          className='svg-icon-1 position-absolute ms-6'
        />

        <input
          type='text'
          data-kt-user-table-filter='search'
          className='form-control form-control-solid w-250px ps-14'
          placeholder='Search employee'
          value={value}
          onChange={(e: any) => {
            if (e.target.value === '') {
            } else if (!isNaN(e.target.value)) {
              alert('Please enter a valid name')
            }
            setValue(e.target.value)
            searchEmployee(e.target.value)
          }}
        />
      </div>
      {/* end::Search */}
    </div>
  )
}

export {UsersListSearchComponent}
