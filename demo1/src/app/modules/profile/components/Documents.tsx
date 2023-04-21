/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import axios from 'axios'
import {useEffect} from 'react'
import {useState} from 'react'

export function Documents() {
  const [userFiles, setUserFiles] = useState([])
  const [employee_id, setEmployee_id] = useState()

  useEffect(() => {
    ;(async () => {
      await employeeDetails()
    })()
  }, [])
  useEffect(() => {
    ;(async () => {
      await Load()
    })()
  }, [employee_id])

  const employeeDetails: any = async () => {
    const varToken = localStorage.getItem('token')
    let url1 = 'http://localhost:3000/api/v1/employee/getempdetails'
    const result1: any = await axios.get(url1, {
      headers: {
        Authorization: 'Bearer ' + varToken,
      },
    })
    const employee_id = result1.data.data._id
    setEmployee_id(employee_id)
  }

  async function Load() {
    const varToken = localStorage.getItem('token')
    let url = 'http://localhost:3000/api/v1/employee/viewFiles/'
    const result = await axios.get(url, {
      headers: {
        Authorization: 'Bearer ' + varToken,
      },
    })
    setUserFiles(result.data.data)
  }
  const deleteFile = async (id: any) => {
    try {
      const varToken = localStorage.getItem('token')
      const url = 'http://localhost:3000/api/v1/employee/deleteFile/' + id
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
    console.log(employee_id)
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('updatedFile', files[i])
    }
    const url = 'http://localhost:3000/api/v1/employee/updateFile/' + file_id

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

  const handleUpload = async (files: any) => {
    if (files.length > 5) {
      alert('Cannot upload more than 5 files')
      return
    }
    try {
      const varToken = localStorage.getItem('token')
      const counturl = 'http://localhost:3000/api/v1/employee/loadFileCount'
      const resp = await axios.get(counturl, {
        headers: {
          Authorization: 'Bearer ' + varToken,
        },
      })

      if (resp) {
        if (resp.data.data.total_files + files.length > 10) {
          alert('You are only allowed to have 10 files in total, kindly rreconsider your upload')
          return
        }
      }
    } catch (err) {
      console.log(err)
    }
    console.log(files[0].size)
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 25000000) {
        alert('File size cannot be greater than 25MB')
        return
      }
    }
    const formData = new FormData()

    for (let i = 0; i < files.length; i++) {
      formData.append('employeeFiles', files[i])
    }
    console.log(formData)
    try {
      const varToken = localStorage.getItem('token')
      let url = 'http://localhost:3000/api/v1/employee/upload'
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + varToken,
        },
      })

      console.log(response.data.data)
      alert('Files uploaded successfully')
      Load()
    } catch (error) {
      alert("Can't upload files")
      console.error(error)
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
    } else if (
      file.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const file_name = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      console.log(file.contentType)
      const uint8Array = new Uint8Array(file.data.data)
      const blob = new Blob([uint8Array], {
        type: file_name,
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'file.docx'
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
    <>
      <div className='d-flex flex-wrap flex-stack mb-6'>
        <h3 className='fw-bolder my-2'>My Documents</h3>
        {userFiles.length === 0 &&
          'You have not uploaded any files yet. Please click on the upload button to upload your files'}
        <div className='d-flex my-2'>
          <a
            href='#'
            className='btn btn-primary btn-sm'
            onClick={() => {
              const fileInput = document.createElement('input')
              fileInput.type = 'file'
              fileInput.multiple = true
              fileInput.onchange = (event: any) => {
                const files = event.target.files
                handleUpload(files)
              }
              fileInput.click()
            }}
          >
            Upload File
          </a>
        </div>
      </div>
      <div>
        <h6>Files (Maximum 10 Files)</h6>
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
    </>
  )
}
