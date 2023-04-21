/* eslint-disable jsx-a11y/anchor-is-valid */
import {useEffect, useMemo} from 'react'
import {useTable, ColumnInstance, Row} from 'react-table'
import {CustomRow} from '../table/columns/CustomRow'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import {usersColumns} from './columns/_columns'
import {User} from '../core/_models'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {UsersListPagination} from '../components/pagination/UsersListPagination'
import {KTCardBody} from '../../../../../../_metronic/helpers'
import axios from 'axios'
import {useListView} from '../core/ListViewProvider'
import {useState} from 'react'
import {EventEmitter} from 'events'
import {EmployeeContext, EmployeeDispatchContext} from '../../context/employeeProvider'
import {FileContext, FileDispatchContext} from '../../context/employeeFileProvider'
import {useContext} from 'react'
export const eventEmitter = new EventEmitter()
const UsersTable = () => {
  const {employeeDetails} = useContext(EmployeeContext)
  const idForFiles = useContext(FileContext)
  const setidForFiles = useContext(FileDispatchContext)
  const {setEmployeeDetails, setEmployeeId} = useContext(EmployeeDispatchContext)
  const {setItemIdForUpdate} = useListView()
  const [count, setCount] = useState(0)
  const [modal, setModal] = useState(false)
  const [bool, setBool] = useState(true)
  const [agebool, setAgeBool] = useState(true)
  console.log('EmployeeDetails', employeeDetails)

  useEffect(() => {
    ;(async () => {
      await Load()
    })()
  }, [])
  async function Load(parameter?: any) {
    const varToken = localStorage.getItem('token')
    const result = await axios.get('http://localhost:3000/api/v1/admin/view', {
      params: {
        sort: parameter,
      },
      headers: {
        Authorization: 'Bearer ' + varToken,
      },
    })
    setEmployeeDetails(result.data.data.emp)
  }
  eventEmitter.on('updateUserList', Load)
  // eventEmitter.on('searchedEmployee', searchEmployee)

  //delete function
  async function DeleteEmployee(id: any) {
    const varToken = localStorage.getItem('token')
    await axios.delete('http://localhost:3000/api/v1/admin/delete/' + id, {
      headers: {
        Authorization: 'Bearer ' + varToken,
      },
    })
    alert('Employee deleted Successfully')
    Load()
    LoadCount()
  }
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
  const users = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const data = useMemo(() => users, [users])
  const columns = useMemo(() => usersColumns, [])

  const {getTableProps, getTableBodyProps} = useTable({
    columns,
    data,
  })

  return (
    <>
      <KTCardBody className='py-4'>
        <div className='table-responsive'>
          <table
            id='kt_table_users'
            className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
            {...getTableProps()}
          >
            <thead>
              <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                {/* {headers.map((column: ColumnInstance<User>) => (
                <CustomHeaderColumn key={column.id} column={column} />
              ))} */}
                <th scope='col'>Emp Name</th>
                <th scope='col'>Emp Email</th>
                <th
                  onClick={() => {
                    if (agebool === true) {
                      Load('-employeeAge')
                      setAgeBool(false)
                    } else {
                      Load('employeeAge')
                      setAgeBool(true)
                    }
                  }}
                  scope='col'
                >
                  Emp Age
                </th>
                <th scope='col'>Emp Gender</th>
                <th scope='col'>Emp Contact</th>
                <th
                  onClick={() => {
                    if (bool === true) {
                      Load('-employeeSalary')
                      setBool(false)
                    } else {
                      Load('employeeSalary')
                      setBool(true)
                    }
                  }}
                  scope='col'
                >
                  Emp Salary
                </th>
                <th scope='col'>Emp Country</th>
                <th scope='col'>Emp City</th>
                <th scope='col'>Emp State</th>
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
              {employeeDetails.length > 0 ? (
                employeeDetails.map((row: any) => {
                  const openEditModal = () => {
                    setItemIdForUpdate(row._id)
                  }
                  return (
                    <tr>
                      <th scope='row'>{row.employeeName} </th>
                      <td>{row.employeeEmail}</td>
                      <td>{row.employeeAge}</td>
                      <td>{row.employeeGender}</td>
                      <td>{row.employeeContact}</td>
                      <td>{row.employeeSalary}</td>
                      <td>{row.employeeCountry}</td>
                      <td>{row.employeeCity}</td>
                      <td>{row.employeeState}</td>
                      <td>
                        <div className='menu-item px-3'>
                          <a
                            href='#'
                            style={{color: 'red'}}
                            className='menu-link px-3'
                            onClick={() => {
                              DeleteEmployee(row._id)
                            }}
                          >
                            Delete
                          </a>
                        </div>
                      </td>
                      <td>
                        <div className='menu-item px-3'>
                          <a href='#' className='menu-link px-3' onClick={openEditModal}>
                            Edit
                          </a>
                        </div>
                      </td>
                      <td>
                        <div className='menu-item px-3'>
                          <a
                            href='#'
                            className='menu-link px-3'
                            onClick={() => {
                              setidForFiles(row._id)
                              setEmployeeId(row._id)
                            }}
                          >
                            Files
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                      No matching records found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <UsersListPagination />
        {isLoading && <UsersListLoading />}
      </KTCardBody>
    </>
  )
}

export {UsersTable}
