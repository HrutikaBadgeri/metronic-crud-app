import {useState, useEffect} from 'react'
import {useAuth} from '../../../../auth/core/Auth'
import React from 'react'
import axios from 'axios'
import {useContext} from 'react'
import {FileContext} from '../../context/employeeFileProvider'
import {useListView} from '../core/ListViewProvider'
import {EmployeeContext} from '../../context/employeeProvider'

const FileEditModalFormWrapper = () => {
  const [userFiles, setUserFiles] = useState([])
  const idForFiles = useContext(FileContext)
  useEffect(() => {
    ;(async () => {
      await Load()
    })()
  }, [])

  async function Load() {
    console.log(idForFiles)
    const varToken = localStorage.getItem('token')
    let url = 'http://localhost:3000/api/v1/admin/viewFiles/' + idForFiles
    const result = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + varToken,
      },
    })
    console.log(result.data.data)
    setUserFiles(result.data.data)
  }
  const deleteFile = async (id: any) => {
    try {
      const varToken = localStorage.getItem('token')
      const url = 'http://localhost:3000/api/v1/admin/deleteFile/' + idForFiles + '/' + id
      await axios.delete(url, {
        headers: {
          Authorization: 'Bearer ' + varToken,
        },
      })
      alert('File deleted successfully')
      Load()
    } catch (err) {
      alert('Cannot delete file')
      console.log(err)
    }
  }
  const handleUpdate = async (files: any, file_id: any) => {
    console.log(files)
    console.log(idForFiles)
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('updatedFile', files[i])
    }
    const url = 'http://localhost:3000/api/v1/admin/updateFile/' + idForFiles + '/' + file_id

    try {
      const varToken = localStorage.getItem('token')
      const res = await axios.patch(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + varToken,
        },
      })
      console.log(res)
      if (res) {
        alert('File updated successfully')
        Load()
      }
    } catch (error) {
      alert('Cannot update file')
      console.log(error)
    }
  }

  const handlePreview = async (file: any) => {
    console.log(file)
    if (file.contentType === 'application/pdf') {
      const uint8Array = new Uint8Array(file.data.data)
      const blob = new Blob([uint8Array], {type: 'application/pdf'})
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'file.pdf'
      link.click()
      return
    } else if (file.contentType === 'text/plain') {
      const uint8Array = new Uint8Array(file.data.data)
      const blob = new Blob([uint8Array], {type: 'text/plain'})
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'file.txt'
      link.click()
      return
    }

    //for images
    console.log(file.data.data)
    const base64 = btoa(
      new Uint8Array(file.data.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
    const url = `data:${file.contentType};base64,${base64}`
    const newWindow: any = window.open()
    const htmlString = `<html><body><img style="margin:auto; display:block" src="${url}" /></body></html>`
    newWindow.document.write(htmlString)
  }
  return (
    <div>
      <h6>Files</h6>
      <table className='table'>
        <thead>
          <tr>
            <th scope='col'>File Names</th>
          </tr>
        </thead>
        {userFiles.map((file: any) => {
          return (
            <tbody key={file.name}>
              <tr>
                <th scope='row'>{file.name} </th>
                <td>{file.name}</td>
                <td>
                  <button
                    className='btn'
                    style={{color: 'red'}}
                    onClick={() => deleteFile(file._id)}
                  >
                    Delete
                  </button>
                </td>
                <td>
                  <button
                    type='button'
                    className='btn'
                    onClick={() => {
                      const fileInput = document.createElement('input')
                      fileInput.type = 'file'
                      fileInput.onchange = (event: any) => {
                        const files = event.target.files
                        handleUpdate(files, file._id)
                      }
                      fileInput.click()
                    }}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    type='button'
                    className='btn'
                    onClick={() => {
                      handlePreview(file)
                    }}
                  >
                    Preview
                  </button>
                </td>
              </tr>
            </tbody>
          )
        })}
      </table>
    </div>
  )
}

export default FileEditModalFormWrapper
