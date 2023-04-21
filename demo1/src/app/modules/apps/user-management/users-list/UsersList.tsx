import {ListViewProvider, useListView} from './core/ListViewProvider'
import {QueryRequestProvider} from './core/QueryRequestProvider'
import {QueryResponseProvider} from './core/QueryResponseProvider'
import {UsersListHeader} from './components/header/UsersListHeader'
import {UsersTable} from './table/UsersTable'
import {UserEditModal} from './user-edit-modal/UserEditModal'
import {KTCard} from '../../../../../_metronic/helpers'
import EmployeeProvider from '../context/employeeProvider'
import EmployeeFileProvider from '../context/employeeFileProvider'
import {FileEditModal} from './file-edit-modal/FileEditModal'
import {useContext} from 'react'
import {FileContext} from '../context/employeeFileProvider'

const UsersList = () => {
  const {itemIdForUpdate} = useListView()
  const idForFiles = useContext(FileContext)
  return (
    <>
      <KTCard>
        <UsersListHeader />
        <UsersTable />
      </KTCard>
      {itemIdForUpdate !== undefined && <UserEditModal />}
      {idForFiles !== undefined && <FileEditModal />}
    </>
  )
}

const UsersListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <EmployeeProvider>
          <EmployeeFileProvider>
            <UsersList />
          </EmployeeFileProvider>
        </EmployeeProvider>
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {UsersListWrapper}
