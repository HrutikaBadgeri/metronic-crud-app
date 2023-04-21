// @ts-nocheck
import clsx from 'clsx'
import {FC, useEffect} from 'react'
import {Row} from 'react-table'
import {User} from '../../core/_models'
import {useState} from 'react'

type Props = {
  row: any
}

const CustomRow: FC<Props> = ({row}) => {
  const [employees, setEmployees] = useState([])
  row = employees
  useEffect(() => {
    ;(async () => {
      await Load()
    })()
  }, [])

  async function Load() {
    const varToken = localStorage.getItem('token')
    const result = await axios.get('http://localhost:3000/api/v1/admin/view', {
      headers: {
        Authorization: 'Bearer ' + varToken,
      },
    })
    setEmployees(result.data.data.emp)
  }
  return (
    <tr {...employees.getRowProps()}>
      {row.employees.map((cell) => {
        return (
          <td
            {...cell.getCellProps()}
            className={clsx({'text-end min-w-100px': cell.column.id === 'actions'})}
          >
            {cell.render('Cell')}
          </td>
        )
      })}
    </tr>
  )
}

export {CustomRow}
