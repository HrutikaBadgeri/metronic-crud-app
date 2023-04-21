import React, {createContext, useState} from 'react'

type Dispatch = React.Dispatch<React.SetStateAction<any[]>>

export const EmployeeContext = React.createContext<any>(undefined)
export const EmployeeDispatchContext = React.createContext<any>(undefined as unknown as Dispatch)

function EmployeeProvider({children}: any) {
  const [employeeDetails, setEmployeeDetails] = useState<any[]>([])
  const [employeeId, setEmployeeId] = useState<any>('')
  return (
    <EmployeeContext.Provider value={{employeeDetails, employeeId}}>
      <EmployeeDispatchContext.Provider value={{setEmployeeDetails, setEmployeeId}}>
        {children}
      </EmployeeDispatchContext.Provider>
    </EmployeeContext.Provider>
  )
}

export default EmployeeProvider
