import React, {createContext, useState} from 'react'
import {unstable_renderSubtreeIntoContainer} from 'react-dom'
type Dispatch = React.Dispatch<React.SetStateAction<any>>

export const FileContext = React.createContext<any>(undefined)
export const FileDispatchContext = React.createContext<Dispatch>(undefined as unknown as Dispatch)
function EmployeeFileProvider({children}: any) {
  const [idForFiles, setidForFiles] = useState<any>(undefined)
  return (
    <FileContext.Provider value={idForFiles}>
      <FileDispatchContext.Provider value={setidForFiles}>{children}</FileDispatchContext.Provider>
    </FileContext.Provider>
  )
}

export default EmployeeFileProvider
