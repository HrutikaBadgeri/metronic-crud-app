import {KTSVG} from '../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {FileEditModal} from './FileEditModal'
import {useContext} from 'react'
import {FileContext} from '../../context/employeeFileProvider'
import {FileDispatchContext} from '../../context/employeeFileProvider'
const FileEditModalHeader = () => {
  const setidForFiles = useContext(FileDispatchContext)
  return (
    <div className='modal-header'>
      {/* begin::Modal title */}
      <h2 className='fw-bolder'>Edit File details</h2>
      {/* end::Modal title */}

      {/* begin::Close */}
      <div
        className='btn btn-icon btn-sm btn-active-icon-primary'
        data-kt-users-modal-action='close'
        onClick={() => setidForFiles(undefined)}
        style={{cursor: 'pointer'}}
      >
        <KTSVG path='/media/icons/duotune/arrows/arr061.svg' className='svg-icon-1' />
      </div>
      {/* end::Close */}
    </div>
  )
}

export default FileEditModalHeader
